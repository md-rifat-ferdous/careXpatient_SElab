import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const router = Router();

router.post('/recommend-doctor', ChatbotController.recommendDoctor);

export default router;
