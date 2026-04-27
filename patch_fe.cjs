// patch_fe.cjs — carousel + magazine image cards + article pages + routes
const fs = require("fs");
let c = fs.readFileSync("src/App.jsx", "utf8").replace(/\r\n/g, "\n");

// ── 1. Carousel: 10 slides → 4 real articles ─────────────────────────────────
const OLD_SLIDES = `  const slides = [
    { img: "https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800", headline: "Gold hits new AUD record as dollar weakens", sub: "Compare prices now →" },
    { img: "https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg?w=800", headline: "Why Australians are buying silver in 2026", sub: "View silver prices →" },
    { img: "https://images.pexels.com/photos/259132/pexels-photo-259132.jpeg?w=800", headline: "Perth Mint reports record bullion demand Q1 2026", sub: "Read more →" },
    { img: "https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?w=800", headline: "What is the gold premium and why it matters", sub: "Learn more →" },
    { img: "https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?w=800", headline: "How to store your gold safely in Australia", sub: "Storage guide →" },
    { img: "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?w=800", headline: "Silver premiums at historic lows — is now the time?", sub: "Compare silver →" },
    { img: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?w=800", headline: "Is gold a good investment in 2026?", sub: "Read the analysis →" },
    { img: "https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?w=800", headline: "Top 5 mistakes new gold investors make", sub: "Investor guide →" },
    { img: "https://images.pexels.com/photos/259132/pexels-photo-259132.jpeg?w=800", headline: "How the RBA rate decision affects gold prices", sub: "Market update →" },
    { img: "https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800", headline: "Buying gold online vs in store — which is better?", sub: "Compare dealers →" },
  ];`;
const NEW_SLIDES = `  const slides = [
    { img: "https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800", headline: "How to Buy Gold in Australia: A Complete 2026 Guide", sub: "Read guide →", slug: "how-to-buy-gold-australia", tag: "Guide" },
    { img: "https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg?w=800", headline: "Why Gold Coin Prices Vary Between Dealers", sub: "Read article →", slug: "why-gold-coin-prices-vary", tag: "Education" },
    { img: "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?w=800", headline: "Is Silver a Good Investment in Australia in 2026?", sub: "Read analysis →", slug: "is-silver-good-investment-australia-2026", tag: "Analysis" },
    { img: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?w=800", headline: "Best Online Gold Dealers in Australia — Compared", sub: "Read comparison →", slug: "best-online-gold-dealers-australia", tag: "Comparison" },
  ];`;

// ── 2. SlideCard: navigate to article slug ────────────────────────────────────
const OLD_SLIDE_NAV = `<div onClick={() => navigate("/magazine")} style={{ flex: 1, position: "relative"`;
const NEW_SLIDE_NAV = `<div onClick={() => navigate("/magazine/" + slide.slug)} style={{ flex: 1, position: "relative"`;

// ── 3. SlideCard: tag badge overlay at top ────────────────────────────────────
const OLD_SLIDE_CONTENT = `      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mobile ? "12px" : "14px" }}>
        <div style={{ fontSize: mobile ? 13 : 14, fontWeight: 700, color: "#fff", lineHeight: 1.35, fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 4 }}>{slide.headline}</div>
        <div style={{ fontSize: 11, color: "#E2C97E", fontWeight: 500 }}>{slide.sub}</div>
      </div>`;
const NEW_SLIDE_CONTENT = `      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 12px" }}>
        {slide.tag && <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,0.18)", color: "#fff", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{slide.tag}</span>}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mobile ? "12px" : "14px" }}>
        <div style={{ fontSize: mobile ? 13 : 14, fontWeight: 700, color: "#fff", lineHeight: 1.35, fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 4 }}>{slide.headline}</div>
        <div style={{ fontSize: 11, color: "#E2C97E", fontWeight: 500 }}>{slide.sub}</div>
      </div>`;

// ── 4. MagazinePage: add ARTICLE_IMGS lookup ──────────────────────────────────
const OLD_TAG_COLORS = `  const tagColors = `;
const NEW_TAG_COLORS = `  const ARTICLE_IMGS = {
    "how-to-buy-gold-australia": "https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800",
    "why-gold-coin-prices-vary": "https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg?w=800",
    "is-silver-good-investment-australia-2026": "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?w=800",
    "best-online-gold-dealers-australia": "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?w=800",
  };
  const tagColors = `;

// ── 5. Magazine card: emoji box → image overlay ───────────────────────────────
const OLD_CARD = `                <div style={{ background: NAVY, padding: "28px 20px", textAlign: "center", fontSize: 36 }}>{a.emoji}</div>
                <div style={{ padding: "16px 18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: tc.bg, color: tc.color, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.tag}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{a.readMin} min read</span>
                  </div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 8px", lineHeight: 1.4, fontFamily: "'Inter',system-ui,sans-serif" }}>{a.title}</h2>
                  <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.7, margin: "0 0 14px" }}>{a.excerpt}</p>
                  <span style={{ fontSize: 12, color: NAVY, fontWeight: 600 }}>Read article →</span>
                </div>`;
const NEW_CARD = `                <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                  <img src={ARTICLE_IMGS[a.slug]} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 10, left: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, background: tc.bg, color: tc.color, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.tag}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.9)" }}>{a.readMin} min read</span>
                  </div>
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 8px", lineHeight: 1.4, fontFamily: "'Inter',system-ui,sans-serif" }}>{a.title}</h2>
                  <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.7, margin: "0 0 14px" }}>{a.excerpt}</p>
                  <span style={{ fontSize: 12, color: NAVY, fontWeight: 600 }}>Read article →</span>
                </div>`;

if (!c.includes(OLD_SLIDES))        { console.error("❌ Slides not found");        process.exit(1); }
if (!c.includes(OLD_SLIDE_NAV))     { console.error("❌ Slide nav not found");      process.exit(1); }
if (!c.includes(OLD_SLIDE_CONTENT)) { console.error("❌ Slide content not found");  process.exit(1); }
if (!c.includes(OLD_TAG_COLORS))    { console.error("❌ tagColors not found");      process.exit(1); }
if (!c.includes(OLD_CARD))          { console.error("❌ Card not found");           process.exit(1); }
c = c.replace(OLD_SLIDES, NEW_SLIDES);
c = c.replace(OLD_SLIDE_NAV, NEW_SLIDE_NAV);
c = c.replace(OLD_SLIDE_CONTENT, NEW_SLIDE_CONTENT);
c = c.replace(OLD_TAG_COLORS, NEW_TAG_COLORS);
c = c.replace(OLD_CARD, NEW_CARD);
console.log("✅ Carousel + magazine cards updated");

// ── 6. ArticlePage component ──────────────────────────────────────────────────
if (c.includes("function ArticlePage")) {
  console.log("⚠️  ArticlePage already exists — skipping");
} else {
  const ARTICLE_PAGE = `
function ArticlePage({ goldSpot, silverSpot, updated }) {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const mobile    = useIsMobile();
  const ARTICLES  = {
    "how-to-buy-gold-australia": {
      title:"How to Buy Gold in Australia: A Complete 2026 Guide", tag:"Guide", readMin:8,
      img:"https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800",
      sections:[
        { h:"What is the spot price?", p:["The spot price is the real-time market price for one troy ounce of gold on international exchanges. Every dealer starts from this number and adds their premium on top.","In Australia spot prices are quoted in AUD. The live price is shown at the top of every page on this site."] },
        { h:"Why do dealers charge more than spot?", p:["Every dealer adds a premium to cover production, distribution, and profit. A 1oz Kangaroo at A$6,900 when spot is A$6,600 carries a A$300 premium — about 4.5%.","Premiums vary significantly between dealers and products. Comparing them before you buy is exactly what this site is for."] },
        { h:"Which product should you buy first?", p:["For first-time buyers, a 1oz Perth Mint Kangaroo gold coin is the most popular choice. It is globally recognised, easy to resell, and available from every major Australian dealer.","Gold bars have lower premiums than coins but are less liquid in small amounts. They suit buyers accumulating larger positions."] },
        { h:"Choosing a dealer", p:["All dealers on this site are reputable Australian businesses. The main differences are price, shipping speed, and payment methods.","A 1-2% premium difference on a 1oz coin is A$65-130 at current prices. Always compare before buying."] },
        { h:"Storage options", p:["Home storage in a quality safe suits most small buyers. Check your home insurance covers bullion.","For larger amounts, allocated vault storage is available from Ainslie Bullion, ABC Bullion, and the Perth Mint."] },
        { h:"Common mistakes to avoid", p:["Buying without comparing premiums — the single biggest way to overpay.","Buying collector or numismatic coins instead of bullion. They carry much higher premiums and are harder to sell at fair value."] },
      ]
    },
    "why-gold-coin-prices-vary": {
      title:"Why Gold Coin Prices Vary Between Dealers — The Premium Explained", tag:"Education", readMin:5,
      img:"https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg?w=800",
      sections:[
        { h:"What is a premium?", p:["Every gold coin price has two parts: the spot price of the gold content, and the premium. The premium is the amount above spot the dealer charges.","A 1oz coin at A$6,900 when spot is A$6,600 has a premium of A$300 (4.5%). Lower is better for buyers."] },
        { h:"Why premiums differ between dealers", p:["Dealers have different costs, buying power, and profit targets. A high-volume importer pays less per coin than a small retailer.","Some dealers hold inventory bought when premiums were higher, which can keep current prices elevated."] },
        { h:"Cast bars vs minted bars", p:["Cast bars are poured into moulds and carry the lowest premiums of any gold product. For pure value they are hard to beat.","Minted bars are machine-pressed with a polished finish. They cost more to produce. Unless aesthetics matter to you, cast bars are the better value buy."] },
        { h:"Why a Kangaroo is cheaper than a Britannia", p:["The Kangaroo is produced in Australia and sold in large volumes domestically. Low distribution costs and high volume keep premiums competitive.","The Britannia is imported from the UK Royal Mint. Import costs and currency exchange add to the premium. Expect to pay 1-2% more."] },
        { h:"Using this site to find the lowest premium", p:["The Gold Coins and Silver Coins registry pages show every product sorted by premium. The lowest premium is always at the top.","For most buyers the Kangaroo or Kookaburra in 1oz offers the best combination of low premium and liquidity."] },
      ]
    },
    "is-silver-good-investment-australia-2026": {
      title:"Is Silver a Good Investment in Australia in 2026?", tag:"Analysis", readMin:6,
      img:"https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?w=800",
      sections:[
        { h:"The gold/silver ratio", p:["The ratio measures how many ounces of silver it takes to buy one ounce of gold. The historical average is around 60:1. In 2026 it sits near 90:1, suggesting silver is undervalued relative to gold.","Silver bulls argue the ratio will revert to the mean, giving silver more upside than gold. This is a popular thesis but not guaranteed."] },
        { h:"The GST problem for Australian buyers", p:["Gold bullion in Australia is GST-exempt. Silver bullion is not — you pay 10% GST on purchase.","That 10% tax means silver needs to rise 10% before you break even on a sale. It changes the investment calculation significantly compared to gold."] },
        { h:"Cast bars vs coins for silver", p:["Cast silver bars carry the lowest premiums and are the best choice for investors focused on value. A 1kg cast bar typically carries a 5-10% premium over spot.","Silver coins (Kookaburra, Kangaroo) are more recognisable and easier to sell in smaller amounts, but carry higher premiums."] },
        { h:"Storage considerations", p:["Silver is much bulkier than gold for the same dollar value. A A$10,000 position in silver takes up far more physical space than the equivalent in gold.","Home storage in a heavy safe works for most buyers. For larger quantities, allocated vault storage avoids the logistical burden."] },
        { h:"The bottom line", p:["Silver can be a legitimate part of a precious metals portfolio, particularly if you believe the gold/silver ratio will normalise.","The 10% GST is a real headwind. Factor it into your return expectations before you buy."] },
      ]
    },
    "best-online-gold-dealers-australia": {
      title:"Best Online Gold Dealers in Australia — Compared", tag:"Comparison", readMin:7,
      img:"https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?w=800",
      sections:[
        { h:"Ainslie Bullion — Brisbane", p:["Founded in 1974, Ainslie is one of Australia's largest and oldest bullion dealers with one of the widest product ranges in the country.","Best for: buyers who want a huge selection and a well-established dealer with a long track record."] },
        { h:"ABC Bullion — Sydney", p:["Part of the ABC Refinery, one of only a handful of LBMA-accredited refineries in Australia. They produce their own branded bars sold at competitive prices.","Best for: buyers who want ABC-branded cast bars at wholesale-competitive prices with strong institutional backing."] },
        { h:"Perth Mint — Perth", p:["A government-owned entity and one of the world's largest precious metals operations. Their Kangaroo coin is Australia's most recognised bullion product.","Best for: buyers who want the highest quality guarantee and are comfortable paying a small premium for government backing."] },
        { h:"KJC Bullion — Melbourne", p:["Operating since 1979 with a wide range of coins and bars. Competitive pricing with a focus on the Melbourne and Victorian market.","Best for: competitive gold coin pricing on Kangaroos and Maple Leafs."] },
        { h:"Jaggards — Sydney", p:["One of Sydney's oldest dealers with strong walk-in trade and competitive online pricing across gold and silver.","Best for: Sydney buyers who want the option to transact in person as well as online."] },
        { h:"Swan Bullion — Perth", p:["A newer online-focused dealer with competitive pricing, particularly strong on silver products with a growing gold range.","Best for: silver buyers looking for competitive premiums, especially on cast bars."] },
        { h:"How to choose", p:["Use the comparison tables on this site to find the lowest price for your specific product. All dealers listed are legitimate Australian businesses.","Factor in shipping cost and insurance when comparing. A slightly higher product price from a closer dealer may be cheaper overall."] },
      ]
    },
  };

  const article = ARTICLES[slug];
  const TC = { Guide:{bg:"#EFF6FF",color:"#1D4ED8"}, Education:{bg:"#F0FDF4",color:"#16A34A"}, Analysis:{bg:"#FEF9C3",color:"#854D0E"}, Comparison:{bg:"#FDF4FF",color:"#7E22CE"} };

  useSEO({
    title: article ? article.title + " | GoldSilverPrices.com.au" : "Article Not Found",
    description: article ? article.sections[0].p[0] : "",
  });

  if (!article) return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth:700, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
        <h1 style={{ color:NAVY }}>Article not found</h1>
        <button onClick={() => navigate("/magazine")} style={{ background:NAVY, color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, cursor:"pointer", marginTop:16 }}>Back to Magazine</button>
      </div>
    </div>
  );

  const tc = TC[article.tag] || { bg:"#F1F5F9", color:"#475569" };

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth:720, margin:"0 auto", padding: mobile ? "0 0 60px" : "0 24px 60px" }}>

        <div style={{ position:"relative", height: mobile ? 200 : 280, overflow:"hidden", borderRadius: mobile ? 0 : "0 0 12px 12px" }}>
          <img src={article.img} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding: mobile ? "16px" : "20px 28px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:9, fontWeight:700, background:tc.bg, color:tc.color, padding:"2px 8px", borderRadius:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>{article.tag}</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{article.readMin} min read</span>
            </div>
            <h1 style={{ fontSize: mobile ? 18 : 24, fontWeight:700, color:"#fff", margin:0, lineHeight:1.3, fontFamily:"'Inter',system-ui,sans-serif" }}>{article.title}</h1>
          </div>
        </div>

        <div style={{ fontSize:11, color:MUTED, margin: mobile ? "12px 14px" : "16px 0", display:"flex", gap:5 }}>
          <span onClick={() => navigate("/")} style={{ cursor:"pointer", color:NAVY }}>Home</span>
          <span>{"›"}</span>
          <span onClick={() => navigate("/magazine")} style={{ cursor:"pointer", color:NAVY }}>Magazine</span>
          <span>{"›"}</span>
          <span style={{ color:SLATE }}>{article.tag}</span>
        </div>

        <div style={{ background:"#fff", borderRadius:10, border:"1px solid "+BORDER, padding: mobile ? "20px 16px" : "28px 32px", margin: mobile ? "0 14px 20px" : "0 0 24px" }}>
          {article.sections.map(function(sec, i) { return (
            <div key={i} style={{ marginBottom: i < article.sections.length - 1 ? 24 : 0 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:NAVY, margin:"0 0 10px", fontFamily:"'Inter',system-ui,sans-serif" }}>{sec.h}</h2>
              {sec.p.map(function(para, j) { return (
                <p key={j} style={{ fontSize:14, color:SLATE, lineHeight:1.85, margin: j < sec.p.length - 1 ? "0 0 10px" : 0 }}>{para}</p>
              ); })}
            </div>
          ); })}
        </div>

        <div style={{ textAlign:"center", padding: mobile ? "0 16px" : 0 }}>
          <button onClick={() => navigate("/magazine")} style={{ background:NAVY, color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            {"More articles →"}
          </button>
        </div>

      </div>
    </div>
  );
}

`;
  if (!c.includes("function AppInner(")) { console.error("❌ AppInner not found"); process.exit(1); }
  c = c.replace("function AppInner(", ARTICLE_PAGE + "function AppInner(");
  console.log("✅ ArticlePage injected");
}

// ── 7. Add /magazine/:slug route ──────────────────────────────────────────────
if (c.includes('path="/magazine/:slug"')) {
  console.log("⚠️  Article route already exists — skipping");
} else {
  const OLD_ROUTE = '<Route path="/magazine"';
  const NEW_ROUTE = '<Route path="/magazine/:slug" element={<ArticlePage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />\n              <Route path="/magazine"';
  if (!c.includes(OLD_ROUTE)) { console.error("❌ /magazine route not found"); process.exit(1); }
  c = c.replace(OLD_ROUTE, NEW_ROUTE);
  console.log("✅ Article route added");
}

fs.writeFileSync("src/App.jsx", c);
console.log("✅ All done");
console.log("   Test: http://localhost:5173/magazine");
console.log("   Test: http://localhost:5173/magazine/how-to-buy-gold-australia");