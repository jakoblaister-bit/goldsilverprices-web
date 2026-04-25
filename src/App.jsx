import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";

const supabase = createClient(
  "https://cjxkhvkvhgnlnviykoad.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeGtodmt2aGdubG52aXlrb2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODIyMDYsImV4cCI6MjA5MjE1ODIwNn0.eCg-JzEshidI-l7pVsumO_SsXbDOh_s--zvH1jc78g0"
);

const NAVY   = "#1B3A5C";
const NAVY2  = "#152D47";
const SLATE  = "#334155";
const MUTED  = "#94A3B8";
const BORDER = "#E2E8F0";
const BG     = "#F4F5F7";
const GREEN  = "#16A34A";
const AMBER  = "#B45309";

const fmt = n => Number(n).toLocaleString("en-AU", {
  style: "currency", currency: "AUD", minimumFractionDigits: 2,
});

const prem = (price, spot) => spot > 0
  ? ((price / spot - 1) * 100)
  : null;

const GOLD_WEIGHTS   = ["1 oz", "1/2 oz", "1/4 oz", "1/10 oz", "1/20 oz"];
const SILVER_WEIGHTS = ["1 oz", "2 oz", "5 oz", "10 oz", "1 kg"];

const WEIGHT_TO_OZ = {
  "1 oz": 1, "1/2 oz": 0.5, "1/4 oz": 0.25,
  "1/10 oz": 0.1, "1/20 oz": 0.05,
  "2 oz": 2, "5 oz": 5, "10 oz": 10, "1 kg": 32.15,
};

const slugify = str => str.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "");

function useIsMobile() {
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mob;
}

/* ── Global styles ────────────────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Inter',system-ui,sans-serif;background:${BG};-webkit-font-smoothing:antialiased}
      a{text-decoration:none} button{font-family:inherit;cursor:pointer;border:none}
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}

/* ── Shared header ────────────────────────────────────────────────────────── */
function Header({ goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();
  const navigate = useNavigate();
  return (
    <div style={{ background: NAVY }}>
      <div style={{ padding: mobile ? "12px 14px" : "14px 32px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 8, marginBottom: 10,
        }}>
          <div
            onClick={() => navigate("/")}
            style={{
              fontFamily: "Georgia,serif", fontSize: mobile ? 18 : 22,
              fontWeight: 700, color: "#fff", whiteSpace: "nowrap", cursor: "pointer",
            }}
          >
            GoldSilver<span style={{ color: "#E2C97E" }}>Prices</span>
            <span style={{ color: "#93C5FD", fontSize: 13 }}>.com.au</span>
          </div>
          {!mobile && (
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Australia's Independent Bullion Comparison
            </div>
          )}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          paddingTop: 8, borderTop: "1px solid #1E3A5F",
        }}>
          {[
            { label: "Gold Spot",   price: goldSpot },
            { label: "Silver Spot", price: silverSpot },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>
                {fmt(s.price)}
              </div>
              <div style={{ fontSize: 9, color: "#93C5FD" }}>/troy oz</div>
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 3 }}>
            {updated && <span style={{ fontSize: 9, color: MUTED }}>Updated {updated}</span>}
            <span style={{ fontSize: 10, color: MUTED }}>8 AU dealers · twice daily</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pills ────────────────────────────────────────────────────────────────── */
function Pills({ options, selected, onSelect }) {
  return (
    <div style={{
      display: "flex", gap: 5, padding: "8px 14px",
      background: "#fff", borderBottom: `1px solid ${BORDER}`,
      overflowX: "auto",
    }}>
      {options.map(o => (
        <button key={o} onClick={() => onSelect(o)} style={{
          background: selected === o ? NAVY : "#fff",
          color:      selected === o ? "#fff" : SLATE,
          border:     `1px solid ${selected === o ? NAVY : BORDER}`,
          borderRadius: 5, padding: "4px 12px",
          fontSize: 12, fontWeight: selected === o ? 600 : 400,
          cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
          minHeight: 32,
        }}>{o}</button>
      ))}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */
function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10,
      border: `1px solid ${BORDER}`,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Section head ─────────────────────────────────────────────────────────── */
function SHead({ icon, title, subtitle }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", background: "#F8FAFC",
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: `1.5px solid ${MUTED}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, flexShrink: 0,
        }}>{icon}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </span>
      </div>
      {subtitle && <span style={{ fontSize: 10, color: MUTED }}>{subtitle}</span>}
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <>
      {[0,1,2].map(i => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "0 14px", minHeight: 42,
          background: i % 2 === 0 ? "#fff" : "#FAFBFC",
          borderBottom: `1px solid ${BORDER}`,
        }}>
          {[44, 120, 80].map((w, j) => (
            <div key={j} style={{
              height: 12, width: w, borderRadius: 4,
              background: "linear-gradient(90deg,#E2E8F0 0%,#F1F5F9 50%,#E2E8F0 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s ease infinite",
            }} />
          ))}
        </div>
      ))}
    </>
  );
}

/* ── Coin overview row (homepage) ─────────────────────────────────────────── */
function CoinRow({ coinType, weightLabel, cheapest, i, onClick }) {
  if (!cheapest) return null;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center",
        padding: "0 14px", minHeight: 42, gap: 8,
        background: i % 2 === 0 ? "#fff" : "#FAFBFC",
        borderBottom: `1px solid ${BORDER}`,
        cursor: "pointer", transition: "background .1s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0F4F8"}
      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFBFC"}
    >
      <span style={{ fontSize: 11, color: MUTED, minWidth: 44, flexShrink: 0 }}>{weightLabel}</span>
      <span style={{ flex: 1, fontSize: 13, color: "#1E293B" }}>{coinType}</span>
      <span style={{ fontSize: 10, color: MUTED, marginRight: 4 }}>from</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>
        {fmt(cheapest.buy_price)}
      </span>
      <span style={{ fontSize: 13, color: "#CBD5E1" }}>›</span>
    </div>
  );
}

/* ── Coins section (homepage) ─────────────────────────────────────────────── */
function CoinsSection({ metal, icon, title, weights, rows }) {
  const [weight, setWeight] = useState(weights[0]);
  const mobile = useIsMobile();
  const navigate = useNavigate();

  const targetOz = WEIGHT_TO_OZ[weight];
  const filtered = rows.filter(r =>
    r.metal === metal &&
    r.category === "coin" &&
    Math.abs((r.weight_oz || 0) - targetOz) < 0.001
  );

  const byType = {};
  for (const r of filtered) {
    if (!byType[r.coin_type]) byType[r.coin_type] = [];
    byType[r.coin_type].push(r);
  }
  for (const ct of Object.keys(byType)) {
    byType[ct].sort((a, b) => a.buy_price - b.buy_price);
  }
  const coinTypes = Object.entries(byType)
    .map(([type, dealers]) => ({ type, cheapest: dealers[0] }))
    .sort((a, b) => a.cheapest.buy_price - b.cheapest.buy_price);

  return (
    <Card>
      <SHead icon={icon} title={title}
        subtitle={coinTypes.length > 0 ? `${coinTypes.length} types` : undefined} />
      <Pills options={weights} selected={weight} onSelect={setWeight} />
      {rows.length === 0
        ? <Skeleton />
        : coinTypes.length === 0
          ? <div style={{ padding: "20px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data for {weight}</div>
          : coinTypes.map(({ type, cheapest }, i) => (
              <CoinRow
                key={type}
                coinType={type}
                weightLabel={weight}
                cheapest={cheapest}
                i={i}
                onClick={() => navigate(`/${metal}/coin/${slugify(type)}/${slugify(weight)}`)}
              />
            ))
      }
      <div style={{
        padding: "8px 14px", background: "#F8FAFC",
        borderTop: `1px solid ${BORDER}`,
        fontSize: 11, color: NAVY, fontWeight: 500, textAlign: "right",
        cursor: "pointer",
      }}>
        All {title.toLowerCase()} ›
      </div>
    </Card>
  );
}

/* ── Bar row (homepage) ───────────────────────────────────────────────────── */
function BarRow({ sizeLabel, cheapest, i, onClick }) {
  if (!cheapest) return null;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center",
        padding: "0 14px", minHeight: 42, gap: 8,
        background: i % 2 === 0 ? "#fff" : "#FAFBFC",
        borderBottom: `1px solid ${BORDER}`,
        cursor: "pointer", transition: "background .1s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0F4F8"}
      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#FAFBFC"}
    >
      <span style={{ fontSize: 11, color: MUTED, minWidth: 44, flexShrink: 0 }}>{sizeLabel}</span>
      <span style={{ flex: 1, fontSize: 13, color: "#1E293B" }}>Gold Bars</span>
      <span style={{ fontSize: 10, color: MUTED, marginRight: 4 }}>from</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>
        {fmt(cheapest.buy_price)}
      </span>
      <span style={{ fontSize: 13, color: "#CBD5E1" }}>›</span>
    </div>
  );
}

/* ── Bars section (homepage) ──────────────────────────────────────────────── */
function BarsSection({ rows }) {
  const [tab, setTab] = useState("Gold Bars");
  const navigate = useNavigate();

  const activeRows = rows.filter(r =>
    tab === "Gold Bars"   ? (r.metal === "gold"   && r.bar_type === "cast") :
    tab === "Silver Bars" ? (r.metal === "silver"  && r.category === "bar") :
                             (r.metal === "gold"   && r.bar_type === "minted")
  );

  const bySize = {};
  for (const r of activeRows) {
    const key = r.weight_g ? `${r.weight_g}g` : `${r.weight_oz}oz`;
    if (!bySize[key]) bySize[key] = [];
    bySize[key].push(r);
  }
  for (const k of Object.keys(bySize)) bySize[k].sort((a, b) => a.buy_price - b.buy_price);

  const sizeOrder = ["1g","5g","10g","20g","25g","0.5oz","1oz","50g","100g","250g","1000g"];
  const sizes = Object.keys(bySize).sort((a, b) => {
    const ai = sizeOrder.indexOf(a), bi = sizeOrder.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <Card>
      <SHead icon="🏅" title="Bars" />
      <Pills
        options={["Gold Bars", "Silver Bars", "Minted Bars"]}
        selected={tab} onSelect={setTab}
      />
      {rows.length === 0
        ? <Skeleton />
        : sizes.length === 0
          ? <div style={{ padding: "20px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data yet</div>
          : sizes.map((size, i) => (
              <BarRow
                key={size} sizeLabel={size}
                cheapest={bySize[size][0]} i={i}
                onClick={() => navigate(`/bars/${slugify(tab)}/${size}`)}
              />
            ))
      }
      <div style={{
        padding: "8px 14px", background: "#F8FAFC",
        borderTop: `1px solid ${BORDER}`,
        fontSize: 11, color: NAVY, fontWeight: 500, textAlign: "right",
      }}>
        All bars ›
      </div>
    </Card>
  );
}

/* ── Trust strip ──────────────────────────────────────────────────────────── */
function TrustStrip() {
  const mobile = useIsMobile();
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)",
      gap: 8, marginTop: 14,
    }}>
      {[
        { icon: "🔍", title: "Independent",   sub: "Not affiliated with any dealer" },
        { icon: "⏱",  title: "Twice Daily",   sub: "7am & 3pm Sydney time" },
        { icon: "🛡",  title: "8 Dealers",     sub: "All major AU bullion dealers" },
        { icon: "📊",  title: "Premium Shown", sub: "True cost above spot price" },
      ].map(t => (
        <div key={t.title} style={{
          background: "#fff", borderRadius: 8,
          border: `1px solid ${BORDER}`, padding: "10px 12px",
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#141410" }}>{t.title}</div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{t.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
function Footer() {
  const mobile = useIsMobile();
  return (
    <footer style={{ background: NAVY, padding: mobile ? "20px 14px" : "20px 32px" }}>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 13, fontWeight: 700, color: "#E2C97E", marginBottom: 6 }}>
        GoldSilverPrices.com.au
      </div>
      <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.8 }}>
        © 2026 goldsilverprices.com.au · Independent bullion comparison · Not financial advice
        <br />Prices updated twice daily · Data sourced from dealer websites
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* PRODUCT PAGE — /gold/coin/kangaroo/1-oz                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
function ProductPage({ rows, goldSpot, silverSpot, updated }) {
  const { metal, coinType, weight } = useParams();
  const navigate = useNavigate();
  const mobile = useIsMobile();

  // Convert slug back to display names
  const coinTypeDisplay = rows
    .find(r => slugify(r.coin_type || "") === coinType)?.coin_type || coinType;

  const weightDisplay = Object.keys(WEIGHT_TO_OZ)
    .find(w => slugify(w) === weight) || weight;

  const targetOz = WEIGHT_TO_OZ[weightDisplay] || 1;
  const spot = metal === "gold" ? goldSpot : silverSpot;

  const dealers = rows
    .filter(r =>
      r.metal === metal &&
      r.category === "coin" &&
      slugify(r.coin_type || "") === coinType &&
      Math.abs((r.weight_oz || 0) - targetOz) < 0.001
    )
    .sort((a, b) => a.buy_price - b.buy_price);

  const lowest  = dealers[0]?.buy_price;
  const highest = dealers[dealers.length - 1]?.buy_price;

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: mobile ? "14px 12px 48px" : "24px 24px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 16, display: "flex", gap: 6, alignItems: "center" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>
            {metal === "gold" ? "Gold Coins" : "Silver Coins"}
          </span>
          <span>›</span>
          <span style={{ color: SLATE }}>{coinTypeDisplay}</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "Georgia,serif", fontSize: mobile ? 20 : 26,
          fontWeight: 700, color: NAVY, marginBottom: 4,
        }}>
          {weightDisplay} {coinTypeDisplay}
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>
          Compare {dealers.length} Australian dealers · Prices updated twice daily
        </p>

        {/* Summary bar */}
        {dealers.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 10, marginBottom: 20,
          }}>
            {[
              { label: "Cheapest",     val: lowest,           color: GREEN,  sub: dealers[0]?.dealer },
              { label: "Most Exp.",    val: highest,          color: "#DC2626", sub: dealers[dealers.length-1]?.dealer },
              { label: "You Save",     val: highest - lowest, color: AMBER,  sub: "by choosing wisely" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", borderRadius: 8,
                border: `1px solid ${BORDER}`, padding: "12px 14px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: mobile ? 18 : 22, fontWeight: 700, color: s.color }}>
                  {fmt(s.val)}
                </div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dealer table */}
        <Card>
          <SHead
            icon={metal === "gold" ? "🪙" : "🥈"}
            title={`${coinTypeDisplay} · ${weightDisplay}`}
            subtitle={`${dealers.length} dealers`}
          />
          {/* Col header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
            padding: "6px 14px", gap: 12,
            background: NAVY,
            fontSize: 9, fontWeight: 700, color: "#64748B",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span>Dealer</span>
            {!mobile && <span style={{ textAlign: "right" }}>Premium</span>}
            <span style={{ textAlign: "right" }}>Buy Price</span>
            <span />
          </div>

          {dealers.length === 0
            ? <div style={{ padding: "24px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data yet</div>
            : dealers.map((r, i) => {
                const p = prem(r.buy_price, spot);
                const isLowest = i === 0;
                return (
                  <a key={r.dealer} href={r.url} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    padding: "0 14px", minHeight: mobile ? 52 : 46, gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: isLowest ? `3px solid ${GREEN}` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 500 : 400 }}>
                      {r.dealer}
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                    </span>
                    {!mobile && (
                      <span style={{
                        fontSize: 12, fontWeight: 500, textAlign: "right",
                        color: p === null ? MUTED : p < 2 ? GREEN : p < 4 ? AMBER : "#DC2626",
                      }}>
                        {p !== null ? `+${p.toFixed(2)}%` : "—"}
                      </span>
                    )}
                    <span style={{
                      fontSize: mobile ? 15 : 14, fontWeight: 600,
                      color: isLowest ? GREEN : NAVY,
                      whiteSpace: "nowrap", textAlign: "right",
                    }}>
                      {fmt(r.buy_price)}
                    </span>
                    <span style={{
                      background: isLowest ? GREEN : NAVY,
                      color: "#fff", borderRadius: 5,
                      padding: mobile ? "8px 12px" : "5px 12px",
                      fontSize: 11, fontWeight: 600,
                      whiteSpace: "nowrap", textAlign: "center",
                    }}>
                      Buy →
                    </span>
                  </a>
                );
              })
          }

          {/* Footer */}
          {dealers.length > 0 && lowest && (
            <div style={{
              padding: "8px 14px", background: "#F8FAFC",
              borderTop: `1px solid ${BORDER}`,
              fontSize: 11, color: MUTED,
              display: "flex", justifyContent: "space-between",
            }}>
              <span>
                Cheapest: <strong style={{ color: GREEN }}>{fmt(lowest)}</strong>
                {spot > 0 && (
                  <> · Premium: <strong style={{ color: AMBER }}>+{prem(lowest, spot)?.toFixed(2)}%</strong></>
                )}
              </span>
              <span>Updated twice daily</span>
            </div>
          )}
        </Card>

        {/* Premium explained */}
        <div style={{
          margin: "14px 0", padding: "10px 14px",
          background: "#EFF6FF", borderRadius: 8,
          border: "1px solid #BFDBFE",
          fontSize: 11, color: "#1E40AF", lineHeight: 1.6,
        }}>
          <strong>Premium %</strong> — the markup above spot price.
          Green = excellent (under 2%) · Amber = typical (2–4%) · Red = high (over 4%).
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: MUTED, lineHeight: 1.7 }}>
          ⚠️ Prices indicative only. Always confirm with dealer before purchase. Not financial advice.
        </p>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* HOMEPAGE                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
function HomePage({ rows, goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />

      {/* Hero strip */}
      <div style={{
        background: NAVY2, padding: mobile ? "10px 14px" : "10px 32px",
        borderBottom: "1px solid #1E3A5F",
      }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: mobile ? 15 : 18, fontWeight: 700, color: "#fff" }}>
          Find Australia's cheapest gold price
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
          Compare {rows.length} prices · Gold coins, silver coins & bars · Independent · Not financial advice
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: mobile ? "14px 10px 48px" : "20px 24px 60px",
      }}>

        {/* Coins side by side on desktop */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 14, marginBottom: 14,
        }}>
          <CoinsSection
            metal="gold" icon="🪙" title="Gold Coins"
            weights={GOLD_WEIGHTS} rows={rows}
          />
          <CoinsSection
            metal="silver" icon="🥈" title="Silver Coins"
            weights={SILVER_WEIGHTS} rows={rows}
          />
        </div>

        {/* Bars full width */}
        <BarsSection rows={rows} />

        <TrustStrip />

        <p style={{
          textAlign: "center", fontSize: 11, color: MUTED,
          lineHeight: 1.7, marginTop: 20,
          padding: mobile ? "0 8px" : 0,
        }}>
          ⚠️ Prices indicative only. Always confirm with dealer before purchase.
          GoldSilverPrices.com.au is independent. Not financial advice.
        </p>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ROOT APP                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
function AppInner() {
  const [rows, setRows]             = useState([]);
  const [updated, setUpdated]       = useState(null);
  const [goldSpot, setGoldSpot]     = useState(6640);
  const [silverSpot, setSilverSpot] = useState(108);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("prices_v2")
      .select("*")
      .eq("status", "OK")
      .order("scraped_at", { ascending: false });

    if (error || !data) return;

    const seen = new Set();
    const latest = [];
    for (const r of data) {
      const key = `${r.dealer}||${r.coin_type || r.bar_brand}||${r.weight_oz || r.weight_g}||${r.metal}`;
      if (!seen.has(key)) { seen.add(key); latest.push(r); }
    }

    setRows(latest);

    const kangaroos = latest
      .filter(r => r.coin_type === "Kangaroo" && r.metal === "gold" && r.weight_oz === 1)
      .sort((a, b) => a.buy_price - b.buy_price);
    if (kangaroos.length > 0) setGoldSpot(Math.round(kangaroos[0].buy_price / 1.013));

    const silver = latest
      .filter(r => r.coin_type === "Kangaroo" && r.metal === "silver" && r.weight_oz === 1)
      .sort((a, b) => a.buy_price - b.buy_price);
    if (silver.length > 0) setSilverSpot(Math.round(silver[0].buy_price / 1.04));

    setUpdated(new Date(data[0].scraped_at).toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }));
  }

  const sharedProps = { rows, goldSpot, silverSpot, updated };

  return (
    <Routes>
      <Route path="/" element={<HomePage {...sharedProps} />} />
      <Route path="/:metal/coin/:coinType/:weight" element={<ProductPage {...sharedProps} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <AppInner />
    </BrowserRouter>
  );
}