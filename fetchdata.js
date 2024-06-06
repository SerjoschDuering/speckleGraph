const graphApiUrl = 'https://serjd-n8nspeckle.hf.space/api/getDependencyGraph';
const graphDataUrl = 'https://speckle.xyz/streams/45e68ac034/branches/computationgraph';

async function fetchGraphData() {
  try {
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: graphDataUrl })
    });
    const result = await response.json();
    console.log('Fetched data:', result.enriched_graph); // Debug log
    return result.enriched_graph;
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return null;
  }
}

function mergeGraphData(newData) {
  const existingNodes = new Set(Object.keys(graphData));
  console.log('Merging graph data...', newData); // Debug log

  // Update existing nodes or add new nodes
  Object.keys(newData).forEach(key => {
    const data = newData[key];
    if (graphData[key]) {
      // Update existing node
      graphData[key] = { ...graphData[key], ...data };
    } else {
      // Add new node
      graphData[key] = data;
    }
    existingNodes.delete(key);
  });

  // Remove nodes that no longer exist
  existingNodes.forEach(key => {
    delete graphData[key];
  });
  console.log('Merged graph data:', graphData); // Debug log
}

async function updateGraphData() {
  console.log('Updating graph data...'); // Debug log
  const newGraphData = await fetchGraphData();
  if (newGraphData) {
    mergeGraphData(newGraphData);
    // Trigger an update in the graph visualization
    const event = new Event('graphDataUpdated');
    document.dispatchEvent(event);
  } else {
    console.warn('No new graph data fetched.'); // Debug log
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateGraphData();
  setInterval(updateGraphData, 5000);
});
