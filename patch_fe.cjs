const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

// Fix useSEO — add null checks to prevent errors before data loads
c = c.replace(
  `function useSEO({ title, description }) {
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
}`,
  `function useSEO({ title, description }) {
  useEffect(() => {
    if (!title) return;
    document.title = title;
    try {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description || '');
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', 'https://goldsilverprices.com.au' + window.location.pathname);
    } catch(e) {}
  }, [title, description]);
}`
);

// Fix ProductPage — useSEO must come after all hooks, before return
// Move it after dealers is defined
c = c.replace(
  `  const coinTypeDisplay = rows.find(r => slugify(r.coin_type || "") === coinType)?.coin_type || coinType;
  useSEO({
    title: \`\${weightDisplay} \${coinTypeDisplay} Price Australia | GoldSilverPrices.com.au\`,
    description: \`Compare \${weightDisplay} \${coinTypeDisplay} prices from \${dealers.length} Australian bullion dealers. Find the cheapest price updated twice daily.\`,
  });`,
  `  const coinTypeDisplay = rows.find(r => slugify(r.coin_type || "") === coinType)?.coin_type || coinType;`
);

// Add useSEO after dealers is defined in ProductPage
c = c.replace(
  `  const lowest  = dealers[0]?.buy_price;
  const highest = dealers[dealers.length - 1]?.buy_price;
  const saving  = highest && lowest ? highest - lowest : 0;

  const premColor = (p) =>`,
  `  const lowest  = dealers[0]?.buy_price;
  const highest = dealers[dealers.length - 1]?.buy_price;
  const saving  = highest && lowest ? highest - lowest : 0;

  useSEO({
    title: \`\${weightDisplay} \${coinTypeDisplay} Price Australia | GoldSilverPrices.com.au\`,
    description: \`Compare \${weightDisplay} \${coinTypeDisplay} prices from \${dealers.length} Australian bullion dealers. Find the cheapest price updated twice daily.\`,
  });

  const premColor = (p) =>`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('✓ Done');