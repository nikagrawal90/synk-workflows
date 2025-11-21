import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Workflow, DollarSign } from 'lucide-react';
import useStore from '../../services/store';

/**
 * Main navigation bar
 */
const Navigation = () => {
  const location = useLocation();
  const { totalCostSession } = useStore();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Synk Workflows</h1>
              <p className="text-xs text-gray-500">AI-Powered Legal Tools</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Session Cost */}
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                ${totalCostSession.toFixed(4)}
              </span>
            </div>

            {/* Settings Link */}
            <Link
              to="/settings"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/settings')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
