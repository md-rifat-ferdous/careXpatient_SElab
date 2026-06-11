const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only PDFs and images are allowed.'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/reports/upload (Upload file)
router.post('/upload', upload.single('reportFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        fileUrl: fileUrl
      }
    });
  } catch (err) {
    console.error('Error in POST /api/reports/upload:', err.message);
    res.status(500).json({ success: false, error: 'File upload error' });
  }
});

// POST /api/reports/verify (Verify and Sign report -> Transitions LabOrder to 'Reported')
router.post('/verify', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { lab_order_id, result_summary, file_url } = req.body;

    if (!lab_order_id || !file_url) {
      return res.status(400).json({ success: false, error: 'Order ID and file URL are required.' });
    }

    await client.query('BEGIN');

    // 1. Insert or update LabResult
    const checkResultQuery = 'SELECT id FROM "LabResult" WHERE lab_order_id = $1';
    const checkResult = await client.query(checkResultQuery, [lab_order_id]);

    let labResultId;
    if (checkResult.rows.length > 0) {
      // Update existing
      const updateResultQuery = `
        UPDATE "LabResult"
        SET result_summary = $1, file_url = $2, uploaded_at = NOW(), uploaded_by = 'Dr. S. Rahman'
        WHERE lab_order_id = $3
        RETURNING id
      `;
      const updateRes = await client.query(updateResultQuery, [result_summary || '', file_url, lab_order_id]);
      labResultId = updateRes.rows[0].id;
    } else {
      // Insert new
      const insertResultQuery = `
        INSERT INTO "LabResult" (lab_order_id, result_summary, file_url, uploaded_at, uploaded_by)
        VALUES ($1, $2, $3, NOW(), 'Dr. S. Rahman')
        RETURNING id
      `;
      const insertRes = await client.query(insertResultQuery, [lab_order_id, result_summary || '', file_url]);
      labResultId = insertRes.rows[0].id;
    }

    // 2. Transition LabOrder status to Reported
    const updateOrderQuery = `
      UPDATE "LabOrder"
      SET status = 'Reported', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const orderResult = await client.query(updateOrderQuery, [lab_order_id]);

    // 3. Update associated Payment to Paid
    await client.query(`
      UPDATE "Payment"
      SET status = 'Paid', paid_at = COALESCE(paid_at, NOW())
      WHERE order_id = $1 AND order_type = 'LabOrder'
    `, [lab_order_id]);

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Report verified and signed successfully.',
      data: {
        labResultId,
        order: orderResult.rows[0]
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/reports/verify:', err.message);
    res.status(500).json({ success: false, error: 'Verification sign-off error' });
  } finally {
    client.release();
  }
});

// POST /api/reports/send (Simulate dispatching report -> creates mock dispatch log)
router.post('/send', async (req, res) => {
  try {
    const { lab_order_id, channel, recipient } = req.body;

    if (!lab_order_id || !channel || !recipient) {
      return res.status(400).json({ success: false, error: 'Missing dispatch variables.' });
    }

    // Fetch patient info
    const patientQuery = `
      SELECT o.patient_id, u.full_name
      FROM "LabOrder" o
      JOIN "Patient" p ON o.patient_id = p.id
      JOIN "User" u ON p.user_id = u.id
      WHERE o.id = $1
    `;
    const patientResult = await db.query(patientQuery, [lab_order_id]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Associated lab order not found.' });
    }

    const { patient_id, full_name } = patientResult.rows[0];

    // Create ReportDispatchLog table if not exists (self-healing migration)
    const createLogTableQuery = `
      CREATE TABLE IF NOT EXISTS "ReportDispatchLog" (
        id SERIAL PRIMARY KEY,
        lab_order_id BIGINT REFERENCES "LabOrder"(id),
        patient_id BIGINT REFERENCES "Patient"(id),
        sent_to VARCHAR(255) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'Delivered'
      )
    `;
    await db.query(createLogTableQuery);

    // Insert dispatch log
    const insertLogQuery = `
      INSERT INTO "ReportDispatchLog" (lab_order_id, patient_id, sent_to, channel, status)
      VALUES ($1, $2, $3, $4, 'Delivered')
      RETURNING *
    `;
    const logResult = await db.query(insertLogQuery, [lab_order_id, patient_id, recipient, channel]);

    res.json({
      success: true,
      message: `Report successfully dispatched to ${full_name} via ${channel}.`,
      data: logResult.rows[0]
    });
  } catch (err) {
    console.error('Error in POST /api/reports/send:', err.message);
    res.status(500).json({ success: false, error: 'Dispatch logging error' });
  }
});

// GET /api/reports/dispatch-logs/:orderId (Fetch logs for an order)
router.get('/dispatch-logs/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if table exists
    const checkTable = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ReportDispatchLog'
      )
    `);

    if (!checkTable.rows[0].exists) {
      return res.json({ success: true, data: [] });
    }

    const logsQuery = `
      SELECT * FROM "ReportDispatchLog" 
      WHERE lab_order_id = $1 
      ORDER BY sent_at DESC
    `;
    const logsResult = await db.query(logsQuery, [orderId]);
    res.json({ success: true, data: logsResult.rows });
  } catch (err) {
    console.error('Error in GET /api/reports/dispatch-logs:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

module.exports = router;
