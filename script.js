let simData = null;
let playerData = null;

async function loadRecommendations() {
    const playerId = document.getElementById("playerIdInput").value;

    if (!playerData) {
        playerData = await fetch("player_best_times.json").then(r => r.json());
    }
    if (!simData) {
        simData = await fetch("map_similarity.json").then(r => r.json());
    }

    if (!(playerId in playerData)) {
        document.getElementById("results").innerHTML = "Player not found.";
        return;
    }

    const playerMaps = playerData[playerId];

    // Compute weights: inverse rank, normalized
    let weights = {};
    let total = 0;

    for (let entry of playerMaps) {
        const w = 1 / entry.rank;
        weights[entry.map_name] = w;
        total += w;
    }
    for (let m in weights) {
        weights[m] /= total;
    }

    // Compute recommendation score for every map
    let scores = {}; // map -> score

    for (let row of simData) {
        const m1 = row.map1;
        const m2 = row.map2;
        const s = row.similarity;

        if (m1 in weights) {
            scores[m2] = (scores[m2] || 0) + weights[m1] * s;
        }
        if (m2 in weights) {
            scores[m1] = (scores[m1] || 0) + weights[m2] * s;
        }
    }

    // Remove maps already played
    for (let p of playerMaps) {
        delete scores[p.map_name];
    }

    // Sort by score
    let sorted = Object.entries(scores)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 15); // top 15

    const html = sorted
        .map(([map, score]) => `<p><b>${map}</b>: ${score.toFixed(4)}</p>`)
        .join("");

    document.getElementById("results").innerHTML = html;
}
