/**
 * API Service - Frontend to Backend Communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  /**
   * Process a legal transcript
   */
  async processLegalTranscript({ text, provider, model, apiKey, strategy = 'balanced' }) {
    const response = await fetch(`${API_BASE_URL}/workflow/legal-transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        provider,
        model,
        apiKey,
        strategy,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process transcript');
    }

    return response.json();
  }

  /**
   * Get available models for a provider
   */
  async getModels(provider) {
    const response = await fetch(`${API_BASE_URL}/workflow/models/${provider}`);

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    return response.json();
  }

  /**
   * Validate an API key
   */
  async validateApiKey(provider, apiKey) {
    const response = await fetch(`${API_BASE_URL}/settings/validate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        apiKey,
      }),
    });

    return response.json();
  }

  /**
   * Get list of supported providers
   */
  async getProviders() {
    const response = await fetch(`${API_BASE_URL}/settings/providers`);

    if (!response.ok) {
      throw new Error('Failed to fetch providers');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
}

export default new ApiService();
