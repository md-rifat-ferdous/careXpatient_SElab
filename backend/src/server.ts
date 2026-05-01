import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import doctorRoutes from './routes/doctorRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

// Load environment variables from .env file
dotenv.config();

// Patch BigInt for JSON serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'careXpatient Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 careXpatient Backend is starting...`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
});
