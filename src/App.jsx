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



/* ── Nav bar ──────────────────────────────────────────────────────────────── */
function NavBar() {
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const path = window.location.pathname;

  const links = [
    { label: "Buy",      path: "/",         desc: "Compare prices" },
    { label: "Sell",     path: "/sell",      desc: "Sell your bullion" },
    { label: "Dealers",  path: "/dealers",   desc: "All 8 dealers" },
    { label: "Magazine", path: "/magazine",  desc: "Gold & silver news" },
  ];

  const isActive = (p) => p === "/" ? path === "/" : path.startsWith(p);

  return (
    <div style={{
      background: "#0F2A44",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      borderBottom: "1px solid rgba(0,0,0,0.2)",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        padding: mobile ? "0 4px" : "0 24px",
      }}>
        {links.map(l => (
          <button
            key={l.label}
            onClick={() => navigate(l.path)}
            style={{
              background: "none",
              border: "none",
              borderBottom: isActive(l.path)
                ? "2px solid #E2C97E"
                : "2px solid transparent",
              color: isActive(l.path) ? "#fff" : "#94A3B8",
              fontSize: mobile ? 12 : 13,
              fontWeight: isActive(l.path) ? 600 : 400,
              padding: mobile ? "0 14px" : "0 28px",
              height: mobile ? 38 : 44,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.01em",
              transition: "color .15s, border-color .15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (!isActive(l.path)) {
                e.currentTarget.style.color = "#E2E8F0";
                e.currentTarget.style.borderBottomColor = "rgba(226,201,126,0.3)";
              }
            }}
            onMouseLeave={e => {
              if (!isActive(l.path)) {
                e.currentTarget.style.color = "#94A3B8";
                e.currentTarget.style.borderBottomColor = "transparent";
              }
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}





const COIN_INFO = {
  "Kangaroo":      { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1986" },
  "Kookaburra":    { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1990" },
  "Koala":         { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1987" },
  "Lunar":         { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "1996" },
  "Emu":           { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "2018" },
  "Swan":          { country: "Australia", mint: "Perth Mint",    fineness: "999.9/1000", since: "2017" },
  "Maple Leaf":    { country: "Canada",    mint: "Royal Canadian", fineness: "999.9/1000", since: "1979" },
  "Krugerrand":    { country: "S. Africa", mint: "SA Mint",       fineness: "916.7/1000", since: "1967" },
  "Britannia":     { country: "UK",        mint: "Royal Mint",    fineness: "999.9/1000", since: "2013" },
  "Philharmonic":  { country: "Austria",   mint: "Austrian Mint", fineness: "999.9/1000", since: "1989" },
  "American Eagle":{ country: "USA",       mint: "US Mint",       fineness: "916.7/1000", since: "1986" },
  "Buffalo":       { country: "USA",       mint: "US Mint",       fineness: "999.9/1000", since: "2006" },
};




/* ── Top spot bar ─────────────────────────────────────────────────────────── */
function TopBar({ goldSpot, silverSpot, goldChange, silverChange }) {
  const mobile = useIsMobile();
  return (
    <div style={{
      background: "#F8F9FA",
      borderBottom: "1px solid #E2E8F0",
      padding: mobile ? "6px 14px" : "6px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* Gold + Silver */}
      <div style={{
        display: "flex",
        width: mobile ? "100%" : "auto",
        justifyContent: mobile ? "space-between" : "flex-start",
        gap: mobile ? 0 : 40,
      }}>
        {[
          { label: "Gold",   price: goldSpot,   change: goldChange,   color: "#B8860B" },
          { label: "Silver", price: silverSpot, change: silverChange, color: "#64748B" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: s.color,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontFamily: "'Inter',system-ui,sans-serif" }}>
              {s.price ? fmt(s.price) : "—"}
            </span>
            {s.change !== null && s.change !== undefined && (
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: s.change >= 0 ? "#16A34A" : "#DC2626",
              }}>
                {s.change >= 0 ? "▲" : "▼"} {Math.abs(s.change).toFixed(2)}%
              </span>
            )}
            <span style={{
              fontSize: 9, color: "#94A3B8",
              borderLeft: "1px solid #E2E8F0", paddingLeft: 8,
            }}>
              /troy oz
            </span>
          </div>
        ))}
      </div>

      {/* Source badge */}
    </div>
  );
}

/* ── Shared header ────────────────────────────────────────────────────────── */
function Header({ goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();
  const navigate = useNavigate();
  return (
    <div>
      <TopBar goldSpot={goldSpot} silverSpot={silverSpot} goldChange={null} silverChange={null} />
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
              fontFamily: "'Inter',system-ui,sans-serif", fontSize: mobile ? 18 : 22,
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
          display: "flex", justifyContent: "flex-start", gap: 40,
          paddingTop: 8, borderTop: "1px solid #1E3A5F",
        }}>
  

        </div>
      </div>
      <NavBar />
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
      <span style={{ flex: 1, fontSize: 13, color: "#1E293B", textAlign: "left", paddingLeft: 8 }}>{coinType}</span>
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
                onClick={() => navigate(`/${metal}/coin/${slugify(type)}`)}
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
function BarRow({ sizeLabel, cheapest, brand, i, onClick }) {
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
      <span style={{ flex: 1, fontSize: 13, color: "#1E293B", textAlign: "left", paddingLeft: 8 }}>{brand || "Bullion Bar"}</span>
      <span style={{ fontSize: 10, color: MUTED, marginRight: 4 }}>from</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: "nowrap" }}>
        {fmt(cheapest.buy_price)}
      </span>
      <span style={{ fontSize: 13, color: "#CBD5E1" }}>›</span>
    </div>
  );
}

/* ── Bars section (homepage) ─────────────────────────────────────────────── */
function BarsSection({ rows }) {
  const [tab, setTab] = useState("Gold Cast");
  const navigate      = useNavigate();

  const TABS = ["Gold Cast", "Gold Minted", "Silver Cast", "Silver Minted"];
  const metal   = tab.startsWith("Gold") ? "gold" : "silver";
  const barType = tab.endsWith("Cast") ? "cast" : "minted";

  const filtered = rows.filter(r =>
    r.category === "bar" &&
    r.metal === metal &&
    r.bar_type === barType &&
    r.buy_price > 100
  );

  // Group by size — one row per size, cheapest dealer
  const grouped = {};
  for (const r of filtered) {
    const size  = r.weight_oz ? `${r.weight_oz}oz` : `${r.weight_g}g`;
    const oz    = r.weight_oz || (r.weight_g / 31.1);
    const key   = size;
    if (!grouped[key]) grouped[key] = { size, oz, cheapest: r, count: 0 };
    if (r.buy_price < grouped[key].cheapest.buy_price) grouped[key].cheapest = r;
    grouped[key].count++;
  }

  const sortedGroups = Object.values(grouped).sort((a, b) => a.oz - b.oz);

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, boxShadow: "0 1px 3px rgba(0,0,0,.04)", overflow: "hidden", flex: 1 }}>

      {/* Header */}
      <div style={{ padding: "10px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🏅</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>Bars</span>
        </div>
        <span style={{ fontSize: 10, color: MUTED }}>{sortedGroups.length} sizes</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, padding: "0 8px 8px", overflowX: "auto", borderBottom: `1px solid ${BORDER}` }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? NAVY : "#fff",
            color: tab === t ? "#fff" : SLATE,
            border: `1px solid ${tab === t ? NAVY : BORDER}`,
            borderRadius: 5, padding: "3px 7px",
            fontSize: 10, fontWeight: tab === t ? 600 : 400,
            cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
          }}>{t}</button>
        ))}
      </div>

      {/* Rows — one per weight size like gold.de */}
      {sortedGroups.length === 0
        ? <div style={{ padding: "20px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data yet</div>
        : sortedGroups.map((g, i) => (
            <div key={g.size}
              onClick={() => navigate(`/bars/${metal}/${barType}/${g.size}`)}
              style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "0 10px", gap: 6, background: i % 2 === 0 ? "#fff" : "#FAFBFC", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}>
              
              {/* Size label */}
              <span style={{ fontSize: 12, color: MUTED, width: 44, flexShrink: 0 }}>{g.size}</span>
              
              {/* Bar type label */}
              <span style={{ flex: 1, fontSize: 13, color: "#1E293B", textAlign: "left" }}>
                {barType === "cast" ? "Cast Bar" : "Minted Bar"}
              </span>

              {/* From price */}
              <span style={{ fontSize: 11, color: MUTED, marginRight: 4 }}>from</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, whiteSpace: "nowrap", fontFamily: "'Inter',system-ui,sans-serif" }}>
                {fmt(g.cheapest.buy_price)}
              </span>
              <span style={{ fontSize: 12, color: MUTED }}>›</span>
            </div>
          ))
      }

      {/* All bars link */}
      <div style={{ padding: "8px 14px", textAlign: "right", borderTop: `1px solid ${BORDER}`, background: "#F8FAFC" }}>
        <span style={{ fontSize: 11, color: NAVY, cursor: "pointer", fontWeight: 500 }}>All {tab.toLowerCase()} ›</span>
      </div>
    </div>
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
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, fontWeight: 700, color: "#E2C97E", marginBottom: 6 }}>
        GoldSilverPrices.com.au
      </div>
      <div style={{ fontSize: 10, color: "#64748B", lineHeight: 1.8 }}>
        © 2026 goldsilverprices.com.au · Independent bullion comparison · Not financial advice
        <br />Prices updated twice daily · Data sourced from dealer websites
      </div>
    </footer>
  );
}


/* ── SEO helper ───────────────────────────────────────────────────────────── */
function useSEO({ title, description }) {
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
    } catch(e) {}
  }, [title, description]);
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* PRODUCT PAGE — /gold/coin/kangaroo                                         */
/* ══════════════════════════════════════════════════════════════════════════ */
function ProductPage({ rows, goldSpot, silverSpot, updated }) {
  const { metal, coinType } = useParams();
  const navigate = useNavigate();
  const mobile   = useIsMobile();

  const coinTypeDisplay = rows.find(r => slugify(r.coin_type || "") === coinType)?.coin_type || coinType;
  const spot = metal === "gold" ? goldSpot : silverSpot;
  const weights = metal === "gold" ? GOLD_WEIGHTS : SILVER_WEIGHTS;

  // Default to 1oz
  const [selWeight, setSelWeight] = useState("1 oz");

  const targetOz = WEIGHT_TO_OZ[selWeight] || 1;

  const dealers = rows
    .filter(r =>
      r.metal === metal &&
      r.category === "coin" &&
      slugify(r.coin_type || "") === coinType &&
      Math.abs((r.weight_oz || 0) - targetOz) < 0.001
    )
    .sort((a, b) => a.buy_price - b.buy_price);

  // Find all available weights for this coin
  const availableWeights = weights.filter(w => {
    const oz = WEIGHT_TO_OZ[w];
    return rows.some(r =>
      r.metal === metal &&
      r.category === "coin" &&
      slugify(r.coin_type || "") === coinType &&
      Math.abs((r.weight_oz || 0) - oz) < 0.001
    );
  });

  const lowest  = dealers[0]?.buy_price;
  const highest = dealers[dealers.length - 1]?.buy_price;
  const saving  = highest && lowest ? highest - lowest : 0;

  useSEO({
    title: `${coinTypeDisplay} Gold Coin Price Australia | GoldSilverPrices.com.au`,
    description: `Compare ${coinTypeDisplay} prices from Australian bullion dealers. Find the cheapest price updated twice daily.`,
  });

  const premColor = (p) =>
    p === null ? MUTED : p < 2 ? GREEN : p < 4 ? AMBER : "#DC2626";

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: mobile ? "14px 12px 48px" : "24px 24px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14, display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>
            {metal === "gold" ? "Gold Coins" : "Silver Coins"}
          </span>
          <span>›</span>
          <span style={{ color: SLATE }}>{coinTypeDisplay}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: "'Inter',system-ui,sans-serif" }}>
          {coinTypeDisplay} {metal === "gold" ? "Gold" : "Silver"} Coin
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>
          Compare prices from Australian dealers · Updated twice daily · Not financial advice
        </p>

        {/* Coin info — NO weight here */}
        {COIN_INFO[coinTypeDisplay] && (
          <div style={{
            background: "#fff", borderRadius: 10,
            border: `1px solid ${BORDER}`,
            padding: "14px 16px", marginBottom: 16,
            display: "flex", gap: 20, flexWrap: "wrap",
          }}>
            {[
              { label: "Country",  val: COIN_INFO[coinTypeDisplay].country },
              { label: "Mint",     val: COIN_INFO[coinTypeDisplay].mint },
              { label: "Fineness", val: COIN_INFO[coinTypeDisplay].fineness },
              { label: "Since",    val: COIN_INFO[coinTypeDisplay].since },
              { label: "Metal",    val: metal === "gold" ? "Gold" : "Silver" },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{item.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Summary cards */}
        {dealers.length > 1 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 10, marginBottom: 16,
          }}>
            {[
              { label: "Cheapest",  val: lowest,  color: GREEN,      sub: dealers[0]?.dealer },
              { label: "Most Exp.", val: highest, color: "#DC2626",  sub: dealers[dealers.length-1]?.dealer },
              { label: "You Save",  val: saving,  color: AMBER,      sub: "by choosing wisely" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", borderRadius: 8,
                border: `1px solid ${BORDER}`,
                padding: "12px 14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: mobile ? 17 : 21, fontWeight: 700, color: s.color, fontFamily: "'Inter',system-ui,sans-serif" }}>{fmt(s.val)}</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dealer table with weight pills in header */}
        <Card>
          <SHead
            icon={metal === "gold" ? "🪙" : "🥈"}
            title={coinTypeDisplay}
            subtitle={`${dealers.length} dealers`}
          />

          {/* Weight pills inside card header area */}
          <div style={{
            display: "flex", gap: 5, padding: "8px 14px",
            background: "#fff", borderBottom: `1px solid ${BORDER}`,
            overflowX: "auto",
          }}>
            {availableWeights.length > 0
              ? availableWeights.map(w => (
                  <button key={w} onClick={() => setSelWeight(w)} style={{
                    background: selWeight === w ? NAVY : "#fff",
                    color: selWeight === w ? "#fff" : SLATE,
                    border: `1px solid ${selWeight === w ? NAVY : BORDER}`,
                    borderRadius: 5, padding: "4px 12px",
                    fontSize: 12, fontWeight: selWeight === w ? 600 : 400,
                    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                    minHeight: 32,
                  }}>{w}</button>
                ))
              : weights.map(w => (
                  <button key={w} onClick={() => setSelWeight(w)} style={{
                    background: selWeight === w ? NAVY : "#fff",
                    color: selWeight === w ? "#fff" : SLATE,
                    border: `1px solid ${selWeight === w ? NAVY : BORDER}`,
                    borderRadius: 5, padding: "4px 12px",
                    fontSize: 12, fontWeight: selWeight === w ? 600 : 400,
                    cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                    minHeight: 32,
                  }}>{w}</button>
                ))
            }
          </div>

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
            ? <div style={{ padding: "24px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data for {selWeight}</div>
            : dealers.map((r, i) => {
                const p = spot > 0 ? ((r.buy_price / spot - 1) * 100) : null;
                const isLowest = i === 0;
                return (
                  <a key={r.dealer} href={r.url} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    minHeight: mobile ? 54 : 48,
                    padding: "0 14px", gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: isLowest ? `3px solid ${GREEN}` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 600 : 400 }}>
                        {r.dealer}
                      </span>
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                    </div>
                    {!mobile && (
                      <span style={{ fontSize: 12, fontWeight: 500, textAlign: "right", color: premColor(p) }}>
                        {p !== null ? `+${p.toFixed(2)}%` : "—"}
                      </span>
                    )}
                    <span style={{
                      fontSize: mobile ? 15 : 14, fontWeight: 600,
                      color: isLowest ? GREEN : NAVY,
                      whiteSpace: "nowrap", textAlign: "right",
                      fontFamily: "'Inter',system-ui,sans-serif",
                    }}>
                      {fmt(r.buy_price)}
                    </span>
                    <div style={{
                      background: isLowest ? GREEN : NAVY,
                      color: "#fff", borderRadius: 5,
                      padding: mobile ? "9px 14px" : "6px 14px",
                      fontSize: 11, fontWeight: 600,
                      whiteSpace: "nowrap", textAlign: "center",
                      minWidth: 58,
                    }}>
                      Buy →
                    </div>
                  </a>
                );
              })
          }

          {/* Footer */}
          {lowest && (
            <div style={{
              padding: "9px 14px", background: "#F8FAFC",
              borderTop: `1px solid ${BORDER}`,
              fontSize: 11, color: MUTED,
              display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6,
            }}>
              <span>
                Cheapest: <strong style={{ color: GREEN }}>{fmt(lowest)}</strong>
                {spot > 0 && lowest && (
                  <> · Premium: <strong style={{ color: premColor(((lowest/spot)-1)*100) }}>+{(((lowest/spot)-1)*100).toFixed(2)}%</strong></>
                )}
              </span>
              <span>Updated twice daily</span>
            </div>
          )}
        </Card>

        {/* Premium explainer */}
        <div style={{
          margin: "14px 0", padding: "10px 14px",
          background: "#EFF6FF", borderRadius: 8,
          border: "1px solid #BFDBFE",
          fontSize: 11, color: "#1E40AF", lineHeight: 1.6,
        }}>
          <strong>Premium %</strong> — the markup above the raw spot price.
          Green (under 2%) = excellent · Amber (2–4%) = typical · Red (over 4%) = high.
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
/* BAR PRODUCT PAGE — /bars/gold-bars/1oz                                    */
/* ══════════════════════════════════════════════════════════════════════════ */
function BarProductPage({ rows, goldSpot, silverSpot, updated }) {
  const { metal, barType, size } = useParams();
  const navigate = useNavigate();
  const mobile   = useIsMobile();


  const spot    = metal === "gold" ? goldSpot : silverSpot;

  // Parse size — e.g. "1oz" → weight_oz=1, "1g" → weight_g=1
  const isGram    = size.endsWith("g");
  const sizeNum   = parseFloat(size);
  const tabLabel  = (barType === "cast" ? "Cast" : "Minted") + " " + (metal === "gold" ? "Gold" : "Silver") + " Bars";

  const dealers = rows
    .filter(r => {
      if (r.metal !== metal || r.category !== "bar") return false;
      if (r.bar_type !== barType) return false;
      if (isGram) return Math.abs((r.weight_g || 0) - sizeNum) < 0.01;
      return Math.abs((r.weight_oz || 0) - sizeNum) < 0.001;
    })
    .sort((a, b) => a.buy_price - b.buy_price);

  const lowest  = dealers[0]?.buy_price;
  const highest = dealers[dealers.length - 1]?.buy_price;
  const saving  = highest && lowest ? highest - lowest : 0;

  const spotForSize = isGram
    ? spot * (sizeNum / 31.1035)
    : spot * sizeNum;

  const premColor = (p) =>
    p === null ? MUTED : p < 2 ? GREEN : p < 4 ? AMBER : "#DC2626";

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: mobile ? "14px 12px 48px" : "24px 24px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14, display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>Bars</span>
          <span>›</span>
          <span style={{ color: SLATE }}>{tabLabel} · {size}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4, fontFamily: "'Inter',system-ui,sans-serif" }}>
          {size} {tabLabel}
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>
          {dealers.length} dealers compared · Prices updated twice daily · Not financial advice
        </p>

        {/* Summary cards */}
        {dealers.length > 1 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3,1fr)",
            gap: 10, marginBottom: 20,
          }}>
            {[
              { label: "Cheapest",  val: lowest,  color: GREEN,     sub: dealers[0]?.dealer },
              { label: "Most Exp.", val: highest, color: "#DC2626", sub: dealers[dealers.length-1]?.dealer },
              { label: "You Save",  val: saving,  color: AMBER,     sub: "by choosing wisely" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", borderRadius: 8,
                border: `1px solid ${BORDER}`,
                padding: "12px 14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: mobile ? 17 : 21, fontWeight: 700, color: s.color, fontFamily: "'Inter',system-ui,sans-serif" }}>
                  {fmt(s.val)}
                </div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Dealer table */}
        <Card>
          <SHead icon="🏅" title={`${size} ${tabLabel}`} subtitle={`${dealers.length} dealers`} />

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
            ? <div style={{ padding: "24px 14px", textAlign: "center", color: MUTED, fontSize: 13 }}>No data yet for this size</div>
            : dealers.map((r, i) => {
                const p = spotForSize > 0 ? ((r.buy_price / spotForSize - 1) * 100) : null;
                const isLowest = i === 0;
                return (
                  <a key={r.dealer} href={r.url} target="_blank" rel="noreferrer" style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "1fr auto auto" : "1fr 80px auto auto",
                    alignItems: "center",
                    minHeight: mobile ? 54 : 48,
                    padding: "0 14px", gap: 12,
                    background: isLowest ? "#F0FDF4" : i % 2 === 0 ? "#fff" : "#FAFBFC",
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: isLowest ? `3px solid ${GREEN}` : "3px solid transparent",
                    textDecoration: "none",
                  }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#1E293B", fontWeight: isLowest ? 600 : 400 }}>
                        {r.dealer}
                      </span>
                      {isLowest && (
                        <span style={{
                          marginLeft: 7, fontSize: 9, fontWeight: 600,
                          background: "#DCFCE7", color: "#166534",
                          padding: "1px 6px", borderRadius: 10, verticalAlign: "middle",
                        }}>lowest</span>
                      )}
                    </div>
                    {!mobile && (
                      <span style={{ fontSize: 12, fontWeight: 500, textAlign: "right", color: premColor(p) }}>
                        {p !== null ? `+${p.toFixed(2)}%` : "—"}
                      </span>
                    )}
                    <span style={{
                      fontSize: mobile ? 15 : 14, fontWeight: 600,
                      color: isLowest ? GREEN : NAVY,
                      whiteSpace: "nowrap", textAlign: "right",
                      fontFamily: "'Inter',system-ui,sans-serif",
                    }}>
                      {fmt(r.buy_price)}
                    </span>
                    <div style={{
                      background: isLowest ? GREEN : NAVY,
                      color: "#fff", borderRadius: 5,
                      padding: mobile ? "9px 14px" : "6px 14px",
                      fontSize: 11, fontWeight: 600,
                      whiteSpace: "nowrap", textAlign: "center",
                      minWidth: 58,
                    }}>
                      Buy →
                    </div>
                  </a>
                );
              })
          }

          {/* Footer */}
          {lowest && (
            <div style={{
              padding: "9px 14px", background: "#F8FAFC",
              borderTop: `1px solid ${BORDER}`,
              fontSize: 11, color: MUTED,
              display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6,
            }}>
              <span>
                Cheapest: <strong style={{ color: GREEN }}>{fmt(lowest)}</strong>
                {spotForSize > 0 && lowest && (
                  <> · Premium: <strong style={{ color: premColor(((lowest/spotForSize)-1)*100) }}>+{(((lowest/spotForSize)-1)*100).toFixed(2)}%</strong></>
                )}
              </span>
              <span>Updated twice daily</span>
            </div>
          )}
        </Card>

        {/* Premium explainer */}
        <div style={{
          margin: "14px 0", padding: "10px 14px",
          background: "#EFF6FF", borderRadius: 8,
          border: "1px solid #BFDBFE",
          fontSize: 11, color: "#1E40AF", lineHeight: 1.6,
        }}>
          <strong>Premium %</strong> — the markup above the raw spot price.
          Green (under 2%) = excellent · Amber (2–4%) = typical · Red (over 4%) = high.
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
/* SELL PAGE                                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */
function SellPage({ goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();
  const navigate = useNavigate();
  useSEO({
    title: "Sell Gold & Silver Australia | GoldSilverPrices.com.au",
    description: "Compare buyback prices from 8 Australian bullion dealers.",
  });
  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mobile ? "40px 16px" : "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontSize: mobile ? 22 : 30, fontWeight: 700, color: NAVY, marginBottom: 12, fontFamily: "'Inter',system-ui,sans-serif" }}>Sell Your Bullion</h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 24 }}>Compare buyback prices from all 8 Australian dealers. Coming soon.</p>
        <button onClick={() => navigate("/")} style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Back to Compare →
        </button>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* MAGAZINE PAGE                                                              */
/* ══════════════════════════════════════════════════════════════════════════ */
function MagazinePage({ goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();
  const navigate = useNavigate();
  useSEO({
    title: "Gold & Silver Magazine Australia | GoldSilverPrices.com.au",
    description: "Gold and silver market news and investment guides for Australian investors.",
  });
  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mobile ? "40px 16px" : "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📰</div>
        <h1 style={{ fontSize: mobile ? 22 : 30, fontWeight: 700, color: NAVY, marginBottom: 12, fontFamily: "'Inter',system-ui,sans-serif" }}>Gold & Silver Magazine</h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: 24 }}>Market analysis, investment guides and the latest news. Coming soon.</p>
        <button onClick={() => navigate("/")} style={{ background: NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Back to Compare →
        </button>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* DEALERS PAGE — placeholder                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */
function DealersPage({ rows, goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();
  const navigate = useNavigate();

  const dealers = [
    { name: "Perth Mint",      url: "https://www.perthmint.com",                    flag: "🇦🇺" },
    { name: "ABC Bullion",     url: "https://www.abcbullion.com.au",                flag: "🇦🇺" },
    { name: "Ainslie Bullion", url: "https://ainsliebullion.com.au",               flag: "🇦🇺" },
    { name: "KJC Bullion",     url: "https://www.kjc-gold-silver-bullion.com.au",  flag: "🇦🇺" },
    { name: "Swan Bullion",    url: "https://swanbullion.com",                      flag: "🇦🇺" },
    { name: "Gold Stackers",   url: "https://www.goldstackers.com.au",              flag: "🇦🇺" },
    { name: "Jaggards",        url: "https://www.jaggards.com.au",                 flag: "🇦🇺" },
    { name: "Guardian Gold",   url: "https://guardian-gold.com.au",                flag: "🇦🇺" },
  ];

  // Count products per dealer from data
  const dealerCounts = {};
  for (const r of rows) {
    dealerCounts[r.dealer] = (dealerCounts[r.dealer] || 0) + 1;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: mobile ? "16px 12px 48px" : "24px 32px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 16, display: "flex", gap: 6 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: NAVY }}>Home</span>
          <span>›</span>
          <span style={{ color: SLATE }}>Dealers</span>
        </div>

        <h1 style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
          Australian Bullion Dealers
        </h1>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>
          {dealers.length} dealers compared · Prices updated twice daily
        </p>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {dealers.map(d => (
            <div key={d.name} style={{
              background: "#fff", borderRadius: 10,
              border: `1px solid ${BORDER}`,
              padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8,
                background: "#F1F5F9",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>{d.flag}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 2 }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>
                  {dealerCounts[d.name] || 0} products tracked · Australian dealer
                </div>
              </div>
              <a href={d.url} target="_blank" rel="noreferrer" style={{
                fontSize: 11, color: NAVY, fontWeight: 500,
                border: `1px solid ${BORDER}`,
                borderRadius: 6, padding: "5px 12px",
                whiteSpace: "nowrap",
              }}>
                Visit →
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: MUTED, lineHeight: 1.7, marginTop: 20 }}>
          ⚠️ GoldSilverPrices.com.au is independent and not affiliated with any dealer.
        </p>
      </div>
      <Footer />
    </div>
  );
}



/* ── Magazine Carousel ────────────────────────────────────────────────────── */
function MagazineCarousel() {
  const mobile = useIsMobile();
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const slides = [
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
  ];

  const perPage = mobile ? 1 : 2;
  const total   = Math.ceil(slides.length / perPage);

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % total), 6000);
    return () => clearInterval(t);
  }, [mobile, total]);

  const prev = () => setActive(a => (a - 1 + total) % total);
  const next = () => setActive(a => (a + 1) % total);
  const visible = slides.slice(active * perPage, active * perPage + perPage);

  const SlideCard = ({ slide }) => (
    <div onClick={() => navigate("/magazine")} style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: mobile ? 6 : 8, cursor: "pointer", minWidth: 0 }}>
      <img src={slide.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: mobile ? "12px" : "14px" }}>
        <div style={{ fontSize: mobile ? 13 : 14, fontWeight: 700, color: "#fff", lineHeight: 1.35, fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 4 }}>{slide.headline}</div>
        <div style={{ fontSize: 11, color: "#E2C97E", fontWeight: 500 }}>{slide.sub}</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "transparent", padding: mobile ? "10px 10px 0" : "12px 24px 0" }}>
      <div style={{ display: "flex", height: mobile ? 180 : 200, gap: mobile ? 0 : 10, overflow: "hidden" }}>
        {visible.map((slide, i) => <SlideCard key={active * perPage + i} slide={slide} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0 0" }}>
        <button onClick={prev} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer", padding: "8px 12px", minHeight: 40, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>‹</button>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} onClick={() => setActive(i)} style={{ width: i === active ? 20 : 8, height: 8, borderRadius: i === active ? 4 : "50%", background: i === active ? "#1B3A5C" : "#CBD5E1", cursor: "pointer", transition: "all .25s ease", minWidth: 8 }} />
          ))}
        </div>
        <button onClick={next} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer", padding: "8px 12px", minHeight: 40, minWidth: 40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>›</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* HOMEPAGE                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
function HomePage({ rows, goldSpot, silverSpot, updated }) {
  const mobile = useIsMobile();

  useSEO({
    title: "Compare Gold & Silver Prices Australia | GoldSilverPrices.com.au",
    description: "Compare live gold and silver bullion prices from 8 Australian dealers. Find the cheapest gold coins, silver coins and gold bars. Updated twice daily.",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, overflowX: "hidden" }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <MagazineCarousel />

      {/* Content */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: mobile ? "10px 6px 48px" : "20px 24px 60px",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}>

        {/* 3 tables side by side on desktop */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 14, marginBottom: 14,
          alignItems: "flex-start",
          width: "100%",
          overflow: "hidden",
        }}>
          <div style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}>
            <CoinsSection
              metal="gold" icon="🪙" title="Gold Coins"
              weights={GOLD_WEIGHTS} rows={rows}
            />
          </div>
          <div style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}>
            <CoinsSection
              metal="silver" icon="🥈" title="Silver Coins"
              weights={SILVER_WEIGHTS} rows={rows}
            />
          </div>
          {!mobile && (
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <BarsSection rows={rows} />
            </div>
          )}
        </div>

        {mobile && <div style={{ marginBottom: 14 }}><BarsSection rows={rows} /></div>}

        {/* TradingView Chart */}
        <div style={{
          background: "#fff", borderRadius: 10,
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,.04)",
          marginBottom: 14,
        }}>
          <div style={{
            padding: "10px 14px", background: "#F8FAFC",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Gold Price AUD — Live Chart
            </span>
            <span style={{ fontSize: 10, color: MUTED }}>Powered by TradingView</span>
          </div>
          <iframe
            src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUAUD&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&style=1&theme=light&timezone=Australia%2FSydney&withdateranges=1&locale=en"
            style={{ width: "100%", height: mobile ? 250 : 350, border: "none", display: "block" }}
            allowtransparency="true"
            scrolling="no"
          />
        </div>

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
  const [goldSpot, setGoldSpot]         = useState(null);
  const [silverSpot, setSilverSpot]     = useState(null);
  const [goldChange, setGoldChange]     = useState(null);
  const [silverChange, setSilverChange] = useState(null);

  useEffect(() => {
    fetchSpot();
    fetchData();
  }, []);

  

  async function fetchSpot() {
    // Check 1-minute cache first
    try {
      const cached = sessionStorage.getItem('spot_cache');
      if (cached) {
        const { gold, silver, ts } = JSON.parse(cached);
        if (Date.now() - ts < 60000) {
          if (gold)   setGoldSpot(gold);
          if (silver) setSilverSpot(silver);
          return;
        }
      }
    } catch {}

    try {
      const [goldRes, silverRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU/AUD"),
        fetch("https://api.gold-api.com/price/XAG/AUD"),
      ]);
      const gold   = await goldRes.json();
      const silver = await silverRes.json();

      const goldPrice   = gold?.price   && gold.price   > 5000 ? Math.round(gold.price)                  : null;
      const silverPrice = silver?.price && silver.price > 80   ? Math.round(silver.price * 100) / 100    : null;

      if (goldPrice)   setGoldSpot(goldPrice);
      if (silverPrice) setSilverSpot(silverPrice);

      // Cache for 1 minute
      if (goldPrice && silverPrice) {
        sessionStorage.setItem('spot_cache', JSON.stringify({
          gold: goldPrice, silver: silverPrice, ts: Date.now()
        }));
      }
    } catch(e) {
      console.log("Spot fetch failed:", e.message);
    }
  }

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


    setUpdated(new Date(data[0].scraped_at).toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }));
  }

  const sharedProps = { rows, goldSpot, silverSpot, updated };

  return (
    <Routes>
      <Route path="/" element={<HomePage {...sharedProps} />} />
      <Route path="/:metal/coin/:coinType" element={<ProductPage {...sharedProps} />} />
      <Route path="/gold" element={<HomePage {...sharedProps} defaultMetal="gold" />} />
      <Route path="/silver" element={<HomePage {...sharedProps} defaultMetal="silver" />} />
      <Route path="/bars" element={<HomePage {...sharedProps} defaultSection="bars" />} />
      <Route path="/dealers" element={<DealersPage {...sharedProps} />} />
      <Route path="/bars/:metal/:barType/:size" element={<BarProductPage {...sharedProps} />} />
      <Route path="/sell" element={<SellPage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
      <Route path="/magazine" element={<MagazinePage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
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