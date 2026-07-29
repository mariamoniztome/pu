import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listConnections,
  startGoogleConnect,
  googleCallback,
  startOutlookConnect,
  outlookCallback,
  connectIcloud,
  syncConnection,
  disconnectConnection,
  getExternalEvents,
} from '../controllers/calendarIntegrationController.js';

const router = Router();

// OAuth callbacks land here via a top-level browser redirect from Google/
// Microsoft, so they can't carry our Authorization header — they're
// authorized instead by the signed `state` param minted in start*Connect.
router.get('/google/callback', googleCallback);
router.get('/outlook/callback', outlookCallback);

router.use(authenticate);

router.get('/', listConnections);
router.get('/events', getExternalEvents);
router.get('/google/connect', startGoogleConnect);
router.get('/outlook/connect', startOutlookConnect);
router.post('/icloud/connect', connectIcloud);
router.post('/:id/sync', syncConnection);
router.delete('/:id', disconnectConnection);

export default router;
