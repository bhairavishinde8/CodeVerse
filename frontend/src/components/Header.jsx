// Header.jsx
import { GitBranch, Github, Sparkles } from 'lucide-react';

const Header = () => (
  <div className="text-center mb-16 relative select-none">
    {/* Background gradient effect */}
    <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-3xl pointer-events-none">
      <div className="w-96 h-96 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
    </div>
    
    <div className="relative">
      {/* Icon */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="relative group">
          {/* Animated glow rings */}
          <div className="absolute -inset-1 bg-indigo-500/10 rounded-full animate-pulse blur-2xl"></div>
          <div className="absolute -inset-2 bg-purple-500/10 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
          
          {/* Icon container */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-400">
            <GitBranch className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          
          {/* Sparkle effects */}
          <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
        
        {/* Title */}
        <div className="text-left">
          <h1 className="text-6xl leading-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-1">
            CodeVerse
          </h1>
          <div className="flex items-center gap-3 text-slate-400">
            <Github className="w-4 h-4" />
            <span className="text-sm font-medium">Repository Visualizer</span>
            <span className="px-2 py-0.5 bg-slate-800/40 text-[11px] rounded-full ml-3">Interactive • Fast • Gorgeous</span>
          </div>
        </div>
      </div>
      
      {/* Subtitle */}
      <p className="text-slate-400 text-lg font-light max-w-3xl mx-auto leading-relaxed">
        Explore repository structures with an elegant, animated, and interactive tree visualization. Hover files to preview content instantly.
      </p>
    </div>
  </div>
);

export default Header;
