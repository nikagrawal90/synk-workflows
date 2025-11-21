import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Unified LLM Service - Abstracts different LLM providers
 * Supports: Anthropic Claude, OpenAI GPT, Google Gemini
 */

class LLMService {
  constructor() {
    this.clients = {};
    this.pricing = {
      // Pricing per million tokens (input / output)
      'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
      'gpt-4-turbo-preview': { input: 10.0, output: 30.0 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
      'gemini-1.5-pro': { input: 1.25, output: 5.0 },
      'gemini-1.5-flash': { input: 0.075, output: 0.3 },
    };
  }

  initializeClient(provider, apiKey) {
    if (!apiKey) {
      throw new Error(`API key not provided for ${provider}`);
    }

    switch (provider) {
      case 'anthropic':
        this.clients.anthropic = new Anthropic({ apiKey });
        break;
      case 'openai':
        this.clients.openai = new OpenAI({ apiKey });
        break;
      case 'google':
        this.clients.google = new GoogleGenerativeAI(apiKey);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async generateCompletion({ provider, model, messages, systemPrompt, temperature = 0.7, maxTokens = 4096, apiKey }) {
    // Initialize client with API key if provided
    if (apiKey) {
      this.initializeClient(provider, apiKey);
    }

    const startTime = Date.now();
    let response, inputTokens, outputTokens;

    try {
      switch (provider) {
        case 'anthropic':
          response = await this.callAnthropic({ model, messages, systemPrompt, temperature, maxTokens });
          inputTokens = response.usage.input_tokens;
          outputTokens = response.usage.output_tokens;
          break;

        case 'openai':
          response = await this.callOpenAI({ model, messages, systemPrompt, temperature, maxTokens });
          inputTokens = response.usage.prompt_tokens;
          outputTokens = response.usage.completion_tokens;
          break;

        case 'google':
          response = await this.callGoogle({ model, messages, systemPrompt, temperature, maxTokens });
          inputTokens = response.usage.inputTokens;
          outputTokens = response.usage.outputTokens;
          break;

        default:
          throw new Error(`Provider ${provider} not supported`);
      }

      const latency = Date.now() - startTime;
      const cost = this.calculateCost(model, inputTokens, outputTokens);

      return {
        content: response.content,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        cost,
        latency,
        provider,
        model,
      };
    } catch (error) {
      console.error(`Error calling ${provider}:`, error);
      throw new Error(`LLM API Error (${provider}): ${error.message}`);
    }
  }

  async callAnthropic({ model, messages, systemPrompt, temperature, maxTokens }) {
    if (!this.clients.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    const response = await this.clients.anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    return {
      content: response.content[0].text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  }

  async callOpenAI({ model, messages, systemPrompt, temperature, maxTokens }) {
    if (!this.clients.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await this.clients.openai.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage,
    };
  }

  async callGoogle({ model, messages, systemPrompt, temperature, maxTokens }) {
    if (!this.clients.google) {
      throw new Error('Google client not initialized');
    }

    const genModel = this.clients.google.getGenerativeModel({
      model: model || 'gemini-1.5-flash',
    });

    // Combine system prompt with messages for Gemini
    const prompt = systemPrompt
      ? `${systemPrompt}\n\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
      : messages.map(m => m.content).join('\n');

    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const response = result.response;

    return {
      content: response.text(),
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      },
    };
  }

  calculateCost(model, inputTokens, outputTokens) {
    const pricing = this.pricing[model];
    if (!pricing) {
      return 0;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return {
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat((inputCost + outputCost).toFixed(6)),
    };
  }

  getAvailableModels(provider) {
    const models = {
      anthropic: [
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', tier: 'premium' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', tier: 'fast' },
      ],
      openai: [
        { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', tier: 'premium' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'fast' },
      ],
      google: [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tier: 'premium' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tier: 'fast' },
      ],
    };

    return models[provider] || [];
  }
}

export default new LLMService();
