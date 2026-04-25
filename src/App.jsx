import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cjxkhvkvhgnlnviykoad.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeGtodmt2aGdubG52aXlrb2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODIyMDYsImV4cCI6MjA5MjE1ODIwNn0.eCg-JzEshidI-l7pVsumO_SsXbDOh_s--zvH1jc78g0"
);

const GOLD_SPOT_APPROX  = 6640;
const SILVER_SPOT_APPROX = 108;

const BAR_TABS = [
  { key: "1g Gold Minted Bar (Perth Mint)", label: "Minted Bars 1g", spot: GOLD_SPOT_APPROX / 31.1035 },
  { key: "1oz Gold Bar (Perth Mint)",       label: "Gold Bars 1oz",  spot: GOLD_SPOT_APPROX },
];

const PRODUCTS = [
  { key: "1oz Gold Kangaroo 2026",    label: "Gold Coins",   icon: "🪙", spot: GOLD_SPOT_APPROX   },
  { key: "1oz Silver Kangaroo 2026",  label: "Silver Coins", icon: "🥈", spot: SILVER_SPOT_APPROX },
];

const fmt = n => Number(n).toLocaleString("en-AU", {
  style: "currency", currency: "AUD", minimumFractionDigits: 2,
});

const prem = (price, spot) => spot > 0
  ? `+${((price / spot - 1) * 100).toFixed(2)}%`
  : "—";

function useIsMobile() {
  const [mob, setMob] = useState(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

/* ── Skeleton row ─────────────────────────────────────────────────────────── */
const SkeletonRow = ({ i }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1fr auto auto auto",
    alignItems: "center", minHeight: 52, padding: "0 16px", gap: 12,
    background: i % 2 === 0 ? "#fff" : "#F8FAFC",
    borderBottom: "1px solid #E6E2D8",
    borderLeft: "3px solid transparent",
  }}>
    {[120, 80, 48, 56].map((w, j) => (
      <div key={j} style={{
        height: 14, width: w, borderRadius: 4,
        background: "linear-gradient(90deg,#E6E2D8 0%,#F2F0EA 50%,#E6E2D8 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease infinite",
        marginLeft: j > 0 ? "auto" : 0,
      }}/>
    ))}
  </div>
);

/* ── Price row — gold.de style ─────────────────────────────────────────── */
function PriceRow({ r, i, spot, mobile, sizeLabel }) {
  const isLowest = i === 0;
  const premium  = spot > 0 ? ((r.buy_price / spot - 1) * 100) : null;
  return (
    <a href={r.url} target="_blank" rel="noreferrer" style={{
      display: "flex", alignItems: "center",
      minHeight: 44, padding: "0 16px", gap: 8,
      background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFAFA",
      borderBottom: "1px solid #F1F5F9",
      borderLeft: isLowest ? "2px solid #16A34A" : "2px solid transparent",
      textDecoration: "none", cursor: "pointer",
      transition: "background .1s",
    }}>
      <span style={{ fontSize: 12, color: "#94A3B8", minWidth: 40, flexShrink: 0 }}>
        {sizeLabel || "1 oz"}
      </span>
      <span style={{ flex: 1, fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 500 : 400 }}>
        {r.dealer}

      </span>
      {!mobile && premium !== null && (
        <span style={{
          fontSize: 11, minWidth: 52, textAlign: "right",
          color: premium < 2 ? "#16A34A" : premium < 4 ? "#64748B" : "#DC2626",
          fontWeight: 500,
        }}>
          +{premium.toFixed(2)}%
        </span>
      )}
      <span style={{
        fontSize: mobile ? 14 : 13, fontWeight: 600,
        color: "#1B3A5C",
        whiteSpace: "nowrap",
      }}>
        <span style={{ fontSize: 9, fontWeight: 400, color: "#94A3B8", marginRight: 2 }}>from</span>{fmt(r.buy_price)}
      </span>
      <span style={{ fontSize: 14, color: "#CBD5E1", marginLeft: 2 }}>›</span>
    </a>
  );
}

/* ── Section head ─────────────────────────────────────────────────────────── */
function SHead({ icon, title, count, updated }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px", background: "#F1F5F9",
      borderBottom: "1px solid #E6E2D8", gap: 8, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid #B8860B",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 15, flexShrink: 0,
        }}>{icon}</div>
        <div>
          <span style={{
            fontFamily: "Georgia, serif",
            fontSize: 13, fontWeight: 600, color: "#334155",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{title}</span>
          {count > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 10, color: "#928C7E",
            }}>
              {count} dealers
            </span>
          )}
        </div>
      </div>
      {updated && (
        <span style={{ fontSize: 10, color: "#928C7E" }}>
          ⏱ {updated} AEST
        </span>
      )}
    </div>
  );
}

/* ── Col header ───────────────────────────────────────────────────────────── */
function ColHead({ mobile, showPrem }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: mobile
        ? "1fr auto auto"
        : showPrem ? "1fr 70px auto auto" : "1fr auto auto",
      padding: "6px 16px", gap: mobile ? 10 : 12,
      background: "#1B3A5C",
      fontSize: 9, fontWeight: 700, color: "#94A3B8",
      textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      <span>Dealer</span>
      {!mobile && showPrem && <span style={{ textAlign: "right" }}>Premium</span>}
      <span style={{ textAlign: "right" }}>Buy Price</span>
      <span style={{ minWidth: mobile ? 76 : 60 }} />
    </div>
  );
}

/* ── Table footer ─────────────────────────────────────────────────────────── */
function TFoot({ rows, spot }) {
  if (!rows || rows.length < 2) return null;
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;
  const saving  = highest - lowest;
  const premLowest = spot > 0 ? ((lowest / spot - 1) * 100).toFixed(2) : null;
  return (
    <div style={{
      padding: "10px 16px", background: "#F4F5F7",
      borderTop: "1px solid #E6E2D8",
      display: "flex", justifyContent: "space-between",
      alignItems: "center", flexWrap: "wrap", gap: 8,
    }}>
      <span style={{ fontSize: 11, color: "#928C7E" }}>
        Cheapest: <strong style={{ color: "#1A7A45" }}>{fmt(lowest)}</strong>
        {premLowest && (
          <span style={{ color: "#1A7A45" }}> (+{premLowest}% over spot)</span>
        )}
        {saving > 0 && (
          <>
            {" · "}
            you save up to <strong style={{ color: "#1B3A5C" }}>{fmt(saving)}</strong>
          </>
        )}
      </span>
      <a href="#" style={{ fontSize: 11, color: "#1B3A5C", fontWeight: 600 }}>
        All dealers ›
      </a>
    </div>
  );
}

/* ── Coin table — gold.de style ─────────────────────────────────────────── */
function CoinTable({ productKey, label, icon, rows, loading, updated, spot, sizes }) {
  const mobile   = useIsMobile();
  const [selSize, setSelSize] = useState(sizes ? sizes[0] : "1 oz");
  const PLAUSIBLE_MAX = spot * 1.2;
  const clean = rows.filter(r => r.buy_price < PLAUSIBLE_MAX);

  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: "1px solid #EEF2F7",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      flex: "1 1 320px", minWidth: 0,
    }}>
      {/* Section head */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", background: "#F8FAFC",
        borderBottom: "1px solid #EEF2F7", gap: 8, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "1.5px solid #94A3B8",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 13, flexShrink: 0,
          }}>{icon}</div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
  
          </div>
        </div>

      </div>

      {/* Size pills */}
      {sizes && (
        <div style={{
          display: "flex", gap: 5, padding: "8px 16px",
          borderBottom: "1px solid #EEF2F7", overflowX: "auto",
          background: "#fff",
        }}>
          {sizes.map(s => (
            <button key={s} onClick={() => setSelSize(s)} style={{
              background: selSize === s ? "#1B3A5C" : "#fff",
              color: selSize === s ? "#fff" : "#64748B",
              border: `1px solid ${selSize === s ? "#1B3A5C" : "#E2E8F0"}`,
              borderRadius: 5, padding: "4px 10px",
              fontSize: 11, fontWeight: selSize === s ? 600 : 400,
              cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}>{s}</button>
          ))}
        </div>
      )}

      {loading
        ? [0,1,2,3,4].map(i => <SkeletonRow key={i} i={i} />)
        : clean.length === 0
          ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No data</div>
          : clean.map((r, i) => (
              <PriceRow key={r.dealer} r={r} i={i} spot={spot} mobile={mobile} sizeLabel={selSize} />
            ))
      }
      {!loading && <TFoot rows={clean} spot={spot} />}
    </div>
  );
}

/* ── Bars table ───────────────────────────────────────────────────────────── */
function BarsTable({ prices, loading, updated }) {
  const mobile = useIsMobile();
  const [tab, setTab] = useState(BAR_TABS[0].key);
  const current = BAR_TABS.find(t => t.key === tab);
  const rows    = (prices[tab] || []).filter(r => r.buy_price < current.spot * 1.5);
  const lowest  = rows[0]?.buy_price;
  const highest = rows[rows.length - 1]?.buy_price;

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #E6E2D8",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      <SHead icon="🏅" title="Bars" />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 16px",
        background: "#F4F5F7", borderBottom: "1px solid #E6E2D8",
        overflowX: "auto",
      }}>
        {BAR_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? "#141410" : "#fff",
            color: tab === t.key ? "#fff" : "#4A4740",
            border: `1px solid ${tab === t.key ? "#141410" : "#CBD5E1"}`,
            borderRadius: 6, padding: "7px 16px",
            fontSize: 12, fontWeight: tab === t.key ? 700 : 400,
            cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap", minHeight: 38,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop: table + stats side by side. Mobile: stacked */}
      <div style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      }}>
        {/* Table */}
        <div style={{ borderRight: mobile ? "none" : "1px solid #E6E2D8" }}>
          
          {loading
            ? [0,1,2,3].map(i => <SkeletonRow key={i} i={i} />)
            : rows.length === 0
              ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#928C7E", fontSize: 13 }}>No data</div>
              : rows.map((r, i) => (
                  <PriceRow key={r.dealer} r={r} i={i} spot={current.spot} mobile={mobile} sizeLabel={tab.includes("1g") ? "1 g" : "1 oz"} />
                ))
          }
        </div>

        {/* Stats */}
        {!loading && rows.length > 1 && (
          <div style={{
            display: "flex",
            flexDirection: mobile ? "row" : "column",
            justifyContent: mobile ? "space-around" : "center",
            gap: mobile ? 0 : 24,
            padding: mobile ? "14px 12px" : "28px 24px",
            borderTop: mobile ? "1px solid #E6E2D8" : "none",
            background: mobile ? "#F7F6F2" : "#fff",
          }}>
            {[
              { label: "Cheapest",   val: lowest,           color: "#1A7A45", sub: rows[0]?.dealer },
              { label: "Most Exp.",  val: highest,          color: "#B83228", sub: rows[rows.length-1]?.dealer },
              { label: "You Save",   val: highest - lowest, color: "#1B3A5C", sub: current.label },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, color: "#928C7E",
                  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4,
                }}>{s.label}</div>
                <div style={{
                  fontFamily: "Georgia, serif",
                  fontSize: mobile ? 16 : 24,
                  fontWeight: 700, color: s.color,
                }}>{fmt(s.val)}</div>
                <div style={{ fontSize: 10, color: "#928C7E", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && <TFoot rows={rows} spot={current.spot} />}
    </div>
  );
}

/* ── Spot price pill ──────────────────────────────────────────────────────── */
function SpotPill({ label, price }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
        {label} spot
      </div>
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>
        {fmt(price)}
      </div>
      <div style={{ fontSize: 9, color: "#93C5FD" }}>/troy oz</div>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────────────── */
export default function App() {
  const mobile = useIsMobile();
  const [prices, setPrices]   = useState({});
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goldSpot, setGoldSpot]     = useState(GOLD_SPOT_APPROX);
  const [silverSpot, setSilverSpot] = useState(SILVER_SPOT_APPROX);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Inter',system-ui,sans-serif;background:#F7F6F2;-webkit-font-smoothing:antialiased}
      a{text-decoration:none}
      button{font-family:'Inter',system-ui,sans-serif;cursor:pointer;border:none}
    `;
    document.head.appendChild(style);
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const { data, error } = await supabase
      .from("prices")
      .select("dealer, product, buy_price, url, status, scraped_at")
      .eq("status", "OK")
      .order("scraped_at", { ascending: false });

    if (error || !data) { setLoading(false); return; }

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

    // Derive approximate spot from cheapest gold coin + typical 1.3% dealer premium
    const cheapestGold = grouped["1oz Gold Kangaroo 2026"]?.[0]?.buy_price;
    if (cheapestGold && cheapestGold > 5000 && cheapestGold < 15000) {
      setGoldSpot(Math.round(cheapestGold / 1.013));
    }
    const cheapestSilver = grouped["1oz Silver Kangaroo 2026"]?.[0]?.buy_price;
    if (cheapestSilver && cheapestSilver > 50 && cheapestSilver < 500) {
      setSilverSpot(Math.round(cheapestSilver / 1.04));
    }

    setPrices(grouped);
    setUpdated(new Date(data[0].scraped_at).toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    }));
    setLoading(false);
  }

  const cheapestGoldPrice = (prices["1oz Gold Kangaroo 2026"] || [])
    .filter(r => r.buy_price < goldSpot * 1.2)[0]?.buy_price;

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        background: "#1B3A5C",
        padding: mobile ? "12px 16px" : "14px 32px",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          marginBottom: 10,
        }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: mobile ? 18 : 22, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
            GoldSilver<span style={{ color: "#E2C97E" }}>Prices</span>
            <span style={{ color: "#93C5FD", fontSize: 13 }}>.com.au</span>
          </div>
          {!mobile && (
            <div style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Australia's Independent Bullion Comparison
            </div>
          )}
        </div>

        {/* Live spot prices in header */}
        <div style={{
          display: "flex",
          justifyContent: mobile ? "space-between" : "flex-start",
          gap: mobile ? 0 : 32,
          paddingTop: 8,
          borderTop: "1px solid #2A2A20",
        }}>
          <SpotPill label="Gold"   price={goldSpot}   color="#1B3A5C" />
          <SpotPill label="Silver" price={silverSpot} />
          
        </div>
      </div>

      {/* ── Hero value strip ──────────────────────────────────────────────── */}
      <div style={{
        background: "#152D47",
        padding: mobile ? "12px 16px" : "14px 32px",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 10,
      }}>
        <div>
          <div style={{
            fontFamily: "Georgia, serif",
            fontSize: mobile ? 16 : 20,
            fontWeight: 700, color: "#fff", marginBottom: 3,
          }}>
            Find Australia's cheapest gold price
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>
            8 dealers compared · Updated twice daily · 100% independent · Not a dealer
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: mobile ? "16px 12px 48px" : "24px 24px 60px",
      }}>

        {/* Coin tables */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 16, marginBottom: 16,
        }}>
          {PRODUCTS.map(p => (
            <CoinTable
              key={p.key}
              productKey={p.key}
              label={p.label}
              icon={p.icon}
              rows={prices[p.key] || []}
              loading={loading}
              updated={updated}
              spot={p.key === "1oz Gold Kangaroo 2026" ? goldSpot : silverSpot}
            />
          ))}
        </div>

        {/* Bars table */}
        <BarsTable prices={prices} loading={loading} updated={updated} />

        {/* Premium explained */}
        <div style={{
          margin: "16px 0",
          padding: "12px 16px",
          background: "#F0F4F8",
          borderRadius: 8,
          border: "1px solid #E8D8A8",
          fontSize: 11, color: "#1B3A5C", lineHeight: 1.6,
        }}>
          <strong>What is premium?</strong> The % above the raw spot price you pay to buy a physical coin or bar.
          Lower premium = better deal for investors. Green = excellent (under 2%), amber = typical (2-4%), red = high (over 4%).
        </div>

        {/* Trust strip */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: 10, marginBottom: 16,
        }}>
          {[
            { icon: "🔍", title: "Independent",     sub: "Not affiliated with any dealer" },
            { icon: "⏱",  title: "Twice Daily",     sub: "7am & 3pm Sydney time" },
            { icon: "🛡",  title: "8 Dealers",       sub: "All major AU bullion dealers" },
            { icon: "📊",  title: "Premium Shown",   sub: "See true cost above spot" },
          ].map(t => (
            <div key={t.title} style={{
              background: "#fff", borderRadius: 8,
              border: "1px solid #E6E2D8",
              padding: "12px 14px",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#141410" }}>{t.title}</div>
                <div style={{ fontSize: 10, color: "#928C7E", marginTop: 1 }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{
          textAlign: "center", fontSize: 11, color: "#928C7E",
          lineHeight: 1.7, padding: mobile ? "0 8px" : 0,
        }}>
          ⚠️ Prices are indicative only. Always confirm with the dealer before purchase.
          GoldSilverPrices.com.au is an independent comparison service. Not financial advice.
          Spot prices shown are approximate, derived from dealer prices.
        </p>
      </div>

      {/* ── Sticky mobile CTA ─────────────────────────────────────────────── */}
      {mobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(27,58,92,0.97)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(27,58,92,.4)",
          padding: "10px 16px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          display: "flex", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#93C5FD", marginBottom: 1 }}>Best gold price today</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#1B3A5C" }}>
              <span style={{color:"#FFFFFF",fontWeight:600,fontFamily:"'Inter',system-ui,sans-serif",fontSize:16}}>{cheapestGoldPrice ? fmt(cheapestGoldPrice) : "Loading..."}</span>
            </div>
          </div>
          <a href="#" style={{
            background: "#1B3A5C", color: "#fff",
            borderRadius: 8, padding: "0 20px",
            fontSize: 13, fontWeight: 700,
            textDecoration: "none",
            display: "flex", alignItems: "center",
            whiteSpace: "nowrap",
          }}>
            Compare All →
          </a>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#1B3A5C",
        padding: mobile ? "20px 16px" : "24px 32px",
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 700, color: "#1B3A5C", marginBottom: 6 }}>
          GoldSilverPrices.com.au
        </div>
        <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.8 }}>
          © 2026 goldsilverprices.com.au · Independent bullion comparison · Not financial advice
          <br />Prices updated twice daily · Data sourced directly from dealer websites
        </div>
      </footer>
    </div>
  );
}