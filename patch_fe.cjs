// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

// ── 1. Fix dropdown overflow — align right on mobile ─────────────────────────
const OLD = `            <div style={{ position:"absolute", top:"100%", left:0, background:"#fff", borderRadius:8, border:"1px solid #E2E8F0", boxShadow:"0 4px 16px rgba(0,0,0,0.12)", zIndex:100, minWidth:160, overflow:"hidden" }}
              onMouseLeave={()=>setServiceOpen(false)}>`;
const NEW = `            <div style={{ position:"absolute", top:"100%", right:0, background:"#fff", borderRadius:8, border:"1px solid #E2E8F0", boxShadow:"0 4px 16px rgba(0,0,0,0.12)", zIndex:100, minWidth:160, overflow:"hidden" }}
              onMouseLeave={()=>setServiceOpen(false)}>`;

// ── 2. Fix weight input — constrain width ─────────────────────────────────────
const OLD2 = `              <input value={weight} onChange={function(e){setWeight(e.target.value);setResult(null);}} placeholder="e.g. 1"
                style={{ flex:1, fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none" }} />`;
const NEW2 = `              <input value={weight} onChange={function(e){setWeight(e.target.value);setResult(null);}} placeholder="e.g. 1"
                style={{ flex:1, minWidth:0, fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none", width:"100%", boxSizing:"border-box" }} />`;

if (!c.includes(OLD))  { console.error("❌ Dropdown not found"); process.exit(1); }
if (!c.includes(OLD2)) { console.error("❌ Input not found"); process.exit(1); }
c = c.replace(OLD, NEW).replace(OLD2, NEW2);
fs.writeFileSync("src/App.jsx", c);
console.log("✅ Fixed — run: npm run dev");