// RepoSearch.jsx
import React, { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

const RepoSearch = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className='w-7/12 mx-auto mb-8 animate-in slide-in-from-top-4 duration-500'>
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur transition-opacity duration-300 ${
          isFocused ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
        }`}></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/50 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">
                Search Repository
              </span>
            </div>
            {searchTerm && (
              <span className="text-[10px] text-indigo-400 font-mono">
                {searchTerm.length > 0 ? 'Filtering...' : ''}
              </span>
            )}
          </div>

          {/* Search input */}
          <div className='px-6 py-5'>
            <div className="relative">
              {/* Search icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className={`w-5 h-5 transition-colors duration-200 ${
                  isFocused ? 'text-indigo-400' : 'text-slate-500'
                }`} strokeWidth={2} />
              </div>

              {/* Input */}
              <input
                type="text"
                placeholder="Search files or folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-slate-200 placeholder-slate-500 transition-all duration-200"
              />

              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors group/clear"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-slate-500 group-hover/clear:text-red-400 transition-colors" />
                </button>
              )}
            </div>

            {/* Search stats */}
            {searchTerm && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <div className="flex-1 h-1 bg-slate-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <span className="text-slate-500 font-medium">
                  Searching: <span className="text-indigo-400">{searchTerm}</span>
                </span>
              </div>
            )}
          </div>

          {/* Tips section */}
          <div className="px-6 py-3 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-t border-slate-800/30">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>💡 Tip: Search is case-insensitive</span>
              <span className="font-mono">Highlighted nodes show matches</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoSearch;