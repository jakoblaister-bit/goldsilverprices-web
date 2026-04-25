const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const lines = c.split('\n');

// Fix price font to Inter
lines[613] = lines[613].replace(
  '<span style={{color:"#FFFFFF",fontWeight:700}}>',
  '<span style={{color:"#FFFFFF",fontWeight:600,fontFamily:"\'Inter\',system-ui,sans-serif",fontSize:16}}>'
);

c = lines.join('\n');

// Replace Compare All button with plain text link
c = c.replace(
  `          <a href="#" style={{
            color: "#F1F5F9",
            fontSize: 13, fontWeight: 500,
            textDecoration: "none",
            borderBottom: "1px solid rgba(241,245,249,.4)",
            paddingBottom: 1,
          }}>
            Compare All →
          </a>`,
  `          <a href="#top" style={{
            color: "#93C5FD",
            fontSize: 13, fontWeight: 500,
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}>
            Compare All →
          </a>`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');