// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

// Fix calculator weight input
const OLD1 = `style={{ flex:1, minWidth:0, fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none", width:"100%", boxSizing:"border-box" }}`;
const NEW1 = `style={{ flex:1, minWidth:0, fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none", width:"100%", boxSizing:"border-box", background:"#fff", WebkitAppearance:"none" }}`;

// Fix sell page postcode input
const OLD2 = `style={{ width:"100%", fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none", boxSizing:"border-box" }}`;
const NEW2 = `style={{ width:"100%", fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none", boxSizing:"border-box", background:"#fff", WebkitAppearance:"none" }}`;

// Fix calculator purity select
const OLD3 = `style={{ width:"100%", fontSize:13, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, background:"#fff", outline:"none" }}>`;
const NEW3 = `style={{ width:"100%", fontSize:13, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, background:"#fff", outline:"none", WebkitAppearance:"auto" }}>`;

let fixed = 0;
[OLD1,OLD2,OLD3].forEach(function(old,i){
  const news = [NEW1,NEW2,NEW3][i];
  if (c.includes(old)) { c = c.replace(old, news); fixed++; console.log("✅ Fixed input "+(i+1)); }
  else { console.log("⚠️  Input "+(i+1)+" not found"); }
});

fs.writeFileSync("src/App.jsx", c);
console.log("✅ Done — run: npm run dev");