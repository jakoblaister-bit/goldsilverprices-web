// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const OLD = `function ProductPage({ rows, goldSpot, silverSpot, updated }) {`;

const NEW = `const COIN_INFO = {
  "Kangaroo":       { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1987" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1989" } },
  "Kookaburra":     { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1990" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1990" } },
  "Koala":          { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1987" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1987" } },
  "Lunar":          { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1996" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1999" } },
  "Emu":            { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2018" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2018" } },
  "Swan":           { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2017" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2017" } },
  "Maple Leaf":     { gold:{ country:"Canada",    mint:"Royal Canadian Mint",fineness:"99.99%", since:"1979" }, silver:{ country:"Canada",    mint:"Royal Canadian Mint",fineness:"99.99%", since:"1988" } },
  "Krugerrand":     { gold:{ country:"S. Africa", mint:"South African Mint", fineness:"91.67%", since:"1967" }, silver:{ country:"S. Africa", mint:"South African Mint", fineness:"99.99%", since:"2017" } },
  "Britannia":      { gold:{ country:"UK",        mint:"The Royal Mint",     fineness:"99.99%", since:"1987" }, silver:{ country:"UK",        mint:"The Royal Mint",     fineness:"99.99%", since:"1997" } },
  "Philharmonic":   { gold:{ country:"Austria",   mint:"Austrian Mint",      fineness:"99.99%", since:"1989" }, silver:{ country:"Austria",   mint:"Austrian Mint",      fineness:"99.99%", since:"2008" } },
  "American Eagle": { gold:{ country:"USA",       mint:"US Mint",            fineness:"91.67%", since:"1986" }, silver:{ country:"USA",       mint:"US Mint",            fineness:"99.93%", since:"1986" } },
  "Buffalo":        { gold:{ country:"USA",       mint:"US Mint",            fineness:"99.99%", since:"2006" }, silver:null },
  "Panda":          { gold:{ country:"China",     mint:"China Mint",         fineness:"99.9%",  since:"1982" }, silver:{ country:"China",     mint:"China Mint",         fineness:"99.9%",  since:"1983" } },
  "Libertad":       { gold:{ country:"Mexico",    mint:"Mexican Mint",       fineness:"99.99%", since:"1981" }, silver:{ country:"Mexico",    mint:"Mexican Mint",       fineness:"99.9%",  since:"1982" } },
  "Southern Cross": { gold:{ country:"Australia", mint:"ABC Refinery",       fineness:"99.99%", since:"2019" }, silver:{ country:"Australia", mint:"ABC Refinery",       fineness:"99.99%", since:"2019" } },
  "Generic":        { gold:{ country:"Various",   mint:"Various",            fineness:"99.99%", since:"—"    }, silver:{ country:"Various",   mint:"Various",            fineness:"99.9%",  since:"—"    } },
};

function ProductPage({ rows, goldSpot, silverSpot, updated }) {`;

if (!c.includes(OLD)) { console.error("❌ not found"); process.exit(1); }
c = c.replace(OLD, NEW);

// Also fix the COIN_INFO usage — it needs to check metal
const OLD2 = `{COIN_INFO[coinTypeDisplay] && (`;
const NEW2 = `{COIN_INFO[coinTypeDisplay]?.[metal] && (`;
if (c.includes(OLD2)) {
  c = c.replace(OLD2, NEW2);
  // Fix all references inside
  c = c.replace(/COIN_INFO\[coinTypeDisplay\]\.country/g, `COIN_INFO[coinTypeDisplay][metal].country`);
  c = c.replace(/COIN_INFO\[coinTypeDisplay\]\.mint/g,    `COIN_INFO[coinTypeDisplay][metal].mint`);
  c = c.replace(/COIN_INFO\[coinTypeDisplay\]\.fineness/g,`COIN_INFO[coinTypeDisplay][metal].fineness`);
  c = c.replace(/COIN_INFO\[coinTypeDisplay\]\.since/g,   `COIN_INFO[coinTypeDisplay][metal].since`);
  console.log("✅ COIN_INFO metal-aware references updated");
}

fs.writeFileSync("src/App.jsx", c);
console.log("✅ COIN_INFO defined with gold+silver data — run: npm run dev");