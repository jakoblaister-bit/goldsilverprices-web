import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cjxkhvkvhgnlnviykoad.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeGtodmt2aGdubG52aXlrb2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODIyMDYsImV4cCI6MjA5MjE1ODIwNn0.eCg-JzEshidI-l7pVsumO_SsXbDOh_s--zvH1jc78g0"
);

const fmt = (n) =>
  Number(n).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

export default function App() {
  const [prices, setPrices]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchPrices();
  }, []);

  async function fetchPrices() {
    setLoading(true);
    try {
      // Get latest price for each dealer
      const { data, error } = await supabase
        .from("prices")
        .select("dealer, buy_price, url, status, scraped_at")
        .eq("status", "OK")
        .order("scraped_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setError("No price data found. Run the scraper first.");
        setLoading(false);
        return;
      }

      // Keep only the most recent row per dealer
      const seen = new Set();
      const latest = [];
      for (const row of data) {
        if (!seen.has(row.dealer)) {
          seen.add(row.dealer);
          latest.push(row);
        }
      }

      // Sort cheapest first
      latest.sort((a, b) => a.buy_price - b.buy_price);

      // Set updated time from most recent record
      setUpdated(new Date(data[0].scraped_at).toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }));

      setPrices(latest);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  const lowest  = prices[0]?.buy_price;
  const highest = prices[prices.length - 1]?.buy_price;
  const spread  = lowest && highest ? (highest - lowest).toFixed(2) : null;

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          GoldSilver<span style={{ color: "#B8860B" }}>Prices</span>
          <span style={styles.logoSub}>.com.au</span>
        </div>
        <div style={styles.tagline}>Australia's Independent Bullion Comparison</div>
      </div>

      {/* Spot price bar */}
      <div style={styles.bar}>
        <span style={styles.barItem}>
          🥇 <strong>Gold Spot</strong> — live via TradingView
        </span>
        <span style={styles.liveDot}>● LIVE</span>
      </div>

      {/* Main content */}
      <div style={styles.container}>

        <h1 style={styles.h1}>1oz Gold Kangaroo 2026</h1>
        <p style={styles.sub}>
          Comparing {prices.length} Australian dealers · Sorted cheapest first
        </p>

        {/* Stats row */}
        {prices.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Cheapest</div>
              <div style={{ ...styles.statVal, color: "#1A7A45" }}>{fmt(lowest)}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>Most Expensive</div>
              <div style={{ ...styles.statVal, color: "#B83228" }}>{fmt(highest)}</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statLabel}>You Save</div>
              <div style={{ ...styles.statVal, color: "#B8860B" }}>
                ${Number(spread).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.loading}>Loading prices...</div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {/* Price table */}
        {!loading && prices.length > 0 && (
          <div style={styles.tableWrap}>

            {/* Table header */}
            <div style={styles.tableHead}>
              <span style={{ flex: "0 0 36px", textAlign: "center" }}>#</span>
              <span style={{ flex: 1 }}>Dealer</span>
              <span style={{ flex: "0 0 130px", textAlign: "right" }}>Buy Price</span>
              <span style={{ flex: "0 0 110px", textAlign: "right" }}>vs Cheapest</span>
              <span style={{ flex: "0 0 80px" }}></span>
            </div>

            {/* Rows */}
            {prices.map((p, i) => {
              const diff     = p.buy_price - lowest;
              const isLowest = i === 0;
              return (
                <div key={p.dealer}
                  style={{
                    ...styles.row,
                    background: isLowest ? "#F0FAF4" : i % 2 === 0 ? "#fff" : "#F8F7F3",
                    borderLeft: isLowest ? "4px solid #1A7A45" : "4px solid transparent",
                  }}>

                  {/* Rank */}
                  <span style={{
                    ...styles.rank,
                    color: i < 3 ? "#B8860B" : "#928C7E",
                    fontWeight: i < 3 ? 700 : 400,
                  }}>
                    {i + 1}
                  </span>

                  {/* Dealer name + badge */}
                  <span style={styles.dealer}>
                    {p.dealer}
                    {isLowest && (
                      <span style={styles.badge}>LOWEST</span>
                    )}
                  </span>

                  {/* Price */}
                  <span style={{
                    ...styles.price,
                    color: isLowest ? "#1A7A45" : "#141410",
                    fontWeight: isLowest ? 700 : 600,
                  }}>
                    {fmt(p.buy_price)}
                  </span>

                  {/* Diff */}
                  <span style={{
                    ...styles.diff,
                    color: isLowest ? "#1A7A45" : "#B83228",
                  }}>
                    {isLowest ? "✓ Best" : `+${fmt(diff)}`}
                  </span>

                  {/* CTA */}
                  <a href={p.url} target="_blank" rel="noreferrer"
                    style={styles.btn}>
                    Buy →
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Updated time */}
        {updated && (
          <div style={styles.updated}>
            ⏱ Last updated: {updated} AEST · Updates hourly
          </div>
        )}

        {/* Disclaimer */}
        <div style={styles.disclaimer}>
          ⚠️ Prices are indicative only. Always confirm with dealer before purchase.
          Not financial advice. GoldSilverPrices.com.au is an independent comparison service.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Sora', system-ui, sans-serif",
    background: "#F7F6F2",
    minHeight: "100vh",
  },
  header: {
    background: "#141410",
    padding: "18px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  logo: {
    fontFamily: "Georgia, serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#FFFFFF",
  },
  logoSub: {
    color: "#928C7E",
    fontSize: 14,
  },
  tagline: {
    fontSize: 11,
    color: "#6B6650",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  bar: {
    background: "#1E1E18",
    padding: "8px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
    color: "#928C7E",
  },
  barItem: {
    color: "#C9A448",
  },
  liveDot: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  container: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "32px 20px 60px",
  },
  h1: {
    fontFamily: "Georgia, serif",
    fontSize: 28,
    fontWeight: 700,
    color: "#141410",
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: "#928C7E",
    marginBottom: 24,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginBottom: 24,
  },
  stat: {
    background: "#fff",
    border: "1px solid #E6E2D8",
    borderRadius: 10,
    padding: "14px 16px",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#928C7E",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
  },
  statVal: {
    fontFamily: "Georgia, serif",
    fontSize: 22,
    fontWeight: 700,
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#928C7E",
    fontSize: 14,
  },
  error: {
    background: "#FDE8E8",
    color: "#B83228",
    padding: "14px 16px",
    borderRadius: 8,
    fontSize: 13,
  },
  tableWrap: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #E6E2D8",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },
  tableHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "#141410",
    color: "#6B6650",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 16px",
    borderBottom: "1px solid #E6E2D8",
    cursor: "default",
  },
  rank: {
    flex: "0 0 36px",
    textAlign: "center",
    fontFamily: "Georgia, serif",
    fontSize: 18,
  },
  dealer: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: "#141410",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    background: "#E8F5EE",
    color: "#1A7A45",
    fontSize: 9,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    letterSpacing: "0.06em",
  },
  price: {
    flex: "0 0 130px",
    textAlign: "right",
    fontFamily: "Georgia, serif",
    fontSize: 17,
  },
  diff: {
    flex: "0 0 110px",
    textAlign: "right",
    fontSize: 12,
    fontWeight: 600,
  },
  btn: {
    flex: "0 0 80px",
    background: "#B8860B",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
  updated: {
    marginTop: 14,
    fontSize: 11,
    color: "#928C7E",
    textAlign: "center",
  },
  disclaimer: {
    marginTop: 32,
    fontSize: 11,
    color: "#928C7E",
    lineHeight: 1.7,
    textAlign: "center",
    maxWidth: 600,
    margin: "32px auto 0",
  },
};