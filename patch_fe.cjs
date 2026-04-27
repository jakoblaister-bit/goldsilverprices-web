// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const OLD = `function StaticPage({ title, children }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} />`;

const NEW = `function StaticPage({ title, children, goldSpot, silverSpot }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot || null} silverSpot={silverSpot || null} />`;

if (!c.includes(OLD)) { console.error("❌ not found"); process.exit(1); }
c = c.replace(OLD, NEW);
fs.writeFileSync("src/App.jsx", c);
console.log("✅ StaticPage fixed");