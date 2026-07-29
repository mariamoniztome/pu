import express from 'express';
import {
  updateOrganization,
  updateBranding,
  uploadBrandingLogo,
  deleteBrandingLogo,
  submitTrialFeedback,
  endTrialForTesting,
} from '../controllers/organizationController.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { imageUpload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

router.patch('/me', authenticate, requirePermission('canManageOrganization'), updateOrganization);
router.put('/me/branding', authenticate, requirePermission('canManageBranding'), updateBranding);
router.post(
  '/me/branding/logo',
  authenticate,
  requirePermission('canManageBranding'),
  imageUpload.single('logo'),
  handleMulterError,
  uploadBrandingLogo
);
router.delete(
  '/me/branding/logo/:variant',
  authenticate,
  requirePermission('canManageBranding'),
  deleteBrandingLogo
);
router.post('/me/trial-feedback', authenticate, submitTrialFeedback);
router.post('/me/end-trial-test', authenticate, endTrialForTesting);

export default router;
