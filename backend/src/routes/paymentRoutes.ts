import { Router } from 'express';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByPatient,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
} from '../controllers/paymentController.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);
router.get('/patient/:patientId', getPaymentsByPatient);
router.get('/:id', getPaymentById);
router.post('/', upload.single('receipt'), handleMulterError, createPayment);
router.put('/:id', upload.single('receipt'), handleMulterError, updatePayment);
router.delete('/:id', deletePayment);

export default router;
