import React, { useEffect, useState, useRef } from "react";
import { X, Copy, ExternalLink, Maximize2, Minimize2, Check, Brain, Loader, MessageSquare, Lightbulb, FileText, ShieldAlert } from 'lucide-react';

const FilePreview = ({ filePreview, setFilePreview, repoData, fetchFileContent }) => {
  const { content, visible, x, y, expanded, path, rawUrl } = filePreview;
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);
  const codeContainerRef = useRef(null);

  // AI Mode State
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [activeTab, setActiveTab] = useState('explanation');
  const [languageLevel, setLanguageLevel] = useState('standard');
  const [highlightedLine, setHighlightedLine] = useState(null);

  // Bug Finder State
  const [bugData, setBugData] = useState(null);
  const [bugAnalysisLoading, setBugAnalysisLoading] = useState(false);
  const [bugPanelOpen, setBugPanelOpen] = useState(false);
  const [bugIconState, setBugIconState] = useState('loading'); // loading, green, yellow, red

  useEffect(() => {
    if (visible && content && content !== "Loading...") {
      fetchBugAnalysis();
    }
  }, [visible, content]);

  const handleClose = () => {
    setFilePreview({ ...filePreview, visible: false });
    setAiMode(false);
    setAiData(null);
    setBugPanelOpen(false);
    setBugData(null);
    setHighlightedLine(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleToggleExpand = () => {
    setFilePreview({ ...filePreview, expanded: !expanded });
  };

  const handleToggleAiMode = () => {
    if (!aiMode && !aiData) {
      fetchAiAnalysis();
    }
    setBugPanelOpen(false); // Close bug panel if open
    setAiMode(!aiMode);
  };

  const handleToggleBugPanel = () => {
    if (bugData && bugData.length > 0) {
      setAiMode(false); // Close AI panel if open
      setBugPanelOpen(!bugPanelOpen);
    } else {
      // Maybe show a toast/notification "No bugs found!"
    }
  };

  const fetchAiAnalysis = async () => {
    setAiLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent: content, languageLevel })
      });
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAiData(JSON.parse(data.analysis));
    } catch (err) {
      console.error("AI Analysis Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchBugAnalysis = async () => {
    setBugAnalysisLoading(true);
    setBugIconState('loading');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/find-bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent: content, languageLevel: 'standard' })
      });
      if (!response.ok) throw new Error('Bug analysis failed');
      const data = await response.json();
      const bugs = JSON.parse(data.bugs);
      setBugData(bugs);

      if (bugs.length === 0) {
        setBugIconState('green');
      } else if (bugs.some(b => b.severity === 'High')) {
        setBugIconState('red');
      } else {
        setBugIconState('yellow');
      }
    } catch (err) {
      console.error("Bug Analysis Error:", err);
      setBugIconState('green'); // Default to green on error
    } finally {
      setBugAnalysisLoading(false);
    }
  };

  const findLineByContent = (snippet) => {
    if (!content || !snippet) return null;
    const lines = content.split('\n');
    const cleanSnippet = snippet.trim();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === cleanSnippet) {
        return i + 1;
      }
    }
    return null; // Not found
  };

  const handleBugClick = (bug) => {
    const lineNum = findLineByContent(bug.code_snippet) || bug.line;
    setHighlightedLine(lineNum);
    if (codeContainerRef.current) {
      const lineElement = codeContainerRef.current.querySelector(`[data-line="${lineNum}"]`);
      if (lineElement) lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCommentClick = (commentItem) => {
    const lineNum = findLineByContent(commentItem.code_snippet) || commentItem.line;
    setHighlightedLine(lineNum);
    if (codeContainerRef.current) {
      const lineElement = codeContainerRef.current.querySelector(`[data-line="${lineNum}"]`);
      if (lineElement) lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCommentHover = (commentItem) => {
    const lineNum = findLineByContent(commentItem.code_snippet) || commentItem.line;
    setHighlightedLine(lineNum);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest && (e.target.closest('button') || e.target.closest('a') || e.target.closest('.no-drag'))) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const clampPosition = (x, y) => {
    const vw = window.innerWidth || 1024;
    const vh = window.innerHeight || 768;
    const w = expanded ? ((aiMode || bugPanelOpen) ? vw * 0.9 : 760) : 520;
    const h = expanded ? vh * 0.8 : 340;
    const nx = Math.max(8, Math.min(x, vw - w - 8));
    const ny = Math.max(8, Math.min(y, vh - h - 8));
    return { x: nx, y: ny };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rawPos = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
    setPosition(clampPosition(rawPos.x, rawPos.y));
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!visible) return null;

  const displayContent = expanded ? content : (content || "").split("\n").slice(0, 20).join("\n");
  const lineCount = (content || "").split("\n").length;
  const language = path?.split('.').pop() || 'text';
  const lines = displayContent ? displayContent.split('\n') : [];

  const bugIconColor = {
    loading: 'text-slate-500 animate-pulse',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
  };

  const bugIconTooltip = {
    loading: 'Analyzing for bugs...',
    green: 'No issues found',
    yellow: 'Minor issues detected',
    red: 'Bugs detected',
  };

  return (
    <div
      ref={previewRef}
      className={`fixed z-50 ${isDragging ? 'cursor-grabbing scale-[1.01]' : 'cursor-grab'} transition-all duration-300`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: expanded ? ((aiMode || bugPanelOpen) ? '90vw' : '760px') : '520px',
        height: expanded ? '80vh' : 'auto',
        maxHeight: expanded ? '80vh' : '340px',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl opacity-20 blur-xl pointer-events-none"></div>
      
      <div className="relative bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/20 rounded-xl shadow-2xl overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/30 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 px-2 py-1 rounded-md bg-indigo-700/10 border border-indigo-700/20">
              <p className="text-[11px] font-mono text-indigo-300 truncate">{path}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">{language} • {lineCount} lines</p>
              <p className="text-sm text-slate-200 font-semibold truncate" style={{ maxWidth: '300px' }}>{path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAiMode}
              className={`p-2 rounded-lg transition flex items-center gap-2 ${aiMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800/30 text-slate-300'}`}
              title="Explain Code with AI"
            >
              <Brain className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleBugPanel}
              className={`p-2 rounded-lg transition flex items-center gap-2 ${bugPanelOpen ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'hover:bg-slate-800/30'}`}
              title={bugIconTooltip[bugIconState]}
            >
              <ShieldAlert className={`w-4 h-4 ${bugIconColor[bugIconState]}`} />
            </button>

            <div className="w-px h-4 bg-slate-700/50 mx-1"></div>

            <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-slate-800/30 transition" title="Copy content">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            </button>

            <a href={rawUrl} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()} className="p-2 rounded-lg hover:bg-slate-800/30 transition" title="Open raw file">
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </a>

            <button onClick={handleToggleExpand} className="p-2 rounded-lg hover:bg-slate-800/30 transition" title={expanded ? "Minimize" : "Maximize"}>
              {expanded ? <Minimize2 className="w-4 h-4 text-slate-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
            </button>

            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-red-500/10 transition" title="Close">
              <X className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Code Viewer (Left) */}
          <div
            ref={codeContainerRef}
            className={`flex-1 overflow-auto transition-all duration-500 ${aiMode || bugPanelOpen ? 'w-[60%] border-r border-slate-800/50' : 'w-full'}`}
          >
            {displayContent ? (
              <div className="flex min-h-full text-xs font-mono leading-relaxed p-4 no-drag cursor-text select-text">
                <div className="flex-shrink-0 flex flex-col text-right pr-4 select-none text-slate-500 border-r border-slate-800/50 mr-4">
                  {lines.map((_, i) => <span key={i} className="h-5 leading-5">{i + 1}</span>)}
                </div>
                <div className="flex-1 flex flex-col text-white">
                  {lines.map((line, i) => (
                    <div
                      key={i}
                      data-line={i + 1}
                      className={`h-5 leading-5 whitespace-pre transition-colors duration-200 ${highlightedLine === i + 1 ? (bugPanelOpen ? 'bg-red-500/20 border-l-2 border-red-500' : 'bg-indigo-500/20 border-l-2 border-indigo-500') : ''} -mx-4 px-4`}
                    >
                      {line || ' '}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              </div>
            )}
          </div>

          {/* AI Panel (Right) */}
          {(aiMode || bugPanelOpen) && (
            <div className="w-[40%] bg-slate-900/50 flex flex-col animate-in slide-in-from-right duration-300 no-drag">
              {aiMode && (
                // AI Explanation Panel
                <div className="flex flex-col h-full">
                  <div className="px-4 py-3 border-b border-slate-800/30 flex items-center justify-between bg-slate-950/30">
                    <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                      {['explanation', 'comments', 'insights'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md transition ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{tab}</button>
                      ))}
                    </div>
                    <select value={languageLevel} onChange={(e) => { setLanguageLevel(e.target.value); fetchAiAnalysis(); }} className="bg-slate-800/50 text-slate-300 text-xs rounded-lg px-2 py-1 border-none focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="beginner">Beginner</option>
                      <option value="standard">Standard</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {aiLoading ? <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400"><Loader className="w-8 h-8 animate-spin text-indigo-500" /><p className="text-xs font-medium animate-pulse">Analyzing code structure...</p></div> : aiData ? (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        {activeTab === 'explanation' && aiData.explanation && (
                          <>
                            <div className="space-y-2"><h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><FileText className="w-4 h-4" /> Overview</h4><p className="text-sm text-slate-300 leading-relaxed">{aiData.explanation.overview}</p></div>
                            <div className="space-y-2"><h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><Brain className="w-4 h-4" /> Key Logic</h4><p className="text-sm text-slate-300 leading-relaxed">{aiData.explanation.key_logic}</p></div>
                            <div className="space-y-2"><h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2"><Loader className="w-4 h-4" /> Execution Flow</h4><p className="text-sm text-slate-300 leading-relaxed">{aiData.explanation.code_flow}</p></div>
                          </>
                        )}
                        {activeTab === 'comments' && aiData.comments && <div className="space-y-3">{aiData.comments.map((item, idx) => <div key={idx} onClick={() => handleCommentClick(item)} onMouseEnter={() => handleCommentHover(item)} onMouseLeave={() => setHighlightedLine(null)} className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${highlightedLine === findLineByContent(item.code_snippet) ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'}`}><span className="text-xs font-mono text-indigo-400 w-8 text-right flex-shrink-0 pt-0.5">L{findLineByContent(item.code_snippet) || item.line}</span><div className="flex-1 min-w-0"><p className="text-xs font-mono text-slate-500 mb-1 truncate bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50">{item.code_snippet || `Line ${item.line}`}</p><p className="text-sm text-slate-300">{item.comment}</p></div></div>)}</div>}
                        {activeTab === 'insights' && aiData.insights && (
                          <>
                            <div className="space-y-2"><h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2"><Check className="w-4 h-4" /> Best Practices</h4><ul className="list-disc list-inside space-y-1 text-sm text-slate-300">{aiData.insights.best_practices.map((bp, i) => <li key={i}>{bp}</li>)}</ul></div>
                            <div className="space-y-2"><h4 className="text-sm font-bold text-amber-400 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Improvements</h4><ul className="list-disc list-inside space-y-1 text-sm text-slate-300">{aiData.insights.possible_improvements.map((pi, i) => <li key={i}>{pi}</li>)}</ul></div>
                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center"><span className="text-xs text-slate-400">Complexity Score</span><span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">{aiData.insights.complexity}</span></div>
                          </>
                        )}
                      </div>
                    ) : <div className="flex flex-col items-center justify-center h-full text-slate-500"><Brain className="w-12 h-12 mb-3 opacity-20" /><p className="text-sm">Select a mode to generate analysis</p></div>}
                  </div>
                </div>
              )}
              {bugPanelOpen && (
                // Bug Analysis Panel
                <div className="flex flex-col h-full">
                  <div className="px-4 py-3 border-b border-slate-800/30 flex items-center justify-between bg-slate-950/30">
                    <h3 className="text-md font-bold text-red-400 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Bug Analysis</h3>
                  </div>
                  <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {bugAnalysisLoading ? <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-400"><Loader className="w-8 h-8 animate-spin text-red-500" /><p className="text-xs font-medium animate-pulse">Scanning for vulnerabilities...</p></div> : bugData && bugData.length > 0 ? (
                      <div className="space-y-4">
                        {bugData.map((bug, idx) => (
                          <div key={idx} onClick={() => handleBugClick(bug)} onMouseEnter={() => setHighlightedLine(findLineByContent(bug.code_snippet) || bug.line)} onMouseLeave={() => setHighlightedLine(null)} className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${bug.severity === 'High' ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-sm text-white flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs ${bug.severity === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{bug.severity}</span> {bug.type}</h4>
                              <span className="text-xs font-mono text-red-400">L{findLineByContent(bug.code_snippet) || bug.line}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{bug.explanation}</p>
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <p className="text-xs text-slate-400 font-medium">Suggestion:</p>
                              <p className="text-sm text-slate-200 font-mono bg-slate-800/50 p-2 rounded mt-1">{bug.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="flex flex-col items-center justify-center h-full text-slate-500"><Check className="w-12 h-12 mb-3 text-green-500 opacity-50" /><p className="text-sm">No critical issues found in this file.</p></div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
