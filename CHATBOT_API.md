## Chatbot API Reference

### Base URL
```
http://localhost:5000/api/chatbot
```

### Endpoints

#### 1. Send Message
**POST** `/api/chatbot/message`

Send a message to the chatbot and get a response.

**Request:**
```json
{
  "sessionId": "session-1704501600000",
  "message": "I need to book an appointment",
  "patientId": "507f1f77bcf86cd799439011",
  "context": {
    "topic": "appointment_booking",
    "appointmentId": "507f1f77bcf86cd799439012",
    "consultationId": "507f1f77bcf86cd799439013"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "I can help you find available appointment slots. Could you tell me what day or time works best for you?",
  "conversation": {
    "sessionId": "session-1704501600000",
    "messages": [
      {
        "role": "user",
        "content": "I need to book an appointment",
        "timestamp": "2024-01-06T10:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "I can help you find available appointment slots...",
        "timestamp": "2024-01-06T10:00:05.000Z"
      }
    ]
  }
}
```

**Parameters:**
- `sessionId` (required) - Unique session identifier
- `message` (required) - User's message
- `patientId` (optional) - Patient ID for tracking
- `context.topic` (optional) - Current topic (appointment_booking, consultation, payment, etc.)
- `context.appointmentId` (optional) - Related appointment ID
- `context.consultationId` (optional) - Related consultation ID

---

#### 2. Get Conversation
**GET** `/api/chatbot/:sessionId`

Retrieve a specific conversation by session ID.

**Request:**
```
GET /api/chatbot/session-1704501600000
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "_id": "507f1f77bcf86cd799439014",
    "sessionId": "session-1704501600000",
    "patientId": "507f1f77bcf86cd799439011",
    "messages": [
      {
        "role": "user",
        "content": "I need to book an appointment",
        "timestamp": "2024-01-06T10:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "I can help you find available appointment slots...",
        "timestamp": "2024-01-06T10:00:05.000Z"
      }
    ],
    "context": {
      "topic": "appointment_booking",
      "appointmentId": "507f1f77bcf86cd799439012"
    },
    "isActive": true,
    "createdAt": "2024-01-06T10:00:00.000Z",
    "updatedAt": "2024-01-06T10:00:05.000Z"
  }
}
```

---

#### 3. Get All Conversations
**GET** `/api/chatbot`

Retrieve all active conversations, optionally filtered by patient.

**Request:**
```
GET /api/chatbot?patientId=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "sessionId": "session-1704501600000",
      "patientId": "507f1f77bcf86cd799439011",
      "messages": [...],
      "context": {
        "topic": "appointment_booking"
      },
      "isActive": true,
      "createdAt": "2024-01-06T10:00:00.000Z",
      "updatedAt": "2024-01-06T10:05:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "sessionId": "session-1704501800000",
      "patientId": "507f1f77bcf86cd799439011",
      "messages": [...],
      "context": {
        "topic": "payment"
      },
      "isActive": true,
      "createdAt": "2024-01-06T11:00:00.000Z",
      "updatedAt": "2024-01-06T11:05:00.000Z"
    }
  ]
}
```

**Query Parameters:**
- `patientId` (optional) - Filter conversations by patient

---

#### 4. Close Conversation
**DELETE** `/api/chatbot/:sessionId`

Close/archive a conversation.

**Request:**
```
DELETE /api/chatbot/session-1704501600000
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation closed",
  "conversation": {
    "_id": "507f1f77bcf86cd799439014",
    "sessionId": "session-1704501600000",
    "isActive": false,
    "messages": [...],
    "updatedAt": "2024-01-06T10:30:00.000Z"
  }
}
```

---

## Example Conversation Flow

### Conversation: Appointment Booking

```
Request 1:
POST /api/chatbot/message
{
  "sessionId": "session-001",
  "message": "I want to book an appointment",
  "context": {"topic": "appointment_booking"}
}

Response 1:
{
  "success": true,
  "message": "I can help you find available appointment slots. Could you tell me what day or time works best for you?",
  "conversation": {
    "sessionId": "session-001",
    "messages": [
      {"role": "user", "content": "I want to book an appointment"},
      {"role": "assistant", "content": "I can help you find..."}
    ]
  }
}

---

Request 2:
POST /api/chatbot/message
{
  "sessionId": "session-001",
  "message": "Next Tuesday at 2 PM",
  "context": {"topic": "appointment_booking"}
}

Response 2:
{
  "success": true,
  "message": "Great! I'll help you find available therapists for next Tuesday at 2 PM. Who would you prefer to see?",
  "conversation": {
    "sessionId": "session-001",
    "messages": [
      {"role": "user", "content": "I want to book an appointment"},
      {"role": "assistant", "content": "I can help you find..."},
      {"role": "user", "content": "Next Tuesday at 2 PM"},
      {"role": "assistant", "content": "Great! I'll help you..."}
    ]
  }
}
```

---

## Error Responses

### Invalid Request
```json
{
  "success": false,
  "message": "Session ID and message are required"
}
```

### Conversation Not Found
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Error processing chat message",
  "error": "MongoDB connection error"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing required fields) |
| 404 | Conversation not found |
| 500 | Server error |

---

## cURL Examples

### Send a message
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "message": "I need help with my appointment",
    "patientId": "patient-123"
  }'
```

### Get conversation history
```bash
curl http://localhost:5000/api/chatbot/session-123
```

### Get all patient conversations
```bash
curl "http://localhost:5000/api/chatbot?patientId=patient-123"
```

### Close a conversation
```bash
curl -X DELETE http://localhost:5000/api/chatbot/session-123
```

---

## JavaScript/TypeScript Examples

### Using the Frontend API Client

```typescript
import { sendChatMessage, getConversation, getAllConversations } from '../api/chatbot';

// Send a message
const response = await sendChatMessage(
  'session-123',
  'I need to book an appointment',
  'patient-123',
  { topic: 'appointment_booking' }
);

console.log(response.message); // Bot's response

// Get conversation history
const conversation = await getConversation('session-123');
console.log(conversation.messages); // All messages in conversation

// Get all patient conversations
const conversations = await getAllConversations('patient-123');
console.log(conversations); // All conversations for patient

// Close conversation
await closeConversation('session-123');
```

### Using fetch

```javascript
// Send message
const response = await fetch('/api/chatbot/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-123',
    message: 'Hello',
    patientId: 'patient-123'
  })
});

const data = await response.json();
console.log(data.message);
```

---

## Database Schema

### Conversation Document

```typescript
{
  _id: ObjectId,
  sessionId: string,          // Unique session identifier
  patientId: ObjectId,        // Reference to Patient document
  messages: [
    {
      role: 'user' | 'assistant',
      content: string,
      timestamp: Date
    }
  ],
  context: {
    topic: string,            // appointment_booking, consultation, payment, etc.
    appointmentId: ObjectId,  // Reference to Appointment
    consultationId: ObjectId  // Reference to Consultation
  },
  isActive: boolean,          // true = conversation ongoing, false = closed
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- `sessionId` (unique) - Fast session lookup
- `patientId, createdAt` - Fast patient history queries
- `context.appointmentId` - Fast appointment-related queries

---

## Rate Limiting (Recommended)

Consider implementing rate limiting in production:

```typescript
// Add to chatbotController.ts
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/message', chatLimiter, sendMessage);
```

---

## Best Practices

1. **Always provide sessionId** - Ensures conversation continuity
2. **Include context** - Helps bot give better responses
3. **Handle errors gracefully** - Show user-friendly messages
4. **Store messages locally** - Cache for better UX
5. **Implement typing indicator** - Show when bot is thinking
6. **Auto-save drafts** - Prevent message loss

---

For more information, see `CHATBOT_SETUP.md`
