const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static serving for uploaded files (PDFs/Images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const dashboardRouter = require('./routes/dashboard');
const patientsRouter = require('./routes/patients');
const testsRouter = require('./routes/tests');
const ordersRouter = require('./routes/orders');
const earningsRouter = require('./routes/earnings');
const settingsRouter = require('./routes/settings');
const reportsRouter = require('./routes/reports');

app.use('/api/dashboard', dashboardRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/tests', testsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/earnings', earningsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Lab Portal API is healthy.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
