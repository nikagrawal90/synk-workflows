import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import WorkflowSelector from './components/layout/WorkflowSelector';
import Settings from './components/layout/Settings';
import LegalTranscriptWorkflow from './components/workflows/legal-transcript/LegalTranscriptWorkflow';

/**
 * Main App Component with Routing
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          {/* Home - Workflow Selector */}
          <Route path="/" element={<WorkflowSelector />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Workflows */}
          <Route
            path="/workflow/legal-transcript"
            element={<LegalTranscriptWorkflow />}
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
