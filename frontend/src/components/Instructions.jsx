// Instructions.jsx
import { CheckCircle2, Sparkles } from 'lucide-react';

const Instructions = () => {
  const steps = [
    { text: 'Enter a public GitHub repository URL', icon: '🔗' },
    { text: 'Click "Visualize" or press Enter', icon: '⚡' },
    { text: 'Explore the interactive tree visualization', icon: '🌳' },
    { text: 'Hover over nodes to preview file content', icon: '👁️' }
  ];

  const examples = [
    { url: 'https://github.com/facebook/react', name: 'React', desc: 'UI Library' },
    { url: 'https://github.com/vuejs/vue', name: 'Vue', desc: 'Progressive Framework' },
    { url: 'https://github.com/pallets/flask', name: 'Flask', desc: 'Python Web Framework' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-900/80 to-slate-900/60 border-b border-slate-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-200">
                Getting Started
              </h3>
            </div>
            <p className="text-slate-400 text-sm">
              Follow these simple steps to visualize any GitHub repository
            </p>
          </div>
          
          {/* Steps */}
          <div className="p-8 space-y-5">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group/item flex gap-4 p-4 rounded-xl hover:bg-slate-800/30 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 border border-indigo-400/20 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover/item:scale-110 transition-transform">
                  <span className="text-white font-bold text-sm">{idx + 1}</span>
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-slate-300 group-hover/item:text-slate-200 transition-colors">
                    <span className="mr-2">{step.icon}</span>
                    {step.text}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-slate-700 group-hover/item:text-indigo-400 transition-colors flex-shrink-0 mt-2" />
              </div>
            ))}
          </div>
          
          {/* Examples */}
          <div className="px-8 pb-8">
            <div className="bg-slate-950/60 border border-slate-800/40 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full"></div>
                <p className="text-sm text-slate-300 font-semibold">
                  Popular Examples
                </p>
              </div>
              
              <div className="space-y-3">
                {examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="group/ex p-3 rounded-xl bg-slate-900/40 border border-slate-800/30 hover:border-indigo-500/30 hover:bg-slate-800/40 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-300 group-hover/ex:text-indigo-400 transition-colors">
                        {example.name}
                      </span>
                      <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-800/50 rounded">
                        {example.desc}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 group-hover/ex:text-slate-400 transition-colors truncate">
                      {example.url}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer tip */}
          <div className="px-8 py-4 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-t border-slate-800/50">
            <p className="text-center text-xs text-slate-500">
              💡 <span className="font-semibold">Pro Tip:</span> Use the search bar to quickly find specific files or directories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;