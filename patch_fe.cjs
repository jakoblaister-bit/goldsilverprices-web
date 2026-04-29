const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

// ── Find & replace SellPage entirely ──
const si = c.indexOf("function SellPage({ goldSpot, silverSpot, updated }) {");
const ei = c.indexOf("\n/* ══════════════════════════════════════════════════════════════════════════ */\n/* MAGAZINE PAGE");
if (si === -1 || ei === -1) { console.error("❌ markers not found", si, ei); process.exit(1); }

const NEW = `
const SELL_DEALERS = [
  { key:"Perth Mint",            short:"Perth Mint",  url:"https://www.perthmint.com/sell-gold" },
  { key:"ABC Bullion",           short:"ABC Bullion", url:"https://www.abcbullion.com.au/sell-gold" },
  { key:"Melbourne Gold Company",short:"Melb Gold",   url:"https://melbournegold.com.au/sell" },
  { key:"Bullion Now",           short:"Bullion Now", url:"https://bulliownow.com.au" },
  { key:"Imperial Bullion",      short:"Imperial",    url:"https://imperialbullion.com.au" },
  { key:"Jaggards",              short:"Jaggards",    url:"https://www.jaggards.com.au" },
  { key:"Guardian Gold",         short:"Guardian",    url:"https://guardian-gold.com.au/sell-bullion" },
];
const GOLD_SELL_WEIGHTS   = [{oz:0.1,label:"1/10 oz"},{oz:0.25,label:"1/4 oz"},{oz:0.5,label:"1/2 oz"},{oz:1.0,label:"1 oz"},{oz:10.0,label:"10 oz"},{oz:32.1507,label:"1 kg"}];
const SILVER_SELL_WEIGHTS = [{oz:0.5,label:"1/2 oz"},{oz:1.0,label:"1 oz"},{oz:10.0,label:"10 oz"},{oz:32.1507,label:"1 kg"}];

function useSellRows() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    supabase.from("prices_v2").select("dealer,metal,weight_oz,sell_price")
      .not("sell_price","is",null).gt("sell_price",0)
      .then(({data}) => { if (data) setRows(data); });
  }, []);
  return rows;
}
function getBestSell(rows, metal, oz) {
  let best = null;
  for (const r of rows) {
    if (r.metal !== metal) continue;
    if (Math.abs((r.weight_oz||0) - oz) > 0.01) continue;
    if (!best || r.sell_price > best) best = r.sell_price;
  }
  return best;
}
function getDealerSell(rows, dealer, metal, oz) {
  const m = rows.filter(r => r.dealer===dealer && r.metal===metal && Math.abs((r.weight_oz||0)-oz)<0.01);
  return m.length ? Math.max(...m.map(r=>r.sell_price)) : null;
}
function fmtAUD(n) {
  return n == null ? null : "$"+n.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});
}

function SellHubPage({ goldSpot, silverSpot, updated }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  const sellRows = useSellRows();
  const [postcode, setPostcode] = useState("");
  const [searched, setSearched] = useState(false);
  const [metal, setMetal]       = useState("gold");

  useSEO({
    title:"Sell Gold & Silver Australia | GoldSilverPrices.com.au",
    description:"Compare live gold and silver buyback prices from Australian dealers.",
  });

  const TILES = [
    {metal:"gold",  category:"bars",  label:"Gold Bars",    emoji:"🥇"},
    {metal:"gold",  category:"coins", label:"Gold Coins",   emoji:"🪙"},
    {metal:"silver",category:"bars",  label:"Silver Bars",  emoji:"🥈"},
    {metal:"silver",category:"coins", label:"Silver Coins", emoji:"🔘"},
  ];

  const DEALERS = [
    {name:"Ainslie Bullion",  city:"Brisbane", state:"QLD",url:"https://ainsliebullion.com.au/sell",         phone:"1800 246 753",online:true, instore:true, gold:true, silver:true, note:"Competitive buyback — price on request online or in store."},
    {name:"ABC Bullion",      city:"Sydney",   state:"NSW",url:"https://www.abcbullion.com.au/sell-gold",    phone:"02 9231 4511",online:true, instore:true, gold:true, silver:true, note:"Live buyback prices published on website for ABC-branded products."},
    {name:"Perth Mint",       city:"Perth",    state:"WA", url:"https://www.perthmint.com/sell-gold",        phone:"1300 201 112",online:true, instore:true, gold:true, silver:true, note:"Government-backed buyback program. Accepts Perth Mint products."},
    {name:"KJC Bullion",      city:"Melbourne",state:"VIC",url:"https://www.kjc-gold-silver-bullion.com.au", phone:"03 9602 2544",online:false,instore:true, gold:true, silver:true, note:"In-store buyback only. Contact for current prices."},
    {name:"Jaggards",         city:"Sydney",   state:"NSW",url:"https://www.jaggards.com.au",                phone:"02 9230 0886",online:false,instore:true, gold:true, silver:false,note:"In-store buyback. One of Sydney's oldest dealers."},
    {name:"Guardian Gold",    city:"Melbourne",state:"VIC",url:"https://guardian-gold.com.au/sell-bullion",  phone:"03 9629 2122",online:false,instore:true, gold:true, silver:true, note:"Vault-based buyback through Guardian Vaults facilities."},
    {name:"Swan Bullion",     city:"Perth",    state:"WA", url:"https://swanbullion.com",                    phone:"",            online:true, instore:false,gold:true, silver:true, note:"Online buyback enquiry. Contact for current offer."},
    {name:"Gold Stackers",    city:"Melbourne",state:"VIC",url:"https://www.goldstackers.com.au",            phone:"1300 618 363",online:true, instore:true, gold:true, silver:true, note:"Buyback available online and in store. Price on request."},
  ];

  const STATE_ORDER = {
    "NSW":["NSW","ACT","VIC","QLD","SA","WA","TAS","NT"],
    "VIC":["VIC","NSW","ACT","SA","QLD","TAS","WA","NT"],
    "QLD":["QLD","NSW","ACT","NT","SA","VIC","WA","TAS"],
    "WA": ["WA","SA","NT","VIC","NSW","ACT","QLD","TAS"],
    "SA": ["SA","VIC","NSW","WA","QLD","NT","ACT","TAS"],
    "TAS":["TAS","VIC","NSW","ACT","SA","QLD","WA","NT"],
    "ACT":["ACT","NSW","VIC","SA","QLD","WA","NT","TAS"],
    "NT": ["NT","QLD","SA","WA","NSW","VIC","ACT","TAS"],
  };
  function postcodeToState(pc) {
    const n = parseInt(pc);
    if (n>=2000&&n<=2999) return "NSW"; if (n>=3000&&n<=3999) return "VIC";
    if (n>=4000&&n<=4999) return "QLD"; if (n>=5000&&n<=5999) return "SA";
    if (n>=6000&&n<=6999) return "WA";  if (n>=7000&&n<=7999) return "TAS";
    if (n>=800&&n<=899)   return "NT";  if (n>=200&&n<=299)   return "ACT";
    return null;
  }
  const userState  = postcodeToState(postcode);
  const stateOrder = STATE_ORDER[userState] || [];
  const filtered   = DEALERS
    .filter(d => metal==="gold" ? d.gold : d.silver)
    .sort((a,b)=>(stateOrder.indexOf(a.state)===-1?99:stateOrder.indexOf(a.state))-(stateOrder.indexOf(b.state)===-1?99:stateOrder.indexOf(b.state)));

  return (
    <div style={{minHeight:"100vh",background:BG}}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{maxWidth:860,margin:"0 auto",padding:mobile?"20px 14px 60px":"32px 24px 60px"}}>

        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:mobile?20:26,fontWeight:700,color:NAVY,margin:"0 0 6px",fontFamily:"'Inter',system-ui,sans-serif"}}>Sell Your Bullion</h1>
          <p style={{fontSize:13,color:MUTED,margin:0}}>Compare live buyback prices from Australian dealers — updated automatically</p>
        </div>

        {/* 4 category tiles */}
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:36}}>
          {TILES.map(function(t){
            const best = getBestSell(sellRows, t.metal, 1.0);
            return (
              <div key={t.label} onClick={()=>navigate("/sell/"+t.metal+"/"+t.category)}
                style={{background:"#fff",border:"1px solid "+BORDER,borderRadius:12,padding:"18px 14px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"box-shadow .15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.10)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)"}>
                <div style={{fontSize:24,marginBottom:8}}>{t.emoji}</div>
                <div style={{fontSize:13,fontWeight:700,color:NAVY,marginBottom:6}}>{t.label}</div>
                {best ? (
                  <>
                    <div style={{fontSize:10,color:MUTED,marginBottom:2}}>Best 1oz offer</div>
                    <div style={{fontSize:15,fontWeight:700,color:GREEN}}>{fmtAUD(best)}</div>
                  </>
                ) : <div style={{fontSize:11,color:MUTED}}>Loading...</div>}
                <div style={{fontSize:11,color:MUTED,marginTop:10}}>Compare prices →</div>
              </div>
            );
          })}
        </div>

        {/* Dealer locator */}
        <h2 style={{fontSize:13,fontWeight:700,color:NAVY,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Find a Dealer Near You</h2>
        <div style={{background:"#fff",borderRadius:10,border:"1px solid "+BORDER,padding:"16px 20px",marginBottom:20,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:"1 1 160px"}}>
              <div style={{fontSize:11,fontWeight:600,color:MUTED,marginBottom:6}}>Your postcode</div>
              <input value={postcode} onChange={e=>setPostcode(e.target.value.replace(/\\D/g,"").slice(0,4))}
                onKeyDown={e=>{if(e.key==="Enter")setSearched(true);}} placeholder="e.g. 2000"
                style={{width:"100%",fontSize:14,padding:"9px 12px",border:"1px solid "+BORDER,borderRadius:7,fontFamily:"inherit",color:NAVY,outline:"none",boxSizing:"border-box",background:"#fff",WebkitAppearance:"none"}} />
            </div>
            <div style={{flex:"1 1 160px"}}>
              <div style={{fontSize:11,fontWeight:600,color:MUTED,marginBottom:6}}>Metal</div>
              <div style={{display:"flex",gap:6}}>
                {["gold","silver"].map(m=>(
                  <button key={m} onClick={()=>setMetal(m)} style={{flex:1,background:metal===m?NAVY:"#fff",color:metal===m?"#fff":SLATE,border:"1px solid "+(metal===m?NAVY:BORDER),borderRadius:7,padding:"9px 0",fontSize:13,fontWeight:metal===m?600:400,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>{m}</button>
                ))}
              </div>
            </div>
            <button onClick={()=>setSearched(true)} style={{flex:"0 0 auto",background:NAVY,color:"#fff",border:"none",borderRadius:7,padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Search →</button>
          </div>
          {postcode.length===4&&!userState&&<div style={{fontSize:11,color:"#DC2626",marginTop:8}}>Please enter a valid Australian postcode</div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map(function(d){
            const isLocal = d.state===userState;
            return (
              <div key={d.name} style={{background:"#fff",borderRadius:10,border:"1px solid "+(isLocal&&searched?"#C9A84C":BORDER),padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",position:"relative"}}>
                {isLocal&&searched&&<div style={{position:"absolute",top:12,right:14,fontSize:9,fontWeight:700,background:"#FEF9C3",color:"#854D0E",padding:"2px 8px",borderRadius:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Nearest</div>}
                <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:700,color:NAVY}}>{d.name}</span>
                      <span style={{fontSize:11,color:MUTED}}>📍 {d.city}, {d.state}</span>
                    </div>
                    <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                      {d.online  &&<span style={{fontSize:10,background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0",borderRadius:6,padding:"2px 8px",fontWeight:600}}>Online buyback</span>}
                      {d.instore &&<span style={{fontSize:10,background:"#EFF6FF",color:"#1D4ED8",border:"1px solid #BFDBFE",borderRadius:6,padding:"2px 8px",fontWeight:600}}>In-store</span>}
                      {d.gold    &&<span style={{fontSize:10,background:"#FEF9C3",color:"#854D0E",border:"1px solid #FDE68A",borderRadius:6,padding:"2px 8px"}}>Gold</span>}
                      {d.silver  &&<span style={{fontSize:10,background:"#F1F5F9",color:"#475569",border:"1px solid #CBD5E1",borderRadius:6,padding:"2px 8px"}}>Silver</span>}
                    </div>
                    <p style={{fontSize:12,color:SLATE,margin:"0 0 8px",lineHeight:1.6}}>{d.note}</p>
                    {d.phone&&<div style={{fontSize:12,color:MUTED}}>{"📞 "+d.phone}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignSelf:"center",flexShrink:0}}>
                    <span onClick={()=>navigate("/dealers/"+d.name.toLowerCase().replace(/\\s+/g,"-").replace(/[^a-z0-9-]/g,""))}
                      style={{fontSize:11,fontWeight:600,color:NAVY,cursor:"pointer",textAlign:"center",padding:"6px 14px",border:"1px solid "+BORDER,borderRadius:6,background:"#fff"}}
                      onMouseEnter={e=>e.currentTarget.style.background=BG}
                      onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                      View dealer
                    </span>
                    <a href={d.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:MUTED,textDecoration:"none",textAlign:"center",padding:"4px 0"}}>Visit website ↗</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{fontSize:11,color:MUTED,marginTop:20,textAlign:"center"}}>Sell prices vary daily. Always confirm current buyback price directly with the dealer before selling.</p>
      </div>
    </div>
  );
}

function SellCategoryPage({ goldSpot, silverSpot, updated }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  const { metal, category } = useParams();
  const sellRows = useSellRows();

  const isGold   = metal === "gold";
  const spot     = isGold ? goldSpot : silverSpot;
  const weights  = isGold ? GOLD_SELL_WEIGHTS : SILVER_SELL_WEIGHTS;
  const [selOz, setSelOz] = useState(1.0);

  const metLabel = isGold ? "Gold" : "Silver";
  const catLabel = category === "bars" ? "Bars" : "Coins";

  useSEO({
    title:"Sell "+metLabel+" "+catLabel+" Australia | GoldSilverPrices.com.au",
    description:"Compare "+metLabel.toLowerCase()+" "+catLabel.toLowerCase()+" buyback prices from Australian bullion dealers.",
  });

  const selWeight = weights.find(w=>Math.abs(w.oz-selOz)<0.001) || weights.find(w=>w.oz===1.0) || weights[0];

  const activeDealers = SELL_DEALERS
    .filter(d => getDealerSell(sellRows,d.key,metal,selOz) !== null)
    .sort((a,b) => (getDealerSell(sellRows,b.key,metal,selOz)||0)-(getDealerSell(sellRows,a.key,metal,selOz)||0));

  const bestPrice = activeDealers.length ? getDealerSell(sellRows,activeDealers[0].key,metal,selOz) : null;

  return (
    <div style={{minHeight:"100vh",background:BG}}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{maxWidth:740,margin:"0 auto",padding:mobile?"16px 14px 60px":"28px 24px 60px"}}>

        {/* Breadcrumb */}
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:MUTED,marginBottom:20}}>
          <span onClick={()=>navigate("/sell")} style={{cursor:"pointer",color:NAVY,fontWeight:600}}>Sell</span>
          <span>›</span><span style={{textTransform:"capitalize"}}>{metLabel}</span>
          <span>›</span><span style={{textTransform:"capitalize",color:NAVY,fontWeight:600}}>{catLabel}</span>
        </div>

        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:mobile?18:24,fontWeight:700,color:NAVY,margin:"0 0 4px"}}>{"Sell "+metLabel+" "+catLabel}</h1>
          <p style={{fontSize:12,color:MUTED,margin:0}}>{"Live buyback prices · "+metLabel+" spot: "+(spot?fmtAUD(spot)+"/oz":"loading...")}</p>
        </div>

        {/* Weight pills */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {weights.map(function(w){
            const active   = Math.abs(w.oz-selOz)<0.001;
            const hasData  = sellRows.some(r=>r.metal===metal&&Math.abs((r.weight_oz||0)-w.oz)<0.01&&r.sell_price>0);
            return (
              <button key={w.oz} onClick={()=>{if(hasData)setSelOz(w.oz);}} disabled={!hasData}
                style={{padding:"7px 18px",borderRadius:20,border:"1px solid "+(active?NAVY:BORDER),background:active?NAVY:"#fff",color:active?"#fff":(hasData?SLATE:MUTED),fontSize:13,fontWeight:active?600:400,cursor:hasData?"pointer":"default",fontFamily:"inherit",opacity:hasData?1:0.4,transition:"all .15s"}}>
                {w.label}
              </button>
            );
          })}
        </div>

        {/* Best price callout */}
        {bestPrice && (
          <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"#15803D",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{"Best offer for "+selWeight.label}</div>
              <div style={{fontSize:24,fontWeight:700,color:NAVY}}>{fmtAUD(bestPrice)}</div>
            </div>
            {spot && <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:MUTED,marginBottom:2}}>vs spot</div>
              <div style={{fontSize:15,fontWeight:600,color:SLATE}}>{((bestPrice/(selOz*spot)-1)*100).toFixed(1)+"%"}</div>
            </div>}
          </div>
        )}

        {/* Dealer table */}
        <div style={{background:"#fff",borderRadius:12,border:"1px solid "+BORDER,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          {sellRows.length===0 ? (
            <div style={{padding:48,textAlign:"center",color:MUTED,fontSize:13}}>Loading prices...</div>
          ) : activeDealers.length===0 ? (
            <div style={{padding:48,textAlign:"center",color:MUTED,fontSize:13}}>No buyback data available for this weight.</div>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"left",  padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Dealer</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right", padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Buyback offer</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right", padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>vs spot</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"center",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}></th>
                </tr>
              </thead>
              <tbody>
                {activeDealers.map(function(d,i){
                  const price  = getDealerSell(sellRows,d.key,metal,selOz);
                  const isBest = i===0;
                  const pct    = (spot&&price) ? ((price/(selOz*spot)-1)*100).toFixed(1) : null;
                  return (
                    <tr key={d.key} style={{borderBottom:"1px solid #F1F5F9",background:isBest?"#FAFFFE":"#fff"}}>
                      <td style={{padding:"14px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:13,fontWeight:600,color:NAVY}}>{d.short}</span>
                          {isBest&&<span style={{fontSize:9,fontWeight:700,background:GREEN,color:"#fff",padding:"2px 7px",borderRadius:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Best</span>}
                        </div>
                      </td>
                      <td style={{padding:"14px 16px",textAlign:"right",fontSize:15,fontWeight:isBest?700:500,color:isBest?GREEN:SLATE}}>{fmtAUD(price)}</td>
                      <td style={{padding:"14px 16px",textAlign:"right",fontSize:12,color:pct&&parseFloat(pct)>=0?GREEN:MUTED}}>{pct?(parseFloat(pct)>=0?"+":"")+pct+"%":"—"}</td>
                      <td style={{padding:"14px 16px",textAlign:"center"}}>
                        <a href={d.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:NAVY,fontWeight:600,textDecoration:"none",padding:"5px 12px",border:"1px solid "+BORDER,borderRadius:6,whiteSpace:"nowrap"}}>Visit →</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{fontSize:10,color:MUTED,marginTop:10,textAlign:"right"}}>Prices updated automatically · Always confirm with dealer before selling</p>
        <div style={{marginTop:20}}>
          <span onClick={()=>navigate("/sell")} style={{fontSize:12,color:NAVY,cursor:"pointer",fontWeight:500}}>← Back to Sell</span>
        </div>
      </div>
    </div>
  );
}

`;

c = c.slice(0, si) + NEW + c.slice(ei);

// ── Update router ──
const OLD_ROUTE = `<Route path="/sell" element={<SellPage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />`;
const NEW_ROUTE = `<Route path="/sell" element={<SellHubPage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
              <Route path="/sell/:metal/:category" element={<SellCategoryPage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />`;
if (!c.includes(OLD_ROUTE)) { console.error("❌ route not found"); process.exit(1); }
c = c.replace(OLD_ROUTE, NEW_ROUTE);

fs.writeFileSync("src/App.jsx", c);
console.log("✅ Sell hub + category pages built");