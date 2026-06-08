const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/tests (Retrieve all tests)
router.get('/', async (req, res) => {
  try {
    const labId = 1; // Assuming default lab ID is 1 (Modern Lab Center)
    const { category, search } = req.query;

    let query = `SELECT * FROM "LabTest" WHERE (lab_id = $1 OR lab_id IS NULL)`;
    const params = [labId];
    let paramIndex = 2;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY category, name ASC`;
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error in GET /api/tests:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

// POST /api/tests (Create a new test)
router.post('/', async (req, res) => {
  try {
    const labId = 1;
    const { name, price, sample_type, category, delivery_time, description, prerequisites, tag, tag_color } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required.' });
    }

    const query = `
      INSERT INTO "LabTest" (name, price, sample_type, category, delivery_time, description, lab_id, prerequisites, tag, tag_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [name, price, sample_type || 'Blood', category || 'General', delivery_time || '24 Hours', description, labId, prerequisites, tag, tag_color];
    const result = await db.query(query, params);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error in POST /api/tests:', err.message);
    res.status(500).json({ success: false, error: 'Database insert error' });
  }
});

// PUT /api/tests/:id (Edit an existing test)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, sample_type, category, delivery_time, description, prerequisites, tag, tag_color } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required.' });
    }

    const query = `
      UPDATE "LabTest"
      SET name = $1, price = $2, sample_type = $3, category = $4, delivery_time = $5, 
          description = $6, prerequisites = $7, tag = $8, tag_color = $9
      WHERE id = $10
      RETURNING *
    `;
    const params = [name, price, sample_type, category, delivery_time, description, prerequisites, tag, tag_color, id];
    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Test not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`Error in PUT /api/tests/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, error: 'Database update error' });
  }
});

// DELETE /api/tests/:id (Delete a test)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify it is a lab-specific test before deleting (prevent deleting global test templates)
    const checkQuery = `SELECT lab_id FROM "LabTest" WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Test not found.' });
    }

    if (checkResult.rows[0].lab_id === null) {
      return res.status(403).json({ success: false, error: 'Global templates cannot be deleted.' });
    }

    const deleteQuery = `DELETE FROM "LabTest" WHERE id = $1 RETURNING *`;
    const deleteResult = await db.query(deleteQuery, [id]);

    res.json({ success: true, message: 'Test deleted successfully', data: deleteResult.rows[0] });
  } catch (err) {
    console.error(`Error in DELETE /api/tests/${req.params.id}:`, err.message);
    res.status(500).json({ success: false, error: 'Database delete error' });
  }
});

module.exports = router;
