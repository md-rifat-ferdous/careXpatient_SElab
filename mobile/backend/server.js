const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
const ordersRouter = require('./routes/orders');
const testsRouter  = require('./routes/tests');

app.use('/api/mobile/orders', ordersRouter);
app.use('/api/mobile/tests',  testsRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Lab Portal Mobile API is healthy.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Mobile API] Unhandled Error:', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Lab Portal Mobile API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Orders: http://localhost:${PORT}/api/mobile/orders`);
  console.log(`   Tests:  http://localhost:${PORT}/api/mobile/tests\n`);
});
