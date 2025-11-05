// SelectedNodeInfo.jsx
import { Folder, FileCode, X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const SelectedNodeInfo = ({ selectedNode, getFileColor, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!selectedNode) return null;

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(selectedNode.fullPath || selectedNode.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };

  return (
    <div className="max-w-7xl mx-auto mb-6 animate-in slide-in-from-top-4 duration-300">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-xl border border-slate-800/50 overflow-hidden shadow-xl">
          <div className="flex items-center gap-4 p-4">
            {/* Icon */}
            <div className={`flex-shrink-0 p-3 rounded-xl ${
              selectedNode.type === 'dir' 
                ? 'bg-slate-800/50 border border-slate-700/50' 
                : 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30'
            }`}>
              {selectedNode.type === 'dir' ? (
                <Folder className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
              ) : (
                <FileCode
                  className="w-6 h-6"
                  style={{ color: getFileColor(selectedNode.name) }}
                  strokeWidth={1.5}
                />
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm text-slate-300 truncate font-medium">
                  {selectedNode.fullPath || selectedNode.name}
                </p>
                <button
                  onClick={handleCopyPath}
                  className="p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors group/copy"
                  title="Copy path"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 group-hover/copy:text-indigo-400" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedNode.type === 'dir'
                    ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {selectedNode.type === 'dir' ? '📁 Directory' : `📄 ${getFileExtension(selectedNode.name)}`}
                </span>
                
                {selectedNode.type === 'file' && (
                  <span className="text-xs text-slate-500 font-mono">
                    • File
                  </span>
                )}
              </div>
            </div>

            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-slate-800/50 rounded-lg transition-colors group/close"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-500 group-hover/close:text-red-400" />
              </button>
            )}
          </div>

          {/* Additional metadata */}
          {selectedNode.type === 'dir' && (
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950/50 rounded-lg p-2 border border-slate-800/30">
                  <p className="text-[10px] text-slate-500 mb-0.5">Path Depth</p>
                  <p className="text-sm font-semibold text-slate-300">
                    {(selectedNode.fullPath || '').split('/').filter(Boolean).length} levels
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedNodeInfo;