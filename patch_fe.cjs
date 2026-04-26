const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  `          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <CoinsSection
              metal="silver" icon="🥈" title="Silver Coins"
              weights={SILVER_WEIGHTS} rows={rows}`,
  `          <div style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}>
            <CoinsSection
              metal="silver" icon="🥈" title="Silver Coins"
              weights={SILVER_WEIGHTS} rows={rows}`
);

// Also fix the parent flex container to use full width on mobile
c = c.replace(
  `        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 14, marginBottom: 14,
          alignItems: "flex-start",
        }}>`,
  `        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 14, marginBottom: 14,
          alignItems: "flex-start",
          width: "100%",
        }}>`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');