#  AI Study Assistant - Setup Instructions

## ✅ Implementation Status: COMPLETED

TaskFlow now includes an intelligent AI Study Assistant powered by OpenRouter (Free GPT)! 🎉

## 📋 Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# OpenRouter Configuration
VITE_OPENAI_API_KEY=your_openrouter_api_key_here

# AI Assistant Configuration (Optional - defaults provided)
VITE_AI_MODEL=openai/gpt-oss-120b:free
VITE_AI_MAX_TOKENS=4000
VITE_AI_TEMPERATURE=0.7

# Feature Flags (Optional - defaults to true)
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_SCREENSHOT=true
```

## 🔑 How to Get OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to **Keys** section
4. Click **"Create API Key"**
5. Copy the key and paste it in your `.env` file

## 🔒 Security Notes

- Never commit your `.env` file to version control
- OpenRouter API keys can have various formats
- Keep your API key secure and don't share it publicly

## 🚀 After Setup

Once you've added your API key to the `.env` file:

1. Restart your development server: `npm run dev`
2. The AI chatbot will automatically appear in the bottom-right corner with a beautiful gradient icon
3. Click the chatbot icon to start chatting with your AI Study Assistant!

## 🌟 Features Available

### 💬 **Intelligent Chat Interface**
- Vietnamese-optimized GPT-4 responses
- Context-aware conversations about your tasks
- Smart study recommendations
- Academic culture understanding

### 📸 **Screenshot Analysis**
- One-click screen capture button in chat
- AI analysis of your productivity charts
- Visual data insights and recommendations
- Privacy-first processing (local only)

### 🎓 **Study Guidance**
- "Tôi sắp có lịch học gì?" - Get personalized schedule suggestions
- Task priority analysis and recommendations
- Workload management advice
- Vietnamese student-focused tips

### ⚡ **Smart Features**
- Auto-save chat history
- Typing indicators and animations
- Mobile-responsive design
- Keyboard shortcuts integration

## 🛠 Troubleshooting

- **"API key not found"**: Make sure your `.env` file is in the project root
- **"Invalid API key"**: Verify your key starts with `sk-` and is correct
- **Chatbot not appearing**: Check browser console for errors
