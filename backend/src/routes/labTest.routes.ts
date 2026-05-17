import { Router } from 'express';
import { LabTestController } from '../controllers/labTest.controller';

const router = Router();

router.get('/', LabTestController.getLabTests);

export default router;
