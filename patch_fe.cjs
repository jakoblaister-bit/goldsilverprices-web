const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Add useEffect for SEO in each page component
// 1. Add SEO helper function before AppInner
const seoHelper = `
/* ── SEO helper ───────────────────────────────────────────────────────────── */
function useSEO({ title, description }) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://goldsilverprices.com.au' + window.location.pathname;
  }, [title, description]);
}

`;

c = c.replace(
  '/* ══════════════════════════════════════════════════════════════════════════ */\n/* ROOT APP',
  seoHelper + '/* ══════════════════════════════════════════════════════════════════════════ */\n/* ROOT APP'
);

// 2. Add SEO to HomePage
c = c.replace(
  `  const mobile   = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: BG }}>

      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />`,
  `  const mobile   = useIsMobile();
  useSEO({
    title: "Compare Gold & Silver Prices Australia | GoldSilverPrices.com.au",
    description: "Compare live gold and silver bullion prices from 8 Australian dealers. Find the cheapest gold coins, silver coins and gold bars. Updated twice daily.",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG }}>

      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />`
);

// 3. Add SEO to ProductPage
c = c.replace(
  `  const coinTypeDisplay = rows.find(r => slugify(r.coin_type || "") === coinType)?.coin_type || coinType;`,
  `  const coinTypeDisplay = rows.find(r => slugify(r.coin_type || "") === coinType)?.coin_type || coinType;
  useSEO({
    title: \`\${weightDisplay} \${coinTypeDisplay} Price Australia | GoldSilverPrices.com.au\`,
    description: \`Compare \${weightDisplay} \${coinTypeDisplay} prices from \${dealers.length} Australian bullion dealers. Find the cheapest price updated twice daily.\`,
  });`
);

// 4. Add SEO to DealersPage
c = c.replace(
  `  const navigate = useNavigate();

  const dealers = [`,
  `  const navigate = useNavigate();
  useSEO({
    title: "Australian Bullion Dealers | GoldSilverPrices.com.au",
    description: "Compare Australia's top 8 bullion dealers. View all gold and silver products, prices and reviews from Perth Mint, ABC Bullion, Ainslie, KJC and more.",
  });

  const dealers = [`
);

// 5. Add SEO to SellPage
c = c.replace(
  `  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mobile ? "40px 16px" : "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mobile ? 22 : 30`,
  `  const navigate = useNavigate();
  useSEO({
    title: "Sell Gold & Silver Australia | GoldSilverPrices.com.au",
    description: "Compare buyback prices from 8 Australian bullion dealers. Get the best price when selling your gold coins, silver coins and bars.",
  });
  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mobile ? "40px 16px" : "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mobile ? 22 : 30`
);

// 6. Add SEO to MagazinePage
c = c.replace(
  `  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mobile ? "40px 16px" : "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📰</div>`,
  `  useSEO({
    title: "Gold & Silver Magazine Australia | GoldSilverPrices.com.au",
    description: "Gold and silver market news, investment guides and analysis for Australian bullion investors.",
  });
  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mobile ? "40px 16px" : "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📰</div>`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ SEO added to all pages');