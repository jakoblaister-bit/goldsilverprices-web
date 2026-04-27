// patch_fe.cjs
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

const OLD = `        let qUrl = SUPA_URL + "/rest/v1/prices_v2?metal=eq." + metal + "&category=eq." + category +
          "&select=coin_type,bar_brand,bar_type,weight_oz,weight_g,buy_price,dealer&order=buy_price.asc";
        if (category === "coin") qUrl += "&weight_oz=eq.1";
        const res  = await fetch(qUrl, { headers:{ apikey:SUPA_KEY, Authorization:"Bearer " + SUPA_KEY } });
        const data = await res.json();`;

const NEW = `        let q = supabase.from("prices_v2").select("coin_type,bar_brand,bar_type,weight_oz,weight_g,buy_price,dealer").eq("metal", metal).eq("category", category).order("buy_price", { ascending:true });
        if (category === "coin") q = q.eq("weight_oz", 1);
        const { data, error } = await q;
        if (error) throw error;`;

if (!c.includes(OLD)) { console.error("❌ OLD not found"); process.exit(1); }
c = c.replace(OLD, NEW);
fs.writeFileSync("src/App.jsx", c);
console.log("✅ Fixed — using supabase client");