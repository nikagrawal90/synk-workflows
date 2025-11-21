import express from 'express';
import llmService from '../services/llmService.js';

const router = express.Router();

/**
 * POST /api/settings/validate-key
 * Validate an API key by making a test call
 */
router.post('/validate-key', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        error: 'Provider and API key are required',
      });
    }

    // Make a minimal test call to validate the key
    const testMessage = [{ role: 'user', content: 'Say "test successful"' }];

    try {
      await llmService.generateCompletion({
        provider,
        model: provider === 'anthropic' ? 'claude-3-haiku-20240307' :
               provider === 'openai' ? 'gpt-4o-mini' :
               'gemini-1.5-flash',
        messages: testMessage,
        systemPrompt: '',
        temperature: 0.5,
        maxTokens: 10,
        apiKey,
      });

      res.json({
        success: true,
        message: 'API key is valid',
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({
      error: 'Failed to validate API key',
      message: error.message,
    });
  }
});

/**
 * GET /api/settings/providers
 * Get list of supported providers
 */
router.get('/providers', (req, res) => {
  res.json({
    success: true,
    providers: [
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        requiresKey: true,
        docsUrl: 'https://console.anthropic.com/',
      },
      {
        id: 'openai',
        name: 'OpenAI GPT',
        requiresKey: true,
        docsUrl: 'https://platform.openai.com/',
      },
      {
        id: 'google',
        name: 'Google Gemini',
        requiresKey: true,
        docsUrl: 'https://ai.google.dev/',
      },
    ],
  });
});

export default router;
