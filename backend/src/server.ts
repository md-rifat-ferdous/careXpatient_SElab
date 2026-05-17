import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import appointmentRoutes from './routes/appointment.routes';
import labTestRoutes from './routes/labTest.routes';
import labOrderRoutes from './routes/labOrder.routes';
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/orders', labOrderRoutes);

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
