import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import reportRoutes from './routes/reportRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'careXpatient Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 careXpatient Backend is starting...`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
});
