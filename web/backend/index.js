require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY appointment_time ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all pending requests
app.get('/api/requests', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointment_requests WHERE status = 'pending' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept a request
app.post('/api/requests/:id/accept', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('BEGIN');
    const requestResult = await pool.query('SELECT * FROM appointment_requests WHERE id = $1', [id]);
    if (requestResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }
    const request = requestResult.rows[0];
    
    // Insert into appointments
    await pool.query(
      'INSERT INTO appointments (patient_name, type, appointment_time, status) VALUES ($1, $2, $3, $4)',
      [request.patient_name, request.type, request.request_time, 'confirmed']
    );
    
    // Update request status
    await pool.query("UPDATE appointment_requests SET status = 'accepted' WHERE id = $1", [id]);
    
    await pool.query('COMMIT');
    res.json({ message: 'Request accepted' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Decline a request
app.post('/api/requests/:id/decline', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    console.log(`Appointment ${id} cancelled by doctor. Reason: ${reason}`);
    await pool.query("UPDATE appointment_requests SET status = 'declined', cancellation_reason = $1 WHERE id = $2", [reason, id]);
    res.json({ message: 'Request declined', reason });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const pendingRes = await pool.query("SELECT COUNT(*) FROM appointment_requests WHERE status = 'pending'");
    const confirmedRes = await pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'confirmed'");
    const cancelledRes = await pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'cancelled'");
    
    res.json({
      pending: parseInt(pendingRes.rows[0].count),
      confirmed: parseInt(confirmedRes.rows[0].count),
      cancelled: parseInt(cancelledRes.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Web backend listening at http://localhost:${port}`);
});
