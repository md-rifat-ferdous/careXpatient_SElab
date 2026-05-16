import express from 'express';
import { getPrescriptionsByPatient, addPrescription, updatePrescription, archivePrescription } from '../controllers/prescriptionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Secure all prescription routes

router.route('/patient/:patientId')
  .get(getPrescriptionsByPatient)
  .post(addPrescription);

router.route('/:id')
  .put(updatePrescription);

router.patch('/:id/archive', archivePrescription);

export default router;
