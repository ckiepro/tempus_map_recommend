const playerCache = new Map();

async function loadRecommendations() {
  const playerId = document.getElementById("playerIdInput").value.trim();
  const results = document.getElementById("results");

  // Validation
  if (!playerId || !/^\d+$/.test(playerId)) {
    results.textContent = "Please enter a valid player ID.";
    return;
  }

  // Check cache first
  if (playerCache.has(playerId)) {
    const data = playerCache.get(playerId);
    results.innerHTML = data
      .map(r => `<p><b>${r.map}</b>: ${r.score.toFixed(4)}</p>`)
      .join("");
    return;
  }

  results.textContent = "Loading...";

  try {
    const res = await fetch(
      `https://tempus-map-recommend.ckiepro.workers.dev/player/${playerId}`
    );

    if (!res.ok) {
      results.textContent = "Player not found.";
      return;
    }

    const data = await res.json();
    
    // Cache the result
    playerCache.set(playerId, data);

    results.innerHTML = data
      .map(r => `<p><b>${r.map}</b>: ${r.score.toFixed(4)}</p>`)
      .join("");

  } catch (err) {
    results.textContent = "Error loading recommendations.";
    console.error(err);
  }
}