const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const lines = c.split('\n');
lines.splice(1332, 1);
fs.writeFileSync('src/App.jsx', lines.join('\n'), 'utf8');
console.log('Done');