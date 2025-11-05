// VisualizationCanvas.jsx (polished, fixed icons)
import { MousePointer2, ZoomIn, Move, Eye, Maximize2 } from 'lucide-react';

const VisualizationCanvas = ({ svgRef, loading, onFit }) => {
  const instructions = [
    { icon: MousePointer2, text: 'Click nodes to expand/collapse' },
    { icon: ZoomIn, text: 'Scroll to zoom' },
    { icon: Move, text: 'Drag to pan' },
    { icon: Eye, text: 'Hover for file preview' }
  ];

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none"></div>
      
      <div
        className="relative bg-slate-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/40 overflow-hidden"
        style={{ height: '750px' }}
      >
        {/* Header with instructions */}
        <div className="relative z-20 px-6 py-4 bg-gradient-to-r from-slate-900/80 to-slate-900/60 border-b border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
              <h3 className="text-sm font-semibold text-slate-300">
                Interactive Visualization
              </h3>
            </div>
            
            {/* Quick controls */}
            <div className="flex items-center gap-2">
              <button onClick={onFit} className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-600/10 rounded-lg border border-indigo-700/20 text-indigo-300 hover:bg-indigo-600/20 transition">
                <Maximize2 className="w-4 h-4" /> Fit
              </button>
              <div className="hidden md:flex items-center gap-4">
                {instructions.map(({ icon: Icon, text }, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/40 border border-slate-800/30 rounded-lg hover:border-indigo-500/30 transition-colors pointer-events-none"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Canvas container */}
        <div className="relative bg-slate-950/50 overflow-hidden" style={{ height: 'calc(100% - 73px)' }}>
          {/* Decorative grid (no pointer events) */}
          <div
            className="absolute inset-0 opacity-8 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(71,85,105,0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(71,85,105,0.12) 1px, transparent 1px)
              `,
              backgroundSize: '44px 44px'
            }}
          ></div>

          {/* Soft vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/10 to-transparent pointer-events-none"></div>
          
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 font-medium">Building visualization...</p>
              </div>
            </div>
          )}
          
          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing transition-colors relative z-10"
            style={{ pointerEvents: 'all' }}
          />

          {/* Corner hint */}
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-lg shadow-xl z-30 pointer-events-none">
            <p className="text-[11px] text-slate-400 font-medium">
              🖱️ <span className="text-slate-300">Interactive canvas</span> • Double-click files to view content
            </p>
          </div>

          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-lg shadow-xl z-30 pointer-events-none">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] text-slate-300 font-mono">
                100%
              </span>
            </div>
          </div>
        </div>

        {/* Mobile instructions */}
        <div className="md:hidden absolute bottom-4 right-4 left-4 z-30 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4 shadow-2xl">
            <p className="text-xs text-slate-400 mb-3 font-semibold">Quick Controls:</p>
            <div className="grid grid-cols-2 gap-2">
              {instructions.map(({ icon: Icon, text }, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" strokeWidth={2} />
                  <span className="text-[11px] text-slate-400">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationCanvas;
