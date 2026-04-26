const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Call fetchSpot after fetchData completes instead of simultaneously
c = c.replace(
  `    fetchSpot();
    fetchData();`,
  `    fetchData().then(() => fetchSpot());`
);

// Make fetchData return a promise
c = c.replace(
  `  async function fetchData() {`,
  `  async function fetchData() {`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');