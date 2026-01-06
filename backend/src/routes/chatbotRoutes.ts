import express from 'express';
import {
  sendMessage,
  getConversation,
  getAllConversations,
  closeConversation,
} from '../controllers/chatbotController.js';

const router = express.Router();

// Send a message to the chatbot
router.post('/message', sendMessage);

// Get a specific conversation
router.get('/:sessionId', getConversation);

// Get all conversations (optionally filtered by patientId)
router.get('/', getAllConversations);

// Close a conversation
router.delete('/:sessionId', closeConversation);

export default router;
