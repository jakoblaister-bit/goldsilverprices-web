const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  `/* ── Top spot bar — TradingView ───────────────────────────────────────────── */
function TopBar() {
  const mobile = useIsMobile();
  useEffect(() => {
    const existing = document.getElementById('tv-ticker-script');
    if (existing) return;
    const script = document.createElement('script');
    script.id  = 'tv-ticker-script';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "OANDA:XAUAUD", title: "Gold AUD" },
        { proName: "OANDA:XAGAUD", title: "Silver AUD" },
      ],
      showSymbolLogo: false,
      colorTheme: "light",
      isTransparent: true,
      displayMode: "compact",
      locale: "en",
    });
    document.getElementById('tv-ticker-container')?.appendChild(script);
  }, []);

  return (
    <div style={{
      background: "#F8F9FA",
      borderBottom: "1px solid #E2E8F0",
      height: mobile ? 46 : 40,
      overflow: "hidden",
    }}>
      <div
        id="tv-ticker-container"
        className="tradingview-widget-container"
        style={{ height: "100%" }}
      >
        <div className="tradingview-widget-container__widget" style={{ height: "100%" }} />
      </div>
    </div>
  );
}`,

  `/* ── Top spot bar ─────────────────────────────────────────────────────────── */
function TopBar({ goldSpot, silverSpot, goldChange, silverChange }) {
  const mobile = useIsMobile();
  return (
    <div style={{
      background: "#F8F9FA",
      borderBottom: "1px solid #E2E8F0",
      padding: mobile ? "6px 14px" : "6px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* Gold + Silver */}
      <div style={{
        display: "flex",
        width: mobile ? "100%" : "auto",
        justifyContent: mobile ? "space-between" : "flex-start",
        gap: mobile ? 0 : 40,
      }}>
        {[
          { label: "Gold",   price: goldSpot,   change: goldChange,   color: "#B8860B" },
          { label: "Silver", price: silverSpot, change: silverChange, color: "#64748B" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: s.color,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontFamily: "'Inter',system-ui,sans-serif" }}>
              {s.price ? fmt(s.price) : "—"}
            </span>
            {s.change !== null && s.change !== undefined && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: s.change >= 0 ? "#16A34A" : "#DC2626",
              }}>
                {s.change >= 0 ? "▲" : "▼"} {Math.abs(s.change).toFixed(2)}%
              </span>
            )}
            <span style={{
              fontSize: 9, color: "#94A3B8",
              borderLeft: "1px solid #E2E8F0", paddingLeft: 8,
            }}>
              /troy oz
            </span>
          </div>
        ))}
      </div>

      {/* Source badge */}
      {!mobile && (
        
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
      )}
    </div>
  );
}`
);

// Update Header to pass goldSpot/silverSpot back to TopBar
c = c.replace(
  `      <TopBar />`,
  `      <TopBar goldSpot={goldSpot} silverSpot={silverSpot} goldChange={null} silverChange={null} />`
);

// Restore fetchSpot using Vercel serverless
c = c.replace(
  `  async function fetchData() {`,
  `  async function fetchSpot() {
    try {
      const res  = await fetch('/api/spot');
      const data = await res.json();
      if (data?.gold)   setGoldSpot(data.gold);
      if (data?.silver) setSilverSpot(data.silver);
      if (data?.goldChange !== undefined)   setGoldChange(data.goldChange);
      if (data?.silverChange !== undefined) setSilverChange(data.silverChange);
    } catch {
      console.log('Spot fetch failed');
    }
  }

  async function fetchData() {`
);

// Add goldChange and silverChange state
c = c.replace(
  `  const [goldSpot, setGoldSpot]     = useState(6640);
  const [silverSpot, setSilverSpot] = useState(108);`,
  `  const [goldSpot, setGoldSpot]         = useState(null);
  const [silverSpot, setSilverSpot]     = useState(null);
  const [goldChange, setGoldChange]     = useState(null);
  const [silverChange, setSilverChange] = useState(null);`
);

// Call fetchSpot on load
c = c.replace(
  `    fetchData();`,
  `    fetchSpot();
    fetchData();`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');