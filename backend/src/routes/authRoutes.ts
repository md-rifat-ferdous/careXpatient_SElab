import express from 'express';
import { loginDoctor, registerDoctor } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerDoctor);
router.post('/login', loginDoctor);

export default router;
