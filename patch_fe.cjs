const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  /async function fetchSpot\(\) \{[\s\S]*?\n  \}/,
  `async function fetchSpot() {
    try {
      const [metalRes, fxRes] = await Promise.all([
        fetch("https://api.metals.live/v1/spot/gold,silver"),
        fetch("https://api.frankfurter.app/latest?from=USD&to=AUD"),
      ]);
      const metals = await metalRes.json();
      const fx     = await fxRes.json();
      const aud    = fx?.rates?.AUD;
      const goldUSD   = metals?.find?.(m => m.gold)?.gold;
      const silverUSD = metals?.find?.(m => m.silver)?.silver;
      if (aud && goldUSD)   setGoldSpot(Math.round(goldUSD * aud));
      if (aud && silverUSD) setSilverSpot(Math.round(silverUSD * aud * 100) / 100);
    } catch(e) {
      console.log("Spot fetch failed:", e.message);
    }
  }`
);

// Make sure fetchSpot is called on load
if (!c.includes('fetchSpot()')) {
  c = c.replace('    fetchData();', '    fetchSpot();\n    fetchData();');
}

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');