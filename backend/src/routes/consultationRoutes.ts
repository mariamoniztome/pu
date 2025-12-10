import { Router } from 'express';
import {
  getAllConsultations,
  getConsultationById,
  getConsultationsByPatient,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  deleteConsultationAttachment,
} from '../controllers/consultationController.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllConsultations);
router.get('/patient/:patientId', getConsultationsByPatient);
router.get('/:id', getConsultationById);
router.post('/', upload.array('attachments', 10), handleMulterError, createConsultation);
router.put('/:id', upload.array('attachments', 10), handleMulterError, updateConsultation);
router.delete('/:id', deleteConsultation);
router.delete('/:id/attachments/:filename', deleteConsultationAttachment);

export default router;
