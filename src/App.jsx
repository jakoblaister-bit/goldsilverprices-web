import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";

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
// Price sanity check — returns false if price is clearly wrong vs spot
function isPriceSane(price, weightOz, metal, goldSpot, silverSpot) {
  if (!price || !weightOz) return false;
  const spot = metal === "gold" ? goldSpot : silverSpot;
  if (!spot) return true; // can't validate without spot — show it
  const pricePerOz = price / weightOz;
  if (pricePerOz < spot * 0.5) return false; // more than 50% below spot
  if (pricePerOz > spot * 3.0) return false; // more than 3x spot
  return true;
}

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
  const [serviceOpen, setServiceOpen] = useState(false);
  const SERVICE_ITEMS = [
    { label:"Calculator", path:"/calculator", icon:"🧮" },
  ];
  const links = [
    { label: "Buy",      path: "/",         desc: "Compare prices" },
    { label: "Sell",     path: "/sell",      desc: "Sell your bullion" },
    { label: "Dealers",  path: "/dealers",   desc: "All 8 dealers" },
    { label: "Magazine", path: "/magazine",  desc: "Gold & silver news" },
  ];
  const isActive = (p) => p === "/" ? path === "/" : path.startsWith(p);
  return (
    <div style={{ background:"#0F2A44", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(0,0,0,0.2)" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"center", padding: mobile ? "0 4px" : "0 24px" }}>
        {links.map(l => (
          <button key={l.label} onClick={() => navigate(l.path)}
            style={{ background:"none", border:"none", borderBottom: isActive(l.path) ? "2px solid #E2C97E" : "2px solid transparent", color: isActive(l.path) ? "#fff" : "#94A3B8", fontSize: mobile ? 12 : 13, fontWeight: isActive(l.path) ? 600 : 400, padding: mobile ? "0 14px" : "0 28px", height: mobile ? 38 : 44, cursor:"pointer", fontFamily:"inherit" }}>
            {l.label}
          </button>
        ))}
        <div style={{ position:"relative" }}>
          <button onClick={()=>setServiceOpen(function(o){return !o;})}
            style={{ background:"none", border:"none", borderBottom: path.startsWith("/calculator") ? "2px solid #E2C97E" : "2px solid transparent", color: path.startsWith("/calculator") ? "#fff" : "#94A3B8", fontSize: mobile ? 12 : 13, fontWeight:400, padding: mobile ? "0 14px" : "0 28px", height: mobile ? 38 : 44, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
            Service
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3.5l3 3 3-3"/></svg>
          </button>
          {serviceOpen && (
            <div style={{ position:"absolute", top:"100%", right:0, background:"#fff", borderRadius:8, border:"1px solid #E2E8F0", boxShadow:"0 4px 16px rgba(0,0,0,0.12)", zIndex:100, minWidth:160, overflow:"hidden" }}
              onMouseLeave={()=>setServiceOpen(false)}>
              {SERVICE_ITEMS.map(function(item){ return (
                <div key={item.path} onClick={function(){ navigate(item.path); setServiceOpen(false); }}
                  style={{ padding:"10px 16px", fontSize:13, color:NAVY, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}
                  onMouseEnter={function(e){e.currentTarget.style.background=BG;}}
                  onMouseLeave={function(e){e.currentTarget.style.background="#fff";}}>
                  <span>{item.icon}</span>{item.label}
                </div>
              ); })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div style={{ padding: mobile ? "0 14px" : "0 32px", height: mobile ? 56 : 64, display:"flex", alignItems:"center" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 8, width:"100%",
        }}>
          <div
            onClick={() => navigate("/")}
            style={{
              fontFamily: "'Inter',system-ui,sans-serif", fontSize: mobile ? 18 : 22,
              fontWeight: 700, color: "#fff", whiteSpace: "nowrap", cursor: "pointer",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE280"/>
                    <stop offset="100%" stopColor="#9A6C10"/>
                  </linearGradient>
                  <linearGradient id="sBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D0DDE8"/>
                    <stop offset="100%" stopColor="#5A7A94"/>
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="36" height="11" rx="3" fill="url(#gBar)"/>
                <rect x="1.5" y="1.5" width="2" height="8" rx="1" fill="rgba(255,255,255,0.35)"/>
                <rect x="0" y="15" width="36" height="11" rx="3" fill="url(#sBar)"/>
                <rect x="1.5" y="16.5" width="2" height="9" rx="1" fill="rgba(255,255,255,0.2)"/>
              </svg>
              <div style={{ lineHeight:1 }}>
                <div style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.02em" }}>
                  <span style={{ color:"#C9A84C" }}>Gold</span>
                  <span style={{ color:"#A8BDD0" }}>Silver</span>
                  <span style={{ color:"#fff" }}>Prices</span>
                </div>
                <div style={{ fontSize:7, letterSpacing:"3px", color:"#3A5A7A", marginTop:2 }}>COM.AU</div>
              </div>
            </div>
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
function CoinRow({ coinType, weightLabel, cheapest, i, onClick, goldSpot, silverSpot, metal }) {
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
function CoinsSection({ metal, icon, title, weights, rows, goldSpot, silverSpot }) {
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
                metal={metal}
                goldSpot={goldSpot}
                silverSpot={silverSpot}
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
        <span onClick={() => navigate("/" + metal + "/coins")} style={{ cursor:"pointer" }}>All {title.toLowerCase()} ›</span>
      </div>
    </Card>
  );
}

/* ── Bar row (homepage) ───────────────────────────────────────────────────── */
function BarRow({ sizeLabel, cheapest, brand, i, onClick, goldSpot, silverSpot, metal }) {
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
function BarsSection({ rows, goldSpot, silverSpot }) {
  const [tab, setTab] = useState("Gold Cast");
  const navigate      = useNavigate();

  const TABS = ["Gold Cast", "Gold Minted", "Silver Cast", "Silver Minted"];
  const metal   = tab.startsWith("Gold") ? "gold" : "silver";
  const barType = tab.endsWith("Cast") ? "cast" : "minted";

  const filtered = rows.filter(r =>
    r.category === "bar" &&
    r.metal === metal &&
    r.bar_type === barType &&
    r.buy_price > 0
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
        <span onClick={() => navigate("/" + metal + "/bars")} style={{ fontSize: 11, color: NAVY, cursor: "pointer", fontWeight: 500 }}>All {tab.toLowerCase()} ›</span>
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
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  const COMPARE  = [["Gold Coins","/gold/coins"],["Silver Coins","/silver/coins"],["Gold Bars","/gold/bars"],["Silver Bars","/silver/bars"],["Dealers","/dealers"]];
  const LEGAL    = [["About","/about"],["Privacy Policy","/privacy"],["Contact","/contact"],["Disclaimer","/disclaimer"]];
  const link = (l) => (
    <div key={l[0]} onClick={()=>navigate(l[1])} style={{ fontSize:12, color:"#94A3B8", marginBottom:7, cursor:"pointer" }}
      onMouseEnter={function(e){e.currentTarget.style.color="#E2C97E";}}
      onMouseLeave={function(e){e.currentTarget.style.color="#94A3B8";}}>{l[0]}</div>
  );
  return (
    <footer style={{ background:NAVY, padding: mobile ? "32px 20px 24px" : "48px 64px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        {mobile ? (
          <>
            <div style={{ display:"flex", justifyContent:"center", gap:64, marginBottom:28 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Compare</div>
                {COMPARE.map(link)}
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Legal</div>
                {LEGAL.map(link)}
              </div>
            </div>
            <div style={{ borderTop:"1px solid #1E3A5F", paddingTop:16, textAlign:"center" }}>
              <div style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:13, fontWeight:700, color:"#E2C97E", marginBottom:4 }}>GoldSilverPrices.com.au</div>
              <div style={{ fontSize:10, color:"#475569" }}>{"© 2026 · Independent bullion comparison · Not financial advice"}</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40 }}>
              <div style={{ maxWidth:260 }}>
                <div style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:15, fontWeight:700, color:"#E2C97E", marginBottom:10 }}>GoldSilverPrices.com.au</div>
                <div style={{ fontSize:12, color:"#64748B", lineHeight:1.75 }}>Independent bullion price comparison for Australian investors. Updated twice daily. Not financial advice.</div>
              </div>
              <div style={{ display:"flex", gap:80 }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Compare</div>
                  {COMPARE.map(link)}
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Legal</div>
                  {LEGAL.map(link)}
                </div>
              </div>
            </div>
            <div style={{ borderTop:"1px solid #1E3A5F", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:11, color:"#475569" }}>{"© 2026 GoldSilverPrices.com.au · All rights reserved"}</div>
              <div style={{ fontSize:11, color:"#475569" }}>{"Prices updated twice daily · Not financial advice"}</div>
            </div>
          </>
        )}
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
const COIN_INFO = {
  "Kangaroo":       { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1987" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1989" } },
  "Kookaburra":     { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1990" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1990" } },
  "Koala":          { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1987" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1987" } },
  "Lunar":          { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1996" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"1999" } },
  "Emu":            { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2018" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2018" } },
  "Swan":           { gold:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2017" }, silver:{ country:"Australia", mint:"Perth Mint",         fineness:"99.99%", since:"2017" } },
  "Maple Leaf":     { gold:{ country:"Canada",    mint:"Royal Canadian Mint",fineness:"99.99%", since:"1979" }, silver:{ country:"Canada",    mint:"Royal Canadian Mint",fineness:"99.99%", since:"1988" } },
  "Krugerrand":     { gold:{ country:"S. Africa", mint:"South African Mint", fineness:"91.67%", since:"1967" }, silver:{ country:"S. Africa", mint:"South African Mint", fineness:"99.99%", since:"2017" } },
  "Britannia":      { gold:{ country:"UK",        mint:"The Royal Mint",     fineness:"99.99%", since:"1987" }, silver:{ country:"UK",        mint:"The Royal Mint",     fineness:"99.99%", since:"1997" } },
  "Philharmonic":   { gold:{ country:"Austria",   mint:"Austrian Mint",      fineness:"99.99%", since:"1989" }, silver:{ country:"Austria",   mint:"Austrian Mint",      fineness:"99.99%", since:"2008" } },
  "American Eagle": { gold:{ country:"USA",       mint:"US Mint",            fineness:"91.67%", since:"1986" }, silver:{ country:"USA",       mint:"US Mint",            fineness:"99.93%", since:"1986" } },
  "Buffalo":        { gold:{ country:"USA",       mint:"US Mint",            fineness:"99.99%", since:"2006" }, silver:null },
  "Panda":          { gold:{ country:"China",     mint:"China Mint",         fineness:"99.9%",  since:"1982" }, silver:{ country:"China",     mint:"China Mint",         fineness:"99.9%",  since:"1983" } },
  "Libertad":       { gold:{ country:"Mexico",    mint:"Mexican Mint",       fineness:"99.99%", since:"1981" }, silver:{ country:"Mexico",    mint:"Mexican Mint",       fineness:"99.9%",  since:"1982" } },
  "Southern Cross": { gold:{ country:"Australia", mint:"ABC Refinery",       fineness:"99.99%", since:"2019" }, silver:{ country:"Australia", mint:"ABC Refinery",       fineness:"99.99%", since:"2019" } },
  "Generic":        { gold:{ country:"Various",   mint:"Various",            fineness:"99.99%", since:"—"    }, silver:{ country:"Various",   mint:"Various",            fineness:"99.9%",  since:"—"    } },
};

const DEALER_URLS = {
  "Perth Mint":            "https://www.perthmint.com",
  "ABC Bullion":           "https://www.abcbullion.com.au",
  "Ainslie Bullion":       "https://ainsliebullion.com.au",
  "KJC Bullion":           "https://www.kjc-gold-silver-bullion.com.au",
  "Jaggards":              "https://www.jaggards.com.au",
  "Swan Bullion":          "https://swanbullion.com",
  "Gold Stackers":         "https://www.goldstackers.com.au",
  "Guardian Gold":         "https://guardian-gold.com.au",
  "Bullion Now":           "https://bullionfirst.com.au",
  "Melbourne Gold Company":"https://melbournegold.com.au",
  "Imperial Bullion":      "https://www.imperialbullion.com.au",
};

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
    title: `${coinTypeDisplay} ${metal === "gold" ? "Gold" : "Silver"} Coin Price Australia | GoldSilverPrices.com.au`,
    description: `Compare ${coinTypeDisplay} ${metal} coin prices from Australian bullion dealers. Find the cheapest price updated twice daily.`,
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
        {COIN_INFO[coinTypeDisplay]?.[metal] && (
          <div style={{
            background: "#fff", borderRadius: 10,
            border: `1px solid ${BORDER}`,
            padding: "14px 16px", marginBottom: 16,
            display: "flex", gap: 20, flexWrap: "wrap",
          }}>
            {[
              { label: "Country",  val: COIN_INFO[coinTypeDisplay][metal].country },
              { label: "Mint",     val: COIN_INFO[coinTypeDisplay][metal].mint },
              { label: "Fineness", val: COIN_INFO[coinTypeDisplay][metal].fineness },
              { label: "Since",    val: COIN_INFO[coinTypeDisplay][metal].since },
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
                const spotForWeight = spot * targetOz;
                const p = spotForWeight > 0 ? ((r.buy_price / spotForWeight - 1) * 100) : null;
                const isLowest = i === 0;
                return (
                  <a key={r.dealer} href={DEALER_URLS[r.dealer] || "#"} target="_blank" rel="noreferrer" style={{
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
                {spot > 0 && lowest && targetOz > 0 && (
                  <> · Premium: <strong style={{ color: premColor(((lowest/(spot*targetOz))-1)*100) }}>+{(((lowest/(spot*targetOz))-1)*100).toFixed(2)}%</strong></>
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
  const barTypeLabel = barType === "cast" ? "Cast" : barType === "minted" ? "Minted" : barType === "buyback" ? "Buyback" : barType;
  const tabLabel  = barTypeLabel + " " + (metal === "gold" ? "Gold" : "Silver") + " Bars";

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
                  <a key={r.dealer} href={DEALER_URLS[r.dealer] || "#"} target="_blank" rel="noreferrer" style={{
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
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════ */
/* SELL PAGE                                                                  */
/* ══════════════════════════════════════════════════════════════════════════ */

const SELL_DEALERS = [
  { key:"Perth Mint",            short:"Perth Mint",  url:"https://www.perthmint.com/sell-gold" },
  { key:"ABC Bullion",           short:"ABC Bullion", url:"https://www.abcbullion.com.au/sell-gold" },
  { key:"Melbourne Gold Company",short:"Melb Gold",   url:"https://melbournegold.com.au/sell" },
  { key:"Bullion Now",           short:"Bullion Now", url:"https://bulliownow.com.au" },
  { key:"Imperial Bullion",      short:"Imperial",    url:"https://imperialbullion.com.au" },
  { key:"Jaggards",              short:"Jaggards",    url:"https://www.jaggards.com.au" },
  { key:"Guardian Gold",         short:"Guardian",    url:"https://guardian-gold.com.au/sell-bullion" },
];
const GOLD_SELL_WEIGHTS   = [{oz:0.1,label:"1/10 oz"},{oz:0.25,label:"1/4 oz"},{oz:0.5,label:"1/2 oz"},{oz:1.0,label:"1 oz"},{oz:10.0,label:"10 oz"},{oz:32.1507,label:"1 kg"}];
const SILVER_SELL_WEIGHTS = [{oz:0.5,label:"1/2 oz"},{oz:1.0,label:"1 oz"},{oz:10.0,label:"10 oz"},{oz:32.1507,label:"1 kg"}];

function useSellRows() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    supabase.from("prices_v2").select("dealer,metal,weight_oz,sell_price")
      .not("sell_price","is",null).gt("sell_price",0)
      .then(({data}) => { if (data) setRows(data); });
  }, []);
  return rows;
}
function getBestSell(rows, metal, oz) {
  let best = null;
  for (const r of rows) {
    if (r.metal !== metal) continue;
    if (Math.abs((r.weight_oz||0) - oz) > 0.01) continue;
    if (!best || r.sell_price > best) best = r.sell_price;
  }
  return best;
}
function getDealerSell(rows, dealer, metal, oz) {
  const m = rows.filter(r => r.dealer===dealer && r.metal===metal && Math.abs((r.weight_oz||0)-oz)<0.01);
  return m.length ? Math.max(...m.map(r=>r.sell_price)) : null;
}
function fmtAUD(n) {
  return n == null ? null : "$"+n.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});
}

function SellHubPage({ goldSpot, silverSpot, updated }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  const sellRows = useSellRows();
  const [postcode, setPostcode] = useState("");
  const [searched, setSearched] = useState(false);
  const [metal, setMetal]       = useState("gold");

  useSEO({
    title:"Sell Gold & Silver Australia | GoldSilverPrices.com.au",
    description:"Compare live gold and silver buyback prices from Australian dealers.",
  });

  const TILES = [
    {metal:"gold",  category:"bars",  label:"Gold Bars",    emoji:"🥇"},
    {metal:"gold",  category:"coins", label:"Gold Coins",   emoji:"🪙"},
    {metal:"silver",category:"bars",  label:"Silver Bars",  emoji:"🥈"},
    {metal:"silver",category:"coins", label:"Silver Coins", emoji:"🔘"},
  ];

  const DEALERS = [
    {name:"Ainslie Bullion",  city:"Brisbane", state:"QLD",url:"https://ainsliebullion.com.au/sell",         phone:"1800 246 753",online:true, instore:true, gold:true, silver:true, note:"Competitive buyback — price on request online or in store."},
    {name:"ABC Bullion",      city:"Sydney",   state:"NSW",url:"https://www.abcbullion.com.au/sell-gold",    phone:"02 9231 4511",online:true, instore:true, gold:true, silver:true, note:"Live buyback prices published on website for ABC-branded products."},
    {name:"Perth Mint",       city:"Perth",    state:"WA", url:"https://www.perthmint.com/sell-gold",        phone:"1300 201 112",online:true, instore:true, gold:true, silver:true, note:"Government-backed buyback program. Accepts Perth Mint products."},
    {name:"KJC Bullion",      city:"Melbourne",state:"VIC",url:"https://www.kjc-gold-silver-bullion.com.au", phone:"03 9602 2544",online:false,instore:true, gold:true, silver:true, note:"In-store buyback only. Contact for current prices."},
    {name:"Jaggards",         city:"Sydney",   state:"NSW",url:"https://www.jaggards.com.au",                phone:"02 9230 0886",online:false,instore:true, gold:true, silver:false,note:"In-store buyback. One of Sydney's oldest dealers."},
    {name:"Guardian Gold",    city:"Melbourne",state:"VIC",url:"https://guardian-gold.com.au/sell-bullion",  phone:"03 9629 2122",online:false,instore:true, gold:true, silver:true, note:"Vault-based buyback through Guardian Vaults facilities."},
    {name:"Swan Bullion",     city:"Perth",    state:"WA", url:"https://swanbullion.com",                    phone:"",            online:true, instore:false,gold:true, silver:true, note:"Online buyback enquiry. Contact for current offer."},
    {name:"Gold Stackers",    city:"Melbourne",state:"VIC",url:"https://www.goldstackers.com.au",            phone:"1300 618 363",online:true, instore:true, gold:true, silver:true, note:"Buyback available online and in store. Price on request."},
  ];

  const STATE_ORDER = {
    "NSW":["NSW","ACT","VIC","QLD","SA","WA","TAS","NT"],
    "VIC":["VIC","NSW","ACT","SA","QLD","TAS","WA","NT"],
    "QLD":["QLD","NSW","ACT","NT","SA","VIC","WA","TAS"],
    "WA": ["WA","SA","NT","VIC","NSW","ACT","QLD","TAS"],
    "SA": ["SA","VIC","NSW","WA","QLD","NT","ACT","TAS"],
    "TAS":["TAS","VIC","NSW","ACT","SA","QLD","WA","NT"],
    "ACT":["ACT","NSW","VIC","SA","QLD","WA","NT","TAS"],
    "NT": ["NT","QLD","SA","WA","NSW","VIC","ACT","TAS"],
  };
  function postcodeToState(pc) {
    const n = parseInt(pc);
    if (n>=2000&&n<=2999) return "NSW"; if (n>=3000&&n<=3999) return "VIC";
    if (n>=4000&&n<=4999) return "QLD"; if (n>=5000&&n<=5999) return "SA";
    if (n>=6000&&n<=6999) return "WA";  if (n>=7000&&n<=7999) return "TAS";
    if (n>=800&&n<=899)   return "NT";  if (n>=200&&n<=299)   return "ACT";
    return null;
  }
  const userState  = postcodeToState(postcode);
  const stateOrder = STATE_ORDER[userState] || [];
  const filtered   = DEALERS
    .filter(d => metal==="gold" ? d.gold : d.silver)
    .sort((a,b)=>(stateOrder.indexOf(a.state)===-1?99:stateOrder.indexOf(a.state))-(stateOrder.indexOf(b.state)===-1?99:stateOrder.indexOf(b.state)));

  return (
    <div style={{minHeight:"100vh",background:BG}}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{maxWidth:860,margin:"0 auto",padding:mobile?"20px 14px 60px":"32px 24px 60px"}}>

        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:mobile?20:26,fontWeight:700,color:NAVY,margin:"0 0 6px",fontFamily:"'Inter',system-ui,sans-serif"}}>Sell Your Bullion</h1>
          <p style={{fontSize:13,color:MUTED,margin:0}}>Compare live buyback prices from Australian dealers — updated automatically</p>
        </div>

        {/* 4 category tiles */}
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:36}}>
          {TILES.map(function(t){
            const best = getBestSell(sellRows, t.metal, 1.0);
            return (
              <div key={t.label} onClick={()=>navigate("/sell/"+t.metal+"/"+t.category)}
                style={{background:"#fff",border:"1px solid "+BORDER,borderRadius:12,padding:"18px 14px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.04)",transition:"box-shadow .15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.10)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)"}>
                <div style={{fontSize:24,marginBottom:8}}>{t.emoji}</div>
                <div style={{fontSize:13,fontWeight:700,color:NAVY,marginBottom:6}}>{t.label}</div>
                {best ? (
                  <>
                    <div style={{fontSize:10,color:MUTED,marginBottom:2}}>Best 1oz offer</div>
                    <div style={{fontSize:15,fontWeight:700,color:GREEN}}>{fmtAUD(best)}</div>
                  </>
                ) : <div style={{fontSize:11,color:MUTED}}>Loading...</div>}
                <div style={{fontSize:11,color:MUTED,marginTop:10}}>Compare prices →</div>
              </div>
            );
          })}
        </div>

        {/* Dealer locator */}
        <h2 style={{fontSize:13,fontWeight:700,color:NAVY,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Find a Dealer Near You</h2>
        <div style={{background:"#fff",borderRadius:10,border:"1px solid "+BORDER,padding:"16px 20px",marginBottom:20,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:"1 1 160px"}}>
              <div style={{fontSize:11,fontWeight:600,color:MUTED,marginBottom:6}}>Your postcode</div>
              <input value={postcode} onChange={e=>setPostcode(e.target.value.replace(/\D/g,"").slice(0,4))}
                onKeyDown={e=>{if(e.key==="Enter")setSearched(true);}} placeholder="e.g. 2000"
                style={{width:"100%",fontSize:14,padding:"9px 12px",border:"1px solid "+BORDER,borderRadius:7,fontFamily:"inherit",color:NAVY,outline:"none",boxSizing:"border-box",background:"#fff",WebkitAppearance:"none"}} />
            </div>
            <div style={{flex:"1 1 160px"}}>
              <div style={{fontSize:11,fontWeight:600,color:MUTED,marginBottom:6}}>Metal</div>
              <div style={{display:"flex",gap:6}}>
                {["gold","silver"].map(m=>(
                  <button key={m} onClick={()=>setMetal(m)} style={{flex:1,background:metal===m?NAVY:"#fff",color:metal===m?"#fff":SLATE,border:"1px solid "+(metal===m?NAVY:BORDER),borderRadius:7,padding:"9px 0",fontSize:13,fontWeight:metal===m?600:400,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>{m}</button>
                ))}
              </div>
            </div>
            <button onClick={()=>setSearched(true)} style={{flex:"0 0 auto",background:NAVY,color:"#fff",border:"none",borderRadius:7,padding:"9px 20px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Search →</button>
          </div>
          {postcode.length===4&&!userState&&<div style={{fontSize:11,color:"#DC2626",marginTop:8}}>Please enter a valid Australian postcode</div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map(function(d){
            const isLocal = d.state===userState;
            return (
              <div key={d.name} style={{background:"#fff",borderRadius:10,border:"1px solid "+(isLocal&&searched?"#C9A84C":BORDER),padding:"16px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.04)",position:"relative"}}>
                {isLocal&&searched&&<div style={{position:"absolute",top:12,right:14,fontSize:9,fontWeight:700,background:"#FEF9C3",color:"#854D0E",padding:"2px 8px",borderRadius:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Nearest</div>}
                <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:700,color:NAVY}}>{d.name}</span>
                      <span style={{fontSize:11,color:MUTED}}>📍 {d.city}, {d.state}</span>
                    </div>
                    <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                      {d.online  &&<span style={{fontSize:10,background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0",borderRadius:6,padding:"2px 8px",fontWeight:600}}>Online buyback</span>}
                      {d.instore &&<span style={{fontSize:10,background:"#EFF6FF",color:"#1D4ED8",border:"1px solid #BFDBFE",borderRadius:6,padding:"2px 8px",fontWeight:600}}>In-store</span>}
                      {d.gold    &&<span style={{fontSize:10,background:"#FEF9C3",color:"#854D0E",border:"1px solid #FDE68A",borderRadius:6,padding:"2px 8px"}}>Gold</span>}
                      {d.silver  &&<span style={{fontSize:10,background:"#F1F5F9",color:"#475569",border:"1px solid #CBD5E1",borderRadius:6,padding:"2px 8px"}}>Silver</span>}
                    </div>
                    <p style={{fontSize:12,color:SLATE,margin:"0 0 8px",lineHeight:1.6}}>{d.note}</p>
                    {d.phone&&<div style={{fontSize:12,color:MUTED}}>{"📞 "+d.phone}</div>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignSelf:"center",flexShrink:0}}>
                    <span onClick={()=>navigate("/dealers/"+d.name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""))}
                      style={{fontSize:11,fontWeight:600,color:NAVY,cursor:"pointer",textAlign:"center",padding:"6px 14px",border:"1px solid "+BORDER,borderRadius:6,background:"#fff"}}
                      onMouseEnter={e=>e.currentTarget.style.background=BG}
                      onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                      View dealer
                    </span>
                    <a href={d.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:MUTED,textDecoration:"none",textAlign:"center",padding:"4px 0"}}>Visit website ↗</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{fontSize:11,color:MUTED,marginTop:20,textAlign:"center"}}>Sell prices vary daily. Always confirm current buyback price directly with the dealer before selling.</p>
      </div>
    </div>
  );
}

function SellCategoryPage({ goldSpot, silverSpot, updated }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  const { metal, category } = useParams();
  const sellRows = useSellRows();

  const isGold   = metal === "gold";
  const spot     = isGold ? goldSpot : silverSpot;
  const weights  = isGold ? GOLD_SELL_WEIGHTS : SILVER_SELL_WEIGHTS;
  const [selOz, setSelOz] = useState(1.0);

  const metLabel = isGold ? "Gold" : "Silver";
  const catLabel = category === "bars" ? "Bars" : "Coins";

  useSEO({
    title:"Sell "+metLabel+" "+catLabel+" Australia | GoldSilverPrices.com.au",
    description:"Compare "+metLabel.toLowerCase()+" "+catLabel.toLowerCase()+" buyback prices from Australian bullion dealers.",
  });

  const selWeight = weights.find(w=>Math.abs(w.oz-selOz)<0.001) || weights.find(w=>w.oz===1.0) || weights[0];

  const activeDealers = SELL_DEALERS
    .filter(d => getDealerSell(sellRows,d.key,metal,selOz) !== null)
    .sort((a,b) => (getDealerSell(sellRows,b.key,metal,selOz)||0)-(getDealerSell(sellRows,a.key,metal,selOz)||0));

  const bestPrice = activeDealers.length ? getDealerSell(sellRows,activeDealers[0].key,metal,selOz) : null;

  return (
    <div style={{minHeight:"100vh",background:BG}}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{maxWidth:740,margin:"0 auto",padding:mobile?"16px 14px 60px":"28px 24px 60px"}}>

        {/* Breadcrumb */}
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:MUTED,marginBottom:20}}>
          <span onClick={()=>navigate("/sell")} style={{cursor:"pointer",color:NAVY,fontWeight:600}}>Sell</span>
          <span>›</span><span style={{textTransform:"capitalize"}}>{metLabel}</span>
          <span>›</span><span style={{textTransform:"capitalize",color:NAVY,fontWeight:600}}>{catLabel}</span>
        </div>

        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:mobile?18:24,fontWeight:700,color:NAVY,margin:"0 0 4px"}}>{"Sell "+metLabel+" "+catLabel}</h1>
          <p style={{fontSize:12,color:MUTED,margin:0}}>{"Live buyback prices · "+metLabel+" spot: "+(spot?fmtAUD(spot)+"/oz":"loading...")}</p>
        </div>

        {/* Weight pills */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {weights.map(function(w){
            const active   = Math.abs(w.oz-selOz)<0.001;
            const hasData  = sellRows.some(r=>r.metal===metal&&Math.abs((r.weight_oz||0)-w.oz)<0.01&&r.sell_price>0);
            return (
              <button key={w.oz} onClick={()=>{if(hasData)setSelOz(w.oz);}} disabled={!hasData}
                style={{padding:"7px 18px",borderRadius:20,border:"1px solid "+(active?NAVY:BORDER),background:active?NAVY:"#fff",color:active?"#fff":(hasData?SLATE:MUTED),fontSize:13,fontWeight:active?600:400,cursor:hasData?"pointer":"default",fontFamily:"inherit",opacity:hasData?1:0.4,transition:"all .15s"}}>
                {w.label}
              </button>
            );
          })}
        </div>

        {/* Best price callout */}
        {bestPrice && (
          <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"#15803D",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{"Best offer for "+selWeight.label}</div>
              <div style={{fontSize:24,fontWeight:700,color:NAVY}}>{fmtAUD(bestPrice)}</div>
            </div>
            {spot && <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:MUTED,marginBottom:2}}>vs spot</div>
              <div style={{fontSize:15,fontWeight:600,color:SLATE}}>{((bestPrice/(selOz*spot)-1)*100).toFixed(1)+"%"}</div>
            </div>}
          </div>
        )}

        {/* Dealer table */}
        <div style={{background:"#fff",borderRadius:12,border:"1px solid "+BORDER,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          {sellRows.length===0 ? (
            <div style={{padding:48,textAlign:"center",color:MUTED,fontSize:13}}>Loading prices...</div>
          ) : activeDealers.length===0 ? (
            <div style={{padding:48,textAlign:"center",color:MUTED,fontSize:13}}>No buyback data available for this weight.</div>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#F8FAFC"}}>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"left",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Dealer</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>vs spot</th>
                  <th style={{fontSize:10,fontWeight:600,color:MUTED,textAlign:"right",padding:"10px 16px",borderBottom:"1px solid "+BORDER}}>Buyback offer</th>
                </tr>
              </thead>
              <tbody>
                {activeDealers.map(function(d,i){
                  const price  = getDealerSell(sellRows,d.key,metal,selOz);
                  const isBest = i===0;
                  const pct    = (spot&&price) ? ((price/(selOz*spot)-1)*100).toFixed(1) : null;
                  return (
                    <tr key={d.key} onClick={()=>window.open(d.url,"_blank")} style={{borderBottom:"1px solid #F1F5F9",background:isBest?"#FAFFFE":"#fff",cursor:"pointer",borderLeft:isBest?"3px solid "+GREEN:"3px solid transparent"}}>
                      <td style={{padding:mobile?"12px 12px":"14px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:13,fontWeight:600,color:NAVY}}>{d.short}</span>
                          {isBest&&<span style={{fontSize:9,fontWeight:700,background:GREEN,color:"#fff",padding:"2px 7px",borderRadius:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Best</span>}
                        </div>
                      </td>
                      <td style={{padding:"14px 16px",textAlign:"right",fontSize:12,color:pct&&parseFloat(pct)>=0?GREEN:MUTED}}>{pct?(parseFloat(pct)>=0?"+":"")+pct+"%":"—"}</td>
                      <td style={{padding:mobile?"12px 12px":"14px 16px",textAlign:"right",fontSize:mobile?14:15,fontWeight:isBest?700:500,color:isBest?GREEN:SLATE,whiteSpace:"nowrap"}}>{fmtAUD(price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{fontSize:10,color:MUTED,marginTop:10,textAlign:"right"}}>Prices updated automatically · Always confirm with dealer before selling</p>
        <div style={{marginTop:20}}>
          <span onClick={()=>navigate("/sell")} style={{fontSize:12,color:NAVY,cursor:"pointer",fontWeight:500}}>← Back to Sell</span>
        </div>
      </div>
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
  const articles = [
  {
    "slug": "how-to-buy-gold-australia",
    "tag": "Guide",
    "title": "How to Buy Gold in Australia: A Complete 2026 Guide",
    "excerpt": "Everything you need to know — spot price, premiums, which dealer to choose, storage options and the most common mistakes first-time buyers make.",
    "readMin": 8,
    "emoji": "🪙"
  },
  {
    "slug": "why-gold-coin-prices-vary",
    "tag": "Education",
    "title": "Why Gold Coin Prices Vary Between Dealers — The Premium Explained",
    "excerpt": "The price difference between dealers isn't random. Understanding premiums, cast vs minted, and why a Kangaroo is cheaper than a Britannia saves you real money.",
    "readMin": 5,
    "emoji": "📊"
  },
  {
    "slug": "is-silver-good-investment-australia-2026",
    "tag": "Analysis",
    "title": "Is Silver a Good Investment in Australia in 2026?",
    "excerpt": "The gold/silver ratio, GST implications on silver, cast bars vs coins, and how to store it cheaply. What Australian investors need to know.",
    "readMin": 6,
    "emoji": "🥈"
  },
  {
    "slug": "best-online-gold-dealers-australia",
    "tag": "Comparison",
    "title": "Best Online Gold Dealers in Australia — Compared",
    "excerpt": "Ainslie, ABC Bullion, Perth Mint, KJC, Jaggards, Swan and more — location, speciality, best products and what each dealer does better than the rest.",
    "readMin": 7,
    "emoji": "🏅"
  }
];
  const ARTICLE_IMGS = {
    "how-to-buy-gold-australia": "https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800",
    "why-gold-coin-prices-vary": "https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg?w=800",
    "is-silver-good-investment-australia-2026": "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?w=800",
    "best-online-gold-dealers-australia": "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?w=800",
  };
  const tagColors = {
  "Guide": {
    "bg": "#EFF6FF",
    "color": "#1D4ED8"
  },
  "Education": {
    "bg": "#F0FDF4",
    "color": "#16A34A"
  },
  "Analysis": {
    "bg": "#FEF9C3",
    "color": "#854D0E"
  },
  "Comparison": {
    "bg": "#FDF4FF",
    "color": "#7E22CE"
  }
};

  return (
    <div style={{ minHeight: "100vh", background: BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: mobile ? "20px 14px 60px" : "32px 24px 60px" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: mobile ? 20 : 26, fontWeight: 700, color: NAVY, margin: "0 0 6px", fontFamily: "'Inter',system-ui,sans-serif" }}>Magazine</h1>
          <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Investment guides and market analysis for Australian gold and silver buyers</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          {articles.map(function(a) {
            const tc = tagColors[a.tag] || { bg: "#F1F5F9", color: "#475569" };
            return (
              <div key={a.slug}
                onClick={() => navigate("/magazine/" + a.slug)}
                style={{ background: "#fff", borderRadius: 10, border: "1px solid " + BORDER, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)", transition: "box-shadow .15s" }}
                onMouseEnter={function(e){ e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.10)"; }}
                onMouseLeave={function(e){ e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; }}>
                <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                  <img src={ARTICLE_IMGS[a.slug]} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 10, left: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, background: tc.bg, color: tc.color, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{a.tag}</span>
                    <span style={{ fontSize: 10, color: "#fff", background: "rgba(0,0,0,0.45)", padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>{a.readMin} min read</span>
                  </div>
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 8px", lineHeight: 1.4, fontFamily: "'Inter',system-ui,sans-serif", textAlign:"left" }}>{a.title}</h2>
                  <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.7, margin: "0 0 14px", textAlign:"left" }}>{a.excerpt}</p>
                  <span style={{ fontSize: 12, color: NAVY, fontWeight: 600, display:"block", textAlign:"left" }}>Read article →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* DEALERS PAGE — placeholder                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════ */
/* DEALER PAGE — /dealers/:dealerId                                           */
/* ══════════════════════════════════════════════════════════════════════════ */
const DEALER_INFO = {
  ainslie: {
    name: "Ainslie Bullion", city: "Brisbane, QLD", state: "QLD",
    url: "https://www.ainsliebullion.com.au", since: 1974, badge: "Est. 1974",
    rating: 4.8, reviews: 2341,
    desc: "Ainslie Bullion is one of Australia's longest-established precious metals dealers, founded in Brisbane in 1974. They offer a comprehensive range of gold, silver, platinum and palladium products for retail and wholesale investors. Their Edward Street store is a landmark for Queensland investors, and they also operate a secure vault storage facility.",
    speciality: ["Walk-in store", "Vault storage", "Large product range", "Wholesale pricing"],
    payMethods: ["Bank Transfer", "Credit Card", "Cash", "BPAY", "PayID"],
    shipping: "Free insured shipping on orders over $500",
    locations: [
      { name: "Brisbane CBD", address: "47 Edward St, Brisbane QLD 4000", phone: "(07) 3221 6052",
        hours: { Mon:"8:30–17:00", Tue:"8:30–17:00", Wed:"8:30–17:00", Thu:"8:30–17:00", Fri:"8:30–17:00", Sat:"9:00–13:00", Sun:"Closed" } },
    ],
    reviewCount: 2341,
  },
  jaggards: {
    name: "Jaggards", city: "Sydney, NSW", state: "NSW",
    url: "https://www.jaggards.com.au", since: 1975, badge: "Since 1975",
    rating: 4.7, reviews: 876,
    desc: "Jaggards has been Sydney's most respected bullion dealer since 1975. Located in the Sydney CBD, they specialise in investment-grade gold and silver coins and bars. They are particularly well regarded for their numismatic and collector coin range alongside standard investment products.",
    speciality: ["Rare coins", "Competitive premiums", "Fast shipping", "Collector pieces"],
    payMethods: ["Bank Transfer", "Credit Card", "BPAY"],
    shipping: "Free insured shipping on orders over $1,000",
    locations: [
      { name: "Sydney CBD", address: "5 Elizabeth St, Sydney NSW 2000", phone: "(02) 9232 5288",
        hours: { Mon:"9:00–17:30", Tue:"9:00–17:30", Wed:"9:00–17:30", Thu:"9:00–17:30", Fri:"9:00–17:30", Sat:"9:00–13:00", Sun:"Closed" } },
    ],
    reviewCount: 876,
  },
  abc: {
    name: "ABC Bullion", city: "Sydney, NSW", state: "NSW",
    url: "https://www.abcbullion.com.au", since: 1972, badge: "Market Leader",
    rating: 4.9, reviews: 3102,
    desc: "ABC Bullion is Australia's largest and most recognised precious metals dealer, established in 1972. Their proprietary ABC Bullion cast bar is Australia's most traded gold product. With offices in Sydney and Melbourne, they serve both retail and institutional investors with some of the most competitive pricing in the market.",
    speciality: ["Own-brand bars", "Institutional volumes", "Sydney & Melbourne offices", "Online bullion pool"],
    payMethods: ["Bank Transfer", "Credit Card", "Cash", "BPAY", "PayID"],
    shipping: "Free insured shipping on orders over $1,000",
    locations: [
      { name: "Sydney (Head Office)", address: "Level 1, 280 George St, Sydney NSW 2000", phone: "(02) 9231 4511",
        hours: { Mon:"9:00–17:00", Tue:"9:00–17:00", Wed:"9:00–17:00", Thu:"9:00–17:00", Fri:"9:00–17:00", Sat:"Closed", Sun:"Closed" } },
      { name: "Melbourne", address: "Level 12, 90 Collins St, Melbourne VIC 3000", phone: "(03) 9225 4077",
        hours: { Mon:"9:00–17:00", Tue:"9:00–17:00", Wed:"9:00–17:00", Thu:"9:00–17:00", Fri:"9:00–17:00", Sat:"Closed", Sun:"Closed" } },
    ],
    reviewCount: 3102,
  },
  perth: {
    name: "Perth Mint", city: "Perth, WA", state: "WA",
    url: "https://www.perthmint.com", since: 1899, badge: "Govt. Owned",
    rating: 4.9, reviews: 8721,
    desc: "The Perth Mint is Australia's official bullion mint, established by the West Australian Government in 1899. It is the oldest operating mint in Australia and produces bullion coins and bars of the highest international recognition. Products carry a government guarantee and are accepted by dealers worldwide.",
    speciality: ["Government guarantee", "Highest purity", "International recognition", "Museum & visitor centre"],
    payMethods: ["Bank Transfer", "Credit Card", "PayPal"],
    shipping: "Free insured shipping on orders over $500",
    locations: [
      { name: "Perth Mint", address: "310 Hay St, East Perth WA 6004", phone: "(08) 9421 7222",
        hours: { Mon:"9:00–17:00", Tue:"9:00–17:00", Wed:"9:00–17:00", Thu:"9:00–17:00", Fri:"9:00–17:00", Sat:"9:00–13:00", Sun:"Closed" } },
    ],
    reviewCount: 8721,
  },
  swan: {
    name: "Swan Bullion", city: "Perth, WA", state: "WA",
    url: "https://www.swanbullion.com", since: 2015, badge: "",
    rating: 4.6, reviews: 412,
    desc: "Swan Bullion is a Perth-based online bullion dealer established in 2015. Specialising in Perth Mint products, they offer competitive pricing on gold and silver coins and bars. As a Western Australian dealer they are ideally positioned to source directly from the Perth Mint.",
    speciality: ["Perth Mint specialists", "Fast WA delivery", "Online focus", "Competitive pricing"],
    payMethods: ["Bank Transfer", "Credit Card"],
    shipping: "Free insured shipping on orders over $500",
    locations: [
      { name: "Online Only", address: "Perth, WA 6000", phone: "support@swanbullion.com",
        hours: { Mon:"Online 24/7", Tue:"Online 24/7", Wed:"Online 24/7", Thu:"Online 24/7", Fri:"Online 24/7", Sat:"Online 24/7", Sun:"Online 24/7" } },
    ],
    reviewCount: 412,
  },
  goldstackers: {
    name: "Gold Stackers", city: "Melbourne, VIC", state: "VIC",
    url: "https://www.goldstackers.com.au", since: 2010, badge: "",
    rating: 4.5, reviews: 654,
    desc: "Gold Stackers is a Melbourne-based bullion dealer popular with collectors and silver stackers. Founded in 2010, they offer a good range of silver coins, gold coins and gold bars. They are particularly well regarded in the stacking community for competitive silver pricing.",
    speciality: ["Silver stacking", "Collector coins", "Melbourne pickup", "Competitive silver pricing"],
    payMethods: ["Bank Transfer", "BPAY"],
    shipping: "Free insured shipping on orders over $500",
    locations: [
      { name: "Melbourne", address: "Melbourne, VIC 3000", phone: "(03) 9999 1234",
        hours: { Mon:"9:00–17:00", Tue:"9:00–17:00", Wed:"9:00–17:00", Thu:"9:00–17:00", Fri:"9:00–17:00", Sat:"By appointment", Sun:"Closed" } },
    ],
    reviewCount: 654,
  },
  kjc: {
    name: "KJC Bullion", city: "Brisbane, QLD", state: "QLD",
    url: "https://www.kjc-gold-silver-bullion.com.au", since: 2008, badge: "",
    rating: 4.4, reviews: 298,
    desc: "KJC Bullion is a Brisbane-based precious metals dealer established in 2008. They focus on mainstream investment products including Kangaroo coins, Maple Leafs and gold bars. Their online store offers competitive pricing with a straightforward buying experience.",
    speciality: ["Kangaroo coins", "Maple Leaf coins", "Mainstream investment products", "Brisbane based"],
    payMethods: ["Bank Transfer", "Credit Card", "BPAY"],
    shipping: "Free insured shipping on orders over $500",
    locations: [
      { name: "Online Only", address: "Brisbane, QLD 4000", phone: "(07) 3999 0000",
        hours: { Mon:"Online 24/7", Tue:"Online 24/7", Wed:"Online 24/7", Thu:"Online 24/7", Fri:"Online 24/7", Sat:"Online 24/7", Sun:"Online 24/7" } },
    ],
    reviewCount: 298,
  },
};

function DealerPage({ goldSpot, silverSpot, updated }) {
  const { dealerId } = useParams();
  const navigate     = useNavigate();
  const mobile       = useIsMobile();
  const [tab, setTab] = useState("about");
  const d = DEALER_INFO[dealerId] || DEALER_INFO.ainslie;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  useSEO({
    title: `${d.name} | GoldSilverPrices.com.au`,
    description: `${d.name} — ${d.city}. ${d.desc.slice(0,120)}...`,
  });

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth:1000, margin:"0 auto", padding: mobile?"14px 12px 60px":"28px 24px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize:11, color:MUTED, marginBottom:14, display:"flex", gap:5, alignItems:"center" }}>
          <span onClick={() => navigate("/")} style={{ cursor:"pointer", color:NAVY }}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/dealers")} style={{ cursor:"pointer", color:NAVY }}>Dealers</span>
          <span>›</span>
          <span style={{ color:SLATE }}>{d.name}</span>
        </div>

        {/* Hero */}
        <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding: mobile?"14px":"22px 24px", marginBottom:18, boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
          <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ width:72, height:72, borderRadius:10, background:BG, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, flexShrink:0 }}>🏪</div>
            <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                <h1 style={{ fontSize: mobile?18:22, fontWeight:700, color:NAVY, margin:0, fontFamily:"'Inter',system-ui,sans-serif" }}>{d.name}</h1>
                {d.badge && <span style={{ fontSize:9, fontWeight:700, background:"#EFF6FF", color:"#1D4ED8", padding:"2px 7px", borderRadius:10, letterSpacing:"0.05em" }}>{d.badge.toUpperCase()}</span>}
              </div>
              <table style={{ fontSize:12, marginTop:8, borderCollapse:"collapse", width:"100%", textAlign:"left" }}>
                <tbody>
                  {[
                    ["📍","Location",   d.city],
                    ["🌐","Website",    d.url],
                    ["📅","Established",String(d.since)],
                    ["⭐","Rating",     `${d.rating}/5.0 (${d.reviewCount?.toLocaleString()} Google reviews)`],
                    ["🚚","Shipping",   d.shipping],
                  ].map(([emoji, label, val]) => (
                    <tr key={label}>
                      <td style={{ color:MUTED, paddingRight:6, paddingBottom:4, verticalAlign:"top", textAlign:"left" }}>{emoji}</td>
                      <td style={{ color:MUTED, paddingRight:14, paddingBottom:4, whiteSpace:"nowrap", verticalAlign:"top", textAlign:"left" }}>{label}</td>
                      <td style={{ color:SLATE, paddingBottom:4, verticalAlign:"top", textAlign:"left" }}>
                        {label === "Website"
                          ? <a href={d.url} target="_blank" rel="noreferrer" style={{ color:NAVY, textDecoration:"none" }}>{val}</a>
                          : val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a href={d.url} target="_blank" rel="noreferrer" style={{ background:"#C9A84C", color:"#0F2A44", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, textDecoration:"none", flexShrink:0, whiteSpace:"nowrap" }}>Visit Store →</a>
          </div>
        </div>

        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>

          {/* Main content */}
          <div style={{ flex:"2 1 480px", minWidth:0 }}>
            {/* Tabs */}
            <div style={{ display:"flex", gap:6, marginBottom:16 }}>
              {["about","locations"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ background:tab===t?NAVY:"#fff", color:tab===t?"#fff":SLATE, border:`1px solid ${tab===t?NAVY:BORDER}`, borderRadius:6, padding:"5px 14px", fontSize:12, fontWeight:tab===t?600:400, cursor:"pointer", fontFamily:"inherit" }}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {/* ABOUT */}
            {tab === "about" && (
              <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding:"18px 20px" }}>
                <h2 style={{ fontSize:15, fontWeight:600, color:NAVY, margin:"0 0 10px" }}>About {d.name}</h2>
                <p style={{ fontSize:13, color:SLATE, lineHeight:1.85, margin:"0 0 18px", textAlign:"left" }}>{d.desc}</p>

                <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:14, marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Speciality</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {d.speciality.map(s => <span key={s} style={{ fontSize:11, background:BG, border:`1px solid ${BORDER}`, borderRadius:6, padding:"4px 10px", color:SLATE }}>{s}</span>)}
                  </div>
                </div>

                <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:14, marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Payment Methods</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {d.payMethods.map(m => <span key={m} style={{ fontSize:11, background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:6, padding:"4px 10px", color:"#166534" }}>✓ {m}</span>)}
                  </div>
                </div>

                <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Shipping</div>
                  <p style={{ fontSize:13, color:SLATE, margin:0 }}>🚚 {d.shipping}</p>
                </div>
              </div>
            )}

            {/* LOCATIONS */}
            {tab === "locations" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {d.locations.map((loc, i) => (
                  <div key={i} style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
                    <div style={{ padding:"13px 18px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:18 }}>📍</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600, color:NAVY }}>{loc.name}</div>
                        <div style={{ fontSize:11, color:MUTED }}>{loc.address}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap" }}>
                      <div style={{ padding:"12px 18px", borderRight:`1px solid ${BORDER}`, minWidth:160 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>Phone</div>
                        <div style={{ fontSize:12, color:SLATE }}>{loc.phone}</div>
                      </div>
                      <div style={{ padding:"12px 18px", flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Opening Hours</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                          {days.map(day => {
                            const hours = loc.hours[day] || "Closed";
                            return (
                              <div key={day} style={{ display:"flex", justifyContent:"space-between", fontSize:12, paddingBottom:4, borderBottom:`1px solid ${BORDER}` }}>
                                <span style={{ color:MUTED, fontWeight:400 }}>{day}</span>
                                <span style={{ color: hours==="Closed"?"#DC2626":SLATE }}>{hours}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div style={{ flex:"1 1 220px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Quick Info</div>
              {[["Established", d.since],["Location", d.city],["Website", d.url],["Stores", d.locations.length === 1 && d.locations[0].name === "Online Only" ? "Online only" : `${d.locations.length} location${d.locations.length>1?"s":""}`]].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:9, fontSize:12, borderBottom:`1px solid ${BORDER}`, paddingBottom:9 }}>
                  <span style={{ color:MUTED }}>{l}</span>
                  <span style={{ color:SLATE, fontWeight:500, textAlign:"right", maxWidth:140, wordBreak:"break-all", fontSize:11 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding:16 }}>
              <div style={{ fontSize:10, color:MUTED, marginBottom:10, lineHeight:1.6 }}>⭐ Ratings sourced from Google Reviews. GoldSilverPrices.com.au is independent and not affiliated with any dealer.</div>
              <div style={{ fontSize:11, color:SLATE, marginBottom:10, lineHeight:1.6 }}>See how {d.name} compares on price across all products.</div>
              <button onClick={() => navigate("/")} style={{ background:NAVY, color:"#fff", border:"none", borderRadius:6, padding:"9px 14px", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%", fontFamily:"inherit" }}>Compare Prices →</button>
            </div>
            <a href={d.url} target="_blank" rel="noreferrer" style={{ background:"#C9A84C", color:"#0F2A44", borderRadius:8, padding:"12px 0", fontSize:13, fontWeight:700, textDecoration:"none", textAlign:"center", display:"block" }}>Visit {d.name} →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DealersPage({ rows, goldSpot, silverSpot, updated }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState("All");

  const DEALERS = [
    { id:"ainslie",      name:"Ainslie Bullion",  city:"Brisbane, QLD", state:"QLD", url:"ainsliebullion.com.au",             since:1974, badge:"Est. 1974",       rating:4.8, reviews:2341, tagline:"Brisbane's most trusted bullion dealer. Walk-in store, vault storage and a huge range of gold and silver products.", shipping:"Free over $500 · Insured" },
    { id:"jaggards",     name:"Jaggards",          city:"Sydney, NSW",   state:"NSW", url:"jaggards.com.au",                  since:1975, badge:"Since 1975",      rating:4.7, reviews:876,  tagline:"Sydney's premier bullion and coin dealer. Specialising in investment coins, collector pieces and competitive gold bars.", shipping:"Free over $1,000 · Insured" },
    { id:"abc",          name:"ABC Bullion",        city:"Sydney, NSW",   state:"NSW", url:"abcbullion.com.au",                since:1972, badge:"Market Leader",   rating:4.9, reviews:3102, tagline:"Australia's largest precious metals dealer. The ABC Bullion cast bar is Australia's most traded gold product.", shipping:"Free over $1,000 · Insured" },
    { id:"perth",        name:"Perth Mint",         city:"Perth, WA",    state:"WA",  url:"perthmint.com",                    since:1899, badge:"Govt. Owned",     rating:4.9, reviews:8721, tagline:"Australia's official government mint since 1899. Products carry a government guarantee and worldwide recognition.", shipping:"Free over $500 · Insured" },
    { id:"swan",         name:"Swan Bullion",       city:"Perth, WA",    state:"WA",  url:"swanbullion.com",                  since:2015, badge:"",                rating:4.6, reviews:412,  tagline:"Perth-based online dealer specialising in Perth Mint products with competitive pricing on coins and bars.", shipping:"Free over $500 · Insured" },
    { id:"goldstackers", name:"Gold Stackers",      city:"Melbourne, VIC",state:"VIC",url:"goldstackers.com.au",              since:2010, badge:"",                rating:4.5, reviews:654,  tagline:"Melbourne-based dealer popular with stackers and collectors. Good range of silver coins and competitive gold pricing.", shipping:"Free over $500 · Insured" },
    { id:"kjc",          name:"KJC Bullion",        city:"Brisbane, QLD", state:"QLD", url:"kjc-gold-silver-bullion.com.au",  since:2008, badge:"",                rating:4.4, reviews:298,  tagline:"Brisbane-based investment bullion specialists. Competitive pricing on Kangaroo coins and mainstream investment products.", shipping:"Free over $500 · Insured" },
  ];

  const states   = ["All","NSW","QLD","VIC","WA"];
  const filtered = stateFilter === "All" ? DEALERS : DEALERS.filter(d => d.state === stateFilter);

  useSEO({
    title: "Australian Bullion Dealers | GoldSilverPrices.com.au",
    description: "Compare Australia's top bullion dealers — Ainslie, ABC Bullion, Perth Mint, Jaggards, Swan Bullion and more.",
  });

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />
      <div style={{ maxWidth:1000, margin:"0 auto", padding: mobile ? "16px 12px 60px" : "28px 24px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize:11, color:MUTED, marginBottom:14, display:"flex", gap:5, alignItems:"center" }}>
          <span onClick={() => navigate("/")} style={{ cursor:"pointer", color:NAVY }}>Home</span>
          <span>›</span>
          <span style={{ color:SLATE }}>Dealers</span>
        </div>

        <h1 style={{ fontSize: mobile?20:26, fontWeight:700, color:NAVY, margin:"0 0 6px", fontFamily:"'Inter',system-ui,sans-serif" }}>
          Australian Bullion Dealers
        </h1>
        <p style={{ color:MUTED, fontSize:13, margin:"0 0 22px" }}>
          Verified Australian dealers we track for daily price comparisons.
        </p>

        {/* State filter */}
        <div style={{ display:"flex", gap:7, marginBottom:22, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:12, color:MUTED }}>State:</span>
          {states.map(s => (
            <button key={s} onClick={() => setStateFilter(s)} style={{
              background: stateFilter===s ? NAVY : "#fff",
              color: stateFilter===s ? "#fff" : SLATE,
              border: `1px solid ${stateFilter===s ? NAVY : BORDER}`,
              borderRadius:6, padding:"4px 12px",
              fontSize:12, fontWeight: stateFilter===s ? 600 : 400,
              cursor:"pointer", fontFamily:"inherit",
            }}>{s}</button>
          ))}
        </div>

        {/* Dealer cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(d => (
            <div key={d.id} onClick={() => navigate(`/dealers/${d.id}`)}
              style={{ background:"#fff", borderRadius:10, border:`1px solid ${BORDER}`, padding: mobile?"14px":"18px 20px", cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,.04)", display:"flex", gap:14, alignItems:"flex-start" }}>

              {/* Logo placeholder */}
              <div style={{ width:54, height:54, borderRadius:8, background:BG, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:22 }}>🏪</div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3, flexWrap:"wrap" }}>
                  <span style={{ fontSize: mobile?14:15, fontWeight:700, color:NAVY }}>{d.name}</span>
                  {d.badge && <span style={{ fontSize:9, fontWeight:700, background:"#EFF6FF", color:"#1D4ED8", padding:"2px 7px", borderRadius:10, letterSpacing:"0.05em" }}>{d.badge.toUpperCase()}</span>}
                </div>
                <div style={{ fontSize:11, color:MUTED, marginBottom:5 }}>📍 {d.city} · {d.url}</div>
                <p style={{ fontSize:12, color:SLATE, margin:"0 0 7px", lineHeight:1.6, textAlign:"left" }}>{d.tagline}</p>
                <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:MUTED }}>⭐ <strong style={{ color:SLATE }}>{d.rating}</strong> ({d.reviews.toLocaleString()} reviews)</span>
                  <span style={{ fontSize:11, color:MUTED }}>Est. {d.since}</span>
                </div>
              </div>

              {/* Arrow */}
              {!mobile && <div style={{ background:NAVY, color:"#fff", borderRadius:6, padding:"8px 16px", fontSize:12, fontWeight:600, flexShrink:0, alignSelf:"center" }}>View →</div>}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop:28, background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:8, padding:"12px 16px", fontSize:12, color:"#1E40AF", lineHeight:1.7 }}>
          <strong>Independent comparison:</strong> GoldSilverPrices.com.au is not affiliated with any dealer. We never accept payment for placement. Prices are scraped twice daily directly from each dealer's website.
        </div>
      </div>
    </div>
  );
}


function MagazineCarousel() {
  const mobile = useIsMobile();
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { img: "https://images.pexels.com/photos/47344/gold-bar-gold-bar-gold-47344.jpeg?w=800", headline: "How to Buy Gold in Australia: A Complete 2026 Guide", sub: "Read guide →", slug: "how-to-buy-gold-australia", tag: "Guide" },
    { img: "https://images.pexels.com/photos/128867/coins-currency-investment-insurance-128867.jpeg?w=800", headline: "Why Gold Coin Prices Vary Between Dealers", sub: "Read article →", slug: "why-gold-coin-prices-vary", tag: "Education" },
    { img: "https://images.pexels.com/photos/1602726/pexels-photo-1602726.jpeg?w=800", headline: "Is Silver a Good Investment in Australia in 2026?", sub: "Read analysis →", slug: "is-silver-good-investment-australia-2026", tag: "Analysis" },
    { img: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?w=800", headline: "Best Online Gold Dealers in Australia — Compared", sub: "Read comparison →", slug: "best-online-gold-dealers-australia", tag: "Comparison" },
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
    <div onClick={() => navigate("/magazine/" + slide.slug)} style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: mobile ? 6 : 8, cursor: "pointer", minWidth: 0 }}>
      <img src={slide.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "10px 12px" }}>
        {slide.tag && <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,0.18)", color: "#fff", padding: "2px 8px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{slide.tag}</span>}
      </div>
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
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/* ROOT APP                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */

function ProductRegistryPage({ metal, category, goldSpot, silverSpot }) {
  const navigate = useNavigate();
  const mobile   = useIsMobile();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const spot     = metal === "gold" ? goldSpot : silverSpot;
  const metalCap = metal === "gold" ? "Gold" : "Silver";
  const catCap   = category === "coin" ? "Coins" : "Bars";

  useSEO({
    title: metalCap + " " + catCap + " — Compare Prices | GoldSilverPrices.com.au",
    description: "Compare " + metalCap.toLowerCase() + " " + catCap.toLowerCase() + " prices from all major Australian bullion dealers. Updated twice daily.",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let q = supabase.from("prices_v2").select("coin_type,bar_brand,bar_type,weight_oz,weight_g,buy_price,dealer").eq("metal", metal).eq("category", category).eq("available", true).order("buy_price", { ascending:true });
        if (category === "coin") q = q.eq("weight_oz", 1);
        const { data, error } = await q;
        if (error) throw error;
        const groups = {};
        data.forEach(function(r) {
          var key, label, link, wOz;
          if (category === "coin") {
            if (!r.coin_type) return;
            key   = r.coin_type;
            label = r.coin_type;
            link  = "/" + metal + "/coin/" + r.coin_type.toLowerCase().replace(/s+/g, "-");
            wOz   = 1;
          } else {
            var wLabel = r.weight_oz ? r.weight_oz + "oz" : r.weight_g + "g";
            key   = (r.bar_brand || "") + "|" + (r.bar_type || "") + "|" + wLabel;
            var ts = r.bar_type ? r.bar_type.charAt(0).toUpperCase() + r.bar_type.slice(1) : "";
            label = [r.bar_brand || "", ts, wLabel].filter(Boolean).join(" ");
            link  = "/bars/" + metal + "/" + (r.bar_type || "cast") + "/" + wLabel;
            wOz   = r.weight_oz || (r.weight_g ? r.weight_g / 31.1035 : 1);
          }
          if (!groups[key]) groups[key] = { key, label, link, wOz, prices:[] };
          groups[key].prices.push({ price:r.buy_price, dealer:r.dealer });
        });
        const result = Object.values(groups).map(function(g) {
          const best    = Math.min.apply(null, g.prices.map(function(p){ return p.price; }));
          const match   = g.prices.find(function(p){ return p.price === best; });
          const spotVal = (spot || 0) * g.wOz;
          const prem    = spotVal > 0 ? +((best - spotVal) / spotVal * 100).toFixed(1) : null;
          return { key:g.key, label:g.label, link:g.link, best, dealer:match?match.dealer:"", n:new Set(g.prices.map(function(p){return p.dealer;})).size, prem };
        }).sort(function(a,b){ return (a.prem==null?999:a.prem)-(b.prem==null?999:b.prem); });
        setRows(result);
      } catch(e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [metal, category, spot]);

  function pc(p){ return p < 3 ? "#16A34A" : p < 7 ? "#D97706" : "#DC2626"; }

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} />
      <div style={{ maxWidth:1000, margin:"0 auto", padding:mobile?"14px 12px 60px":"28px 24px 60px" }}>
        <div style={{ fontSize:11, color:MUTED, marginBottom:14, display:"flex", gap:5 }}>
          <span onClick={()=>navigate("/")} style={{ cursor:"pointer", color:NAVY }}>Home</span>
          <span>›</span>
          <span style={{ color:SLATE }}>{metalCap} {catCap}</span>
        </div>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:mobile?20:26, fontWeight:700, color:NAVY, margin:"0 0 6px", fontFamily:"'Inter',system-ui,sans-serif" }}>{metalCap} {catCap}</h1>
          <p style={{ fontSize:13, color:MUTED, margin:0 }}>Best prices from Australian dealers · Updated twice daily · Sorted by lowest premium</p>
        </div>
        {loading ? (
          <div style={{ padding:"20px 14px", textAlign:"center", color:MUTED, fontSize:13 }}>Loading prices…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding:"20px 14px", textAlign:"center", color:MUTED, fontSize:13 }}>No products found.</div>
        ) : (
          <Card>
            {rows.filter(function(row){ return row.prem === null || (row.prem > -50 && row.prem < 200); }).map(function(row, i) { return (
              <div key={row.key} onClick={()=>navigate(row.link)}
                style={{ display:"flex", alignItems:"center", padding:"0 14px", minHeight:42, gap:8, background:i%2===0?"#fff":"#FAFBFC", borderBottom:"1px solid "+BORDER, cursor:"pointer", transition:"background .1s" }}
                onMouseEnter={function(e){e.currentTarget.style.background="#F0F4F8";}}
                onMouseLeave={function(e){e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC";}}>
                <span style={{ flex:1, fontSize:13, color:"#1E293B", textAlign:"left", paddingLeft:8 }}>{row.label}</span>
                {row.prem!==null && <span style={{ fontSize:12, fontWeight:600, color:pc(row.prem), minWidth:52, textAlign:"right" }}>{"+" + row.prem + "%"}</span>}
                <span style={{ fontSize:10, color:MUTED, marginRight:4 }}>from</span>
                <span style={{ fontSize:13, fontWeight:600, color:NAVY, whiteSpace:"nowrap" }}>{"A$"+row.best.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                <span style={{ fontSize:13, color:"#CBD5E1" }}>{"›"}</span>
              </div>
            ); })}
          </Card>
        )}
      </div>
    </div>
  );
}

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


function StaticPage({ title, children, goldSpot, silverSpot }) {
  const mobile   = useIsMobile();
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot || null} silverSpot={silverSpot || null} />
      <div style={{ maxWidth:740, margin:"0 auto", padding: mobile ? "28px 16px 60px" : "40px 24px 60px" }}>
        <div style={{ fontSize:11, color:MUTED, marginBottom:16, display:"flex", gap:5 }}>
          <span onClick={() => navigate("/")} style={{ cursor:"pointer", color:NAVY }}>Home</span>
          <span>{"›"}</span>
          <span style={{ color:SLATE }}>{title}</span>
        </div>
        <h1 style={{ fontSize: mobile?22:28, fontWeight:700, color:NAVY, margin:"0 0 24px", fontFamily:"'Inter',system-ui,sans-serif" }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Section({ h, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid "+BORDER, padding:"20px 22px", marginBottom:16 }}>
      {h && <h2 style={{ fontSize:14, fontWeight:700, color:NAVY, margin:"0 0 10px", fontFamily:"'Inter',system-ui,sans-serif" }}>{h}</h2>}
      {children}
    </div>
  );
}

function P({ children }) {
  return <p style={{ fontSize:13, color:SLATE, lineHeight:1.85, margin:"0 0 10px" }}>{children}</p>;
}

function AboutPage({ goldSpot, silverSpot }) {
  return (
    <StaticPage goldSpot={goldSpot} silverSpot={silverSpot} title="About GoldSilverPrices.com.au">
      <Section h="What we do">
        <P>GoldSilverPrices.com.au is an independent price comparison service for Australian bullion buyers. We track buy prices from major Australian dealers twice daily so you can find the lowest premium without visiting multiple websites.</P>
        <P>We cover gold and silver coins, cast bars, and minted bars from dealers including Ainslie Bullion, ABC Bullion, Perth Mint, KJC, Jaggards, Swan Bullion, and Guardian Gold.</P>
      </Section>
      <Section h="How it works">
        <P>Our scraper collects prices directly from dealer websites twice daily. Prices are stored in our database and displayed on the comparison tables within minutes of collection.</P>
        <P>We show the lowest available buy price for each product and calculate the premium over spot so you can make an informed decision quickly.</P>
      </Section>
      <Section h="Independence">
        <P>We are not affiliated with any dealer. We do not accept payment for placement or rankings. Dealers are listed because they are reputable Australian businesses — not because they pay us.</P>
        <P>If a dealer's prices are consistently high, they will appear lower in the rankings. That is the point.</P>
      </Section>
      <Section h="Contact">
        <P>{"Questions or feedback? Reach us at hello@goldsilverprices.com.au"}</P>
      </Section>
    </StaticPage>
  );
}

function PrivacyPage({ goldSpot, silverSpot }) {
  return (
    <StaticPage goldSpot={goldSpot} silverSpot={silverSpot} title="Privacy Policy">
      <Section>
        <P>Last updated: April 2026</P>
      </Section>
      <Section h="What we collect">
        <P>We do not require registration or login. We do not collect personal information from visitors browsing the site.</P>
        <P>If you contact us by email, we retain your email address and message content only to respond to your enquiry.</P>
      </Section>
      <Section h="Cookies and analytics">
        <P>We use anonymous analytics to understand how the site is used — pages visited, device type, and general location (country/state level). No personally identifiable data is collected.</P>
        <P>We do not use advertising cookies or sell data to third parties.</P>
      </Section>
      <Section h="Third party services">
        <P>Spot price data is fetched from a public gold price API. Dealer prices are scraped from publicly accessible dealer websites. No personal data is shared with these services.</P>
      </Section>
      <Section h="Data retention">
        <P>Price data is retained indefinitely for historical comparison. Contact emails are deleted once resolved. Analytics data is retained for 12 months.</P>
      </Section>
      <Section h="Contact">
        <P>{"Privacy questions: hello@goldsilverprices.com.au"}</P>
      </Section>
    </StaticPage>
  );
}

function ContactPage({ goldSpot, silverSpot }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  function handleSubmit() {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
  }
  const inp = { width:"100%", fontSize:13, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, background:"#fff", boxSizing:"border-box", outline:"none" };
  return (
    <StaticPage goldSpot={goldSpot} silverSpot={silverSpot} title="Contact">
      <Section h="Get in touch">
        <P>{"We'd love to hear from you — whether it's a missing dealer, a data error, or general feedback."}</P>
        <P>{"Email: hello@goldsilverprices.com.au"}</P>
      </Section>
      {sent ? (
        <Section>
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
            <div style={{ fontSize:14, fontWeight:600, color:NAVY, marginBottom:6 }}>Message sent!</div>
            <div style={{ fontSize:13, color:MUTED }}>{"We'll get back to you within 1-2 business days."}</div>
          </div>
        </Section>
      ) : (
        <Section h="Send a message">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:MUTED, marginBottom:4 }}>Name</div>
              <input style={inp} value={form.name} onChange={function(e){setForm(function(f){return{...f,name:e.target.value};});}} placeholder="Your name" />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:MUTED, marginBottom:4 }}>Email</div>
              <input style={inp} type="email" value={form.email} onChange={function(e){setForm(function(f){return{...f,email:e.target.value};});}} placeholder="your@email.com" />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:MUTED, marginBottom:4 }}>Message</div>
              <textarea style={{...inp, minHeight:120, resize:"vertical"}} value={form.message} onChange={function(e){setForm(function(f){return{...f,message:e.target.value};});}} placeholder="Your message..." />
            </div>
            <button onClick={handleSubmit} style={{ background:NAVY, color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", alignSelf:"flex-start" }}>
              Send message →
            </button>
          </div>
        </Section>
      )}
    </StaticPage>
  );
}

function DisclaimerPage({ goldSpot, silverSpot }) {
  return (
    <StaticPage goldSpot={goldSpot} silverSpot={silverSpot} title="Disclaimer">
      <Section h="Not financial advice">
        <P>The information on GoldSilverPrices.com.au is for informational purposes only. Nothing on this site constitutes financial advice, investment advice, or a recommendation to buy or sell any asset.</P>
        <P>Precious metals prices are volatile. Past performance does not guarantee future results. Always do your own research before making any investment decision.</P>
      </Section>
      <Section h="Price accuracy">
        <P>We make every effort to display accurate prices. However, dealer prices can change at any time. Always verify the current price directly with the dealer before purchasing.</P>
        <P>We are not responsible for discrepancies between prices shown on this site and prices charged by dealers at the time of purchase.</P>
      </Section>
      <Section h="Dealer relationships">
        <P>We are not affiliated with, endorsed by, or responsible for the actions of any dealer listed on this site. Transactions are between you and the dealer directly.</P>
      </Section>
      <Section h="Limitation of liability">
        <P>To the maximum extent permitted by Australian law, GoldSilverPrices.com.au accepts no liability for any loss or damage arising from use of this site or reliance on information displayed here.</P>
      </Section>
    </StaticPage>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
}


function CalculatorPage({ goldSpot, silverSpot }) {
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const [metal, setMetal]   = useState("gold");
  const [weight, setWeight] = useState("");
  const [unit, setUnit]     = useState("oz");
  const [purity, setPurity] = useState("999.9");
  const [result, setResult] = useState(null);

  useSEO({
    title: "Gold & Silver Calculator Australia | GoldSilverPrices.com.au",
    description: "Calculate the value of your gold or silver based on live spot prices.",
  });

  const PURITIES = {
    gold:   [["999.9","24ct — 99.99%"],["999","23.98ct — 99.9%"],["916","22ct — 91.6%"],["750","18ct — 75%"],["585","14ct — 58.5%"],["375","9ct — 37.5%"]],
    silver: [["999","Fine Silver 99.9%"],["925","Sterling Silver 92.5%"],["800","Silver 80%"]],
  };
  const UNITS = [["oz","Troy oz"],["g","Grams"],["kg","Kilograms"]];

  function toOz(w, u) {
    if (u==="oz") return parseFloat(w);
    if (u==="g")  return parseFloat(w)/31.1035;
    if (u==="kg") return parseFloat(w)/0.0311035;
    return 0;
  }

  function calculate() {
    const w = parseFloat(weight);
    if (!w||w<=0) return;
    const spot = metal==="gold" ? goldSpot : silverSpot;
    if (!spot) return;
    const oz   = toOz(w, unit);
    const pur  = parseFloat(purity)/1000;
    const gross = spot * oz * pur;
    setResult({ gross, low:gross*0.92, high:gross*0.97, spot, oz:oz*pur, metal });
  }

  const fmtA = (n) => "A$"+n.toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});

  return (
    <div style={{ minHeight:"100vh", background:BG }}>
      <Header goldSpot={goldSpot} silverSpot={silverSpot} />
      <div style={{ maxWidth:560, margin:"0 auto", padding: mobile?"20px 14px 60px":"36px 24px 60px" }}>

        <div style={{ fontSize:11, color:MUTED, marginBottom:16, display:"flex", gap:5 }}>
          <span onClick={()=>navigate("/")} style={{ cursor:"pointer", color:NAVY }}>Home</span>
          <span>{"›"}</span>
          <span style={{ color:SLATE }}>Calculator</span>
        </div>

        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:mobile?20:24, fontWeight:700, color:NAVY, margin:"0 0 6px", fontFamily:"'Inter',system-ui,sans-serif" }}>Gold & Silver Calculator</h1>
          <p style={{ fontSize:13, color:MUTED, margin:0 }}>Estimate the value of your bullion using live spot prices</p>
        </div>

        <div style={{ background:"#fff", borderRadius:10, border:"1px solid "+BORDER, padding:"20px", marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:MUTED, marginBottom:8 }}>Metal</div>
            <div style={{ display:"flex", gap:8 }}>
              {["gold","silver"].map(function(m){ return (
                <button key={m} onClick={()=>{setMetal(m);setPurity(m==="gold"?"999.9":"999");setResult(null);}}
                  style={{ flex:1, padding:"10px 0", fontSize:13, fontWeight:metal===m?600:400, background:metal===m?NAVY:"#fff", color:metal===m?"#fff":SLATE, border:"1px solid "+(metal===m?NAVY:BORDER), borderRadius:7, cursor:"pointer", fontFamily:"inherit" }}>
                  {m==="gold"?"🥇 Gold":"🥈 Silver"}
                </button>
              ); })}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:MUTED, marginBottom:8 }}>Weight</div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={weight} onChange={function(e){setWeight(e.target.value);setResult(null);}} placeholder="e.g. 1"
                style={{ flex:1, minWidth:0, fontSize:14, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, outline:"none", width:"100%", boxSizing:"border-box", background:"#fff", WebkitAppearance:"none" }} />
              <select value={unit} onChange={function(e){setUnit(e.target.value);setResult(null);}}
                style={{ fontSize:13, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, background:"#fff", outline:"none" }}>
                {UNITS.map(function(u){ return <option key={u[0]} value={u[0]}>{u[1]}</option>; })}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:600, color:MUTED, marginBottom:8 }}>Purity</div>
            <select value={purity} onChange={function(e){setPurity(e.target.value);setResult(null);}}
              style={{ width:"100%", fontSize:13, padding:"9px 12px", border:"1px solid "+BORDER, borderRadius:7, fontFamily:"inherit", color:NAVY, background:"#fff", outline:"none", WebkitAppearance:"auto" }}>
              {PURITIES[metal].map(function(p){ return <option key={p[0]} value={p[0]}>{p[1]}</option>; })}
            </select>
          </div>

          <button onClick={calculate}
            style={{ width:"100%", background:NAVY, color:"#fff", border:"none", borderRadius:8, padding:"12px 0", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Calculate →
          </button>
        </div>

        {result && (
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid "+BORDER, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:16 }}>Estimated Value</div>
            <div style={{ textAlign:"center", padding:"8px 0 20px" }}>
              <div style={{ fontSize:11, color:MUTED, marginBottom:4 }}>Spot value (fine metal)</div>
              <div style={{ fontSize:34, fontWeight:700, color:NAVY, fontFamily:"'Inter',system-ui,sans-serif" }}>{fmtA(result.gross)}</div>
              <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>{"Based on "+result.oz.toFixed(4)+" oz fine at A$"+result.spot.toLocaleString("en-AU")+"/oz"}</div>
            </div>
            <div style={{ borderTop:"1px solid "+BORDER, paddingTop:16, marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Typical dealer buyback range</div>
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ flex:1, background:BG, borderRadius:8, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>Conservative (92%)</div>
                  <div style={{ fontSize:16, fontWeight:700, color:NAVY }}>{fmtA(result.low)}</div>
                </div>
                <div style={{ flex:1, background:BG, borderRadius:8, padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>Optimistic (97%)</div>
                  <div style={{ fontSize:16, fontWeight:700, color:NAVY }}>{fmtA(result.high)}</div>
                </div>
              </div>
            </div>
            <p style={{ fontSize:11, color:MUTED, margin:"0 0 14px", lineHeight:1.7 }}>Buyback rates vary by dealer, product and market conditions. Always confirm directly with the dealer before selling.</p>
            <button onClick={()=>navigate("/sell")}
              style={{ width:"100%", background:"#fff", color:NAVY, border:"1px solid "+BORDER, borderRadius:8, padding:"10px 0", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {"Find dealers that buy "+result.metal+" →"}
            </button>
          </div>
        )}

        {!goldSpot && <p style={{ fontSize:11, color:MUTED, marginTop:12, textAlign:"center" }}>{"⚠️ Spot price loading — please wait"}</p>}
      </div>
    </div>
  );
}

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
      .eq("available", true)
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
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage {...sharedProps} />} />
      <Route path="/:metal/coin/:coinType" element={<ProductPage {...sharedProps} />} />
      <Route path="/gold" element={<HomePage {...sharedProps} defaultMetal="gold" />} />
      <Route path="/silver" element={<HomePage {...sharedProps} defaultMetal="silver" />} />
      <Route path="/bars" element={<HomePage {...sharedProps} defaultSection="bars" />} />
      <Route path="/dealers" element={<DealersPage {...sharedProps} />} />
      <Route path="/dealers/:dealerId" element={<DealerPage {...sharedProps} />} />
      <Route path="/bars/:metal/:barType/:size" element={<BarProductPage {...sharedProps} />} />
      <Route path="/gold/coins"   element={<ProductRegistryPage metal="gold"   category="coin" goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/silver/coins"  element={<ProductRegistryPage metal="silver" category="coin" goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/gold/bars"     element={<ProductRegistryPage metal="gold"   category="bar"  goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/silver/bars"   element={<ProductRegistryPage metal="silver" category="bar"  goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/calculator" element={<CalculatorPage goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/sell" element={<SellHubPage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
              <Route path="/sell/:metal/:category" element={<SellCategoryPage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
      <Route path="/magazine/:slug" element={<ArticlePage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
              <Route path="/about"      element={<AboutPage      goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/privacy"    element={<PrivacyPage    goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/contact"    element={<ContactPage    goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/disclaimer" element={<DisclaimerPage goldSpot={goldSpot} silverSpot={silverSpot} />} />
              <Route path="/magazine" element={<MagazinePage goldSpot={goldSpot} silverSpot={silverSpot} updated={updated} />} />
    </Routes>
    <Footer />
    </>
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