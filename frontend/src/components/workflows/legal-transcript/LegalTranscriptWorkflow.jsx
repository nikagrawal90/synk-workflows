import React, { useState } from 'react';
import { Scale, FileText, ListChecks, Download } from 'lucide-react';
import FileUpload from '../../shared/FileUpload';
import LLMSelector from '../../shared/LLMSelector';
import ProcessingStatus from '../../shared/ProcessingStatus';
import ResultSection from '../../shared/ResultSection';
import CostTracker from '../../shared/CostTracker';
import useStore from '../../../services/store';

/**
 * Legal Transcript Analyzer Workflow
 */
const LegalTranscriptWorkflow = () => {
  const { apiKeys, setIsProcessing, addResult, addCost, totalCostSession } = useStore();

  const [transcriptText, setTranscriptText] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedLLM, setSelectedLLM] = useState({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
  });
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState(null);
  const [currentCost, setCurrentCost] = useState(0);

  const handleFileLoad = (text, file) => {
    setTranscriptText(text);
    setFileName(file?.name || '');
    setResults(null);
    setStatus('idle');
  };

  const handleLLMChange = (selection) => {
    setSelectedLLM(selection);
  };

  const handleAnalyze = async () => {
    if (!transcriptText) {
      alert('Please upload a transcript file first');
      return;
    }

    const apiKey = apiKeys[selectedLLM.provider];
    if (!apiKey) {
      alert(`Please configure your ${selectedLLM.provider} API key in Settings`);
      return;
    }

    setStatus('processing');
    setStatusMessage('Analyzing transcript...');
    setIsProcessing(true);
    setResults(null);

    try {
      const response = await fetch('/api/workflow/legal-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcriptText,
          provider: selectedLLM.provider,
          model: selectedLLM.model,
          apiKey,
          strategy: 'balanced',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process transcript');
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setCurrentCost(data.results.totalCost);
        addCost(data.results.totalCost);
        addResult({
          workflow: 'legal-transcript',
          fileName,
          cost: data.results.totalCost,
          provider: selectedLLM.provider,
          model: selectedLLM.model,
        });
        setStatus('success');
        setStatusMessage('Analysis complete!');
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      setStatus('error');
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJSON = () => {
    if (!results) return;

    const exportData = {
      fileName,
      timestamp: new Date().toISOString(),
      provider: selectedLLM.provider,
      model: selectedLLM.model,
      cost: currentCost,
      results: {
        keyTakeaways: results.keyTakeaways,
        summary: results.summary,
        actionItems: results.actionItems,
      },
      metadata: results.metadata,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.txt', '')}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    if (!results) return;

    const exportText = `LEGAL TRANSCRIPT ANALYSIS
Generated: ${new Date().toLocaleString()}
File: ${fileName}
Model: ${selectedLLM.provider} - ${selectedLLM.model}
Cost: $${currentCost.toFixed(4)}

${'='.repeat(80)}

KEY TAKEAWAYS:
${results.keyTakeaways}

${'='.repeat(80)}

SUMMARY:
${results.summary}

${'='.repeat(80)}

ACTION ITEMS:
${results.actionItems}

${'='.repeat(80)}

TRANSCRIPT METADATA:
- Speakers: ${results.metadata?.speakers?.join(', ') || 'N/A'}
- Sections: ${results.metadata?.sections?.join(', ') || 'N/A'}
- Estimated Tokens: ${results.metadata?.estimatedTokens || 'N/A'}
- Processing Chunks: ${results.processing?.chunks || 1}
`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.txt', '')}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Scale className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Legal Transcript Analyzer
            </h2>
            <p className="text-gray-600">
              AI-powered analysis of court transcripts with paralegal-level expertise
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <FileUpload onFileLoad={handleFileLoad} accept=".txt" />
        </div>
        <div>
          <LLMSelector value={selectedLLM} onChange={handleLLMChange} apiKeys={apiKeys} />
          <button
            onClick={handleAnalyze}
            disabled={!transcriptText || status === 'processing'}
            className="btn btn-primary w-full mt-4"
          >
            {status === 'processing' ? 'Analyzing...' : 'Analyze Transcript'}
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {status !== 'idle' && (
        <div className="mb-8">
          <ProcessingStatus status={status} message={statusMessage} />
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-fadeIn">
          {/* Cost Tracker */}
          <CostTracker currentCost={currentCost} sessionTotal={totalCostSession} />

          {/* Export Buttons */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Export Results</h3>
              <div className="flex space-x-3">
                <button onClick={handleExportText} className="btn btn-secondary">
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export as Text
                </button>
                <button onClick={handleExportJSON} className="btn btn-primary">
                  <Download className="w-4 h-4 mr-2 inline" />
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <ResultSection
            title="Key Takeaways"
            content={results.keyTakeaways}
            icon={Scale}
            defaultOpen={true}
          />

          <ResultSection
            title="Summary"
            content={results.summary}
            icon={FileText}
            defaultOpen={true}
          />

          <ResultSection
            title="Action Items"
            content={results.actionItems}
            icon={ListChecks}
            defaultOpen={true}
          />

          {/* Metadata */}
          {results.metadata && (
            <div className="card bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Processing Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Speakers:</span>
                  <p className="font-medium text-gray-900">
                    {results.metadata.speakers?.length || 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Sections:</span>
                  <p className="font-medium text-gray-900">
                    {results.metadata.sections?.length || 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Tokens:</span>
                  <p className="font-medium text-gray-900">
                    {results.metadata.estimatedTokens?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Chunks:</span>
                  <p className="font-medium text-gray-900">
                    {results.processing?.chunks || 1}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalTranscriptWorkflow;
