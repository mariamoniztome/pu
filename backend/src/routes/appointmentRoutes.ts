import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

router.get('/', getAllAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.get('/patient/:patientId', getAppointmentsByPatient);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
