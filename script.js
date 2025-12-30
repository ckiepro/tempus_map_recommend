const playerCache = new Map();
let currentData = null;

function getPlacementBadge(placement) {
  if (!placement) return '';
  
  if (placement === 1) {
    return '<span class="placement-badge wr">WR</span>';
  } else if (placement >= 2 && placement <= 10) {
    return '<span class="placement-badge tt">TT</span>';
  } else {
    const gNum = placement - 10;
    return `<span class="placement-badge gold">G${gNum}</span>`;
  }
}

function getPlacementCategory(placement) {
  if (!placement) return null;
  if (placement === 1) return 'wr';
  if (placement >= 2 && placement <= 10) return 'tt';
  if (placement === 11) return 'g1';
  return 'other';
}

function applyFilters() {
  const hideWR = document.getElementById('hideWR').checked;
  const hideTT = document.getElementById('hideTT').checked;
  const hideG1 = document.getElementById('hideG1').checked;
  
  // Enforce cascading hide rules
  if (hideTT && !hideWR) {
    document.getElementById('hideWR').checked = true;
  }
  if (hideG1 && (!hideTT || !hideWR)) {
    document.getElementById('hideTT').checked = true;
    document.getElementById('hideWR').checked = true;
  }
  
  if (!currentData) return;
  
  displayResults(currentData);
}

function displayResults(data) {
  const results = document.getElementById('results');
  const hideWR = document.getElementById('hideWR').checked;
  const hideTT = document.getElementById('hideTT').checked;
  const hideG1 = document.getElementById('hideG1').checked;
  
  let filtered = data.slice(0, 50); // Only show first 50
  
  // Apply filters
  filtered = filtered.filter(r => {
    const category = getPlacementCategory(r.placement);
    if (hideWR && category === 'wr') return false;
    if (hideTT && category === 'tt') return false;
    if (hideG1 && category === 'g1') return false;
    return true;
  });
  
  if (filtered.length === 0) {
    results.innerHTML = '<p>No maps match the current filters.</p>';
    return;
  }
  
  results.innerHTML = filtered.map(r => {
    const rankText = r.rank ? `Rank: ${r.rank}` : 'Not played';
    const placementBadge = getPlacementBadge(r.placement);
    
    return `
      <div class="map-entry">
        <span class="map-name">${r.map}</span>
        <span class="map-score">${r.score.toFixed(4)}</span>
        ${placementBadge}
        <span class="map-stats">${rankText}</span>
      </div>
    `;
  }).join('');
}

async function loadRecommendations() {
  const playerId = document.getElementById("playerIdInput").value.trim();
  const results = document.getElementById("results");
  const resultsHeading = document.getElementById("resultsHeading");
  const filtersContainer = document.getElementById("filtersContainer");

  // Hide filters and reset
  filtersContainer.style.display = "none";
  currentData = null;

  // Validation
  if (!playerId || !/^\d+$/.test(playerId)) {
    results.textContent = "Please enter a valid player ID.";
    resultsHeading.textContent = "Results";
    return;
  }

  // Check cache first
  if (playerCache.has(playerId)) {
    const data = playerCache.get(playerId);
    currentData = data;
    displayResults(data);
    resultsHeading.textContent = "Results (updated 2025-12-18)";
    filtersContainer.style.display = "block";
    return;
  }

  results.textContent = "Loading...";
  resultsHeading.textContent = "Results";

  try {
    const res = await fetch(
      `https://tempus-map-recommend.ckiepro.workers.dev/player/${playerId}`
    );

    if (!res.ok) {
      results.textContent = "Player not found.";
      resultsHeading.textContent = "Results";
      return;
    }

    const data = await res.json();
    
    // Cache the result
    playerCache.set(playerId, data);
    currentData = data;

    displayResults(data);
    resultsHeading.textContent = "Results (updated 2025-12-18)";
    filtersContainer.style.display = "block";

  } catch (err) {
    results.textContent = "Error loading recommendations.";
    resultsHeading.textContent = "Results";
    console.error(err);
  }
}