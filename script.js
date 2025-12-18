const playerCache = new Map();

async function loadRecommendations() {
  const playerId = document.getElementById("playerIdInput").value.trim();
  const results = document.getElementById("results");
  const resultsHeading = document.getElementById("resultsHeading");

  // Validation
  if (!playerId || !/^\d+$/.test(playerId)) {
    results.textContent = "Please enter a valid player ID.";
    resultsHeading.textContent = "Results";
    return;
  }

  // Check cache first
  if (playerCache.has(playerId)) {
    const data = playerCache.get(playerId);
    results.innerHTML = data
      .map(r => `<p><b>${r.map}</b>: ${r.score.toFixed(4)}</p>`)
      .join("");
    resultsHeading.textContent = "Results (updated 2025-12-18)";
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

    results.innerHTML = data
      .map(r => `<p><b>${r.map}</b>: ${r.score.toFixed(4)}</p>`)
      .join("");

    resultsHeading.textContent = "Results (updated 2025-12-18)";

  } catch (err) {
    results.textContent = "Error loading recommendations.";
    resultsHeading.textContent = "Results";
    console.error(err);
  }
}