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
  { key: "1g Gold Minted Bar (Perth Mint)", label: "Minted Bars 1g" },
  { key: "1oz Gold Bar (Perth Mint)",       label: "Gold Bars 1oz" },
];

function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

/* ─── Single price row ───────────────────────────────────────────────────── */
function PriceRow({ r, i, lowest, mobile }) {
  const isLowest = i === 0;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: mobile ? "1fr auto auto" : "1fr auto auto",
      alignItems: "center",
      minHeight: mobile ? 52 : 44,
      padding: mobile ? "10px 14px" : "9px 16px",
      gap: mobile ? 10 : 12,
      background: isLowest ? "#F0FAF4" : i % 2 === 0 ? "#fff" : "#F8F7F3",
      borderBottom: "1px solid #E6E2D8",
      borderLeft: isLowest ? "3px solid #1A7A45" : "3px solid transparent",
    }}>
      <span style={{
        fontSize: mobile ? 14 : 13,
        color: "#141410",
        fontWeight: isLowest ? 600 : 400,
        lineHeight: 1.3,
      }}>
        {r.dealer}
        {isLowest && (
          <span style={{
            marginLeft: 7, fontSize: 9, fontWeight: 700,
            background: "#E8F5EE", color: "#1A7A45",
            padding: "2px 6px", borderRadius: 10,
            letterSpacing: "0.05em", verticalAlign: "middle",
          }}>LOWEST</span>
        )}
      </span>
      <span style={{
        fontFamily: "Georgia, serif",
        fontSize: mobile ? 16 : 15,
        fontWeight: 700,
        color: isLowest ? "#1A7A45" : "#141410",
        whiteSpace: "nowrap",
      }}>
        {fmt(r.buy_price)}
      </span>
      <a href={r.url} target="_blank" rel="noreferrer" style={{
        background: "#B8860B", color: "#fff",
        borderRadius: 6,
        padding: mobile ? "9px 14px" : "5px 12px",
        fontSize: mobile ? 13 : 11,
        fontWeight: 700,
        textDecoration: "none",
        whiteSpace: "nowrap",
        minWidth: mobile ? 72 : 60,
        textAlign: "center",
        display: "inline-block",
      }}>
        Buy →
      </a>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────── */
function SectionHead({ icon, title }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", background: "#F2F0EA",
      borderBottom: "1px solid #E6E2D8",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "2px solid #B8860B",
        display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 15, flexShrink: 0,
      }}>{icon}</div>
      <span style={{
        fontFamily: "Georgia, serif",
        fontSize: 15, fontWeight: 700, color: "#141410",
        textTransform: "uppercase", letterSpacing: "0.04em",
      }}>{title}</span>
    </div>
  );
}

/* ─── Table footer ───────────────────────────────────────────────────────── */
function TableFooter({ lowest, highest }) {
  if (!lowest || !highest) return null;
  return (
    <div style={{
      padding: "9px 16px", background: "#F7F6F2",
      borderTop: "1px solid #E6E2D8",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", flexWrap: "wrap", gap: 6,
    }}>
      <span style={{ fontSize: 11, color: "#928C7E" }}>
        Cheapest: <strong style={{ color: "#1A7A45" }}>{fmt(lowest)}</strong>
        {" · "}
        You save: <strong style={{ color: "#B8860B" }}>{fmt(highest - lowest)}</strong>
      </span>
      <a href="#" style={{ fontSize: 11, color: "#B8860B", fontWeight: 600 }}>
        All dealers ›
      </a>
    </div>
  );
}

/* ─── Col header bar ─────────────────────────────────────────────────────── */
function ColHead() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto auto",
      padding: "6px 16px", gap: 12,
      background: "#141410",
      fontSize: 9, fontWeight: 700, color: "#6B6650",
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      <span>Dealer</span>
      <span>Buy Price</span>
      <span style={{ minWidth: 60 }} />
    </div>
  );
}

/* ─── Coin table ─────────────────────────────────────────────────────────── */
function CoinTable({ title, icon, rows }) {
  const mobile = useIsMobile();
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      flex: "1 1 0", minWidth: 0, width: "100%",
    }}>
      <SectionHead icon={icon} title={title} />
      <ColHead />
      {rows.length === 0
        ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#928C7E", fontSize: 13 }}>Loading...</div>
        : rows.map((r, i) => <PriceRow key={r.dealer} r={r} i={i} lowest={lowest} mobile={mobile} />)
      }
      <TableFooter lowest={lowest} highest={highest} />
    </div>
  );
}

/* ─── Bars table ─────────────────────────────────────────────────────────── */
function BarsTable({ prices }) {
  const mobile  = useIsMobile();
  const [tab, setTab] = useState(BAR_TABS[0].key);
  const rows    = prices[tab] || [];
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      <SectionHead icon="🏅" title="Bars" />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 16px",
        background: "#F7F6F2", borderBottom: "1px solid #E6E2D8",
        overflowX: "auto",
      }}>
        {BAR_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? "#141410" : "#fff",
            color: tab === t.key ? "#fff" : "#4A4740",
            border: `1px solid ${tab === t.key ? "#141410" : "#D4D0C4"}`,
            borderRadius: 6, padding: "7px 16px",
            fontSize: 12, fontWeight: tab === t.key ? 700 : 400,
            cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap", minHeight: 38,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* On mobile: table full width. On desktop: table + stats side by side */}
      <div style={{
        display: mobile ? "block" : "grid",
        gridTemplateColumns: mobile ? undefined : "1fr 1fr",
      }}>
        {/* Table */}
        <div style={{ borderRight: mobile ? "none" : "1px solid #E6E2D8" }}>
          <ColHead />
          {rows.length === 0
            ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#928C7E", fontSize: 13 }}>Loading...</div>
            : rows.map((r, i) => <PriceRow key={r.dealer} r={r} i={i} lowest={lowest} mobile={mobile} />)
          }
        </div>

        {/* Stats panel — below on mobile, beside on desktop */}
        {rows.length > 0 && (
          <div style={{
            padding: mobile ? "16px" : "28px 24px",
            display: "flex",
            flexDirection: mobile ? "row" : "column",
            gap: mobile ? 0 : 20,
            justifyContent: mobile ? "space-around" : "center",
            borderTop: mobile ? "1px solid #E6E2D8" : "none",
            background: mobile ? "#F7F6F2" : "#fff",
          }}>
            {[
              { label: "Cheapest",       val: lowest,           color: "#1A7A45", sub: rows[0]?.dealer },
              { label: "Most Expensive", val: highest,          color: "#B83228", sub: rows[rows.length-1]?.dealer },
              { label: "You Save",       val: highest - lowest, color: "#B8860B", sub: tab === BAR_TABS[0].key ? "on 1oz Cast Bars" : "on 1g Minted Bars" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: "#928C7E",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "Georgia, serif",
                  fontSize: mobile ? 18 : 26,
                  fontWeight: 700, color: s.color,
                }}>{fmt(s.val)}</div>
                <div style={{ fontSize: 10, color: "#928C7E", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TableFooter lowest={lowest} highest={highest} />
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const mobile = useIsMobile();
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

    const keys = [
      "1oz Gold Kangaroo 2026",
      "1oz Silver Kangaroo 2026",
      "1oz Gold Bar (Perth Mint)",
      "1g Gold Minted Bar (Perth Mint)",
    ];
    const grouped = {};
    for (const key of keys) {
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

      {/* Header */}
      <div style={{
        background: "#141410",
        padding: mobile ? "12px 16px" : "14px 32px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: mobile ? 18 : 22, fontWeight: 700, color: "#fff" }}>
          GoldSilver<span style={{ color: "#B8860B" }}>Prices</span>
          <span style={{ color: "#6B6650", fontSize: mobile ? 12 : 13 }}>.com.au</span>
        </div>
        {!mobile && (
          <div style={{ fontSize: 10, color: "#6B6650", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Australia's Independent Bullion Comparison
          </div>
        )}
      </div>

      {/* Spot bar */}
      <div style={{
        background: "#1E1E18",
        padding: mobile ? "7px 16px" : "7px 32px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 6,
      }}>
        <span style={{ fontSize: mobile ? 11 : 11, color: "#C9A448", fontWeight: 600 }}>
          🥇 Gold · 🥈 Silver · Live from 8 AU dealers
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

      {/* Content */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: mobile ? "20px 12px 48px" : "28px 24px 60px",
      }}>
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: mobile ? 18 : 22,
          fontWeight: 700, color: "#141410", marginBottom: 20,
        }}>
          Australia's Nr.1 Gold Comparison Portal
        </h1>

        {/* Coin tables — side by side desktop, stacked mobile */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 16, marginBottom: 16,
        }}>
          <CoinTable
            title="Gold Coins"
            icon="🪙"
            rows={prices["1oz Gold Kangaroo 2026"] || []}
          />
          <CoinTable
            title="Silver Coins"
            icon="🥈"
            rows={prices["1oz Silver Kangaroo 2026"] || []}
          />
        </div>

        {/* Bars — full width */}
        <BarsTable prices={prices} />

        <p style={{
          textAlign: "center", fontSize: 11, color: "#928C7E",
          lineHeight: 1.7, marginTop: 24,
          padding: mobile ? "0 8px" : 0,
        }}>
          ⚠️ Prices are indicative only. Always confirm with dealer before purchase.
          GoldSilverPrices.com.au is independent. Not financial advice.
        </p>
      </div>

      {/* Footer */}
      <footer style={{
        background: "#141410",
        padding: mobile ? "20px 16px" : "24px 32px",
      }}>
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