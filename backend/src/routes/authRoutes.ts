import express from 'express';
import {
  register,
  login,
  getMe,
  inviteDoctor,
  getInvite,
  acceptInvite,
  getDoctors,
  updateDoctor,
  updateDoctorPermissions,
  deleteDoctor,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { imageUpload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/invite/:token', getInvite);
router.post('/invite/accept', acceptInvite);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/me/password', authenticate, changePassword);
router.get('/doctors', authenticate, getDoctors);
router.post('/doctors/invite', authenticate, inviteDoctor);
router.put('/doctors/:doctorId', authenticate, updateDoctor);
router.put('/doctors/:doctorId/permissions', authenticate, updateDoctorPermissions);
router.post('/doctors/:doctorId/avatar', authenticate, imageUpload.single('avatar'), handleMulterError, uploadAvatar);
router.delete('/doctors/:doctorId/avatar', authenticate, deleteAvatar);
router.delete('/doctors/:doctorId', authenticate, deleteDoctor);

export default router;
