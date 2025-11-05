// RepoInput.jsx (with quick example buttons)
import { Search, Loader, Github, Sparkles } from 'lucide-react';
import { useState } from 'react';

const RepoInput = ({ repoUrl, setRepoUrl, handleFetchRepo, loading }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleFetchRepo();
    }
  };

  const examples = [
    'https://github.com/facebook/react',
    'https://github.com/vuejs/vue',
    'https://github.com/pallets/flask'
  ];

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'} pointer-events-none`}></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800/50 overflow-hidden">
          <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">
                Enter GitHub Repository URL
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] text-slate-600 font-mono">
                Press Enter ↵
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Search className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-indigo-400' : 'text-slate-500'}`} />
                </div>

                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="https://github.com/username/repository"
                  disabled={loading}
                  className="w-full pl-12 pr-5 py-4 bg-slate-950/50 border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-slate-200 placeholder-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {repoUrl && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-[10px] text-slate-600 font-mono">
                      {repoUrl.length} chars
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleFetchRepo}
                disabled={loading || !repoUrl.trim()}
                className="group/btn relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                
                {loading ? (
                  <>
                    <Loader className="relative w-5 h-5 animate-spin" />
                    <span className="relative">Loading</span>
                  </>
                ) : (
                  <>
                    <Search className="relative w-5 h-5" />
                    <span className="relative">Visualize</span>
                  </>
                )}
              </button>
            </div>

            {/* Examples */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">Try a popular repo:</p>
              <div className="flex items-center gap-2">
                {examples.map((ex, idx) => (
                  <button key={idx} onClick={() => setRepoUrl(ex)} className="text-xs px-3 py-1 rounded-md bg-slate-800/30 hover:bg-indigo-600/10 transition">{ex.split('/').slice(-2).join('/')}</button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
              <span className="mt-0.5">💡</span>
              <p>
                Make sure the repository is <span className="text-indigo-400 font-medium">public</span> and accessible. 
                Private repositories are not supported yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoInput;
