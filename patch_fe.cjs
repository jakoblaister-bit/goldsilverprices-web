const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Replace fetchSpot with cached version + fix call order
c = c.replace(
  /async function fetchSpot\(\) \{[\s\S]*?\n  \}/,
  `async function fetchSpot() {
    // Check 1-minute cache first
    try {
      const cached = sessionStorage.getItem('spot_cache');
      if (cached) {
        const { gold, silver, ts } = JSON.parse(cached);
        if (Date.now() - ts < 60000) {
          if (gold)   setGoldSpot(gold);
          if (silver) setSilverSpot(silver);
          return;
        }
      }
    } catch {}

    try {
      const [goldRes, silverRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU/AUD"),
        fetch("https://api.gold-api.com/price/XAG/AUD"),
      ]);
      const gold   = await goldRes.json();
      const silver = await silverRes.json();

      const goldPrice   = gold?.price   && gold.price   > 5000 ? Math.round(gold.price)                  : null;
      const silverPrice = silver?.price && silver.price > 80   ? Math.round(silver.price * 100) / 100    : null;

      if (goldPrice)   setGoldSpot(goldPrice);
      if (silverPrice) setSilverSpot(silverPrice);

      // Cache for 1 minute
      if (goldPrice && silverPrice) {
        sessionStorage.setItem('spot_cache', JSON.stringify({
          gold: goldPrice, silver: silverPrice, ts: Date.now()
        }));
      }
    } catch(e) {
      console.log("Spot fetch failed:", e.message);
    }
  }`
);

// Fix call order — fetch spot first, then data, sequentially
c = c.replace(
  `    fetchData().then(() => fetchSpot());`,
  `    fetchSpot().then(() => fetchData());`
);

// Remove TradingView attribution if still there
c = c.replace(
  /\s*\{!mobile && \(\s*<a\s+href="https:\/\/www\.tradingview\.com"[\s\S]*?<\/a>\s*\)\}/,
  ''
);

// Show dash while loading instead of null
c = c.replace(
  `{s.price ? fmt(s.price) : "—"}`,
  `{s.price ? fmt(s.price) : "—"}`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done — verify removed:', !c.includes('kangaroos[0].buy_price'));