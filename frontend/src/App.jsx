import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

import Header from './components/Header';
import RepoInput from './components/RepoInput';
import ErrorAlert from './components/ErrorAlert';
import RepoInfo from './components/RepoInfo';
import VisualizationCanvas from './components/VisualizationCanvas';
import SelectedNodeInfo from './components/SelectedNodeInfo';
import Instructions from './components/Instructions';
import RepoSearch from './components/RepoSearch';
import FilePreview from "./components/FilePreview";
import RepoSummary from './components/RepoSummary';

import { visualizeRepo } from './utils/d3visualizer';

const App = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState(null);
  const svgRef = useRef(null);
  const visualizerControlsRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filePreview, setFilePreview] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    path: "",
    expanded: false,
    rawUrl: ""
  });
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const getFileColor = (path) => {
    const ext = path.split('.').pop().toLowerCase();
    const colorMap = {
      // Programming Languages
      py: '#3776AB',
      js: '#F7DF1E',
      jsx: '#61DAFB',
      ts: '#3178C6',
      tsx: '#3178C6',
      java: '#B07219',
      cpp: '#F34B7D',
      c: '#A8B9CC',
      cs: '#178600',
      go: '#00ADD8',
      rs: '#CE422B',
      rb: '#CC342D',
      php: '#777BB4',
      swift: '#F05138',
      kt: '#A97BFF',
      scala: '#DC322F',
      dart: '#00B4AB',
      r: '#276DC3',
      lua: '#000080',
      perl: '#0298C3',
      
      // Web
      html: '#E34F26',
      css: '#1572B6',
      scss: '#CC6699',
      sass: '#CC6699',
      less: '#1D365D',
      vue: '#4FC08D',
      svelte: '#FF3E00',
      
      // Data & Config
      json: '#5A5A5A',
      yaml: '#CB171E',
      yml: '#CB171E',
      xml: '#0060AC',
      toml: '#9C4121',
      ini: '#6B7280',
      env: '#ECD53F',
      
      // Documentation
      md: '#083FA1',
      txt: '#6B7280',
      pdf: '#F40F02',
      doc: '#2B579A',
      docx: '#2B579A',
      
      // Shell & Scripts
      sh: '#4EAA25',
      bash: '#4EAA25',
      zsh: '#4EAA25',
      fish: '#4EAA25',
      bat: '#C1F12E',
      ps1: '#012456',
      
      // Database
      sql: '#E38C00',
      db: '#003B57',
      sqlite: '#003B57',
      
      // Images
      svg: '#FFB13B',
      jpg: '#8B5CF6',
      jpeg: '#8B5CF6',
      png: '#8B5CF6',
      gif: '#8B5CF6',
      webp: '#8B5CF6',
      ico: '#8B5CF6',
      
      // Other
      lock: '#F59E0B',
      gitignore: '#F05032',
      dockerfile: '#2496ED',
    };
    return colorMap[ext] || '#6B7280';
  };

  // Initialize visualization when repo data changes
  useEffect(() => {
    if (repoData && svgRef.current) {
      try {
        const controls = visualizeRepo(
          repoData,
          svgRef,
          getFileColor,
          setSelectedNode,
          searchTerm,
          null,
          setFilePreview,
          // pass app-level fetchFileContent so the visualizer can call it
          fetchFileContent
        );


        visualizerControlsRef.current = controls;
      } catch (err) {
        console.error('Visualization error:', err);
        setError('Failed to create visualization');
      }
    }
  }, [repoData, searchTerm]);

  const handleFetchRepo = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setLoading(true);
    setError('');
    setRepoData(null);
    setSelectedNode(null);
    setSearchTerm('');
    setSummary(null);
    setSummaryError(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repo?url=${encodeURIComponent(repoUrl)}`
      );
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch repository');
      }

      const data = await response.json();
      console.log("Fetched Repo Data:", data);
      
      if (!data.structure || !Array.isArray(data.structure)) {
        throw new Error('Invalid repository data structure');
      }
      
      setRepoData(data);
      fetchRepoSummary(repoUrl, 'paragraph', 'medium');
    } catch (err) {
      console.error("Error fetching repo:", err);
      setError(err.message || 'Failed to fetch repository. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoSummary = async (url, mode, length) => {
    setLoadingSummary(true);
    setSummaryError(null);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
        const response = await fetch(`${API_BASE_URL}/api/repo/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ repoUrl: url, mode, length }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch summary');
        }

        const data = await response.json();
        const parsedSummary = JSON.parse(data.summary);
        setSummary(parsedSummary);
    } catch (err) {
        console.error("Error fetching summary:", err);
        setSummaryError("Failed to generate summary. The AI may be offline or the repo too complex.");
    } finally {
        setLoadingSummary(false);
    }
  };

  // Fetch raw file content from the backend
  const fetchFileContent = async (owner, repo, filePath, x, y, expanded = false) => {
    const branch = repoData?.default_branch || 'main';
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    setFilePreview({
      visible: true,
      content: "Loading...",
      path: filePath,
      x,
      y,
      expanded,
      rawUrl
    });

    try {
      const params = new URLSearchParams({ owner, repo, branch, path: filePath });
      const response = await fetch(`${API_BASE_URL}/api/repo/content?${params.toString()}`);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Cannot load file");
      }

      const data = await response.json();

      setFilePreview(prev => ({
        ...prev,
        content: data.content
      }));
    } catch (err) {
      setFilePreview(prev => ({
        ...prev,
        content: `⚠️ Unable to load file preview: ${err.message}`
      }));
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (svg.zoom) {
      svg.transition().duration(300).call(svg.zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    if (svg.zoom) {
      svg.transition().duration(300).call(svg.zoom.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (visualizerControlsRef.current?.fitToView) {
      visualizerControlsRef.current.fitToView();
    }
  };

  const handleExpandAll = () => {
    if (visualizerControlsRef.current?.expandAll) {
      visualizerControlsRef.current.expandAll();
    }
  };

  const handleCollapseAll = () => {
    if (visualizerControlsRef.current?.collapseAll) {
      visualizerControlsRef.current.collapseAll();
    }
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${repoData?.repo_name || 'repo'}-visualization.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative container mx-auto px-4 py-12">
        <Header />
        
        <RepoInput
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          handleFetchRepo={handleFetchRepo}
          loading={loading}
        />
        
        {error && (
          <ErrorAlert 
            message={error} 
            onRetry={handleFetchRepo}
            onDismiss={() => setError('')}
          />
        )}
        
        {repoData && (
          <>
            <RepoInfo 
              repoData={repoData}
              handleZoomIn={handleZoomIn}
              handleZoomOut={handleZoomOut}
              handleResetZoom={handleResetZoom}
              handleDownload={handleDownload}
              handleExpandAll={handleExpandAll}
              handleCollapseAll={handleCollapseAll}
            />
            
            <RepoSearch 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
            
            {selectedNode && (
              <SelectedNodeInfo 
                selectedNode={selectedNode} 
                getFileColor={getFileColor}
                onClose={() => setSelectedNode(null)}
              />
            )}
            
            <VisualizationCanvas 
              svgRef={svgRef}
              loading={loading}
            />

            <RepoSummary
                summary={summary}
                loading={loadingSummary}
                summaryError={summaryError}
                onRegenerate={(mode, length) => fetchRepoSummary(repoUrl, mode, length)}
            />
          </>
        )}
        
        {!repoData && !loading && !error && <Instructions />}

        {filePreview.visible && (
          <FilePreview
            filePreview={filePreview}
            setFilePreview={setFilePreview}
            repoData={repoData}
            fetchFileContent={fetchFileContent}
          />
        )}
      </div>
    </div>
  );
};

export default App;