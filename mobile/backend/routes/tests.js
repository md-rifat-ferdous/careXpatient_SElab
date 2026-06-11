const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/mobile/tests  — returns all active lab tests for manual-entry picker
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, price, category FROM "LabTest" ORDER BY category, name'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET /api/mobile/tests error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch tests' });
  }
});

module.exports = router;
