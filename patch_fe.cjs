const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// ── 1. Desktop: 3 tables side by side ────────────────────────────────────────
c = c.replace(
  `        {/* Coins side by side on desktop */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 14, marginBottom: 14,
        }}>
          <CoinsSection
            metal="gold" icon="🪙" title="Gold Coins"
            weights={GOLD_WEIGHTS} rows={rows}
          />
          <CoinsSection
            metal="silver" icon="🥈" title="Silver Coins"
            weights={SILVER_WEIGHTS} rows={rows}
          />
        </div>

        {/* Bars full width */}
        <BarsSection rows={rows} />`,
  `        {/* 3 tables side by side on desktop */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 14, marginBottom: 14,
          alignItems: "flex-start",
        }}>
          <CoinsSection
            metal="gold" icon="🪙" title="Gold Coins"
            weights={GOLD_WEIGHTS} rows={rows}
          />
          <CoinsSection
            metal="silver" icon="🥈" title="Silver Coins"
            weights={SILVER_WEIGHTS} rows={rows}
          />
          <BarsSection rows={rows} />
        </div>`
);

// ── 2. TradingView chart section on homepage ───────────────────────────────────
const tvChart = `
        {/* TradingView Charts */}
        <div style={{
          background: "#fff", borderRadius: 10,
          border: \`1px solid \${BORDER}\`,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,.04)",
          marginBottom: 14,
        }}>
          <div style={{
            padding: "10px 14px", background: "#F8FAFC",
            borderBottom: \`1px solid \${BORDER}\`,
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Live Gold Price (AUD)
            </span>
            <span style={{ fontSize: 10, color: MUTED }}>Powered by TradingView</span>
          </div>
          <div style={{ height: mobile ? 250 : 350 }}>
            <iframe
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_gold&symbol=OANDA%3AXAUAUD&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=F1F3F6&studies=[]&theme=light&style=1&timezone=Australia%2FSydney&withdateranges=1&showpopupbutton=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=goldsilverprices.com.au"
              style={{ width: "100%", height: "100%", border: "none" }}
              allowTransparency={true}
              scrolling="no"
            />
          </div>
        </div>`;

c = c.replace(
  `        {/* Trust strip */}`,
  tvChart + `\n        {/* Trust strip */}`
);

// ── 3. Product page: coin info section + weight pills ─────────────────────────

// Coin info data
const coinInfo = `
const COIN_INFO = {
  "Kangaroo":      { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1986" },
  "Kookaburra":    { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1990" },
  "Koala":         { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1987" },
  "Lunar":         { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1996" },
  "Emu":           { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "2018" },
  "Swan":          { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "2017" },
  "Maple Leaf":    { country: "Canada",    mint: "Royal Canadian", fineness: "999.9/1000", since: "1979" },
  "Krugerrand":    { country: "S. Africa", mint: "SA Mint",       fineness: "916.7/1000", since: "1967" },
  "Britannia":     { country: "UK",        mint: "Royal Mint",    fineness: "999.9/1000", since: "2013" },
  "Philharmonic":  { country: "Austria",   mint: "Austrian Mint", fineness: "999.9/1000", since: "1989" },
  "American Eagle":{ country: "USA",       mint: "US Mint",       fineness: "916.7/1000", since: "1986" },
  "Buffalo":       { country: "USA",       mint: "US Mint",       fineness: "999.9/1000", since: "2006" },
};

`;

c = c.replace(
  '/* ── Top spot bar',
  coinInfo + '/* ── Top spot bar'
);

// Add coin info section + weight pills to ProductPage
c = c.replace(
  `        {/* Title */}
        <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: "'Inter',system-ui,sans-serif" }}>
          {weightDisplay} {coinTypeDisplay}
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>
          {dealers.length} dealers compared · Prices updated twice daily · Not financial advice
        </p>`,
  `        {/* Title */}
        <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: "'Inter',system-ui,sans-serif" }}>
          {weightDisplay} {coinTypeDisplay}
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>
          {dealers.length} dealers compared · Prices updated twice daily · Not financial advice
        </p>

        {/* Coin info card */}
        {COIN_INFO[coinTypeDisplay] && (
          <div style={{
            background: "#fff", borderRadius: 10,
            border: \`1px solid \${BORDER}\`,
            padding: "14px 16px", marginBottom: 16,
            display: "flex", gap: 24, flexWrap: "wrap",
          }}>
            {[
              { label: "Country",   val: COIN_INFO[coinTypeDisplay].country },
              { label: "Mint",      val: COIN_INFO[coinTypeDisplay].mint },
              { label: "Fineness",  val: COIN_INFO[coinTypeDisplay].fineness },
              { label: "Since",     val: COIN_INFO[coinTypeDisplay].since },
              { label: "Metal",     val: metal === "gold" ? "Gold" : "Silver" },
              { label: "Weight",    val: weightDisplay },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weight filter pills */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: SLATE, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Select weight
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(metal === "gold" ? GOLD_WEIGHTS : SILVER_WEIGHTS).map(w => (
              <button key={w}
                onClick={() => navigate(\`/\${metal}/coin/\${coinType}/\${slugify(w)}\`)}
                style={{
                  background: slugify(w) === weight ? NAVY : "#fff",
                  color: slugify(w) === weight ? "#fff" : SLATE,
                  border: \`1px solid \${slugify(w) === weight ? NAVY : BORDER}\`,
                  borderRadius: 5, padding: "5px 14px",
                  fontSize: 12, fontWeight: slugify(w) === weight ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                {w}
              </button>
            ))}
          </div>
        </div>`
);

// Remove the old "Other sizes" section at bottom since we have pills at top
c = c.replace(
  `        {/* Other weights */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: SLATE, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Other sizes
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(metal === "gold" ? GOLD_WEIGHTS : SILVER_WEIGHTS)
              .filter(w => slugify(w) !== weight)
              .map(w => (
                <button key={w} onClick={() => navigate(\`/\${metal}/coin/\${coinType}/\${slugify(w)}\`)} style={{
                  background: "#fff", border: \`1px solid \${BORDER}\`,
                  borderRadius: 5, padding: "5px 12px",
                  fontSize: 12, color: SLATE,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {w}
                </button>
              ))
            }
          </div>
        </div>`,
  ''
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done — 3 tables desktop, TradingView chart, product info + weight pills');