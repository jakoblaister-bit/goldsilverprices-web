const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  /async function fetchSpot\(\) \{[\s\S]*?\n  \}/,
  `async function fetchSpot() {
    try {
      // Yahoo Finance — XAUAUD and XAGAUD direct
      const [goldRes, silverRes] = await Promise.all([
        fetch("https://query1.finance.yahoo.com/v8/finance/chart/XAUAUD=X?interval=1d&range=1d"),
        fetch("https://query1.finance.yahoo.com/v8/finance/chart/XAGAUD=X?interval=1d&range=1d"),
      ]);
      const goldData   = await goldRes.json();
      const silverData = await silverRes.json();
      const goldPrice   = goldData?.chart?.result?.[0]?.meta?.regularMarketPrice;
      const silverPrice = silverData?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (goldPrice)   setGoldSpot(Math.round(goldPrice));
      if (silverPrice) setSilverSpot(Math.round(silverPrice * 100) / 100);
    } catch(e) {
      console.log("Spot fetch failed:", e.message);
    }
  }`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Yahoo Finance spot prices');