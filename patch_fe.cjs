const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Find by index
const target = 'SILVER_WEIGHTS} rows={rows}';
const idx = c.indexOf(target);
console.log('Found at:', idx);

if (idx > -1) {
  // Find the closing </div> after this
  const divClose = c.indexOf('</div>', idx);
  const afterDiv = divClose + 6;
  
  // Find TrustStrip
  const trustStrip = c.indexOf('<TrustStrip />', afterDiv);
  console.log('TrustStrip at:', trustStrip);
  
  // Insert BarsSection before TrustStrip
  if (trustStrip > -1) {
    const insert = `
        {!mobile && <BarsSection rows={rows} />}

        {/* TradingView Chart */}
        <div style={{ background: "#fff", borderRadius: 10, marginBottom: 14 }}>
          <div style={{ padding: "10px 14px", background: "#F8FAFC" }}>
            <span>Gold Price AUD — Live Chart</span>
          </div>
          <iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUAUD&interval=D&style=1&theme=light&locale=en"
            style={{ width: "100%", height: 350, border: "none", display: "block" }}
            allowTransparency="true" scrolling="no" />
        </div>

        `;
    c = c.slice(0, trustStrip) + insert + c.slice(trustStrip);
    console.log('✓ Inserted');
  }
}

fs.writeFileSync('src/App.jsx', c, 'utf8');