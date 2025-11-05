// RepoInfo.jsx (icon import fixes: use ZoomIn / ZoomOut / Maximize2)
import { Code2, Package, GitFork, Clock, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

const RepoInfo = ({ 
  repoData, 
  handleZoomIn, 
  handleZoomOut, 
  handleResetZoom, 
  handleDownload,
  handleExpandAll,
  handleCollapseAll,
  handleFitView
}) => {
  const fileCount = repoData.structure.filter(item => item.type === 'file').length;
  const dirCount = repoData.structure.filter(item => item.type === 'dir').length;

  return (
    <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex-1 relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-800/50">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-500 p-4 rounded-xl shadow-2xl shadow-indigo-500/30">
              <Code2 className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-slate-200 truncate">
                  <span className="text-slate-400 mr-2">{repoData.owner}/</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {repoData.repo_name}
                  </span>
                </h2>

                <div className="ml-4 flex items-center gap-2">
                  <button onClick={handleExpandAll} className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 hover:bg-indigo-600/20 transition">Expand All</button>
                  <button onClick={handleCollapseAll} className="px-3 py-1 bg-slate-800/30 border border-slate-700/20 rounded-lg text-xs text-slate-300 hover:bg-slate-800/40 transition">Collapse</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/30 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs text-slate-400 font-medium">Files</span>
                  </div>
                  <p className="text-lg font-bold text-slate-200">{fileCount}</p>
                </div>
                
                <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/30 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-400 font-medium">Directories</span>
                  </div>
                  <p className="text-lg font-bold text-slate-200">{dirCount}</p>
                </div>
                
                <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/30 hover:border-green-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <GitFork className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-slate-400 font-medium">Total Items</span>
                  </div>
                  <p className="text-lg font-bold text-slate-200">{repoData.structure.length}</p>
                </div>
                
                <div className="bg-slate-950/40 rounded-lg p-3 border border-slate-800/30 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs text-slate-400 font-medium">Branch</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {repoData.default_branch || 'main'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <div className="flex items-center gap-2">
                <button onClick={handleZoomIn} className="p-2 rounded-lg bg-slate-800/30 hover:bg-indigo-700/20 transition" title="Zoom In">
                  <ZoomIn className="w-4 h-4 text-indigo-300" />
                </button>
                <button onClick={handleZoomOut} className="p-2 rounded-lg bg-slate-800/30 hover:bg-indigo-700/20 transition" title="Zoom Out">
                  <ZoomOut className="w-4 h-4 text-slate-300" />
                </button>
                <button onClick={handleResetZoom} className="p-2 rounded-lg bg-slate-800/30 hover:bg-indigo-700/20 transition" title="Reset Zoom">
                  <Maximize2 className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleFitView} className="px-2 py-1 rounded-lg bg-indigo-600/10 text-indigo-300 text-xs hover:bg-indigo-600/20 transition">Fit</button>
                <button onClick={handleDownload} className="px-2 py-1 rounded-lg bg-slate-800/30 text-slate-300 text-xs hover:bg-slate-800/40 transition flex items-center gap-2"><Download className="w-4 h-4"/> Export</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoInfo;
