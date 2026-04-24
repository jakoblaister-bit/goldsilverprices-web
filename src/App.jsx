import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cjxkhvkvhgnlnviykoad.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeGtodmt2aGdubG52aXlrb2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODIyMDYsImV4cCI6MjA5MjE1ODIwNn0.eCg-JzEshidI-l7pVsumO_SsXbDOh_s--zvH1jc78g0"
);

const fmt = n => Number(n).toLocaleString("en-AU", {
  style: "currency", currency: "AUD", minimumFractionDigits: 2,
});

const BAR_TABS = [
  { key: "1oz Gold Bar (Perth Mint)",       label: "Gold Bars 1oz" },
  { key: "1g Gold Minted Bar (Perth Mint)", label: "Minted Bars 1g" },
];

/* ─── Shared row component ───────────────────────────────────────────────── */
function PriceRow({ r, i, lowest }) {
  const isLowest = i === 0;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto",
      alignItems: "center",
      padding: "9px 16px",
      gap: 12,
      background: isLowest ? "#F0FAF4" : i % 2 === 0 ? "#fff" : "#F8F7F3",
      borderBottom: "1px solid #E6E2D8",
      borderLeft: isLowest ? "3px solid #1A7A45" : "3px solid transparent",
    }}>
      <span style={{ fontSize: 13, color: "#141410", fontWeight: isLowest ? 600 : 400 }}>
        {r.dealer}
        {isLowest && (
          <span style={{
            marginLeft: 7, fontSize: 8, fontWeight: 700,
            background: "#E8F5EE", color: "#1A7A45",
            padding: "2px 6px", borderRadius: 10, letterSpacing: "0.05em",
          }}>LOWEST</span>
        )}
      </span>
      <span style={{
        fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700,
        color: isLowest ? "#1A7A45" : "#141410",
        whiteSpace: "nowrap",
      }}>
        {fmt(r.buy_price)}
      </span>
      <a href={r.url} target="_blank" rel="noreferrer" style={{
        background: "#B8860B", color: "#fff",
        borderRadius: 5, padding: "5px 12px",
        fontSize: 11, fontWeight: 700,
        textDecoration: "none", whiteSpace: "nowrap",
      }}>
        Buy →
      </a>
    </div>
  );
}

/* ─── Coin table (used for gold + silver) ────────────────────────────────── */
function CoinTable({ title, icon, rows }) {
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      flex: "1 1 0", minWidth: 0,
    }}>
      {/* Section head */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", background: "#F2F0EA",
        borderBottom: "1px solid #E6E2D8",
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          border: "2px solid #B8860B",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14,
        }}>{icon}</div>
        <span style={{
          fontFamily: "Georgia, serif",
          fontSize: 15, fontWeight: 700, color: "#141410",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>{title}</span>
      </div>

      {/* Col header */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto auto",
        padding: "6px 16px", gap: 12,
        background: "#141410",
        fontSize: 9, fontWeight: 700, color: "#6B6650",
        textTransform: "uppercase", letterSpacing: "0.07em",
      }}>
        <span>Dealer</span>
        <span>Buy Price</span>
        <span style={{ width: 52 }} />
      </div>

      {/* Rows */}
      {rows.length === 0
        ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#928C7E", fontSize: 13 }}>Loading...</div>
        : rows.map((r, i) => <PriceRow key={r.dealer} r={r} i={i} lowest={lowest} />)
      }

      {/* Footer */}
      {rows.length > 0 && (
        <div style={{
          padding: "9px 16px", background: "#F7F6F2",
          borderTop: "1px solid #E6E2D8",
          display: "flex", justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#928C7E" }}>
            Cheapest: <strong style={{ color: "#1A7A45" }}>{fmt(lowest)}</strong>
            {highest && lowest && (
              <> · You save: <strong style={{ color: "#B8860B" }}>{fmt(highest - lowest)}</strong></>
            )}
          </span>
          <a href="#" style={{ fontSize: 11, color: "#B8860B", fontWeight: 600 }}>
            All dealers ›
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Bars table with tabs ───────────────────────────────────────────────── */
function BarsTable({ prices }) {
  const [tab, setTab] = useState(BAR_TABS[0].key);
  const rows   = prices[tab] || [];
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      {/* Section head */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", background: "#F2F0EA",
        borderBottom: "1px solid #E6E2D8",
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          border: "2px solid #B8860B",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14,
        }}>🏅</div>
        <span style={{
          fontFamily: "Georgia, serif",
          fontSize: 15, fontWeight: 700, color: "#141410",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>Bars</span>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 16px",
        background: "#F7F6F2", borderBottom: "1px solid #E6E2D8",
      }}>
        {BAR_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? "#141410" : "#fff",
            color: tab === t.key ? "#fff" : "#4A4740",
            border: `1px solid ${tab === t.key ? "#141410" : "#D4D0C4"}`,
            borderRadius: 6, padding: "5px 14px",
            fontSize: 12, fontWeight: tab === t.key ? 700 : 400,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Two column layout for bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

        {/* Left: table */}
        <div style={{ borderRight: "1px solid #E6E2D8" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto auto",
            padding: "6px 16px", gap: 12,
            background: "#141410",
            fontSize: 9, fontWeight: 700, color: "#6B6650",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            <span>Dealer</span>
            <span>Buy Price</span>
            <span style={{ width: 52 }} />
          </div>
          {rows.length === 0
            ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#928C7E", fontSize: 13 }}>Loading...</div>
            : rows.map((r, i) => <PriceRow key={r.dealer} r={r} i={i} lowest={lowest} />)
          }
        </div>

        {/* Right: summary stats */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#928C7E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Cheapest</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#1A7A45" }}>
              {rows.length > 0 ? fmt(lowest) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#928C7E", marginTop: 2 }}>{rows[0]?.dealer}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#928C7E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Most Expensive</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#B83228" }}>
              {rows.length > 0 ? fmt(highest) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#928C7E", marginTop: 2 }}>{rows[rows.length - 1]?.dealer}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#928C7E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>You Save</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 700, color: "#B8860B" }}>
              {rows.length > 0 ? fmt(highest - lowest) : "—"}
            </div>
            <div style={{ fontSize: 11, color: "#928C7E", marginTop: 2 }}>
              {tab === "1oz Gold Bar (Perth Mint)" ? "on 1oz Cast Bars" : "on 1g Minted Bars"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {rows.length > 0 && (
        <div style={{
          padding: "9px 16px", background: "#F7F6F2",
          borderTop: "1px solid #E6E2D8",
          display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 11, color: "#928C7E" }}>
            {rows.length} dealers · updated every 8 hours
          </span>
          <a href="#" style={{ fontSize: 11, color: "#B8860B", fontWeight: 600 }}>
            All bars ›
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Content tabs ───────────────────────────────────────────────────────── */


/* ─── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [prices, setPrices]   = useState({});
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Sora',system-ui,sans-serif;background:#F7F6F2;-webkit-font-smoothing:antialiased}
      a{text-decoration:none}
      button{font-family:inherit;cursor:pointer;border:none}
    `;
    document.head.appendChild(style);
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data, error } = await supabase
      .from("prices")
      .select("dealer, product, buy_price, url, status, scraped_at")
      .eq("status", "OK")
      .order("scraped_at", { ascending: false });

    if (error || !data) return;

    const seen = new Set();
    const latest = [];
    for (const row of data) {
      const k = `${row.product}||${row.dealer}`;
      if (!seen.has(k)) { seen.add(k); latest.push(row); }
    }

    const grouped = {};
    const allKeys = [
      "1oz Gold Kangaroo 2026",
      "1oz Silver Kangaroo 2026",
      "1oz Gold Bar (Perth Mint)",
      "1g Gold Minted Bar (Perth Mint)",
    ];
    for (const key of allKeys) {
      grouped[key] = latest
        .filter(r => r.product === key)
        .sort((a, b) => a.buy_price - b.buy_price);
    }

    setPrices(grouped);
    setUpdated(new Date(data[0].scraped_at).toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    }));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F2" }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div style={{
        background: "#141410", padding: "14px 32px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
          GoldSilver<span style={{ color: "#B8860B" }}>Prices</span>
          <span style={{ color: "#6B6650", fontSize: 13 }}>.com.au</span>
        </div>
        <div style={{ fontSize: 10, color: "#6B6650", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Australia's Independent Bullion Comparison
        </div>
      </div>

      {/* ── Spot bar ───────────────────────────────────────────────────── */}
      <div style={{
        background: "#1E1E18", padding: "7px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 11, color: "#C9A448", fontWeight: 600 }}>
          🥇 Gold · 🥈 Silver · Live prices from 8 Australian dealers
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "#1A3820", color: "#22C55E",
          fontSize: 9, fontWeight: 700, padding: "3px 8px",
          borderRadius: 20, letterSpacing: "0.07em",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#22C55E", display: "inline-block",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          Live
        </span>
        {updated && (
          <span style={{ fontSize: 10, color: "#6B6650" }}>⏱ {updated} AEST</span>
        )}
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Page title + tabs */}
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700,
          color: "#141410", marginBottom: 16,
        }}>
          Australia's Nr.1 Gold Comparison Portal
        </h1>



        {/* ── Two column: Gold Coins | Silver Coins ─────────────────────── */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "flex-start" }}>
          <CoinTable
            title="Gold Coins"
            icon="🪙"
            rows={prices["1oz Gold Kangaroo 2026"] || []}
            updated={updated}
          />
          <CoinTable
            title="Silver Coins"
            icon="🥈"
            rows={prices["1oz Silver Kangaroo 2026"] || []}
            updated={updated}
          />
        </div>

        {/* ── Full width: Bars ──────────────────────────────────────────── */}
        <BarsTable prices={prices} />

        <p style={{
          textAlign: "center", fontSize: 11, color: "#928C7E",
          lineHeight: 1.7, marginTop: 28,
        }}>
          ⚠️ Prices are indicative only. Always confirm with dealer before purchase.
          GoldSilverPrices.com.au is independent. Not financial advice.
        </p>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer style={{ background: "#141410", padding: "24px 32px" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#B8860B", marginBottom: 6 }}>
          GoldSilverPrices.com.au
        </div>
        <div style={{ fontSize: 10, color: "#4A4A3A", lineHeight: 1.8 }}>
          © 2026 goldsilverprices.com.au · Independent bullion comparison · Not financial advice
          <br />Prices updated twice daily · Data sourced from dealer websites
        </div>
      </footer>
    </div>
  );
}