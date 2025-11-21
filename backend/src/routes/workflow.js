import express from 'express';
import legalTranscriptService from '../services/legalTranscriptService.js';
import llmService from '../services/llmService.js';

const router = express.Router();

/**
 * POST /api/workflow/legal-transcript
 * Process a legal transcript
 */
router.post('/legal-transcript', async (req, res) => {
  try {
    const { text, provider, model, apiKey, strategy } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    if (!provider || !model) {
      return res.status(400).json({ error: 'Provider and model are required' });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is required. Please configure it in Settings.',
      });
    }

    // Process the transcript
    const results = await legalTranscriptService.processTranscript({
      text,
      provider,
      model,
      apiKey,
      strategy: strategy || 'balanced',
    });

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error processing legal transcript:', error);
    res.status(500).json({
      error: 'Failed to process transcript',
      message: error.message,
    });
  }
});

/**
 * GET /api/workflow/models
 * Get available models for a provider
 */
router.get('/models/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const models = llmService.getAvailableModels(provider);

    res.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message,
    });
  }
});

export default router;
