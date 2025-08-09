# 🚀 Gemini Chat Setup & API Security Guide

## 🔐 **CRITICAL: API Key Security First**

### **1. Gemini Only**
We use Gemini for AI. No OpenAI key is required.

### **2. Get Gemini API Key**
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key for use in your environment

## 🛠️ **Environment Setup**

### **Update Local Environment**
Edit `backend/env.local`:

```bash
# API Keys (replace with your actual keys)
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
```

### **Update Production Environment**
Edit your production environment file (e.g., `backend/env.production`):

```bash
# API Keys
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
```

## ✅ **Current Implementation Status**

### **✅ Already Implemented:**
1. **Gemini Utilities** (`backend/ai_services/gemini_utils.py`)
   - Complete Gemini API integration
   - Multiple model support (gemini-1.5-flash, gemini-1.5-pro)
   - Specialized functions for AI agents, content generation, and insights

2. **Backend API Endpoint** (`backend/ai_services/views.py`)
   - `GeminiChatView` - Complete chat implementation
   - Agent personality mapping
   - Conversation history support
   - Error handling and logging

3. **Frontend Chat Interface** (`frontend/src/components/AIChatInterface.tsx`)
   - Real-time chat UI
   - Integration with Gemini API
   - Loading states and error handling

4. **URL Configuration** (`backend/ai_services/urls.py`)
   - `/ai-services/gemini-chat/` endpoint configured

5. **Dependencies**
   - `google-generativeai==0.3.2` in requirements
   - Django settings configured

## 🧪 **Testing the Gemini Chat**

### **1. Start the Backend**
```bash
cd backend
python manage.py runserver
```

### **2. Start the Frontend**
```bash
cd frontend
npm run dev
```

### **3. Test Chat Functionality**
1. Navigate to the AI Agents page
2. Click on any AI agent to open chat
3. Send a message - it should now use real Gemini API

### **4. Test API Endpoint Directly**
```bash
curl -X POST http://localhost:8000/api/ai-services/gemini-chat/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello, can you help me with marketing strategy?",
    "agent_name": "Marketing Assistant",
    "agent_specialization": "campaign_optimization"
  }'
```

## 🔧 **Available AI Agent Specializations**

The system supports these specialized agents:

1. **`lead_nurturing`** - Lead nurturing specialist
2. **`brand_identity`** - Creative, brand-conscious specialist
3. **`campaign_optimization`** - Data-driven campaign optimizer
4. **`budget_analysis`** - Financial expert
5. **`content_creation`** - Creative content specialist
6. **`general`** - General marketing assistant

## 🚨 **Security Checklist**

### **✅ Completed:**
- [x] Gemini API integration implemented
- [x] Environment variables configured
- [x] Error handling in place
- [x] User authentication required
- [x] API key validation

### **⚠️ Action Required:**
- [ ] **Replace exposed OpenAI key**
- [ ] **Add Gemini API key to environment**
- [ ] **Test chat functionality**
- [ ] **Monitor API usage**

## 📊 **Monitoring & Usage**

### **Check API Usage**
The system logs all AI interactions. Check the logs:

```bash
# View Django logs
python manage.py shell
>>> from ai_services.models import AIInteractionLog
>>> AIInteractionLog.objects.all().order_by('-timestamp')[:10]
```

### **Monitor Gemini API Usage**
- Check [Google AI Studio](https://makersuite.google.com/app/apikey) for usage metrics
- Monitor your billing and quotas

## 🔄 **Next Steps**

1. **Immediately replace your OpenAI key**
2. **Add your Gemini API key to environment files**
3. **Test the chat functionality**
4. **Monitor API usage and costs**
5. **Consider implementing rate limiting if needed**

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Gemini API key not configured"**
   - Check that `GOOGLE_GEMINI_API_KEY` is set in your environment
   - Restart the Django server after updating environment

2. **"Failed to process chat message"**
   - Check Gemini API key validity
   - Verify internet connection
   - Check Django logs for detailed error

3. **Frontend not connecting**
   - Verify backend is running on correct port
   - Check CORS settings
   - Ensure authentication token is valid

### **Debug Commands:**
```bash
# Test Gemini connection
python manage.py shell
>>> from ai_services.gemini_utils import call_gemini_api
>>> call_gemini_api("Hello, test message")
```

## 🎉 **Success Indicators**

You'll know everything is working when:
- ✅ Chat messages get real responses from Gemini
- ✅ No more placeholder/mock responses
- ✅ AI agents respond with specialized knowledge
- ✅ Conversation history is maintained
- ✅ No API key errors in logs

---

**🚀 Your Gemini chat is ready to go! Just add your API keys and test it out.**
