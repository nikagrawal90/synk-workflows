import React from 'react';
import { Scale, FileText, Search, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../services/store';

/**
 * Workflow selector - shows available and coming soon workflows
 */
const WorkflowSelector = () => {
  const navigate = useNavigate();
  const { currentWorkflow } = useStore();

  const workflows = [
    {
      id: 'legal-transcript',
      name: 'Legal Transcript Analyzer',
      description: 'Analyze court transcripts with AI-powered insights',
      icon: Scale,
      path: '/workflow/legal-transcript',
      available: true,
      features: [
        'Key takeaways extraction',
        'Comprehensive summaries',
        'Action item tracking',
        'Cost-efficient processing',
      ],
    },
    {
      id: 'contract-review',
      name: 'Contract Review',
      description: 'Automated contract analysis and risk assessment',
      icon: FileText,
      path: '/workflow/contract-review',
      available: false,
      features: [
        'Clause identification',
        'Risk assessment',
        'Compliance checking',
        'Redlining suggestions',
      ],
    },
    {
      id: 'legal-research',
      name: 'Legal Research',
      description: 'AI-assisted case law and statute research',
      icon: Search,
      path: '/workflow/legal-research',
      available: false,
      features: [
        'Case law search',
        'Precedent analysis',
        'Citation checking',
        'Brief preparation',
      ],
    },
  ];

  const handleWorkflowClick = (workflow) => {
    if (workflow.available) {
      navigate(workflow.path);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="section-header">Select a Workflow</h2>
        <p className="section-subheader">
          Choose from our AI-powered legal workflows to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => {
          const Icon = workflow.icon;
          const isActive = currentWorkflow === workflow.id;

          return (
            <div
              key={workflow.id}
              onClick={() => handleWorkflowClick(workflow)}
              className={`card transition-all duration-200 ${
                workflow.available
                  ? 'cursor-pointer hover:shadow-lg hover:scale-105'
                  : 'opacity-60 cursor-not-allowed'
              } ${isActive ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    workflow.available
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 ${
                      workflow.available
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
                {!workflow.available && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Coming Soon</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {workflow.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>

              <div className="space-y-2">
                {workflow.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {workflow.available && (
                <button className="mt-6 w-full btn btn-primary">
                  Launch Workflow
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSelector;
