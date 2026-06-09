import { Router } from 'express';
import { LabOrderController } from '../controllers/labOrder.controller';

const router = Router();

router.post('/', LabOrderController.createOrder);
router.get('/', LabOrderController.getOrders);

export default router;
