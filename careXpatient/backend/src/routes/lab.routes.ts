import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getLabPatients,
  getPatientHistory,
  getPendingUploads,
  uploadReport,
  upload,
} from '../controllers/lab.controller';

const router = Router();

// All routes require Lab authentication
router.use(authenticate, authorize(['Lab']));

router.get('/patients',                       getLabPatients);
router.get('/patients/:patientId/history',    getPatientHistory);
router.get('/pending-uploads',                getPendingUploads);
router.post('/upload-report', upload.single('file'), uploadReport);

export default router;
