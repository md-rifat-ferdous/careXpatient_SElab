import { Router } from 'express';
import * as prescriptionController from '../controllers/prescription.controller';
import { validate } from '../middleware/validate';
import { getPrescriptionsSchema, getPrescriptionDetailSchema } from '../validators/prescription.validator';

const router = Router();

router.get('/doctors', prescriptionController.getDoctors);
router.get('/', validate(getPrescriptionsSchema), prescriptionController.getPrescriptions);
router.get('/:id/pdf', validate(getPrescriptionDetailSchema), prescriptionController.downloadPrescriptionPDF);
router.get('/:id', validate(getPrescriptionDetailSchema), prescriptionController.getPrescriptionDetail);

export default router;
