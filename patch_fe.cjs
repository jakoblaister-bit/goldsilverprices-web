const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Find and remove any remaining setGoldSpot derivation from kangaroo prices
const before = c.length;

// Remove the derivation block — find it precisely
const marker1 = 'const kangaroos = latest';
const marker2 = 'if (silver.length > 0) setSilverSpot';
const end2     = c.indexOf('\n', c.indexOf(marker2)) + 1;
const start1   = c.lastIndexOf('\n', c.indexOf(marker1)) + 1;

if (c.includes(marker1)) {
  c = c.slice(0, start1) + c.slice(end2);
  console.log('✓ Derivation block removed');
} else {
  console.log('✓ Already clean');
}

console.log('Verify:', c.includes('kangaroos[0].buy_price') ? '✗ STILL THERE' : '✓ GONE');
fs.writeFileSync('src/App.jsx', c, 'utf8');