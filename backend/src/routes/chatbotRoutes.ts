import express from 'express';
import {
  sendMessage,
  getConversation,
  getAllConversations,
  closeConversation,
} from '../controllers/chatbotController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All chatbot routes require authentication
router.use(authenticate);

// Send a message to the chatbot
router.post('/message', sendMessage);

// Get a specific conversation
router.get('/:sessionId', getConversation);

// Get all conversations (optionally filtered by patientId)
router.get('/', getAllConversations);

// Close a conversation
router.delete('/:sessionId', closeConversation);

export default router;
