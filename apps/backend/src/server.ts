import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import reportsRouter from './routes/reports';
import prescriptionsRouter from './routes/prescriptions';

// Load environment variables from .env file
dotenv.config();

// BigInt serialization fix
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/reports', reportsRouter);
app.use('/api/prescriptions', prescriptionsRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'careXpatient Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 careXpatient Backend is starting...`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
});

// End of file
