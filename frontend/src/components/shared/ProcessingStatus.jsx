import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Processing status indicator with progress
 */
const ProcessingStatus = ({ status, message, progress = null }) => {
  const statusConfig = {
    idle: {
      icon: null,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
    },
    processing: {
      icon: Loader2,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      animate: true,
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  if (status === 'idle') return null;

  return (
    <div
      className={`card ${config.bgColor} border-2 ${config.borderColor} animate-fadeIn`}
    >
      <div className="flex items-center space-x-4">
        {Icon && (
          <Icon
            className={`w-6 h-6 ${config.color} ${
              config.animate ? 'animate-spin' : ''
            }`}
          />
        )}
        <div className="flex-1">
          <p className={`font-medium ${config.color}`}>{message}</p>
          {progress !== null && status === 'processing' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
