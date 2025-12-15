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
    displayTopPlayers();
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

    // Display troll players
    displayTopPlayers();

  } catch (err) {
    results.textContent = "Error loading recommendations.";
    console.error(err);
  }
}

function displayTopPlayers() {
  const players = [
    { name: "boshy", score: Math.random() * (0.15 - 0.1) + 0.1 },
    { name: "bunny", score: Math.random() * (0.15 - 0.1) + 0.1 },
    { name: "vice", score: Math.random() * (0.15 - 0.1) + 0.1 },
    { name: "nikita", score: Math.random() * (0.15 - 0.1) + 0.1 },
    { name: "arinet", score: Math.random() * (0.15 - 0.1) + 0.1 }
  ];

  // Sort by score descending
  players.sort((a, b) => b.score - a.score);

  const topPlayers = document.getElementById("topPlayers");
  topPlayers.innerHTML = players
    .map(p => `<p><b>${p.name}</b>: ${p.score.toFixed(4)}</p>`)
    .join("");
}