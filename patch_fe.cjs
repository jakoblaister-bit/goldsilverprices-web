const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const OLD = `                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"left",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Dealer</th>
                  {!mobile&&<th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>vs spot</th>}
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Buyback offer</th>`;

const NEW = `                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"left",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Dealer</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>vs spot</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Buyback offer</th>`;

if (!c.includes(OLD)) { console.error("❌ header not found"); process.exit(1); }
c = c.replace(OLD, NEW);

const OLD2 = `                        {mobile&&pct&&<div style={{fontSize:11,color:parseFloat(pct)>=0?GREEN:MUTED,marginTop:2}}>{(parseFloat(pct)>=0?"+":"")+pct+"% vs spot"}</div>}
                      </td>
                      {!mobile&&<td style={{padding:"14px 16px",textAlign:"right",fontSize:12,color:pct&&parseFloat(pct)>=0?GREEN:MUTED}}>{pct?(parseFloat(pct)>=0?"+":"")+pct+"%":"—"}</td>}`;

const NEW2 = `                      </td>
                      <td style={{padding:"14px 16px",textAlign:"right",fontSize:12,color:pct&&parseFloat(pct)>=0?GREEN:MUTED}}>{pct?(parseFloat(pct)>=0?"+":"")+pct+"%":"—"}</td>`;

if (!c.includes(OLD2)) { console.error("❌ row not found"); process.exit(1); }
c = c.replace(OLD2, NEW2);

fs.writeFileSync("src/App.jsx", c);
console.log("✅ vs spot column always visible, before price");