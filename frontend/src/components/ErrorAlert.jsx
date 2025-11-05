// ErrorAlert.jsx
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const ErrorAlert = ({ message, onRetry, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss && setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative group">
        {/* Animated border gradient */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity"></div>
        
        <div className="relative bg-red-950/40 backdrop-blur-xl border border-red-800/40 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 bg-red-900/30 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" strokeWidth={2} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-semibold text-red-300 text-lg">
                  Something went wrong
                </h3>
                {onDismiss && (
                  <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-red-900/30 rounded-lg transition-colors"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
              
              <p className="text-red-200/90 text-sm leading-relaxed mb-4">
                {message}
              </p>
              
              {/* Actions */}
              {onRetry && (
                <div className="flex gap-2">
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-700/40 rounded-lg text-red-200 text-sm font-medium transition-all duration-200 flex items-center gap-2 group/btn"
                  >
                    <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Error code hint */}
          <div className="mt-4 pt-4 border-t border-red-800/30">
            <p className="text-xs text-red-400/60 font-mono">
              💡 Tip: Make sure the repository is public and the URL is correct
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;