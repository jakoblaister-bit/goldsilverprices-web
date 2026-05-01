const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const errors = [];

/* ── 1. Coin hero: show image on mobile (smaller), always row layout ── */
const OLD1 = `        {/* Hero — coin image left, title + specs right */}
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
          <div style={{ flex: 1, minWidth: 0 }}>`;

const NEW1 = `        {/* Hero — coin image left, title + specs right */}
        <div style={{
          display: "flex", gap: mobile ? 14 : 24, marginBottom: 20,
          flexDirection: "row",
          alignItems: "flex-start",
        }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: mobile ? 90 : 164, height: mobile ? 90 : 164, borderRadius: "50%",
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
                  fontSize: mobile ? 22 : 36, fontWeight: 900, fontFamily: "Georgia, serif",
                  color: metal === "gold" ? "rgba(130,90,5,0.75)" : "rgba(85,105,125,0.75)",
                  userSelect: "none",
                }}>
                  {metal === "gold" ? "Au" : "Ag"}
                </span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>`;

if (c.includes(OLD1)) { c = c.replace(OLD1, NEW1); console.log("✅ Coin hero mobile image added"); }
else errors.push("❌ Coin hero anchor not found");

/* ── 2. Bar hero: show image on mobile (smaller), always row layout ── */
const OLD2 = `        {/* Hero — bar image left, title + specs right */}
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
          <div style={{ flex: 1, minWidth: 0 }}>`;

const NEW2 = `        {/* Hero — bar image left, title + specs right */}
        <div style={{
          display: "flex", gap: mobile ? 14 : 24, marginBottom: 20,
          flexDirection: "row",
          alignItems: "flex-start",
        }}>
          <div style={{ flexShrink: 0, paddingTop: 4 }}>
            <div style={{
              width: mobile ? 120 : 196, height: mobile ? 72 : 118, borderRadius: 10,
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
                  fontSize: mobile ? 18 : 26, fontWeight: 900, fontFamily: "Georgia, serif",
                  color: metal === "gold" ? "rgba(130,90,5,0.75)" : "rgba(85,105,125,0.75)",
                  userSelect: "none",
                }}>
                  {metal === "gold" ? "Au" : "Ag"}
                </span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>`;

if (c.includes(OLD2)) { c = c.replace(OLD2, NEW2); console.log("✅ Bar hero mobile image added"); }
else errors.push("❌ Bar hero anchor not found");

/* ── 3. Coin table: use buy_url for exact product link ── */
const OLD3 = `                  <a key={r.dealer} href={DEALER_URLS[r.dealer] || "#"} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    minHeight: mobile ? 54 : 48,
                    padding: "0 14px", gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: \`1px solid \${BORDER}\`,
                    borderLeft: isLowest ? \`3px solid \${GREEN}\` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 600 : 400 }}>
                        {r.dealer}
                      </span>
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                    </div>`;

const NEW3 = `                  <a key={r.dealer} href={r.buy_url || DEALER_URLS[r.dealer] || "#"} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    minHeight: mobile ? 54 : 48,
                    padding: "0 14px", gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: \`1px solid \${BORDER}\`,
                    borderLeft: isLowest ? \`3px solid \${GREEN}\` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 600 : 400 }}>
                        {r.dealer}
                      </span>
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                    </div>`;

if (c.includes(OLD3)) { c = c.replace(OLD3, NEW3); console.log("✅ Coin table buy_url applied"); }
else errors.push("❌ Coin table anchor not found");

/* ── 4. Bar table: buy_url + bar_brand label + unique key ── */
const OLD4 = `            : dealers.map((r, i) => {
                const p = spotForSize > 0 ? ((r.buy_price / spotForSize - 1) * 100) : null;
                const isLowest = i === 0;
                return (
                  <a key={r.dealer} href={DEALER_URLS[r.dealer] || "#"} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    minHeight: mobile ? 54 : 48,
                    padding: "0 14px", gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: \`1px solid \${BORDER}\`,
                    borderLeft: isLowest ? \`3px solid \${GREEN}\` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 600 : 400 }}>
                        {r.dealer}
                      </span>
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                    </div>`;

const NEW4 = `            : dealers.map((r, i) => {
                const p = spotForSize > 0 ? ((r.buy_price / spotForSize - 1) * 100) : null;
                const isLowest = i === 0;
                return (
                  <a key={\`\${r.dealer}-\${r.bar_brand||''}\`} href={r.buy_url || DEALER_URLS[r.dealer] || "#"} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    minHeight: mobile ? 54 : 48,
                    padding: "0 14px", gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: \`1px solid \${BORDER}\`,
                    borderLeft: isLowest ? \`3px solid \${GREEN}\` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 600 : 400 }}>
                        {r.dealer}
                      </span>
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                      {r.bar_brand && <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{r.bar_brand}</div>}
                    </div>`;

if (c.includes(OLD4)) { c = c.replace(OLD4, NEW4); console.log("✅ Bar table buy_url + brand label + key fix applied"); }
else errors.push("❌ Bar table anchor not found");

/* ── 5. "Updated twice daily" → "Updated every 3 hours" ── */
c = c.replace(/Updated twice daily/g, "Updated every 3 hours");
c = c.replace(/Prices updated twice daily/g, "Prices updated every 3 hours");
console.log("✅ Update frequency text corrected");

if (errors.length) { errors.forEach(e => console.log(e)); process.exit(1); }
fs.writeFileSync("src/App.jsx", c, "utf8");
console.log("✅ App.jsx written");