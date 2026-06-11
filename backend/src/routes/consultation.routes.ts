import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  startConsultation,
  joinConsultation,
  endConsultation,
  sendChatMessage,
  getChatMessages,
  uploadFile,
  getFiles,
  refreshToken,
} from '../controllers/consultation.controller';

const router = Router();

// ─── Consultation Lifecycle ──────────────────────────────────────────────────

router.post('/:id/start', authenticate, authorize(['Doctor']), startConsultation);
router.post('/:id/join', authenticate, authorize(['Patient']), joinConsultation);
router.post('/:id/end', authenticate, authorize(['Doctor']), endConsultation);
router.get('/:id/token', authenticate, refreshToken);

// ─── Chat ────────────────────────────────────────────────────────────────────

router.post('/:id/chat', authenticate, sendChatMessage);
router.get('/:id/chat', authenticate, getChatMessages);

// ─── Files ───────────────────────────────────────────────────────────────────

router.post('/:id/upload', authenticate, authorize(['Doctor']), upload.single('file'), uploadFile);
router.get('/:id/files', authenticate, getFiles);

export default router;
