// FilePreview.jsx (polished)
import React, { useEffect, useState, useRef } from "react";
import { X, Copy, ExternalLink, Maximize2, Minimize2, Check } from 'lucide-react';

const FilePreview = ({ filePreview, setFilePreview, repoData, fetchFileContent }) => {
  const { content, visible, x, y, expanded, path, rawUrl } = filePreview;
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  useEffect(() => {
  if (visible && repoData && path && (content === "Loading preview..." || content === "")) {
    if (typeof fetchFileContent === 'function') {
      fetchFileContent(repoData.owner, repoData.repo_name, path, x, y, expanded);
    }
  }
}, [visible, path, expanded, content, repoData]);


  useEffect(() => {
  const pos = { x, y };
  setPosition(clampPosition(pos.x, pos.y));
}, [x, y, visible]);


  const handleClose = () => {
    setFilePreview({ ...filePreview, visible: false });
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

  const handleMouseDown = (e) => {
  // If the click is inside a button or link (or an element that is inside them), don't start drag
  if (e.target.closest && (e.target.closest('button') || e.target.closest('a'))) return;
  setIsDragging(true);
  setDragOffset({
    x: e.clientX - position.x,
    y: e.clientY - position.y
  });
};


  const clampPosition = (x, y) => {
  const vw = window.innerWidth || 1024;
  const vh = window.innerHeight || 768;
  const w = expanded ? 760 : 520;
  const h = expanded ? 640 : 340;
  const nx = Math.max(8, Math.min(x, vw - w - 8));
  const ny = Math.max(8, Math.min(y, vh - h - 8));
  return { x: nx, y: ny };
};

const handleMouseMove = (e) => {
  if (!isDragging) return;
  const rawPos = {
    x: e.clientX - dragOffset.x,
    y: e.clientY - dragOffset.y
  };
  setPosition(clampPosition(rawPos.x, rawPos.y));
};


  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  const displayContent = expanded
    ? content
    : (content || "").split("\n").slice(0, 20).join("\n");

  const lineCount = (content || "").split("\n").length;
  const language = path?.split('.').pop() || 'text';

  return (
    <div
      ref={previewRef}
      className={`fixed z-50 ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'} transition-all duration-300`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: expanded ? '760px' : '520px',
        maxHeight: expanded ? '640px' : '340px',
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-xl opacity-20 blur-xl pointer-events-none"></div>
      
      <div className="relative bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/20 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 px-2 py-1 rounded-md bg-indigo-700/10 border border-indigo-700/20">
              <p className="text-[11px] font-mono text-indigo-300 truncate">{path}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">{language} • {lineCount} lines</p>
              <p className="text-sm text-slate-200 font-semibold truncate" style={{ maxWidth: '420px' }}>{path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-slate-800/30 transition" title="Copy content">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            </button>

            {rawUrl && (
              <a href={rawUrl} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()} className="p-2 rounded-lg hover:bg-slate-800/30 transition" title="Open raw file">
                <ExternalLink className="w-4 h-4 text-slate-300" />
              </a>
            )}

            <button onClick={handleToggleExpand} className="p-2 rounded-lg hover:bg-slate-800/30 transition" title={expanded ? "Minimize" : "Maximize"}>
              {expanded ? <Minimize2 className="w-4 h-4 text-slate-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
            </button>

            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-red-500/10 transition" title="Close">
              <X className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        <div className="relative overflow-auto" style={{ maxHeight: expanded ? '560px' : '260px' }}>
          <pre className="text-xs font-mono leading-relaxed text-gray-200 whitespace-pre-wrap break-words p-4">
            {displayContent || (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              </div>
            )}
          </pre>
        </div>

        {!expanded && (content || "").split("\n").length > 20 && (
          <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/30">
            <p className="text-[11px] text-slate-400 text-center">Click maximize to view full content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
