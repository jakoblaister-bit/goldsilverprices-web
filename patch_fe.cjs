const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const lines = c.split('\n');

// Find and fix lines 898-910
for (let i = 895; i < 915; i++) {
  if (lines[i] && lines[i].includes('tabLabel2')) {
    lines.splice(i, 1); // remove the tabLabel2 line
    console.log('✓ Removed tabLabel2 at line', i+1);
    break;
  }
}

c = lines.join('\n');
fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Done');