const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix BarRow — remove tab reference, use generic label
c = c.replace(
  `      <span style={{ flex: 1, fontSize: 13, color: "#1E293B", textAlign: "left", paddingLeft: 8 }}>{brand || (tab === "Silver Bars" ? "Silver Bar" : "Gold Bar")}</span>`,
  `      <span style={{ flex: 1, fontSize: 13, color: "#1E293B", textAlign: "left", paddingLeft: 8 }}>{brand || "Bullion Bar"}</span>`
);

// 2. Fix allowTransparency on iframe
c = c.replace(/allowTransparency="true"/g, 'allowtransparency="true"');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');