const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/earnings
router.get('/', async (req, res) => {
  try {
    const labId = 1;

    // 1. Daily Earnings
    const dailyQuery = `
      SELECT COALESCE(SUM(p.amount), 0) as total
      FROM "Payment" p
      JOIN "LabOrder" o ON p.order_id = o.id AND p.order_type = 'LabOrder'
      WHERE o.lab_id = $1 AND p.status = 'Paid' AND p.paid_at >= CURRENT_DATE
    `;
    const dailyResult = await db.query(dailyQuery, [labId]);

    // 2. Weekly Earnings
    const weeklyQuery = `
      SELECT COALESCE(SUM(p.amount), 0) as total
      FROM "Payment" p
      JOIN "LabOrder" o ON p.order_id = o.id AND p.order_type = 'LabOrder'
      WHERE o.lab_id = $1 AND p.status = 'Paid' AND p.paid_at >= DATE_TRUNC('week', CURRENT_DATE)
    `;
    const weeklyResult = await db.query(weeklyQuery, [labId]);

    // 3. Monthly Earnings
    const monthlyQuery = `
      SELECT COALESCE(SUM(p.amount), 0) as total
      FROM "Payment" p
      JOIN "LabOrder" o ON p.order_id = o.id AND p.order_type = 'LabOrder'
      WHERE o.lab_id = $1 AND p.status = 'Paid' AND p.paid_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const monthlyResult = await db.query(monthlyQuery, [labId]);

    // 4. Revenue Analytics (Daily data points for the past 7 days)
    const analyticsQuery = `
      SELECT gs.date::date as day, COALESCE(SUM(p.amount), 0) as total
      FROM GENERATE_SERIES(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') gs(date)
      LEFT JOIN "Payment" p ON p.paid_at::date = gs.date::date AND p.status = 'Paid'
      LEFT JOIN "LabOrder" o ON p.order_id = o.id AND p.order_type = 'LabOrder' AND o.lab_id = $1
      GROUP BY gs.date
      ORDER BY gs.date ASC
    `;
    const analyticsResult = await db.query(analyticsQuery, [labId]);

    // 5. Test-wise Revenue breakdown
    const testBreakdownQuery = `
      SELECT t.name, COUNT(ot.lab_test_id) as test_count, SUM(t.price) as total_revenue
      FROM "LabOrderTest" ot
      JOIN "LabTest" t ON ot.lab_test_id = t.id
      JOIN "LabOrder" o ON ot.lab_order_id = o.id
      JOIN "Payment" p ON p.order_id = o.id AND p.order_type = 'LabOrder'
      WHERE o.lab_id = $1 AND p.status = 'Paid'
      GROUP BY t.id, t.name
      ORDER BY total_revenue DESC
    `;
    const testBreakdownResult = await db.query(testBreakdownQuery, [labId]);

    // 6. Transaction History
    const transactionsQuery = `
      SELECT p.id, p.amount, p.gateway, p.transaction_id, p.status, p.paid_at,
             u.full_name as patient_name, o.id as order_id
      FROM "Payment" p
      JOIN "LabOrder" o ON p.order_id = o.id AND p.order_type = 'LabOrder'
      JOIN "Patient" pat ON o.patient_id = pat.id
      JOIN "User" u ON pat.user_id = u.id
      WHERE o.lab_id = $1
      ORDER BY p.paid_at DESC NULLS LAST, p.id DESC
      LIMIT 50
    `;
    const transactionsResult = await db.query(transactionsQuery, [labId]);

    res.json({
      success: true,
      data: {
        daily: parseFloat(dailyResult.rows[0].total || 0),
        weekly: parseFloat(weeklyResult.rows[0].total || 0),
        monthly: parseFloat(monthlyResult.rows[0].total || 0),
        analytics: analyticsResult.rows,
        testBreakdown: testBreakdownResult.rows,
        transactions: transactionsResult.rows
      }
    });
  } catch (err) {
    console.error('Error in GET /api/earnings:', err.message);
    res.status(500).json({ success: false, error: 'Database query error' });
  }
});

module.exports = router;
