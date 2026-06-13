import { Router } from 'express';
import { LabTestController } from '../controllers/labTest.controller';

const router = Router();

router.get('/', LabTestController.getLabTests);
router.post('/', LabTestController.createLabTest);
router.put('/:id', LabTestController.updateLabTest);
router.delete('/:id', LabTestController.deleteLabTest);

export default router;
