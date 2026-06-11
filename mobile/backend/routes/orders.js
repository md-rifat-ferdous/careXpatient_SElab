const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ─── Step → Status mapping (matches web backend exactly) ─────────────────────
const STEP_TO_STATUS = {
  0: 'Cancelled',
  1: 'Requested',
  2: 'AcceptedByLab',
  3: 'AcceptedByLab',
  4: 'SampleCollected',
  5: 'SampleCollected',
  6: 'Processing',
  7: 'Processing',
  8: 'Processing',
  9: 'Reported',
};

function parseSlotToTime(slot) {
  if (!slot) return null;
  const match = slot.match(/^(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}:00`;
  return '08:00:00';
}

// ─── Shared order SELECT query builder ────────────────────────────────────────
const ORDER_SELECT = `
  SELECT
    o.id,
    o.patient_id,
    o.lab_id,
    o.status,
    o.demo_step,
    o.assigned_staff,
    o.total_amount,
    o.home_collection,
    o.collection_address,
    o.collection_slot,
    o.created_at,
    o.updated_at,
    o.home_collection_fee,
    o.subtotal,
    o.vat,
    u.full_name AS patient_name,
    u.phone AS patient_phone,
    u.profile_photo_url AS patient_photo,
    r.reason AS rejection_reason,
    r.note AS rejection_note,
    r.rejected_at AS rejected_at,
    COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS test_names,
    COALESCE(ARRAY_AGG(t.id)   FILTER (WHERE t.id   IS NOT NULL), '{}') AS test_ids
  FROM "LabOrder" o
  JOIN "Patient" p   ON o.patient_id = p.id
  JOIN "User"    u   ON p.user_id    = u.id
  LEFT JOIN "LabOrderTest" ot ON o.id = ot.lab_order_id
  LEFT JOIN "LabTest"      t  ON ot.lab_test_id = t.id
  LEFT JOIN "OrderRejection" r ON o.id = r.order_id
`;

// ─── GET /api/mobile/orders ───────────────────────────────────────────────────
// Query params:
//   module   = 'testqueue' | 'samplecollection'
//   status   = filter label (optional)
//   search   = free-text (optional)
router.get('/', async (req, res) => {
  try {
    const { module, status, search } = req.query;

    let queryText = ORDER_SELECT;
    const conditions = [];
    const params = [];

    // Module scoping — mirrors web backend
    if (module === 'testqueue') {
      conditions.push('o.demo_step IN (0, 1, 2)');
    } else if (module === 'samplecollection') {
      conditions.push('o.demo_step IN (3, 4, 5, 6)');
    }

    // Status filtering
    if (status && status !== 'All') {
      switch (status) {
        case 'New Requests':    conditions.push('o.demo_step = 1');               break;
        case 'Accepted':        conditions.push('o.demo_step = 2');               break;
        case 'Rejected':        conditions.push('o.demo_step = 0');               break;
        case 'Home Collection': conditions.push('o.home_collection = true');      break;
        case 'In-Lab':          conditions.push('o.home_collection = false');     break;
        case 'Pending':         conditions.push('o.demo_step IN (3, 4)');         break;
        case 'Collected':       conditions.push('o.demo_step IN (5, 6)');         break;
        case 'Urgent':          conditions.push('o.home_collection = true AND o.demo_step IN (3, 4)'); break;
        case 'Overdue':
          conditions.push("o.created_at < NOW() - INTERVAL '24 hours' AND o.demo_step NOT IN (0, 9)");
          break;
        default:
          params.push(status);
          conditions.push(`o.status = $${params.length}`);
      }
    }

    // Search
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      conditions.push(`(u.full_name ILIKE $${idx} OR u.phone ILIKE $${idx} OR o.id::text ILIKE $${idx})`);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ' GROUP BY o.id, p.id, u.id, r.id ORDER BY o.created_at DESC';

    const result = await db.query(queryText, params);

    // Override step/status for rejected orders
    const data = result.rows.map(o => {
      if (o.rejection_reason) {
        return { ...o, demo_step: 0, status: 'Rejected' };
      }
      return o;
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/mobile/orders error:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

// ─── PATCH /api/mobile/orders/:id/advance ────────────────────────────────────
router.patch('/:id/advance', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const orderRes = await db.query('SELECT demo_step FROM "LabOrder" WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const currentStep = orderRes.rows[0].demo_step;

    const rejCheck = await db.query('SELECT id FROM "OrderRejection" WHERE order_id = $1', [id]);
    if (rejCheck.rows.length > 0 || currentStep === 0) {
      return res.status(400).json({ success: false, error: 'Cannot advance a rejected order.' });
    }

    if (currentStep >= 9) {
      const fullOrder = await db.query('SELECT * FROM "LabOrder" WHERE id = $1', [id]);
      return res.json({ success: true, data: fullOrder.rows[0] });
    }

    const newStep = currentStep + 1;
    const status = STEP_TO_STATUS[newStep];

    const updateRes = await db.query(`
      UPDATE "LabOrder"
      SET demo_step = $1, status = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [newStep, status, id]);

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (err) {
    console.error('PATCH /advance error:', err.message);
    res.status(500).json({ success: false, error: 'Advance step error' });
  }
});

// ─── PATCH /api/mobile/orders/:id/assign ─────────────────────────────────────
router.patch('/:id/assign', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { staff_name } = req.body;
    if (!staff_name) {
      return res.status(400).json({ success: false, error: 'staff_name is required.' });
    }

    const orderRes = await db.query('SELECT demo_step FROM "LabOrder" WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    let demoStep = orderRes.rows[0].demo_step;
    let status = STEP_TO_STATUS[demoStep];

    // Assigning collector at step 2 bumps to step 3 (collector assigned)
    if (demoStep === 2) {
      demoStep = 3;
      status = STEP_TO_STATUS[3];
    }

    const updateRes = await db.query(`
      UPDATE "LabOrder"
      SET assigned_staff = $1, demo_step = $2, status = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [staff_name, demoStep, status, id]);

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (err) {
    console.error('PATCH /assign error:', err.message);
    res.status(500).json({ success: false, error: 'Staff assignment error' });
  }
});

// ─── PATCH /api/mobile/orders/:id/reject ─────────────────────────────────────
router.patch('/:id/reject', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const id = parseInt(req.params.id);
    const { reason, note } = req.body;

    if (!reason || !reason.trim()) {
      client.release();
      return res.status(400).json({ success: false, error: 'A rejection reason is required.' });
    }

    const orderRes = await client.query('SELECT demo_step FROM "LabOrder" WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (orderRes.rows[0].demo_step !== 1) {
      client.release();
      return res.status(400).json({ success: false, error: 'Only New Request orders (step 1) can be rejected.' });
    }

    const rejectedAt = new Date().toISOString();

    await client.query('BEGIN');

    await client.query(`
      INSERT INTO "OrderRejection" (order_id, reason, note, rejected_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (order_id) DO UPDATE
      SET reason = EXCLUDED.reason, note = EXCLUDED.note, rejected_at = EXCLUDED.rejected_at
    `, [id, reason.trim(), note ? note.trim() : null, rejectedAt]);

    const updateRes = await client.query(`
      UPDATE "LabOrder"
      SET demo_step = 0, status = 'Cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    await client.query('COMMIT');
    client.release();

    res.json({
      success: true,
      data: {
        ...updateRes.rows[0],
        status: 'Rejected',
        rejection_reason: reason.trim(),
        rejection_note: note ? note.trim() : null,
        rejected_at: rejectedAt,
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('PATCH /reject error:', err.message);
    res.status(500).json({ success: false, error: 'Rejection error' });
  }
});

// ─── PATCH /api/mobile/orders/:id/restore ────────────────────────────────────
router.patch('/:id/restore', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const id = parseInt(req.params.id);
    const orderRes = await client.query('SELECT demo_step FROM "LabOrder" WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    await client.query('BEGIN');
    await client.query('DELETE FROM "OrderRejection" WHERE order_id = $1', [id]);

    const updateRes = await client.query(`
      UPDATE "LabOrder"
      SET demo_step = 1, status = 'Requested', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    await client.query('COMMIT');
    client.release();

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('PATCH /restore error:', err.message);
    res.status(500).json({ success: false, error: 'Restore error' });
  }
});

// ─── POST /api/mobile/orders/manual-entry ────────────────────────────────────
router.post('/manual-entry', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { patient_name, patient_phone, patient_email, test_ids, home_collection, collection_address, collection_slot } = req.body;

    if (!patient_name || !patient_phone || !test_ids || test_ids.length === 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Missing required parameters.' });
    }

    await client.query('BEGIN');

    const testsRes = await client.query('SELECT id, price FROM "LabTest" WHERE id = ANY($1)', [test_ids]);
    const resolvedTests = testsRes.rows;

    const subtotal = resolvedTests.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
    const homeCollectionFee = home_collection ? 150.00 : 0.00;
    const vat = parseFloat(((subtotal + homeCollectionFee) * 0.05).toFixed(2));
    const totalAmount = subtotal + homeCollectionFee + vat;

    const cleanPhone = patient_phone.replace(/\s+/g, '');
    let userRes = await client.query('SELECT id FROM "User" WHERE phone = $1', [cleanPhone]);
    let userId;
    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
    } else {
      const email = patient_email || `patient_mobile_${Date.now()}@example.com`;
      const insertUser = await client.query(`
        INSERT INTO "User" (phone, email, full_name, role, is_verified, profile_photo_url, created_at, updated_at)
        VALUES ($1, $2, $3, 'Patient', true, '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png', NOW(), NOW())
        RETURNING id
      `, [cleanPhone, email, patient_name]);
      userId = insertUser.rows[0].id;
    }

    let patientRes = await client.query('SELECT id FROM "Patient" WHERE user_id = $1', [userId]);
    let patientId;
    if (patientRes.rows.length > 0) {
      patientId = patientRes.rows[0].id;
    } else {
      const insertPatient = await client.query(`
        INSERT INTO "Patient" (user_id, date_of_birth, blood_group, address, created_at, updated_at)
        VALUES ($1, '1990-01-01', 'O+', $2, NOW(), NOW())
        RETURNING id
      `, [userId, collection_address || 'Dhaka, Bangladesh']);
      patientId = insertPatient.rows[0].id;
    }

    const slotTime = parseSlotToTime(collection_slot);
    const orderInsert = await client.query(`
      INSERT INTO "LabOrder" (patient_id, lab_id, status, demo_step, assigned_staff, total_amount,
        home_collection, collection_address, collection_slot, home_collection_fee, subtotal, vat, created_at, updated_at)
      VALUES ($1, 1, 'Requested', 1, null, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      patientId,
      totalAmount.toFixed(2),
      !!home_collection,
      collection_address || null,
      slotTime,
      homeCollectionFee.toFixed(2),
      subtotal.toFixed(2),
      vat.toFixed(2),
    ]);

    const newOrder = orderInsert.rows[0];

    for (const testId of test_ids) {
      await client.query(`
        INSERT INTO "LabOrderTest" (lab_order_id, lab_test_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [newOrder.id, testId]);
    }

    await client.query('COMMIT');
    client.release();

    const fullDetail = await db.query(`
      SELECT
        o.id, o.patient_id, o.lab_id, o.status, o.demo_step, o.assigned_staff, o.total_amount,
        o.home_collection, o.collection_address, o.collection_slot, o.created_at, o.updated_at,
        o.home_collection_fee, o.subtotal, o.vat,
        u.full_name AS patient_name, u.phone AS patient_phone, u.profile_photo_url AS patient_photo,
        COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS test_names,
        COALESCE(ARRAY_AGG(t.id)   FILTER (WHERE t.id   IS NOT NULL), '{}') AS test_ids
      FROM "LabOrder" o
      JOIN "Patient" p ON o.patient_id = p.id
      JOIN "User"    u ON p.user_id    = u.id
      LEFT JOIN "LabOrderTest" ot ON o.id = ot.lab_order_id
      LEFT JOIN "LabTest"      t  ON ot.lab_test_id = t.id
      WHERE o.id = $1
      GROUP BY o.id, p.id, u.id
    `, [newOrder.id]);

    res.status(201).json({ success: true, data: fullDetail.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('POST /manual-entry error:', err.message);
    res.status(500).json({ success: false, error: 'Manual entry creation error' });
  }
});

module.exports = router;
