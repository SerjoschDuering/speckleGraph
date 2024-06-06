const graphData = {
    "Speckle Branch": {
      "connections": ["Method", "Method2", "Method3"],
      "position": [920, 780],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/buildings"
    },
    "Speckle Branch5": {
      "connections": ["Method1"],
      "position": [920, 340],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/street_network"
    },
    "Method1": {
      "connections": ["Speckle Branch2"],
      "position": [1240, 360],
      "args": {
        "serviceApi": "createGraphTemplate",
        "token": "52566d1047b881764e16ad238356abeb2fc35d8b42",
        "apiEndpoint": "https://serjd-n8nspeckle.hf.space/api/createGraph",
        "speckleInput_StreetNetwork": "https://speckle.xyz/streams/45e68ac034/branches/street_network",
        "speckleOutput_Graph": "https://speckle.xyz/streams/45e68ac034/branches/network_graph"
      }
    },
    "Method": {
      "connections": ["Speckle Branch1"],
      "position": [2020, 460],
      "args": {
        "serviceApi": "createDistanceMatrixTemplate",
        "token": "speckleOutputsSeparator",
        "apiEndpoint": "https://serjd-n8nspeckle.hf.space/api/createDistanceMatrix",
        "modal_mode": "pedestrian",
        "speckleInput_Graph": "https://speckle.xyz/streams/45e68ac034/branches/network_graph",
        "speckleInput_Buildings": "https://speckle.xyz/streams/45e68ac034/branches/buildings",
        "speckleOutput_DistanceMatrix": "https://speckle.xyz/streams/45e68ac034/branches/distance_matrix"
      }
    },
    "Speckle Branch2": {
      "connections": ["Method"],
      "position": [1480, 340],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/network_graph"
    },
    "Speckle Branch1": {
      "connections": ["Method2", "Method3"],
      "position": [2240, 600],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/distance_matrix"
    },
    "Method2": {
      "connections": ["Speckle Branch3"],
      "position": [2760, 840],
      "args": {
        "serviceApi": "accessibilityTemplate",
        "token": "speckleOutputsSeparator",
        "apiEndpoint": "https://serjd-n8nspeckle.hf.space/api/accessibilityAnalysis",
        "landuseColumns": ["residential", "schools", "adad"],
        "distanceThreshold": 300,
        "normaliseResults": false,
        "speckleInput_distanceMatrix": "https://speckle.xyz/streams/45e68ac034/branches/distance_matrix",
        "speckleInput_buildings": "https://speckle.xyz/streams/45e68ac034/branches/buildings",
        "speckleOutput_accessibilityResult": "https://speckle.xyz/streams/45e68ac034/branches/result_accessibility"
      }
    },
    "Speckle Branch3": {
      "connections": ["Method4"],
      "position": [3080, 860],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/result_accessibility"
    },
    "Method3": {
      "connections": ["Speckle Branch4"],
      "position": [2760, 1060],
      "args": {
        "serviceApi": "patronageAnalysisTemplate",
        "token": "speckleOutputsSeparator",
        "apiEndpoint": "https://serjd-n8nspeckle.hf.space/api/patronageAnalysis",
        "landuseColumns": ["schools"],
        "distanceThreshold": 400,
        "normaliseResults": false,
        "speckleInput_distanceMatrix": "https://speckle.xyz/streams/45e68ac034/branches/distance_matrix",
        "speckleInput_buildings": "https://speckle.xyz/streams/45e68ac034/branches/buildings",
        "speckleOutput_patronageResult": "https://speckle.xyz/streams/45e68ac034/branches/result_patronage"
      }
    },
    "Speckle Branch4": {
      "connections": ["Method4"],
      "position": [3080, 1060],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/result_patronage"
    },
    "Method4": {
      "connections": ["Speckle Branch6"],
      "position": [3780, 1000],
      "args": {
        "serviceApi": "mergeForDashboardTemplate",
        "token": "speckleOutputsSeparator",
        "apiEndpoint": "https://serjd-n8nspeckle.hf.space/api/mergeForDashboard",
        "speckleInput_resultBranch1": {
          "branches": [
            {
              "speckleInput_resultBranch1_url": "https://speckle.xyz/streams/45e68ac034/branches/result_accessibility"
            },
            {
              "speckleInput_resultBranch1_url": "https://speckle.xyz/streams/45e68ac034/branches/result_patronage"
            }
          ]
        },
        "speckleOutput_Dashboard": "https://speckle.xyz/streams/45e68ac034/branches/result_dashboard"
      }
    },
    "Speckle Branch6": {
      "connections": [],
      "position": [4100, 1000],
      "branchUrl": "https://speckle.xyz/streams/45e68ac034/branches/result_dashboard"
    }
  };

  function normalizeCoordinates(data) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
    Object.keys(data).forEach(key => {
      const [x, y] = data[key].position;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
  
    const width = maxX - minX;
    const height = maxY - minY;
  
    const scaleFactor = Math.min(window.innerWidth / (width + 600), window.innerHeight / (height));
  
    Object.keys(data).forEach(key => {
      data[key].position[0] = (data[key].position[0] - minX) * scaleFactor + 50;
      data[key].position[1] = (data[key].position[1] - minY) * scaleFactor + 50;
    });
  
    return data;
  }
  
  function createNode(type, name, status, position, additionalInfo, serviceApi) {
    const node = document.createElement('div');
    node.className = `node ${type === 'method' ? 'method-node' : 'speckle-node'} ${status}`;
    node.style.left = `${position[0]}px`;
    node.style.top = `${position[1]}px`;
  
    if (type === 'speckle') {
      const branchName = additionalInfo.split('/').pop();
      node.innerHTML = `<div class="node-text">${name}</div><div class="small-text">${branchName}</div>`;
    } else {
      node.innerHTML = `<div class="node-text">${name}</div><div class="small-text">${serviceApi}</div>`;
    }
  
    // Create drag handle
    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    handle.innerHTML = '☰'; // Using a simple icon for the handle
    node.appendChild(handle);
  
    node.addEventListener('mouseenter', () => handle.style.display = 'block');
    node.addEventListener('mouseleave', () => handle.style.display = 'none');
  
    if (type === 'method') {
      node.querySelector('.node-text').addEventListener('click', () => {
        node.classList.add('flash');
        setTimeout(() => node.classList.remove('flash'), 1000);
      });
    } else if (type === 'speckle') {
      node.querySelector('.node-text').addEventListener('click', (event) => {
        event.stopPropagation();
  
        // Remove existing tooltips
        document.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());
  
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
          <a href="${additionalInfo}" target="_blank">${additionalInfo}</a>
          <iframe src="https://speckle.xyz/embed?stream=68595ed2d2&commit=abc578dd70&transparent=true&autoload=true&hidecontrols=true&hidesidebar=true" width="600" height="400" frameborder="0"></iframe>
        `;
        document.body.appendChild(tooltip);
  
        const nodeRect = node.getBoundingClientRect();
        const tooltipWidth = 640;
        const tooltipHeight = 460;
        let tooltipLeft = nodeRect.left + 160;
        let tooltipTop = nodeRect.top;
  
        // Adjust tooltip position to stay within the viewport
        if (tooltipLeft + tooltipWidth > window.innerWidth) {
          tooltipLeft = window.innerWidth - tooltipWidth - 20; // 20px padding
        }
        if (tooltipTop + tooltipHeight > window.innerHeight) {
          tooltipTop = window.innerHeight - tooltipHeight - 20; // 20px padding
        }
  
        tooltip.style.left = `${tooltipLeft}px`;
        tooltip.style.top = `${tooltipTop}px`;
  
        console.log(`Tooltip position: left=${tooltipLeft}, top=${tooltipTop}`);
        console.log(`Node position: left=${nodeRect.left}, top=${nodeRect.top}`);
        console.log(`Viewport width=${window.innerWidth}, height=${window.innerHeight}`);
        console.log(`Tooltip dimensions: width=${tooltipWidth}, height=${tooltipHeight}`);
        console.log(`Tooltip style: left=${tooltip.style.left}, top=${tooltip.style.top}`);
  
        const closeTooltip = () => {
          if (tooltip.parentElement) {
            document.body.removeChild(tooltip);
            document.removeEventListener('click', closeTooltip);
          }
        };
  
        setTimeout(() => document.addEventListener('click', closeTooltip), 100);
      });
    }
  
    return { node, handle };
  }
  
  function drawConnection(context, from, to) {
    const fromCenter = { x: from[0] + 75, y: from[1] + 35 };
    const toCenter = { x: to[0] + 75, y: to[1] + 35 };
  
    // Calculate direction vector
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const angle = Math.atan2(dy, dx);
  
    // Calculate start and end points
    const fromEdge = {
      x: fromCenter.x + (75 * Math.cos(angle)),
      y: fromCenter.y + (35 * Math.sin(angle))
    };
    const toEdge = {
      x: toCenter.x - (75 * Math.cos(angle)) - 5,
      y: toCenter.y - (35 * Math.sin(angle))
    };
  
    context.beginPath();
    context.moveTo(fromEdge.x, fromEdge.y);
    context.lineTo(toEdge.x, toEdge.y);
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.stroke();
  
    // Draw arrowhead
    const arrowHeadLength = 8;
    const arrowHeadOffset = 5;
    context.beginPath();
    context.moveTo(toEdge.x, toEdge.y);
    context.lineTo(
      toEdge.x - arrowHeadLength * Math.cos(angle - Math.PI / 6),
      toEdge.y - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    context.moveTo(toEdge.x, toEdge.y);
    context.lineTo(
      toEdge.x - arrowHeadLength * Math.cos(angle + Math.PI / 6),
      toEdge.y - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.stroke();
  
    // Apply offset
    toEdge.x -= arrowHeadOffset * Math.cos(angle);
    toEdge.y -= arrowHeadOffset * Math.sin(angle);
  }
  
  function updateConnections(context, nodes) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    Object.keys(graphData).forEach(key => {
      const data = graphData[key];
      const fromNode = nodes[key];
      data.connections.forEach(connection => {
        const toNode = nodes[connection];
        const fromPos = [
          parseFloat(fromNode.style.left) + parseFloat(fromNode.getAttribute('data-x') || 0),
          parseFloat(fromNode.style.top) + parseFloat(fromNode.getAttribute('data-y') || 0)
        ];
        const toPos = [
          parseFloat(toNode.style.left) + parseFloat(toNode.getAttribute('data-x') || 0),
          parseFloat(toNode.style.top) + parseFloat(toNode.getAttribute('data-y') || 0)
        ];
        drawConnection(context, fromPos, toPos);
      });
    });
  }
  
  function resizeGraph(normalizedData, nodes, context, container) {
    const scaleFactorX = container.clientWidth / window.innerWidth;
    const scaleFactorY = container.clientHeight / window.innerHeight;
  
    Object.keys(normalizedData).forEach(key => {
      const data = normalizedData[key];
      const node = nodes[key];
      const x = parseFloat(data.position[0] * scaleFactorX);
      const y = parseFloat(data.position[1] * scaleFactorY);
  
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
    });
  
    updateConnections(context, nodes);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('graph-container');
    const canvas = document.getElementById('connections-canvas');
    const context = canvas.getContext('2d');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  
    const normalizedData = normalizeCoordinates(JSON.parse(JSON.stringify(graphData)));
  
    const nodes = {};
  
    // Create and position nodes
    Object.keys(normalizedData).forEach(key => {
      const data = normalizedData[key];
      const type = key.startsWith('Method') ? 'method' : 'speckle';
      const { node, handle } = createNode(type, key, 'up-to-date', data.position, data.branchUrl || '2024-05-03 12:22:00', data.args ? data.args.serviceApi : '');
      container.appendChild(node);
      nodes[key] = node;
  
      interact(handle).draggable({
        allowFrom: '.drag-handle',
        onmove(event) {
          const target = event.target.parentElement;
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  
          target.style.transform = `translate(${x}px, ${y}px)`;
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
  
          updateConnections(context, nodes);
        }
      });
    });
  
    // Draw initial connections
    updateConnections(context, nodes);
  
    window.addEventListener('resize', () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      resizeGraph(normalizedData, nodes, context, container);
    });
  });
  