const fs = require('fs');
const file = 'src/App.jsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Show 1g bar first in tabs
c = c.replace(
  `const BAR_TABS = [
  { key: "1oz Gold Bar (Perth Mint)",       label: "Gold Bars 1oz" },
  { key: "1g Gold Minted Bar (Perth Mint)", label: "Minted Bars 1g" },
];`,
  `const BAR_TABS = [
  { key: "1g Gold Minted Bar (Perth Mint)", label: "Minted Bars 1g" },
  { key: "1oz Gold Bar (Perth Mint)",       label: "Gold Bars 1oz" },
];`
);

// 2. Fix mobile detection — use 900px breakpoint so narrow desktop
//    windows also stack correctly
c = c.replace(
  'const [mob, setMob] = useState(window.innerWidth < 768);',
  'const [mob, setMob] = useState(window.innerWidth < 900);'
);
c = c.replace(
  'const h = () => setMob(window.innerWidth < 768);',
  'const h = () => setMob(window.innerWidth < 900);'
);

// 3. Fix coin table container — ensure full width on mobile
c = c.replace(
  `      flex: "1 1 0", minWidth: 0,`,
  `      flex: "1 1 0", minWidth: 0, width: "100%",`
);

fs.writeFileSync(file, c, 'utf8');
console.log('✓ All patches applied');