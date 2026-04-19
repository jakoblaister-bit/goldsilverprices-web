import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cjxkhvkvhgnlnviykoad.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeGtodmt2aGdubG52aXlrb2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODIyMDYsImV4cCI6MjA5MjE1ODIwNn0.eCg-JzEshidI-l7pVsumO_SsXbDOh_s--zvH1jc78g0"
);

const PRODUCTS = [
  { key: "1oz Gold Kangaroo 2026",    label: "1oz Gold Kangaroo 2026",    icon: "🪙", metal: "gold"   },
  { key: "1oz Silver Kangaroo 2026",  label: "1oz Silver Kangaroo 2026",  icon: "🥈", metal: "silver" },
  { key: "1oz Gold Bar (Perth Mint)", label: "1oz Gold Bar (Perth Mint)", icon: "🏅", metal: "gold"   },
];

const fmt = n =>
  Number(n).toLocaleString("en-AU", {
    style: "currency", currency: "AUD", minimumFractionDigits: 2,
  });

const COLS = "36px 1fr 120px 100px 70px";

function ProductTable({ product, prices, updated }) {
  const rows    = prices[product.key] || [];
  const loading = prices[product.key] === undefined;
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;
  const spread  = lowest && highest ? highest - lowest : null;

  if (loading) {
    return (
      <div style={card}>
        <SectionHead product={product} subtitle="Loading..." />
        <div style={{ padding: "32px", textAlign: "center", color: "#928C7E", fontSize: 13 }}>
          Loading prices...
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <SectionHead
        product={product}
        subtitle={rows.length > 0 ? `${rows.length} dealers · cheapest first` : "No data"}
      />

      {rows.length > 0 && (
        <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #E6E2D8" }}>
            {[
              { label: "Cheapest",       val: fmt(lowest),          color: "#1A7A45" },
              { label: "Most Expensive", val: fmt(highest),         color: "#B83228" },
              { label: "You Save",       val: spread ? fmt(spread) : "—", color: "#B8860B" },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "12px 18px", textAlign: "center",
                borderRight: i < 2 ? "1px solid #E6E2D8" : "none",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#928C7E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: s.color }}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: COLS,
            padding: "8px 18px",
            background: "#141410",
            color: "#6B6650", fontSize: 9, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span style={{ textAlign: "center" }}>#</span>
            <span>Dealer</span>
            <span style={{ textAlign: "right" }}>Buy Price</span>
            <span style={{ textAlign: "right" }}>vs Cheapest</span>
            <span />
          </div>

          {/* Rows */}
          {rows.map((r, i) => {
            const diff     = r.buy_price - lowest;
            const isLowest = i === 0;
            const bg       = isLowest ? "#F0FAF4" : i % 2 === 0 ? "#fff" : "#F8F7F3";
            return (
              <div key={r.dealer} style={{
                display: "grid", gridTemplateColumns: COLS,
                padding: "12px 18px", alignItems: "center",
                borderBottom: "1px solid #E6E2D8",
                borderLeft: isLowest ? "4px solid #1A7A45" : "4px solid transparent",
                background: bg,
              }}>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 16,
                  textAlign: "center",
                  color: i < 3 ? "#B8860B" : "#928C7E",
                  fontWeight: i < 3 ? 700 : 400,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#141410" }}>
                  {r.dealer}
                  {isLowest && (
                    <span style={{
                      display: "inline-block", background: "#E8F5EE", color: "#1A7A45",
                      fontSize: 8, fontWeight: 700, padding: "2px 6px",
                      borderRadius: 20, marginLeft: 7, letterSpacing: "0.05em",
                    }}>
                      LOWEST
                    </span>
                  )}
                </span>
                <span style={{
                  fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700,
                  textAlign: "right",
                  color: isLowest ? "#1A7A45" : "#141410",
                }}>
                  {fmt(r.buy_price)}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, textAlign: "right",
                  color: isLowest ? "#1A7A45" : "#B83228",
                }}>
                  {isLowest ? "✓ Best" : `+${fmt(diff)}`}
                </span>
                <a href={r.url} target="_blank" rel="noreferrer" style={{
                  display: "block", background: "#B8860B", color: "#fff",
                  borderRadius: 6, padding: "6px 0",
                  fontSize: 11, fontWeight: 700,
                  textAlign: "center", textDecoration: "none",
                }}>
                  Buy
                </a>
              </div>
            );
          })}

          {updated && (
            <div style={{ padding: "8px 18px", textAlign: "right", fontSize: 10, color: "#928C7E", background: "#F7F6F2", borderTop: "1px solid #E6E2D8" }}>
              Updated {updated} AEST
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SectionHead({ product, subtitle }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 18px", background: "#F2F0EA",
      borderBottom: "1px solid #E6E2D8", flexWrap: "wrap", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid #B8860B",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15,
        }}>
          {product.icon}
        </div>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: "#141410" }}>
          {product.label}
        </span>
      </div>
      <span style={{ fontSize: 11, color: "#928C7E" }}>{subtitle}</span>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #E6E2D8",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  marginBottom: 20,
};

export default function App() {
  const [prices, setPrices]   = useState({});
  const [updated, setUpdated] = useState(null);
  const [error, setError]     = useState(null);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}";
    document.head.appendChild(style);
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const { data, error } = await supabase
        .from("prices")
        .select("dealer, product, buy_price, url, status, scraped_at")
        .eq("status", "OK")
        .order("scraped_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setError("No price data found. Run the scraper first.");
        setLoaded(true);
        return;
      }

      // Keep most recent per dealer+product
      const seen = new Set();
      const latest = [];
      for (const row of data) {
        const k = `${row.product}||${row.dealer}`;
        if (!seen.has(k)) { seen.add(k); latest.push(row); }
      }

      // Group and sort
      const grouped = {};
      for (const p of PRODUCTS) {
        grouped[p.key] = latest
          .filter(r => r.product === p.key)
          .sort((a, b) => a.buy_price - b.buy_price);
      }

      setPrices(grouped);
      setUpdated(new Date(data[0].scraped_at).toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }));
      setLoaded(true);
    } catch (e) {
      setError(e.message);
      setLoaded(true);
    }
  }

  const totalPrices = Object.values(prices).reduce((s, a) => s + a.length, 0);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Sora',system-ui,sans-serif;background:#F7F6F2;-webkit-font-smoothing:antialiased}
        a{text-decoration:none}
      `}</style>

      {/* Header */}
      <div style={{ background: "#141410", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
          GoldSilver<span style={{ color: "#B8860B" }}>Prices</span>
          <span style={{ color: "#6B6650", fontSize: 13 }}>.com.au</span>
        </div>
        <div style={{ fontSize: 10, color: "#6B6650", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Australia's Independent Bullion Comparison
        </div>
      </div>

      {/* Live bar */}
      <div style={{ background: "#1E1E18", padding: "7px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#C9A448", fontWeight: 600 }}>
          🥇 Gold  ·  🥈 Silver  ·  Live prices from 8 AU dealers
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "#1A3820", color: "#22C55E",
          fontSize: 9, fontWeight: 700, padding: "3px 8px",
          borderRadius: 20, letterSpacing: "0.07em", textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s ease-in-out infinite", display: "inline-block" }} />
          Live
        </span>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px 60px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#141410", marginBottom: 4 }}>
          Australia's Nr.1 Bullion Comparison
        </h1>
        <p style={{ fontSize: 13, color: "#928C7E", marginBottom: 28 }}>
          {totalPrices > 0
            ? `${totalPrices} live prices across ${PRODUCTS.length} products from 8 Australian dealers`
            : "Loading live prices from 8 Australian dealers..."}
          {" · Independent · Not financial advice"}
        </p>

        {error && (
          <div style={{ background: "#FDE8E8", color: "#B83228", padding: "14px 18px", borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {PRODUCTS.map(p => (
          <ProductTable key={p.key} product={p} prices={prices} updated={updated} />
        ))}

        <p style={{ textAlign: "center", fontSize: 11, color: "#928C7E", lineHeight: 1.7, marginTop: 28 }}>
          ⚠️ Prices are indicative only. Always confirm with the dealer before purchase.
          GoldSilverPrices.com.au is an independent comparison service. Not financial advice.
        </p>
      </div>

      {/* Footer */}
      <footer style={{ background: "#141410", padding: "28px 24px 20px", marginTop: 0 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 700, color: "#B8860B", marginBottom: 8 }}>
          GoldSilverPrices.com.au
        </div>
        <div style={{ fontSize: 10, color: "#4A4A3A", lineHeight: 1.8 }}>
          © 2026 goldsilverprices.com.au · Independent bullion price comparison · Not a dealer · Not financial advice
          <br />Prices updated every 8 hours · Data sourced directly from dealer websites
        </div>
      </footer>
    </>
  );
}