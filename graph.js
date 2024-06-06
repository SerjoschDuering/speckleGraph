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
  }
  
  function updateConnections(context, nodes) {

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    Object.keys(graphData).forEach(key => {
      const data = graphData[key];
      const fromNode = nodes[key];
  
      if (!fromNode) return; // Skip if fromNode is not found
  
      data.connections.forEach(connection => {
        const toNode = nodes[connection];
        const fromPos = [
          parseFloat(fromNode.style.left) + (parseFloat(fromNode.getAttribute('data-x')) || 0),
          parseFloat(fromNode.style.top) + (parseFloat(fromNode.getAttribute('data-y')) || 0)
        ];
  
        let toPos;
  
        if (toNode) {
          toPos = [
            parseFloat(toNode.style.left) + (parseFloat(toNode.getAttribute('data-x')) || 0),
            parseFloat(toNode.style.top) + (parseFloat(toNode.getAttribute('data-y')) || 0)
          ];
        } else {
          toPos = fromPos; // Default to drawing from fromNode to fromNode if toNode is not found
        }
  
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
  
    let normalizedData = normalizeCoordinates(JSON.parse(JSON.stringify(graphData)));
  
    const nodes = {};
  
    // Create and position nodes
    Object.keys(normalizedData).forEach(key => {
      const data = normalizedData[key];
      const type = key.startsWith('Method') ? 'method' : 'speckle';
      const status = data.status || 'up-to-date'; // Default to 'up-to-date' if status is missing
      const { node, handle } = createNode(type, key, status, data.position, data.branchUrl || '2024-05-03 12:22:00', data.args ? data.args.serviceApi : '');
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
  
    // Listen for custom event to update graph
    document.addEventListener('graphDataUpdated', () => {
      console.log('Updating graph data...');
  
      // Normalize the updated graph data
      const updatedData = normalizeCoordinates(JSON.parse(JSON.stringify(graphData)));
  
      // Update or add nodes
      Object.keys(updatedData).forEach(key => {
        const data = updatedData[key];
        const type = key.startsWith('Method') ? 'method' : 'speckle';
        const status = data.status || 'up-to-date'; // Default to 'up-to-date' if status is missing
        if (nodes[key]) {
          // Update existing node
          nodes[key].className = `node ${type === 'method' ? 'method-node' : 'speckle-node'} ${status}`;
          nodes[key].style.left = `${data.position[0]}px`;
          nodes[key].style.top = `${data.position[1]}px`;
        } else {
          // Add new node
          const { node, handle } = createNode(type, key, status, data.position, data.branchUrl || '2024-05-03 12:22:00', data.args ? data.args.serviceApi : '');
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
        }
      });
  
      // Remove nodes that no longer exist
      Object.keys(nodes).forEach(key => {
        if (!updatedData[key]) {
          container.removeChild(nodes[key]);
          delete nodes[key];
        }
      });
  
      // Redraw connections
      updateConnections(context, nodes);
    });
  });
  