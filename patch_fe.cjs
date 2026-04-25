const fs = require('fs');
const file = 'src/App.jsx';
let c = fs.readFileSync(file, 'utf8');

// Fix mobile stacking — remove flex constraints on coin table
c = c.replace(
  `      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      flex: "1 1 0", minWidth: 0,`,
  `      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      flex: "1 1 300px", minWidth: 0,`
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ Frontend patched');