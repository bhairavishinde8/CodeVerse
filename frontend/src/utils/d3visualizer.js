// src/utils/d3visualizer.js - Fixed outside click handler
import * as d3 from "d3";

export const visualizeRepo = (
  data,
  svgRef,
  getFileColor,
  setSelectedNode,
  searchTerm = "",
  setSelectedFile = null,
  setFilePreview,
  fetchFileContent
) => {
  if (!svgRef || !svgRef.current || !data) return;

  // Clear previous visualization
  d3.select(svgRef.current).selectAll("*").remove();

  const width = svgRef.current.clientWidth || 1000;
  const height = svgRef.current.clientHeight || 700;
  const margin = { top: 50, right: 80, bottom: 50, left: 80 };

  const svg = d3
    .select(svgRef.current)
    .attr("width", width)
    .attr("height", height)
    .style("background", "transparent");

  // Background
  const bgDefs = svg.append("defs");
  const bgGradient = bgDefs.append("radialGradient")
    .attr("id", "bgGradient")
    .attr("cx", "50%")
    .attr("cy", "50%");
  bgGradient.append("stop").attr("offset", "0%").attr("stop-color", "#1e1b4b");
  bgGradient.append("stop").attr("offset", "100%").attr("stop-color", "#0f172a");

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#bgGradient)")
    .attr("opacity", 0.3);

  // Main group
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
  
  svg.call(zoom);
  svg.zoom = zoom;

  // Build tree structure
  const rootObj = { 
    name: data.repo_name || "repo", 
    children: [], 
    isRoot: true, 
    fullPath: "",
    fileCount: 0,
    dirCount: 0
  };
  const pathMap = { "": rootObj };

  let totalFiles = 0;
  let totalDirs = 0;

  (data.structure || []).forEach((item) => {
    const parts = item.path.split("/").filter(Boolean);
    if (!parts.length) return;
    
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const prev = currentPath;
      currentPath = prev ? `${prev}/${part}` : part;
      
      if (!pathMap[currentPath]) {
        const isFile = i === parts.length - 1 && item.type === "file";
        const isDir = !isFile;
        
        const node = {
          name: part,
          fullPath: currentPath,
          type: isFile ? "file" : "dir",
          extension: isFile ? getFileExtension(part) : null,
          depth: i + 1,
          fileCount: isFile ? 1 : 0,
          dirCount: isDir ? 1 : 0
        };
        
        pathMap[prev].children = pathMap[prev].children || [];
        pathMap[prev].children.push(node);
        pathMap[currentPath] = node;
        
        if (isFile) totalFiles++;
        if (isDir) totalDirs++;
      }
    }
  });

  // Propagate counts
  function propagateCounts(node) {
    if (!node.children || !node.children.length) return;
    node.children.forEach(child => {
      propagateCounts(child);
      node.fileCount += child.fileCount;
      node.dirCount += child.dirCount;
    });
  }
  propagateCounts(rootObj);

  // Convert to hierarchy
  const root = d3.hierarchy(rootObj, (d) => d.children);
  root.x0 = height / 2;
  root.y0 = 0;

  // === SMART INITIAL COLLAPSE ===
  if (root.children) {
    root.children.forEach(child => {
      if (child.children) {
        child.children.forEach(grandchild => {
          if (grandchild.children) {
            collapse(grandchild);
          }
        });
      }
    });
  }

  // Tree layout
  const horizontalSpan = width - margin.left - margin.right - 220;
  const verticalSpan = height - margin.top - margin.bottom;
  const treeLayout = d3.tree()
    .size([verticalSpan, horizontalSpan])
    .separation((a, b) => a.parent === b.parent ? 1.2 : 1.5);

  // Defs
  const defs = g.append("defs");
  
  const softGlow = defs.append("filter").attr("id", "softGlow");
  softGlow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
  const softMerge = softGlow.append("feMerge");
  softMerge.append("feMergeNode").attr("in", "blur");
  softMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const strongGlow = defs.append("filter").attr("id", "strongGlow");
  strongGlow.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
  const strongMerge = strongGlow.append("feMerge");
  strongMerge.append("feMergeNode").attr("in", "blur");
  strongMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const rootGradient = defs.append("radialGradient")
    .attr("id", "rootGradient")
    .attr("cx", "30%").attr("cy", "30%");
  rootGradient.append("stop").attr("offset", "0%").attr("stop-color", "#fbbf24");
  rootGradient.append("stop").attr("offset", "50%").attr("stop-color", "#f59e0b");
  rootGradient.append("stop").attr("offset", "100%").attr("stop-color", "#d97706");

  const dirGradient = defs.append("radialGradient")
    .attr("id", "dirGradient")
    .attr("cx", "30%").attr("cy", "30%");
  dirGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
  dirGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1e40af");

  const searchGradient = defs.append("radialGradient")
    .attr("id", "searchGradient")
    .attr("cx", "30%").attr("cy", "30%");
  searchGradient.append("stop").attr("offset", "0%").attr("stop-color", "#fcd34d");
  searchGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b");

  // Groups
  const linkGroup = g.append("g").attr("class", "links");
  const nodeGroup = g.append("g").attr("class", "nodes");

  // Stats
  const stats = svg.append("g")
    .attr("class", "stats")
    .attr("transform", "translate(20, 20)");

  stats.append("rect")
    .attr("width", 200)
    .attr("height", 85)
    .attr("fill", "rgba(15, 23, 42, 0.85)")
    .attr("stroke", "#6366f1")
    .attr("stroke-width", 1.5)
    .attr("rx", 10)
    .style("filter", "drop-shadow(0 4px 20px rgba(99, 102, 241, 0.3))");

  const statsText = stats.append("text")
    .attr("x", 15)
    .attr("y", 25)
    .attr("fill", "#e5e7eb")
    .attr("font-size", "12px");

  statsText.append("tspan")
    .attr("x", 15)
    .attr("dy", 0)
    .attr("font-weight", "700")
    .attr("fill", "#fbbf24")
    .text(`📁 ${data.repo_name || 'Repository'}`);

  statsText.append("tspan")
    .attr("x", 15)
    .attr("dy", 22)
    .attr("fill", "#60a5fa")
    .text(`📄 Files: ${totalFiles}`);

  statsText.append("tspan")
    .attr("x", 15)
    .attr("dy", 18)
    .attr("fill", "#a78bfa")
    .text(`📂 Dirs: ${totalDirs}`);

  // Tooltip
  const tooltip = g.append("g")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("pointer-events", "none");

  tooltip.append("rect")
    .attr("fill", "rgba(15, 23, 42, 0.95)")
    .attr("stroke", "#6366f1")
    .attr("stroke-width", 2)
    .attr("rx", 8)
    .style("filter", "drop-shadow(0 4px 20px rgba(99, 102, 241, 0.4))");

  tooltip.append("text")
    .attr("fill", "#e5e7eb")
    .attr("font-size", "11px")
    .attr("font-weight", "600")
    .attr("x", 10)
    .attr("y", 18);

  // Track dragging
  let isDragging = false;
  let dragStartTime = 0;

  // Drag handler
  const drag = d3.drag()
    .subject((event, d) => ({ x: d.y || 0, y: d.x || 0 }))
    .on("start", function(event, d) {
      isDragging = false;
      dragStartTime = Date.now();
      
      if (event.sourceEvent) {
        event.sourceEvent.stopPropagation();
      }
      
      d3.select(this).raise();
      d3.select(this).select("circle")
        .transition().duration(100)
        .attr("stroke-width", 4)
        .style("filter", "url(#strongGlow)");
    })
    .on("drag", function(event, d) {
      isDragging = true;
      d.y = event.x;
      d.x = event.y;
      d.data._dragX = d.x;
      d.data._dragY = d.y;
      update(root);
    })
    .on("end", function(event, d) {
      d3.select(this).select("circle")
        .transition().duration(200)
        .attr("stroke-width", 2.5)
        .style("filter", "url(#softGlow)");
      
      setTimeout(() => {
        isDragging = false;
      }, 100);
    });

  // Initial render
  update(root);

  // Helper functions
  function getFileExtension(filename) {
    const parts = filename.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }

  function collapse(node) {
    if (!node || !node.children) return;
    node._children = node.children;
    node._children.forEach(collapse);
    node.children = null;
  }

  function expand(node) {
    if (!node || !node._children) return;
    node.children = node._children;
    node.children.forEach(expand);
    node._children = null;
  }

  function getNodeRadius(d) {
    if (d.data.isRoot) return 18;
    if (d.data.type === "dir") {
      const childCount = (d.children || d._children || []).length;
      return Math.min(10 + Math.log(childCount + 1) * 2, 16);
    }
    return 7;
  }

  function getNodeFill(d) {
    if (searchTerm && d.data.fullPath && 
        d.data.fullPath.toLowerCase().includes(searchTerm.toLowerCase())) {
      return "url(#searchGradient)";
    }
    if (d.data.isRoot) return "url(#rootGradient)";
    if (d.data.type === "dir") return "url(#dirGradient)";
    
    const color = getFileColor ? getFileColor(d.data.name) : "#6B7280";
    return color;
  }

  function getNodeStroke(d) {
    if (searchTerm && d.data.fullPath && 
        d.data.fullPath.toLowerCase().includes(searchTerm.toLowerCase())) {
      return "#fbbf24";
    }
    if (d.data.isRoot) return "#fcd34d";
    if (d.data.type === "dir") return "#60a5fa";
    
    const baseColor = getFileColor ? getFileColor(d.data.name) : "#6B7280";
    const darkerColor = d3.color(baseColor);
    return darkerColor ? darkerColor.darker(0.8).toString() : "#374151";
  }

  // Core update function
  function update(source) {
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    const maxDepth = d3.max(nodes, d => d.depth) || 1;
    const nodeSpacing = Math.max(130, Math.min(200, width / (maxDepth + 2)));

    nodes.forEach((d) => {
      d._layoutX = d.x;
      d._layoutY = d.y;
      d.x = verticalSpan - d._layoutX;
      d.y = d.depth * nodeSpacing;
      
      if (typeof d.data._dragX === "number") d.x = d.data._dragX;
      if (typeof d.data._dragY === "number") d.y = d.data._dragY;
    });

    // Links
    const linkSelection = linkGroup
      .selectAll("path.link")
      .data(links, (d) => d.target.data.fullPath || d.target.id);

    linkSelection.exit()
      .transition().duration(300)
      .attr("opacity", 0)
      .remove();

    const linkEnter = linkSelection.enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-width", d => {
        if (d.target.data.isRoot) return 4;
        if (d.target.data.type === "dir") return 2.5;
        return 2;
      })
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", 0)
      .attr("d", (d) => diagonal({
        source: { x: source.x0 || source.x, y: source.y0 || source.y },
        target: { x: source.x0 || source.x, y: source.y0 || source.y }
      }))
      .attr("stroke", (d) => {
        if (d.target.data.type === "file" && getFileColor) {
          const color = d3.color(getFileColor(d.target.data.name));
          return color ? color.brighter(0.8).toString() : "#60a5fa";
        }
        return "#60a5fa";
      })
      .style("filter", "drop-shadow(0 0 3px rgba(96, 165, 250, 0.4))");

    linkEnter.merge(linkSelection)
      .transition().duration(500)
      .attr("stroke-opacity", d => {
        if (searchTerm && d.target.data.fullPath && 
            d.target.data.fullPath.toLowerCase().includes(searchTerm.toLowerCase())) {
          return 1;
        }
        return 0.7;
      })
      .attr("stroke", (d) => {
        if (searchTerm && d.target.data.fullPath && 
            d.target.data.fullPath.toLowerCase().includes(searchTerm.toLowerCase())) {
          return "#fbbf24";
        }
        if (d.target.data.type === "file" && getFileColor) {
          const color = d3.color(getFileColor(d.target.data.name));
          return color ? color.brighter(0.8).toString() : "#60a5fa";
        }
        return "#60a5fa";
      })
      .attr("d", (d) => diagonal({ 
        source: { x: d.source.x, y: d.source.y }, 
        target: { x: d.target.x, y: d.target.y } 
      }));

    // Nodes
    const nodeSelection = nodeGroup
      .selectAll("g.node")
      .data(nodes, (d) => d.data.fullPath || d.id);

    nodeSelection.exit()
      .transition().duration(250)
      .attr("opacity", 0)
      .remove();

    const nodeEnter = nodeSelection.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${source.y0 || source.y},${source.x0 || source.x})`)
      .style("cursor", "pointer")
      .attr("opacity", 0)
      .on("click", function(event, d) {
        const timeSinceStart = Date.now() - dragStartTime;
        
        if (isDragging || timeSinceStart < 150) {
          return;
        }
        
        event.stopPropagation();
        
        if (d.data.type === "dir") {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else if (d._children) {
            d.children = d._children;
            d._children = null;
          }
          
          update(d);
        }
      })
      .call(drag);

    // Circles
    nodeEnter.append("circle")
      .attr("r", 0)
      .attr("fill", getNodeFill)
      .attr("stroke", getNodeStroke)
      .attr("stroke-width", 2.5)
      .style("filter", "url(#softGlow)")
      .on("mouseenter", function(event, d) {
        const circle = d3.select(this);
        const currentRadius = getNodeRadius(d);
        
        circle.transition().duration(200)
          .attr("r", currentRadius * 1.6)
          .attr("stroke-width", 4)
          .style("filter", "url(#strongGlow)");

        let tooltipText = d.data.name;
        if (d.data.type === "dir") {
          const childCount = (d.children || d._children || []).length;
          tooltipText += ` (${childCount} items)`;
        } else {
          const ext = d.data.extension || "file";
          tooltipText += ` .${ext}`;
        }

        const textNode = tooltip.select("text").text(tooltipText).node();
        if (textNode) {
          const bbox = textNode.getBBox();
          tooltip.select("rect")
            .attr("width", bbox.width + 20)
            .attr("height", bbox.height + 14);

          tooltip
            .attr("transform", `translate(${d.y + 30},${d.x - 30})`)
            .transition().duration(150)
            .style("opacity", 1);
        }
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("r", getNodeRadius(d))
          .attr("stroke-width", 2.5)
          .style("filter", "url(#softGlow)");

        tooltip.transition().duration(150).style("opacity", 0);
      })
      .on("dblclick", function(event, d) {
        event.stopPropagation();
        if (d.data.type === "file" && setFilePreview) {
          handleFilePreview(event, d, true);
        }
      });

    nodeEnter.select("circle")
      .transition().duration(500)
      .attr("r", getNodeRadius);

    // Labels
    nodeEnter.append("text")
      .attr("dy", "0.35em")
      .attr("x", 14)
      .attr("text-anchor", "start")
      .text((d) => {
        const maxLen = 28;
        let name = d.data.name;
        if (name.length > maxLen) {
          name = name.substring(0, maxLen) + "...";
        }
        return name;
      })
      .attr("fill", "#f1f5f9")
      .attr("font-size", (d) => d.data.isRoot ? "15px" : "12px")
      .attr("font-weight", (d) => d.data.isRoot ? "700" : "500")
      .style("user-select", "none")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(99, 102, 241, 0.3)")
      .attr("opacity", 0);

    nodeEnter.select("text")
      .transition().delay(200).duration(400)
      .attr("opacity", 1);

    // Expand indicator
    nodeEnter.append("text")
      .attr("class", "expand-indicator")
      .attr("dy", "0.35em")
      .attr("x", -6)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .attr("font-size", "14px")
      .attr("font-weight", "900")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 10px rgba(251, 191, 36, 0.6)")
      .text(d => {
        if (d.data.type === "dir") {
          return d.children ? "−" : "+";
        }
        return "";
      });

    // Merge
    const nodeMerge = nodeEnter.merge(nodeSelection);

    nodeMerge.transition().duration(500)
      .attr("opacity", 1)
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    nodeMerge.select("circle")
      .transition().duration(400)
      .attr("fill", getNodeFill)
      .attr("stroke", getNodeStroke)
      .attr("r", getNodeRadius);

    nodeMerge.select(".expand-indicator")
      .text(d => {
        if (d.data.type === "dir") {
          return d.children ? "−" : "+";
        }
        return "";
      });

    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
      d.data._dragX = d.x;
      d.data._dragY = d.y;
    });

    if (source === root) tryAutoFit();
  }

  function diagonal(d) {
    const sourceX = d.source.x;
    const sourceY = d.source.y;
    const targetX = d.target.x;
    const targetY = d.target.y;
    const midY = sourceY + (targetY - sourceY) / 2;
    
    return `M ${sourceY} ${sourceX} 
            C ${midY} ${sourceX}, 
              ${midY} ${targetX}, 
              ${targetY} ${targetX}`;
  }

  async function handleFilePreview(event, d, expanded) {
    if (!setFilePreview) return;

    setSelectedNode && setSelectedNode(d.data);

    const rawEv = event && (event.pageX !== undefined ? event : event.sourceEvent || event);
    const pageX = (rawEv && rawEv.pageX) || (rawEv && rawEv.clientX) || 0;
    const pageY = (rawEv && rawEv.pageY) || (rawEv && rawEv.clientY) || 0;

    const owner = data.owner;
    const repo = data.repo_name;
    const branch = data.default_branch || "main";
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${d.data.fullPath}`;

    setFilePreview({
      visible: true,
      x: pageX + 15,
      y: pageY - 10,
      content: "Loading preview...",
      path: d.data.fullPath,
      expanded: expanded,
      rawUrl
    });

    if (typeof fetchFileContent === "function") {
      try {
        await fetchFileContent(owner, repo, d.data.fullPath, pageX + 15, pageY - 10, expanded);
      } catch (err) {
        setFilePreview(prev => ({ ...prev, content: "Failed to load preview" }));
      }
      return;
    }

    try {
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error("fetch failed");
      const text = await res.text();
      const previewText = expanded ? text : text.split("\n").slice(0, 20).join("\n");
      setFilePreview(prev => ({ ...prev, content: previewText }));
    } catch (err) {
      setFilePreview(prev => ({ ...prev, content: "Failed to load preview" }));
    }
  }

  function tryAutoFit() {
    setTimeout(() => {
      if (!g.node()) return;
      
      try {
        const bbox = g.node().getBBox();
        const fullW = bbox.width || 1;
        const fullH = bbox.height || 1;

        const innerW = width - margin.left - margin.right - 60;
        const innerH = height - margin.top - margin.bottom - 60;

        const scale = Math.min(innerW / fullW, innerH / fullH, 1);
        const translateX = (width / 2) - (bbox.x + fullW / 2) * scale;
        const translateY = (height / 2) - (bbox.y + fullH / 2) * scale;

        svg.transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .call(zoom.transform, d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale));
      } catch (e) {
        console.warn("Auto-fit failed:", e);
      }
    }, 200);
  }

  // ============ FIXED OUTSIDE CLICK HANDLER ============
  // Remove any existing handler first
  if (svgRef.current && svgRef.current.__outsideClickHandler) {
    document.removeEventListener('mousedown', svgRef.current.__outsideClickHandler);
    svgRef.current.__outsideClickHandler = null;
  }

  const outsideClickHandler = (e) => {
    if (!setFilePreview) return;
    
    // Check if preview is visible first
    const previewEl = document.querySelector('.file-preview');
    if (!previewEl) return; // No preview to close
    
    // Check if click is inside the preview box
    if (previewEl.contains(e.target)) {
      return; // Click was inside preview, don't close
    }
    
    // Click was outside preview, close it
    setFilePreview(prev => ({ 
      ...prev, 
      visible: false 
    }));
  };

  // Store handler reference and attach
  if (svgRef.current) {
    svgRef.current.__outsideClickHandler = outsideClickHandler;
    // Use capture phase to ensure we catch the event
    document.addEventListener('mousedown', outsideClickHandler, true);
  }

  return {
    expandAll: () => {
      expand(root);
      update(root);
    },
    collapseAll: () => {
      if (root.children) root.children.forEach(collapse);
      update(root);
    },
    fitToView: tryAutoFit,
    resetZoom: () => {
      svg.transition().duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    },
    zoomBy: (factor) => {
      try {
        svg.transition().duration(300).call(zoom.scaleBy, factor);
      } catch (e) {
        console.warn("zoomBy failed:", e);
      }
    },
    // Cleanup function - call this when component unmounts
    cleanup: () => {
      if (svgRef.current && svgRef.current.__outsideClickHandler) {
        document.removeEventListener('mousedown', svgRef.current.__outsideClickHandler, true);
        svgRef.current.__outsideClickHandler = null;
      }
    }
  };
};