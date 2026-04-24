const fs = require('fs');
const file = 'src/App.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Remove TABS constant
c = c.replace(`const TABS = ["Übersicht", "Günstig", "Neu", "Beliebt", "Trend"];`, '');

// 2. Remove activeTab state
c = c.replace(`  const [activeTab, setActiveTab] = useState("Übersicht");\n`, '');

// 3. Remove the entire tabs nav block
c = c.replace(`        {/* Content tabs — gold.de style */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 24,
          borderBottom: "2px solid #E6E2D8",
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background: "none", border: "none",
              borderBottom: activeTab === t ? "2px solid #B8860B" : "2px solid transparent",
              color: activeTab === t ? "#B8860B" : "#4A4740",
              padding: "8px 18px", fontSize: 13,
              fontWeight: activeTab === t ? 700 : 400,
              marginBottom: -2, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>`, '');

// 4. Fix BARREN label to English
c = c.replace(`        }}>BARREN</span>`, `        }}>Bars</span>`);

// 5. Fix "by choosing wisely" to reflect current tab
c = c.replace(
  `            <div style={{ fontSize: 11, color: "#928C7E", marginTop: 2 }}>by choosing wisely</div>`,
  `            <div style={{ fontSize: 11, color: "#928C7E", marginTop: 2 }}>
              {tab === "1oz Gold Bar (Perth Mint)" ? "on 1oz Cast Bars" : "on 1g Minted Bars"}
            </div>`
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ All patches applied');