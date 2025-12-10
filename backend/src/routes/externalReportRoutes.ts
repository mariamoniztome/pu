import { Router } from 'express';
import {
  getAllReports,
  getReportById,
  getReportsByPatient,
  createReport,
  updateReport,
  deleteReport,
  deleteReportAttachment,
} from '../controllers/externalReportController.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = Router();

router.get('/', getAllReports);
router.get('/patient/:patientId', getReportsByPatient);
router.get('/:id', getReportById);
router.post('/', upload.array('attachments', 10), handleMulterError, createReport);
router.put('/:id', upload.array('attachments', 10), handleMulterError, updateReport);
router.delete('/:id', deleteReport);
router.delete('/:id/attachments/:filename', deleteReportAttachment);

export default router;
