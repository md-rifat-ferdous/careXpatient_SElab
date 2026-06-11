const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const labId = 1; // Assuming default lab ID for the logged-in mock staff is 1 (Modern Lab Center)

    // Today's Tests Count (created today)
    const todayQuery = `
      SELECT COUNT(*) as count 
      FROM "LabOrder" 
      WHERE lab_id = $1 AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'
    `;
    const todayResult = await db.query(todayQuery, [labId]);

    // Pending Tests Count (status is Requested, AcceptedByLab, SampleCollected, Processing)
    const pendingQuery = `
      SELECT COUNT(*) as count 
      FROM "LabOrder" 
      WHERE lab_id = $1 AND status IN ('Requested', 'AcceptedByLab', 'SampleCollected', 'Processing')
    `;
    const pendingResult = await db.query(pendingQuery, [labId]);

    // Completed Tests Count (status is Reported)
    const completedQuery = `
      SELECT COUNT(*) as count 
      FROM "LabOrder" 
      WHERE lab_id = $1 AND status = 'Reported'
    `;
    const completedResult = await db.query(completedQuery, [labId]);

    // Revenue Summary (Sum of paid payments for lab orders)
    const revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM "Payment" p
      JOIN "LabOrder" o ON p.order_id = o.id AND p.order_type = 'LabOrder'
      WHERE o.lab_id = $1 AND p.status = 'Paid'
    `;
    const revenueResult = await db.query(revenueQuery, [labId]);

    // Recent Activities (Joined LabOrders with Patient and User names)
    const recentActivitiesQuery = `
      SELECT o.id, o.status, o.created_at, o.total_amount, o.home_collection,
             u.full_name as patient_name
      FROM "LabOrder" o
      JOIN "Patient" p ON o.patient_id = p.id
      JOIN "User" u ON p.user_id = u.id
      WHERE o.lab_id = $1
      ORDER BY o.created_at DESC
      LIMIT 6
    `;
    const recentActivitiesResult = await db.query(recentActivitiesQuery, [labId]);

    // Overview statistics grouped by status
    const statusStatsQuery = `
      SELECT status, COUNT(*) as count 
      FROM "LabOrder" 
      WHERE lab_id = $1 
      GROUP BY status
    `;
    const statusStatsResult = await db.query(statusStatsQuery, [labId]);

    res.json({
      success: true,
      data: {
        todaysTests: parseInt(todayResult.rows[0].count || 0, 10),
        pendingTests: parseInt(pendingResult.rows[0].count || 0, 10),
        completedTests: parseInt(completedResult.rows[0].count || 0, 10),
        totalRevenue: parseFloat(revenueResult.rows[0].total || 0),
        recentActivities: recentActivitiesResult.rows,
        statusStats: statusStatsResult.rows
      }
    });
  } catch (err) {
    console.error('Error in GET /api/dashboard:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

module.exports = router;
