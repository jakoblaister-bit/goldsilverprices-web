const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Remove spot derivation from fetchData — fetchSpot handles it
c = c.replace(
  `    // Derive spot from cheapest 1oz gold kangaroo
    const kangaroos = latest
      .filter(r => r.coin_type === "Kangaroo" && r.metal === "gold" && r.weight_oz === 1)
      .sort((a, b) => a.buy_price - b.buy_price);
    if (kangaroos.length > 0) setGoldSpot(Math.round(kangaroos[0].buy_price / 1.013));

    const silver = latest
      .filter(r => r.coin_type === "Kangaroo" && r.metal === "silver" && r.weight_oz === 1)
      .sort((a, b) => a.buy_price - b.buy_price);
    if (silver.length > 0) setSilverSpot(Math.round(silver[0].buy_price / 1.04));`,
  `    // Spot prices handled by fetchSpot() — do not derive here`
);

// Also remove "Prices by TradingView" attribution
c = c.replace(
  `      {!mobile && (
        
          href="https://www.tradingview.com"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 9, color: "#94A3B8",
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          Prices by
          <span style={{ fontWeight: 700, color: "#2962FF" }}>TradingView</span>
        </a>
      )}`,
  ``
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');