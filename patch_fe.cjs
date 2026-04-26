const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  `{ display: "flex", gap: 5, padding: "0 14px 8px", flexWrap: "wrap", borderBottom: \`1px solid \${BORDER}\` }}>
        {TABS.map(t => (`,
  `{ display: "flex", gap: 5, padding: "0 14px 8px", overflowX: "auto", borderBottom: \`1px solid \${BORDER}\` }}>
        {TABS.map(t => (`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');