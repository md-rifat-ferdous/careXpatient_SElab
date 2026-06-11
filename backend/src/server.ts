import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import appointmentRoutes from './routes/appointment.routes';
import chatbotRoutes from './routes/chatbot.routes';
import labTestRoutes from './routes/labTest.routes';
import labOrderRoutes from './routes/labOrder.routes';
import reportsRoutes from './routes/reports.routes';
import prescriptionRoutes from './routes/prescription.routes';
import consultationRoutes from './routes/consultation.routes';
import { initSocketServer } from './services/socket.service';
// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for uploaded consultation files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/orders', labOrderRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/consultations', consultationRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'careXpatient Backend is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server and attach Socket.IO
const httpServer = http.createServer(app);
initSocketServer(httpServer);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🚀 careXpatient Backend is starting...`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
});
