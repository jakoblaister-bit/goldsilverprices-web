const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const lines = c.split('\n');

// Line 1332 (index 1331) needs to close the style and add }}>
lines[1331] = '          overflow: "hidden",\n        }}>';

// Remove the extra </div> at line 1339
// After fix line numbers shift by 1
// Find and remove the double </div>
const joined = lines.join('\n');
const fixed = joined.replace(
  '          </div>\n          </div>\n          <div style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}>',
  '          </div>\n          <div style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}>'
);

fs.writeFileSync('src/App.jsx', fixed, 'utf8');
console.log('✓ Done');