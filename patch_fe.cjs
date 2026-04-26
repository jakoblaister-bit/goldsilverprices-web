const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Remove derivation at line 55668 area
c = c.replace(
  `    const kangaroos = latest
      .filter(r => r.coin_type === "Kangaroo" && r.metal === "gold" && r.weight_oz === 1)
      .sort((a, b) => a.buy_price - b.buy_price);
    if (kangaroos.length > 0) setGoldSpot(Math.round(kangaroos[0].buy_price / 1.013));

    const silver = latest
      .filter(r => r.coin_type === "Kangaroo" && r.metal === "silver" && r.weight_oz === 1)
      .sort((a, b) => a.buy_price - b.buy_price);
    if (silver.length > 0) setSilverSpot(Math.round(silver[0].buy_price / 1.04));`,
  ``
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done — verify:', c.includes('kangaroos[0].buy_price') ? 'STILL THERE' : 'REMOVED');