let simData = null;
let playerData = null;

window.addEventListener("DOMContentLoaded", async () => {
    await loadAllData();
});

async function loadAllData() {
    console.log("Preloading data...");

    playerData = await loadCompressedJSON("player_best_times.json.gz");
    simData = await loadCompressedJSON("map_similarity.json.gz");

    console.log("Data preloaded.");
}

async function loadCompressedJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch " + url);

    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // ✔ Decompress properly
    const decompressed = pako.ungzip(uint8, { to: "string" });
    return JSON.parse(decompressed);
}

async function loadRecommendations() {
    const playerId = document.getElementById("playerIdInput").value.trim();

    // Load compressed player data once
    if (!playerData) {
        console.log("Loading player_best_times.json.gz...");
        try {
            playerData = await loadCompressedJSON("player_best_times.json.gz");
            console.log("Loaded playerData:", playerData);
        } catch (err) {
            console.error("FAILED to decompress player data:", err);
            document.getElementById("results").innerHTML =
                "Error loading player data.";
            return;
        }
    }

    // Load map similarity matrix once
    if (!simData) {
        console.log("Loading map_similarity.json...");
        try {
            console.log("Loading map_similarity.json.gz...");

            const resp2 = await fetch("map_similarity.json.gz");
            const blob2 = await resp2.blob();
            const buf2 = await blob2.arrayBuffer();
            const text2 = new TextDecoder().decode(pako.ungzip(new Uint8Array(buf2)));

            simData = JSON.parse(text2);

            console.log("Loaded simData:", simData.length, "rows");
        } catch (err) {
            console.error("FAILED to load similarity data:", err);
            document.getElementById("results").innerHTML =
                "Error loading similarity data.";
            return;
        }
    }

    // Validate player
    if (!(playerId in playerData)) {
        document.getElementById("results").innerHTML = "Player not found.";
        return;
    }

    const playerMaps = playerData[playerId];

    // --- Compute weights from player's map ranks ---
    let weights = {};
    let total = 0;

    for (let entry of playerMaps) {
        // rank → weight (inverse)
        const w = 1 / entry.rank;
        weights[entry.map_name] = w;
        total += w;
    }

    // Normalize weights
    for (let m in weights) {
        weights[m] /= total;
    }

    // --- Compute similarity scores for all maps ---
    let scores = {};

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
    //for (let p of playerMaps) {
    //    delete scores[p.map_name];
    //}

    // Sort + take top 15
    const sorted = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    // Render results
    const html = sorted
        .map(([map, score]) => `<p><b>${map}</b>: ${score.toFixed(4)}</p>`)
        .join("");

    document.getElementById("results").innerHTML = html;
}
