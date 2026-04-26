const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Check if HomePage exists
if (c.includes('function HomePage')) {
  console.log('HomePage exists — checking for syntax errors');
} else {
  console.log('HomePage missing — adding it back');

  const homePage = `
/* ══════════════════════════════════════════════════════════════════════════ */
/* HOMEPAGE                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
function HomePage({ rows, goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();

  useSEO({
    title: "Compare Gold & Silver Prices Australia | GoldSilverPrices.com.au",
    description: "Compare live gold and silver bullion prices from 8 Australian dealers. Updated twice daily.",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <MagazineCarousel />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: mobile ? "14px 10px 48px" : "20px 24px 60px" }}>

        <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <CoinsSection metal="gold" icon="🪙" title="Gold Coins" weights={GOLD_WEIGHTS} rows={rows} />
          </div>
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <CoinsSection metal="silver" icon="🥈" title="Silver Coins" weights={SILVER_WEIGHTS} rows={rows} />
          </div>
          {!mobile && <div style={{ flex: "1 1 0", minWidth: 0 }}><BarsSection rows={rows} /></div>}
        </div>

        {mobile && <div style={{ marginBottom: 14 }}><BarsSection rows={rows} /></div>}

        <div style={{ background: "#fff", borderRadius: 10, border: \`1px solid \${BORDER}\`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)", marginBottom: 14 }}>
          <div style={{ padding: "10px 14px", background: "#F8FAFC", borderBottom: \`1px solid \${BORDER}\`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Gold Price AUD — Live Chart</span>
            <span style={{ fontSize: 10, color: MUTED }}>Powered by TradingView</span>
          </div>
          <iframe
            src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUAUD&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&style=1&theme=light&timezone=Australia%2FSydney&withdateranges=1&locale=en"
            style={{ width: "100%", height: mobile ? 250 : 350, border: "none", display: "block" }}
            allowTransparency="true" scrolling="no"
          />
        </div>

        <TrustStrip />

        <p style={{ textAlign: "center", fontSize: 11, color: MUTED, lineHeight: 1.7, marginTop: 20, padding: mobile ? "0 8px" : 0 }}>
          ⚠️ Prices indicative only. Always confirm with dealer before purchase. Not financial advice.
        </p>
      </div>
      <Footer />
    </div>
  );
}

`;

  // Find ROOT APP section and insert before it
  const rootIdx = c.indexOf('/* ROOT APP');
  const sectionStart = c.lastIndexOf('/*', rootIdx - 2);
  c = c.slice(0, sectionStart) + homePage + c.slice(sectionStart);
}

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('HomePage defined:', c.includes('function HomePage'));
console.log('CoinsSection called:', c.includes('<CoinsSection'));