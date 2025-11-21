import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * LLM Provider and Model Selector
 */
const LLMSelector = ({ value, onChange, apiKeys }) => {
  const [selectedProvider, setSelectedProvider] = useState(value?.provider || 'anthropic');
  const [selectedModel, setSelectedModel] = useState(
    value?.model || 'claude-3-5-sonnet-20241022'
  );

  const providers = [
    { id: 'anthropic', name: 'Anthropic Claude' },
    { id: 'openai', name: 'OpenAI GPT' },
    { id: 'google', name: 'Google Gemini' },
  ];

  const models = {
    anthropic: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        tier: 'Premium',
        description: 'Best quality, higher cost',
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        tier: 'Fast',
        description: 'Fast, cost-efficient',
      },
    ],
    openai: [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        tier: 'Premium',
        description: 'Best quality, higher cost',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        tier: 'Fast',
        description: 'Fast, cost-efficient',
      },
    ],
    google: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        tier: 'Premium',
        description: 'Best quality, higher cost',
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        tier: 'Fast',
        description: 'Fast, cost-efficient',
      },
    ],
  };

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    setSelectedProvider(provider);
    const defaultModel = models[provider][0].id;
    setSelectedModel(defaultModel);
    onChange({ provider, model: defaultModel });
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    onChange({ provider: selectedProvider, model });
  };

  const hasApiKey = apiKeys[selectedProvider];
  const currentModels = models[selectedProvider] || [];

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Model Selection</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <select
            value={selectedProvider}
            onChange={handleProviderChange}
            className="input"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="input"
            disabled={!hasApiKey}
          >
            {currentModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.tier}) - {model.description}
              </option>
            ))}
          </select>
        </div>

        {!hasApiKey && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ No API key configured for {providers.find(p => p.id === selectedProvider)?.name}.
              Please add one in Settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMSelector;
