import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Loader, Copy, Download, Check } from 'lucide-react';

const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6 p-4">
        <div className="h-5 bg-slate-700/50 rounded w-1/3"></div>
        <div className="space-y-2">
            <div className="h-4 bg-slate-700/50 rounded w-full"></div>
            <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
        </div>
        <div className="h-5 bg-slate-700/50 rounded w-1/4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        </div>
    </div>
);

const Section = ({ title, content }) => {
    if (!content) return null;
    const isBullet = Array.isArray(content);
    return (
        <div className="mb-6">
            <h4 className="text-md font-bold text-cyan-300 mb-2">{title.replace(/_/g, ' ')}</h4>
            {isBullet ? (
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {content.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            )}
        </div>
    );
};

const RepoSummary = ({ summary, loading, summaryError, onRegenerate }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mode, setMode] = useState('paragraph');
    const [length, setLength] = useState('medium');
    const [languageLevel, setLanguageLevel] = useState('standard');
    const [copied, setCopied] = useState(false);

    const [wordCount, setWordCount] = useState(0);
    const [sentenceCount, setSentenceCount] = useState(0);

    useEffect(() => {
        if (summary && typeof summary === 'object') {
            let fullText = "";
            Object.values(summary).forEach(val => {
                if (Array.isArray(val)) {
                    fullText += " " + val.join(". ");
                } else if (typeof val === 'string') {
                    fullText += " " + val;
                }
            });

            const cleanText = fullText.trim();
            if (cleanText) {
                setWordCount(cleanText.split(/\s+/).filter(Boolean).length);
                setSentenceCount(cleanText.split(/[.!?]+/).filter(Boolean).length);
            } else {
                setWordCount(0);
                setSentenceCount(0);
            }
        }
    }, [summary]);

    const handleRegenerate = () => {
        onRegenerate(mode, length, languageLevel);
    };

    const handleCopy = () => {
        if (!summary) return;
        const textToCopy = Object.entries(summary)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}\n${Array.isArray(value) ? value.map(v => `- ${v}`).join('\n') : value}`)
            .join('\n\n');
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!summary) return;
        const textToDownload = Object.entries(summary)
            .map(([key, value]) => `${key.replace(/_/g, ' ')}\n${Array.isArray(value) ? value.map(v => `- ${v}`).join('\n') : value}`)
            .join('\n\n');
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'summary.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto mb-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950/50 border-b border-slate-800/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                            <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-200">Repository Summary</h3>
                            <p className="text-xs text-slate-500 font-medium">AI-Generated Overview</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                        {isCollapsed ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
                    </button>
                </div>

                {/* Controls */}
                {!isCollapsed && (
                    <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/30 bg-slate-900/20">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Mode */}
                            <div className="flex rounded-lg bg-slate-800/50 p-1">
                                <button onClick={() => setMode('paragraph')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${mode === 'paragraph' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>Paragraph</button>
                                <button onClick={() => setMode('bullet')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${mode === 'bullet' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>Bullets</button>
                            </div>

                            {/* Length */}
                            <div className="flex rounded-lg bg-slate-800/50 p-1">
                                {['short', 'medium', 'long'].map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLength(l)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition ${length === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>

                            {/* Language Level */}
                            <div className="flex rounded-lg bg-slate-800/50 p-1">
                                {['beginner', 'standard', 'technical'].map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setLanguageLevel(l)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition ${languageLevel === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4" />
                                    <span>Regenerate</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Content */}
                {!isCollapsed && (
                    <div className="p-6 bg-slate-900/40 min-h-[300px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                                    <Loader className="w-10 h-10 text-cyan-400 animate-spin relative z-10" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium animate-pulse">Analyzing repository structure...</p>
                                <SkeletonLoader />
                            </div>
                        ) : summaryError ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-full">!</div>
                                {summaryError}
                            </div>
                        ) : summary && typeof summary === 'object' ? (
                            <div className="animate-in fade-in duration-500">
                                <div className="space-y-2">
                                    <Section title="Project Overview" content={summary.overview} />
                                    <Section title="Key Features" content={summary.key_features} />
                                    <Section title="Technologies Used" content={summary.technologies} />
                                    <Section title="Main Modules" content={summary.main_modules} />
                                    <Section title="How it Works" content={summary.how_it_works} />
                                    <Section title="Future Improvements" content={summary.future_improvements} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <p className="text-sm">Summary will be generated automatically.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                {!isCollapsed && summary && (
                    <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                <span>Words: <span className="font-bold text-slate-200">{wordCount}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                <span>Sentences: <span className="font-bold text-slate-200">{sentenceCount}</span></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-slate-800/50 transition group relative" title="Copy">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />}
                            </button>
                            <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-slate-800/50 transition group" title="Download">
                                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepoSummary;
