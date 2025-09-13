// AI Configuration
// This file contains AI-related configuration settings

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enableAI: boolean;
  enableScreenshot: boolean;
}

// Default configuration for OpenRouter
export const defaultAIConfig: Omit<AIConfig, 'apiKey'> = {
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  maxTokens: 4000,
  temperature: 0.7,
  enableAI: true,
  enableScreenshot: true,
};

// Get AI configuration from environment variables
export const getAIConfig = (): AIConfig => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  
  if (!apiKey) {
    console.warn('OpenRouter API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
  }

  return {
    apiKey,
    model: import.meta.env.VITE_AI_MODEL || defaultAIConfig.model,
    maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS) || defaultAIConfig.maxTokens,
    temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE) || defaultAIConfig.temperature,
    enableAI: import.meta.env.VITE_ENABLE_AI_ASSISTANT !== 'false',
    enableScreenshot: import.meta.env.VITE_ENABLE_SCREENSHOT !== 'false',
  };
};

// Validate AI configuration for OpenRouter
export const validateAIConfig = (config: AIConfig): boolean => {
  if (!config.apiKey) {
    console.error('OpenRouter API key is required. Please check your configuration.');
    return false;
  }
  
  // OpenRouter API keys can have various formats
  if (config.apiKey.length < 10) {
    console.error('Invalid OpenRouter API key format. Please check your configuration.');
    return false;
  }
  
  return true;
};
