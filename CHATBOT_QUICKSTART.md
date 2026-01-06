## Chatbot Quick Start

Your psychology clinic app now has a context-aware chatbot! Here's how to use it:

### ✨ What the Chatbot Does

1. **Remembers conversations** - Chat history is stored and persists
2. **Multi-step support** - Guides users through appointment bookings and troubleshooting
3. **Context-aware** - Understands appointment, consultation, and payment inquiries
4. **Always available** - Floating widget in bottom-right corner

### 🚀 Getting Started

The chatbot is already integrated! Just start your app:

**Backend:**
```bash
cd backend
npm install  # if needed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install  # if needed
npm run dev
```

Then open `http://localhost:5173` and click the **"Support Chat"** button in the bottom-right corner.

### 💬 Try These Queries

The chatbot understands:
- "I need to book an appointment"
- "What are your consultation hours?"
- "Help with my payment"
- "I want to reschedule"
- "Tell me about clinic services"

### 📁 What Was Added

**Backend:**
- `src/models/Conversation.ts` - Database schema for chat history
- `src/controllers/chatbotController.ts` - Chat logic and response generation
- `src/routes/chatbotRoutes.ts` - API endpoints

**Frontend:**
- `src/api/chatbot.ts` - API client for chatbot communication
- `src/components/Chatbot.tsx` - Chat UI component
- Updated `src/components/Layout.tsx` - Integrated chatbot widget

**Documentation:**
- `CHATBOT_SETUP.md` - Complete setup and customization guide

### 🔧 Customize the Bot

Edit `chatbotController.ts` to customize responses:

```typescript
// Line ~46 in generateChatbotResponse()
if (lowerMessage.includes('your custom trigger')) {
  return "Your custom response here";
}
```

### 🤖 Advanced: Connect Real AI

To use OpenAI or Claude, see the "Extending the Chatbot" section in `CHATBOT_SETUP.md`.

### 📊 View Conversations

Conversations are stored in MongoDB:
```bash
# Connect to MongoDB shell
mongosh

# View conversations
use psychology-clinic
db.conversations.find()
```

### ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Chat button appears in bottom-right
- [ ] Click button to open chat
- [ ] Send a test message
- [ ] Get intelligent response

### ❓ Troubleshooting

**Chat button not showing?**
- Check browser console (F12) for errors
- Verify backend is running

**Messages not sending?**
- Check network tab in browser DevTools
- Ensure backend endpoint: `POST /api/chatbot/message`

**No response?**
- Check MongoDB is running
- View backend terminal for errors

### 📚 See Also

- Full documentation: `CHATBOT_SETUP.md`
- Backend routes: `backend/src/routes/chatbotRoutes.ts`
- UI component: `frontend/src/components/Chatbot.tsx`

---

Enjoy your new chatbot! 🎉
