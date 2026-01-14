import express from 'express';
import {
  register,
  login,
  getMe,
  inviteDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
} from '../controllers/authController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.get('/doctors', authenticate, getDoctors);
router.post('/doctors/invite', authenticate, inviteDoctor);
router.put('/doctors/:doctorId', authenticate, updateDoctor);
router.delete('/doctors/:doctorId', authenticate, deleteDoctor);

export default router;
