import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

/**
 * Cost tracking display component
 */
const CostTracker = ({ currentCost, sessionTotal }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Current Analysis</p>
            <p className="text-2xl font-bold text-green-700">
              ${currentCost?.toFixed(4) || '0.0000'}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Session Total</p>
            <p className="text-2xl font-bold text-blue-700">
              ${sessionTotal?.toFixed(4) || '0.0000'}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostTracker;
