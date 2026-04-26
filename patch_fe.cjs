const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  /async function fetchSpot\(\) \{[\s\S]*?\n  \}/,
  `async function fetchSpot() {
    try {
      const [goldRes, silverRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU/AUD"),
        fetch("https://api.gold-api.com/price/XAG/AUD"),
      ]);
      const gold   = await goldRes.json();
      const silver = await silverRes.json();
      if (gold?.price   && gold.price > 5000)  setGoldSpot(Math.round(gold.price));
      if (silver?.price && silver.price > 80)  setSilverSpot(Math.round(silver.price * 100) / 100);
    } catch(e) {
      console.log("Spot fetch failed:", e.message);
    }
  }`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');