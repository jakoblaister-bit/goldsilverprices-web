const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const errors = [];

/* ── 1. Add COIN_IMAGES + BAR_IMG constants after COIN_INFO ── */
const OLD1 = `  "Generic":        { gold:{ country:"Various",   mint:"Various",            fineness:"99.99%", since:"—"    }, silver:{ country:"Various",   mint:"Various",            fineness:"99.9%",  since:"—"    } },
};

const DEALER_URLS = {`;

const NEW1 = `  "Generic":        { gold:{ country:"Various",   mint:"Various",            fineness:"99.99%", since:"—"    }, silver:{ country:"Various",   mint:"Various",            fineness:"99.9%",  since:"—"    } },
};

const COIN_IMAGES = {
  "Krugerrand":   { gold: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/1_oz_Krugerrand_2017_Wertseite.png/300px-1_oz_Krugerrand_2017_Wertseite.png" },
  "Philharmonic": {
    gold:   "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/1_oz_Vienna_Philharmonic_2017_averse.png/300px-1_oz_Vienna_Philharmonic_2017_averse.png",
    silver: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/1_oz_Vienna_Philharmonic_2017_averse.png/300px-1_oz_Vienna_Philharmonic_2017_averse.png",
  },
};
const BAR_IMG = {
  gold: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Gold_Ingot_on_white_background.jpg/300px-Gold_Ingot_on_white_background.jpg",
};

const DEALER_URLS = {`;

if (c.includes(OLD1)) { c = c.replace(OLD1, NEW1); console.log("✅ COIN_IMAGES + BAR_IMG constants added"); }
else errors.push("❌ COIN_INFO closing anchor not found");

/* ── 2. BarsSection default tab + TABS order ── */
const OLD2 = `  const [tab, setTab] = useState("Gold Cast");
  const navigate      = useNavigate();

  const TABS = ["Gold Cast", "Gold Minted", "Silver Cast", "Silver Minted"];`;

const NEW2 = `  const [tab, setTab] = useState("Gold Minted");
  const navigate      = useNavigate();

  const TABS = ["Gold Minted", "Silver Minted", "Gold Cast", "Silver Cast"];`;

if (c.includes(OLD2)) { c = c.replace(OLD2, NEW2); console.log("✅ BarsSection tab order updated"); }
else errors.push("❌ BarsSection tab anchor not found");

/* ── 3. BarsSection gram bar filter ── */
const OLD3 = `  const filtered = rows.filter(r =>
    r.category === "bar" &&
    r.metal === metal &&
    r.bar_type === barType &&
    r.buy_price > 0
  );`;

const NEW3 = `  const filtered = rows.filter(r =>
    r.category === "bar" &&
    r.metal === metal &&
    r.bar_type === barType &&
    r.buy_price > 0 &&
    !(r.weight_g && r.weight_g < 31.1035)
  );`;

if (c.includes(OLD3)) { c = c.replace(OLD3, NEW3); console.log("✅ BarsSection gram filter added"); }
else errors.push("❌ BarsSection filter anchor not found");

/* ── 4. BarsSection size formula ── */
const OLD4 = `    const size  = r.weight_oz ? \`\${r.weight_oz}oz\` : \`\${r.weight_g}g\`;`;
const NEW4 = `    const size  = r.weight_g && r.weight_g < 31.1035 ? \`\${r.weight_g}g\` : \`\${r.weight_oz}oz\`;`;

if (c.includes(OLD4)) { c = c.replace(OLD4, NEW4); console.log("✅ BarsSection size formula fixed"); }
else errors.push("❌ BarsSection size formula anchor not found");

/* ── 5. ProductRegistryPage bar gram filter + size formula ── */
const OLD5 = `          } else {
            var wLabel = r.weight_oz ? r.weight_oz + "oz" : r.weight_g + "g";`;

const NEW5 = `          } else {
            if (r.weight_g && r.weight_g < 31.1035) return;
            var wLabel = r.weight_oz + "oz";`;

if (c.includes(OLD5)) { c = c.replace(OLD5, NEW5); console.log("✅ ProductRegistryPage gram filter + size formula fixed"); }
else errors.push("❌ ProductRegistryPage bar anchor not found");

/* ── 6. Coin hero: use COIN_IMAGES via CSS background ── */
const OLD6 = `              background: metal === "gold"
                ? "radial-gradient(circle at 38% 30%, #FEF3A7, #E8B90A 45%, #A07008 75%, #7A5205)"
                : "radial-gradient(circle at 38% 30%, #FFFFFF, #D4DFE8 45%, #96A8B8 75%, #6B7F90)",
              boxShadow: metal === "gold"
                ? "0 8px 28px rgba(180,130,0,0.35), inset 0 2px 6px rgba(255,255,255,0.5)"
                : "0 8px 28px rgba(100,130,160,0.3), inset 0 2px 6px rgba(255,255,255,0.6)",
              border: \`2px solid \${metal === "gold" ? "#C8950A" : "#8899AA"}\`,
              display: "flex", alignItems: "center", justifyContent: "center",`;

const NEW6 = `              background: COIN_IMAGES[coinTypeDisplay]?.[metal]
                ? \`url("\${COIN_IMAGES[coinTypeDisplay][metal]}") center/contain no-repeat, \${metal === "gold" ? "radial-gradient(circle at 38% 30%, #FEF3A7, #E8B90A 45%, #A07008 75%, #7A5205)" : "radial-gradient(circle at 38% 30%, #FFFFFF, #D4DFE8 45%, #96A8B8 75%, #6B7F90)"}\`
                : metal === "gold"
                  ? "radial-gradient(circle at 38% 30%, #FEF3A7, #E8B90A 45%, #A07008 75%, #7A5205)"
                  : "radial-gradient(circle at 38% 30%, #FFFFFF, #D4DFE8 45%, #96A8B8 75%, #6B7F90)",
              boxShadow: metal === "gold"
                ? "0 8px 28px rgba(180,130,0,0.35), inset 0 2px 6px rgba(255,255,255,0.5)"
                : "0 8px 28px rgba(100,130,160,0.3), inset 0 2px 6px rgba(255,255,255,0.6)",
              border: \`2px solid \${metal === "gold" ? "#C8950A" : "#8899AA"}\`,
              display: "flex", alignItems: "center", justifyContent: "center",`;

if (c.includes(OLD6)) { c = c.replace(OLD6, NEW6); console.log("✅ Coin hero image via CSS background"); }
else errors.push("❌ Coin hero background anchor not found");

/* ── 7. Bar hero: use BAR_IMG via CSS background ── */
const OLD7 = `              background: metal === "gold"
                ? "linear-gradient(140deg, #FEF3A7 0%, #E8B90A 35%, #A07008 70%, #C8950A 100%)"
                : "linear-gradient(140deg, #FFFFFF 0%, #D4DFE8 35%, #96A8B8 70%, #B0C0CE 100%)",
              boxShadow: metal === "gold"
                ? "0 6px 24px rgba(180,130,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)"
                : "0 6px 24px rgba(100,130,160,0.25), inset 0 2px 4px rgba(255,255,255,0.5)",
              border: \`2px solid \${metal === "gold" ? "#C8950A" : "#8899AA"}\`,
              display: "flex", alignItems: "center", justifyContent: "center",`;

const NEW7 = `              background: BAR_IMG[metal]
                ? \`url("\${BAR_IMG[metal]}") center/contain no-repeat #fff\`
                : metal === "gold"
                  ? "linear-gradient(140deg, #FEF3A7 0%, #E8B90A 35%, #A07008 70%, #C8950A 100%)"
                  : "linear-gradient(140deg, #FFFFFF 0%, #D4DFE8 35%, #96A8B8 70%, #B0C0CE 100%)",
              boxShadow: metal === "gold"
                ? "0 6px 24px rgba(180,130,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)"
                : "0 6px 24px rgba(100,130,160,0.25), inset 0 2px 4px rgba(255,255,255,0.5)",
              border: \`2px solid \${metal === "gold" ? "#C8950A" : "#8899AA"}\`,
              display: "flex", alignItems: "center", justifyContent: "center",`;

if (c.includes(OLD7)) { c = c.replace(OLD7, NEW7); console.log("✅ Bar hero image via CSS background"); }
else errors.push("❌ Bar hero background anchor not found");

/* ── 8. TrustStrip frequency text ── */
const OLD8 = `        { icon: "⏱",  title: "Twice Daily",   sub: "7am & 3pm Sydney time" },`;
const NEW8 = `        { icon: "⏱",  title: "Every 3 Hours", sub: "8 updates/day Sydney time" },`;

if (c.includes(OLD8)) { c = c.replace(OLD8, NEW8); console.log("✅ TrustStrip frequency updated"); }
else errors.push("❌ TrustStrip anchor not found");

if (errors.length) { errors.forEach(e => console.log(e)); process.exit(1); }
fs.writeFileSync("src/App.jsx", c, "utf8");
console.log("✅ App.jsx written");