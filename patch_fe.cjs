// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

// CoinsSection "All" link
const OLD1 = `        All {title.toLowerCase()} ›
      </div>
    </Card>`;
const NEW1 = `        <span onClick={() => navigate("/" + metal + "/coins")} style={{ cursor:"pointer" }}>All {title.toLowerCase()} ›</span>
      </div>
    </Card>`;

// BarsSection "All" link
const OLD2 = `        <span style={{ fontSize: 11, color: NAVY, cursor: "pointer", fontWeight: 500 }}>All {tab.toLowerCase()} ›</span>`;
const NEW2 = `        <span onClick={() => navigate("/" + metal + "/bars")} style={{ fontSize: 11, color: NAVY, cursor: "pointer", fontWeight: 500 }}>All {tab.toLowerCase()} ›</span>`;

if (!c.includes(OLD1)) { console.error("❌ CoinsSection All not found"); process.exit(1); }
if (!c.includes(OLD2)) { console.error("❌ BarsSection All not found"); process.exit(1); }
c = c.replace(OLD1, NEW1).replace(OLD2, NEW2);
fs.writeFileSync("src/App.jsx", c);
console.log("✅ All links connected to registry pages");