const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const oldStart = c.indexOf('/* ── Bars section (homepage)');
const oldEnd   = c.indexOf('\n}', oldStart) + 2;

const newBars = `/* ── Bars section (homepage) ─────────────────────────────────────────────── */
function BarsSection({ rows }) {
  const [tab, setTab] = useState("Gold Cast");
  const navigate      = useNavigate();

  const TABS = ["Gold Cast", "Gold Minted", "Silver Cast", "Silver Minted"];
  const metal   = tab.startsWith("Gold") ? "gold" : "silver";
  const barType = tab.endsWith("Cast") ? "cast" : "minted";

  const filtered = rows.filter(r =>
    r.category === "bar" &&
    r.metal === metal &&
    r.bar_type === barType &&
    r.buy_price > 100
  );

  // Group by size — one row per size, cheapest dealer
  const grouped = {};
  for (const r of filtered) {
    const size  = r.weight_oz ? \`\${r.weight_oz}oz\` : \`\${r.weight_g}g\`;
    const oz    = r.weight_oz || (r.weight_g / 31.1);
    const key   = size;
    if (!grouped[key]) grouped[key] = { size, oz, cheapest: r, count: 0 };
    if (r.buy_price < grouped[key].cheapest.buy_price) grouped[key].cheapest = r;
    grouped[key].count++;
  }

  const sortedGroups = Object.values(grouped).sort((a, b) => a.oz - b.oz);

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: \`1px solid \${BORDER}\`, boxShadow: "0 1px 3px rgba(0,0,0,.04)", overflow: "hidden", flex: 1 }}>

      {/* Header */}
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🏅</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Bars</span>
        </div>
        <span style={{ fontSize: 10, color: MUTED }}>{sortedGroups.length} sizes</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 5, padding: "0 14px 8px", overflowX: "auto", borderBottom: \`1px solid \${BORDER}\` }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? NAVY : "#fff",
            color: tab === t ? "#fff" : SLATE,
            border: \`1px solid \${tab === t ? NAVY : BORDER}\`,
            borderRadius: 5, padding: "4px 10px",
            fontSize: 11, fontWeight: tab === t ? 600 : 400,
            cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>{t}</button>
        ))}
      </div>

      {/* Rows — one per weight size like gold.de */}
      {sortedGroups.length === 0
        ? <div style={{ padding: "20px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data yet</div>
        : sortedGroups.map((g, i) => (
            <div key={g.size}
              onClick={() => navigate(\`/bars/\${metal}/\${barType}/\${g.size}\`)}
              style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "0 14px", gap: 10, background: i % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: \`1px solid \${BORDER}\`, cursor: "pointer" }}>
              
              {/* Size label */}
              <span style={{ fontSize: 12, color: MUTED, width: 44, flexShrink: 0 }}>{g.size}</span>
              
              {/* Bar type label */}
              <span style={{ flex: 1, fontSize: 13, color: "#1E293B", textAlign: "left" }}>
                {barType === "cast" ? "Cast Bar" : "Minted Bar"}
              </span>

              {/* From price */}
              <span style={{ fontSize: 11, color: MUTED, marginRight: 4 }}>from</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: "nowrap", fontFamily: "'Inter',system-ui,sans-serif" }}>
                {fmt(g.cheapest.buy_price)}
              </span>
              <span style={{ fontSize: 12, color: MUTED }}>›</span>
            </div>
          ))
      }

      {/* All bars link */}
      <div style={{ padding: "8px 14px", textAlign: "right", borderTop: \`1px solid \${BORDER}\`, background: "#F8FAFC" }}>
        <span style={{ fontSize: 11, color: NAVY, cursor: "pointer", fontWeight: 500 }}>All {tab.toLowerCase()} ›</span>
      </div>
    </div>
  );
}
`;

c = c.slice(0, oldStart) + newBars + c.slice(oldEnd);
fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');