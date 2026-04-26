const fs = require('fs');
const c = fs.readFileSync('src/App.jsx', 'utf8');
console.log('HomePage defined:', c.includes('function HomePage'));
console.log('CoinsSection called:', c.includes('<CoinsSection'));
console.log('BarsSection called:', c.includes('<BarsSection'));