import { getAIConfig, validateAIConfig } from '../config/aiConfig';
import { Task } from '../types/Task';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface OpenAIResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class OpenAIService {
  private config = getAIConfig();
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  // Vietnamese-optimized system prompt for student assistant
  private systemPrompt = `Bạn là AI Study Assistant - trợ lý học tập thông minh dành cho sinh viên Việt Nam.

NHIỆM VỤ:
- Hỗ trợ sinh viên quản lý thời gian và công việc học tập hiệu quả
- Đưa ra lời khuyên về lịch học, ưu tiên công việc, và kỹ thuật học tập
- Hiểu văn hóa học tập Việt Nam và môi trường đại học
- Giao tiếp thân thiện, hữu ích bằng tiếng Việt

NGUYÊN TẮC:
1. Luôn trả lời bằng tiếng Việt trừ khi được yêu cầu khác
2. Đưa ra lời khuyên thực tế, có thể thực hiện được
3. Ưu tiên sức khỏe tinh thần và cân bằng cuộc sống
4. Khuyến khích thói quen học tập tích cực
5. Hiểu bối cảnh sinh viên Việt Nam (kỳ thi, học kỳ, áp lực học tập)

CHUYÊN MÔN:
- Quản lý thời gian và lập kế hoạch học tập
- Phân tích workload và đề xuất ưu tiên
- Kỹ thuật học tập hiệu quả (Pomodoro, spaced repetition, etc.)
- Cân bằng giữa học tập và nghỉ ngơi
- Chuẩn bị kỳ thi và deadline`;

  constructor() {
    if (!validateAIConfig(this.config)) {
      console.warn('AI configuration is invalid. Some features may not work properly.');
    }
  }

  // Main method to send chat messages
  async sendMessage(
    messages: ChatMessage[],
    context?: {
      tasks?: Task[];
      currentView?: string;
      userQuestion?: string;
    }
  ): Promise<OpenAIResponse> {
    if (!this.config.enableAI) {
      throw new Error('AI Assistant is disabled');
    }

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Prepare messages with system prompt and context
      const contextualSystemPrompt = this.buildContextualPrompt(context);
      const apiMessages = [
        { role: 'system', content: contextualSystemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'TaskFlow AI Assistant'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: apiMessages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          // OpenRouter specific settings
          provider: {
            allow_fallbacks: true,
            data_collection: "deny" // Important: deny data collection for privacy
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI API');
      }

      return {
        message: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined
      };

    } catch (error) {
      console.error('OpenAI Service Error:', error);
      
      // Return fallback response for better UX
      if (error instanceof Error && error.message.includes('API key')) {
        throw error; // Re-throw API key errors
      }
      
      return {
        message: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút. '
      };
    }
  }

  // Build contextual system prompt based on user data
  private buildContextualPrompt(context?: {
    tasks?: Task[];
    currentView?: string;
    userQuestion?: string;
  }): string {
    let contextualPrompt = this.systemPrompt;

    if (context?.tasks && context.tasks.length > 0) {
      const taskSummary = this.analyzeTasksForContext(context.tasks);
      contextualPrompt += `\n\nBỐI CẢNH HIỆN TẠI:\n${taskSummary}`;
    }

    if (context?.currentView) {
      contextualPrompt += `\n\nNGƯỜI DÙNG ĐANG XEM: ${context.currentView} view`;
    }

    return contextualPrompt;
  }

  // Analyze tasks to provide context for AI
  private analyzeTasksForContext(tasks: Task[]): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed').length,
      dueSoon: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const dueDate = new Date(t.dueDate);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
      }).length
    };

    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    
    return `Người dùng có ${stats.total} task:
- ${stats.completed} đã hoàn thành
- ${stats.pending} đang chờ
- ${stats.inProgress} đang thực hiện  
- ${stats.overdue} quá hạn
- ${stats.dueSoon} sắp đến hạn (3 ngày)
- ${highPriorityTasks} ưu tiên cao chưa xong

Hãy đưa ra lời khuyên phù hợp với tình hình này.`;
  }

  // Generate study schedule suggestions
  async generateStudySchedule(tasks: Task[]): Promise<string> {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Dựa vào các task hiện tại, hãy đề xuất lịch học phù hợp cho tôi trong tuần này.',
      timestamp: new Date()
    };

    const response = await this.sendMessage([message], { tasks: incompleteTasks });
    return response.message;
  }

  // Analyze screenshot and provide insights
  async analyzeScreenshot(screenshotData: string, context: string): Promise<string> {
    // Note: This is a placeholder for screenshot analysis
    // In a real implementation, you would use OpenAI's vision capabilities
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Tôi vừa chụp màn hình ${context}. Hãy phân tích và đưa ra lời khuyên.`,
      timestamp: new Date()
    };

    const response = await this.sendMessage([message]);
    return response.message;
  }

  // Check if AI service is available
  isAvailable(): boolean {
    return this.config.enableAI && !!this.config.apiKey && validateAIConfig(this.config);
  }

  // Get current configuration
  getConfig() {
    return {
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      enableAI: this.config.enableAI,
      enableScreenshot: this.config.enableScreenshot,
      hasApiKey: !!this.config.apiKey
    };
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
