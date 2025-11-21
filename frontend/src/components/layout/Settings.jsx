import React, { useState } from 'react';
import { Key, Check, X, ExternalLink, AlertCircle } from 'lucide-react';
import useStore from '../../services/store';

/**
 * Settings page for API key management
 */
const Settings = () => {
  const { apiKeys, setApiKey } = useStore();
  const [localKeys, setLocalKeys] = useState({ ...apiKeys });
  const [validating, setValidating] = useState({});
  const [validation, setValidation] = useState({});
  const [saved, setSaved] = useState(false);

  const providers = [
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Access Claude 3.5 Sonnet and Haiku models',
      docsUrl: 'https://console.anthropic.com/',
      placeholder: 'sk-ant-...',
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Access GPT-4 and GPT-4o models',
      docsUrl: 'https://platform.openai.com/api-keys',
      placeholder: 'sk-...',
    },
    {
      id: 'google',
      name: 'Google Gemini',
      description: 'Access Gemini 1.5 Pro and Flash models',
      docsUrl: 'https://ai.google.dev/',
      placeholder: 'AIza...',
    },
  ];

  const handleKeyChange = (provider, value) => {
    setLocalKeys({ ...localKeys, [provider]: value });
    setValidation({ ...validation, [provider]: null });
  };

  const handleValidate = async (provider) => {
    const apiKey = localKeys[provider];
    if (!apiKey) return;

    setValidating({ ...validating, [provider]: true });

    try {
      const response = await fetch('/api/settings/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      });

      const data = await response.json();

      setValidation({
        ...validation,
        [provider]: data.success ? 'valid' : 'invalid',
      });
    } catch (error) {
      setValidation({ ...validation, [provider]: 'error' });
    } finally {
      setValidating({ ...validating, [provider]: false });
    }
  };

  const handleSave = () => {
    Object.keys(localKeys).forEach((provider) => {
      setApiKey(provider, localKeys[provider]);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasChanges = JSON.stringify(localKeys) !== JSON.stringify(apiKeys);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="section-header">Settings</h2>
        <p className="section-subheader">
          Configure your API keys and preferences for AI models
        </p>
      </div>

      {/* API Keys Section */}
      <div className="space-y-6">
        {providers.map((provider) => {
          const isValidating = validating[provider.id];
          const validationStatus = validation[provider.id];
          const hasKey = localKeys[provider.id];

          return (
            <div key={provider.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Key className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                  </div>
                </div>
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 text-sm"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={localKeys[provider.id] || ''}
                    onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => handleValidate(provider.id)}
                    disabled={!hasKey || isValidating}
                    className="btn btn-secondary"
                  >
                    {isValidating ? 'Validating...' : 'Validate'}
                  </button>
                </div>

                {/* Validation Status */}
                {validationStatus === 'valid' && (
                  <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">API key is valid</span>
                  </div>
                )}
                {validationStatus === 'invalid' && (
                  <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-4 py-2 rounded-lg">
                    <X className="w-4 h-4" />
                    <span className="text-sm">Invalid API key</span>
                  </div>
                )}
                {validationStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Could not validate key</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          {hasChanges
            ? 'You have unsaved changes'
            : 'All changes saved'}
        </p>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`btn ${hasChanges ? 'btn-primary' : 'btn-secondary'}`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2 inline" />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">About API Keys</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• API keys are stored securely in your browser's local storage</li>
          <li>• Keys are never sent to our servers - they're only used for direct API calls</li>
          <li>• You only pay for what you use directly to the AI provider</li>
          <li>• Get your API keys from the respective provider's platform</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
