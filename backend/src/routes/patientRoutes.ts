import express from 'express';
import { getPatients, getPatientById, addPatient } from '../controllers/patientController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Secure all patient routes

router.route('/')
  .get(getPatients)
  .post(addPatient);

router.route('/:id')
  .get(getPatientById);

export default router;
