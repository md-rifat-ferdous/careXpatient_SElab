const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/patients (With search filter)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT p.id, p.date_of_birth, p.blood_group, p.address,
             u.full_name, u.email, u.phone, u.profile_photo_url
      FROM "Patient" p
      JOIN "User" u ON p.user_id = u.id
      WHERE p.deleted_at IS NULL
    `;
    
    const params = [];
    if (search) {
      query += ` AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY u.full_name ASC`;
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in GET /api/patients:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

// GET /api/patients/:id (Patient Details + History + Reports)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Patient Profile
    const profileQuery = `
      SELECT p.id, p.date_of_birth, p.blood_group, p.address, p.allergies, p.medical_history,
             u.full_name, u.email, u.phone, u.profile_photo_url
      FROM "Patient" p
      JOIN "User" u ON p.user_id = u.id
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `;
    const profileResult = await db.query(profileQuery, [id]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    const patientProfile = profileResult.rows[0];

    // 2. Test History (LabOrders and associated tests)
    const historyQuery = `
      SELECT o.id, o.status, o.total_amount, o.home_collection, o.created_at,
             ARRAY_AGG(t.name) as test_names
      FROM "LabOrder" o
      LEFT JOIN "LabOrderTest" ot ON o.id = ot.lab_order_id
      LEFT JOIN "LabTest" t ON ot.lab_test_id = t.id
      WHERE o.patient_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    const historyResult = await db.query(historyQuery, [id]);

    // 3. Previous Reports (LabResults associated with Patient's LabOrders)
    const reportsQuery = `
      SELECT r.id, r.lab_order_id, r.result_summary, r.file_url, r.uploaded_at, r.uploaded_by,
             ARRAY_AGG(t.name) as test_names
      FROM "LabResult" r
      JOIN "LabOrder" o ON r.lab_order_id = o.id
      LEFT JOIN "LabOrderTest" ot ON o.id = ot.lab_order_id
      LEFT JOIN "LabTest" t ON ot.lab_test_id = t.id
      WHERE o.patient_id = $1
      GROUP BY r.id, r.lab_order_id, r.result_summary, r.file_url, r.uploaded_at, r.uploaded_by
      ORDER BY r.uploaded_at DESC
    `;
    const reportsResult = await db.query(reportsQuery, [id]);

    res.json({
      success: true,
      data: {
        profile: patientProfile,
        history: historyResult.rows,
        reports: reportsResult.rows
      }
    });
  } catch (err) {
    console.error(`Error in GET /api/patients/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

module.exports = router;
