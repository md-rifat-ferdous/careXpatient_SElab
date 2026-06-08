import { Router } from 'express';
import * as prescriptionController from '../controllers/prescriptions';

const router = Router();

router.get('/doctors', prescriptionController.getDoctors);
router.get('/', prescriptionController.getPrescriptions);
router.get('/:id/pdf', prescriptionController.downloadPrescriptionPDF);
router.get('/:id', prescriptionController.getPrescriptionDetail);

export default router;
