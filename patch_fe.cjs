const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const errors = [];

/* ── 1. ProductPage: replace title + specs with hero (image left, specs right) */
const OLD1 = `        {/* Title */}
        <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: "'Inter',system-ui,sans-serif" }}>
          {coinTypeDisplay} {metal === "gold" ? "Gold" : "Silver"} Coin
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>
          Compare prices from Australian dealers · Updated twice daily · Not financial advice
        </p>

        {/* Coin info — NO weight here */}
        {COIN_INFO[coinTypeDisplay]?.[metal] && (
          <div style={{
            background: "#fff", borderRadius: 10,
            border: \`1px solid \${BORDER}\`,
            padding: "14px 16px", marginBottom: 16,
            display: "flex", gap: 20, flexWrap: "wrap",
          }}>
            {[
              { label: "Country",  val: COIN_INFO[coinTypeDisplay][metal].country },
              { label: "Mint",     val: COIN_INFO[coinTypeDisplay][metal].mint },
              { label: "Fineness", val: COIN_INFO[coinTypeDisplay][metal].fineness },
              { label: "Since",    val: COIN_INFO[coinTypeDisplay][metal].since },
              { label: "Metal",    val: metal === "gold" ? "Gold" : "Silver" },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{item.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Summary cards */}`;

const NEW1 = `        {/* Hero — coin image left, title + specs right */}
        <div style={{
          display: "flex", gap: 24, marginBottom: 20,
          flexDirection: mobile ? "column" : "row",
          alignItems: "flex-start",
        }}>
          {!mobile && (
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: 164, height: 164, borderRadius: "50%",
                background: metal === "gold"
                  ? "radial-gradient(circle at 38% 30%, #FEF3A7, #E8B90A 45%, #A07008 75%, #7A5205)"
                  : "radial-gradient(circle at 38% 30%, #FFFFFF, #D4DFE8 45%, #96A8B8 75%, #6B7F90)",
                boxShadow: metal === "gold"
                  ? "0 8px 28px rgba(180,130,0,0.35), inset 0 2px 6px rgba(255,255,255,0.5)"
                  : "0 8px 28px rgba(100,130,160,0.3), inset 0 2px 6px rgba(255,255,255,0.6)",
                border: \`2px solid \${metal === "gold" ? "#C8950A" : "#8899AA"}\`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: "62%", height: "62%", borderRadius: "50%",
                  background: metal === "gold"
                    ? "radial-gradient(circle at 40% 35%, #FEF8C0, #D4A010 50%, #9A7010)"
                    : "radial-gradient(circle at 40% 35%, #F8FBFD, #B8C8D8 50%, #7888A0)",
                  border: \`1px solid \${metal === "gold" ? "rgba(200,149,10,0.4)" : "rgba(136,153,170,0.4)"}\`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontSize: 36, fontWeight: 900, fontFamily: "Georgia, serif",
                    color: metal === "gold" ? "rgba(130,90,5,0.75)" : "rgba(85,105,125,0.75)",
                    userSelect: "none",
                  }}>
                    {metal === "gold" ? "Au" : "Ag"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: mobile ? 22 : 26, fontWeight: 700, color: NAVY, marginBottom: 3 }}>
              {coinTypeDisplay} {metal === "gold" ? "Gold" : "Silver"} Coin
            </h1>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
              Compare prices from Australian dealers · Updated twice daily · Not financial advice
            </p>
            {COIN_INFO[coinTypeDisplay]?.[metal] && (
              <div style={{
                background: "#fff", borderRadius: 10,
                border: \`1px solid \${BORDER}\`,
                padding: "12px 16px",
                display: "grid",
                gridTemplateColumns: mobile ? "1fr 1fr 1fr" : "repeat(5, 1fr)",
                gap: "10px 0",
              }}>
                {[
                  { label: "Country",  val: COIN_INFO[coinTypeDisplay][metal].country },
                  { label: "Mint",     val: COIN_INFO[coinTypeDisplay][metal].mint },
                  { label: "Fineness", val: COIN_INFO[coinTypeDisplay][metal].fineness },
                  { label: "Since",    val: COIN_INFO[coinTypeDisplay][metal].since },
                  { label: "Metal",    val: metal === "gold" ? "Gold" : "Silver" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{item.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary cards */}`;

if (c.includes(OLD1)) { c = c.replace(OLD1, NEW1); console.log("✅ ProductPage hero redesign applied"); }
else errors.push("❌ ProductPage title+specs anchor not found");

/* ── 2. BarProductPage: replace title with hero (bar image left, specs right) */
const OLD2 = `        {/* Title */}
        <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: "'Inter',system-ui,sans-serif" }}>
          {size} {tabLabel}
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>
          {dealers.length} dealers compared · Prices updated twice daily · Not financial advice
        </p>

        {/* Summary cards */}`;

const NEW2 = `        {/* Hero — bar image left, title + specs right */}
        <div style={{
          display: "flex", gap: 24, marginBottom: 20,
          flexDirection: mobile ? "column" : "row",
          alignItems: "flex-start",
        }}>
          {!mobile && (
            <div style={{ flexShrink: 0, paddingTop: 4 }}>
              <div style={{
                width: 196, height: 118, borderRadius: 10,
                background: metal === "gold"
                  ? "linear-gradient(140deg, #FEF3A7 0%, #E8B90A 35%, #A07008 70%, #C8950A 100%)"
                  : "linear-gradient(140deg, #FFFFFF 0%, #D4DFE8 35%, #96A8B8 70%, #B0C0CE 100%)",
                boxShadow: metal === "gold"
                  ? "0 6px 24px rgba(180,130,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)"
                  : "0 6px 24px rgba(100,130,160,0.25), inset 0 2px 4px rgba(255,255,255,0.5)",
                border: \`2px solid \${metal === "gold" ? "#C8950A" : "#8899AA"}\`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: "70%", height: "62%", borderRadius: 5,
                  border: \`1px solid \${metal === "gold" ? "rgba(200,149,10,0.5)" : "rgba(136,153,170,0.5)"}\`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontSize: 26, fontWeight: 900, fontFamily: "Georgia, serif",
                    color: metal === "gold" ? "rgba(130,90,5,0.75)" : "rgba(85,105,125,0.75)",
                    userSelect: "none",
                  }}>
                    {metal === "gold" ? "Au" : "Ag"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: mobile ? 22 : 26, fontWeight: 700, color: NAVY, marginBottom: 3 }}>
              {size} {tabLabel}
            </h1>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
              {dealers.length} dealers compared · Prices updated twice daily · Not financial advice
            </p>
            <div style={{
              background: "#fff", borderRadius: 10,
              border: \`1px solid \${BORDER}\`,
              padding: "12px 16px",
              display: "grid",
              gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: "10px 0",
            }}>
              {[
                { label: "Type",     val: barTypeLabel },
                { label: "Metal",    val: metal === "gold" ? "Gold" : "Silver" },
                { label: "Fineness", val: metal === "gold" ? "99.99%" : "99.9%" },
                { label: "Size",     val: size },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary cards */}`;

if (c.includes(OLD2)) { c = c.replace(OLD2, NEW2); console.log("✅ BarProductPage hero redesign applied"); }
else errors.push("❌ BarProductPage title anchor not found");

if (errors.length) { errors.forEach(e => console.log(e)); process.exit(1); }
fs.writeFileSync("src/App.jsx", c, "utf8");
console.log("✅ App.jsx written");