import express from 'express';
import { getReportsByPatient, addReport, updateReportNotes } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Secure all report routes

router.route('/patient/:patientId')
  .get(getReportsByPatient)
  .post(addReport);

router.patch('/:id/notes', updateReportNotes);

export default router;
