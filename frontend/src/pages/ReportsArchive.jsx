/**
 * ERP — ReportsArchive.jsx
 * Utilise l'instance axios du projet — même pattern que GestionStock.
 * TOUS les rapports apparaissent dans la section "Rapports archivés"
 */

import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios"; // même import que GestionStock

/* ─────────────────────────────────────────────────────────────────────────────
   PALETTE — cohérente avec GestionStock
───────────────────────────────────────────────────────────────────────────── */
const C = {
  bg:       "#f4f6f9",
  surface:  "#ffffff",
  border:   "#e3e8ef",
  accent:   "#2563eb",
  accentLt: "#eff4ff",
  green:    "#16a34a",
  greenLt:  "#f0fdf4",
  red:      "#dc2626",
  redLt:    "#fef2f2",
  amber:    "#d97706",
  amberLt:  "#fffbeb",
  purple:   "#7c3aed",
  purpleLt: "#f5f3ff",
  sky:      "#0284c7",
  skyLt:    "#f0f9ff",
  orange:   "#ea580c",
  orangeLt: "#fff7ed",
  text:     "#111827",
  sub:      "#374151",
  muted:    "#6b7280",
  inputBg:  "#f9fafb",
};

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const s = {
  app: { fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", background: C.bg, minHeight: "100vh", color: C.text },
  topbar: {
    background: C.surface, borderBottom: `1px solid ${C.border}`,
    padding: "0 2rem", display: "flex", alignItems: "center",
    justifyContent: "space-between", height: 60,
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  logo: {
    width: 34, height: 34, background: C.accent, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1rem", fontWeight: 700, color: "#fff",
  },
  h1:    { margin: 0, fontSize: "1rem", fontWeight: 600, color: C.text },
  h1sub: { margin: 0, fontSize: "0.75rem", color: C.muted },
  badgeOnline: {
    background: C.greenLt, color: C.green, border: "1px solid #bbf7d0",
    borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600,
    display: "flex", alignItems: "center", gap: 4,
  },
  dot:       { width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" },
  badgeSync: {
    background: C.accentLt, color: C.accent, border: "1px solid #bfdbfe",
    borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600,
  },
  main: { padding: "1.75rem 2rem", maxWidth: 1400, margin: "0 auto" },

  kpiRow: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "1rem", marginBottom: "1.75rem" },
  kpiCard: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer",
  },
  kpiIcon: (lt) => ({
    width: 36, height: 36, borderRadius: 8, background: lt,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1rem", flexShrink: 0,
  }),
  kpiLabel: { margin: "0 0 1px", fontSize: "0.68rem", color: C.muted, fontWeight: 500 },
  kpiVal:   (color) => ({ margin: 0, fontSize: "1.4rem", fontWeight: 700, color, lineHeight: 1 }),

  tabRow: {
    display: "flex", gap: "0.25rem", marginBottom: "1.5rem",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "4px", width: "fit-content",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  tab: (active) => ({
    padding: "0.5rem 1.1rem", border: "none", borderRadius: 7,
    cursor: "pointer", fontSize: "0.85rem",
    fontWeight: active ? 600 : 400,
    background: active ? C.accent : "transparent",
    color: active ? "#fff" : C.muted,
    transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap",
  }),

  section: {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "1.5rem", marginBottom: "1.25rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: `1px solid ${C.border}`,
  },
  sectionTitle: { margin: 0, fontSize: "0.9rem", fontWeight: 600, color: C.text },
  sectionSub:   { margin: 0, fontSize: "0.78rem", color: C.muted },

  filterRow: { display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "1.25rem" },
  fg:    { display: "flex", flexDirection: "column", gap: "0.3rem" },
  label: { fontSize: "0.75rem", fontWeight: 500, color: C.sub },
  input: {
    padding: "0.55rem 0.85rem", background: C.inputBg,
    border: `1px solid ${C.border}`, borderRadius: 7,
    color: C.text, fontSize: "0.85rem", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  },
  select: {
    padding: "0.55rem 0.85rem", background: C.inputBg,
    border: `1px solid ${C.border}`, borderRadius: 7,
    color: C.text, fontSize: "0.85rem", fontFamily: "inherit",
    outline: "none", cursor: "pointer",
  },
  btnPrimary: {
    background: C.accent, color: "#fff", border: "none", borderRadius: 7,
    padding: "0.55rem 1.25rem", fontFamily: "inherit",
    fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
  },
  btnGhost: {
    background: C.inputBg, color: C.sub, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "0.45rem 0.85rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.8rem", cursor: "pointer",
  },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  thead: { background: C.bg },
  th: {
    textAlign: "left", padding: "0.6rem 0.9rem",
    borderBottom: `1px solid ${C.border}`,
    color: C.muted, fontWeight: 600, fontSize: "0.72rem",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  tr: (i) => ({ background: i % 2 === 0 ? "#fff" : C.bg }),
  td: { padding: "0.75rem 0.9rem", borderBottom: `1px solid ${C.border}`, color: C.sub, verticalAlign: "middle" },

  pill: (bg, color, border) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
    fontWeight: 600, background: bg, color, border: `1px solid ${border}`,
  }),
  alertBox: (bg, border, color) => ({
    background: bg, border: `1px solid ${border}`,
    borderLeft: `3px solid ${color}`, borderRadius: 8,
    padding: "0.75rem 1rem", marginBottom: "1rem",
    fontSize: "0.85rem", color, display: "flex", alignItems: "flex-start", gap: "0.5rem",
  }),
  infoBox: {
    background: C.accentLt, border: "1px solid #bfdbfe",
    borderLeft: `3px solid ${C.accent}`, borderRadius: 8,
    padding: "0.75rem 1rem", marginBottom: "1.25rem",
    fontSize: "0.85rem", color: "#1d4ed8", lineHeight: 1.5,
  },
  emptyState: {
    textAlign: "center", padding: "3rem", color: C.muted,
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
  },
  emptyIcon: { fontSize: "2.5rem" },

  /* Drawer */
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, backdropFilter: "blur(2px)" },
  drawer: {
    position: "fixed", right: 0, top: 0, bottom: 0,
    width: "min(660px,95vw)", background: C.bg, zIndex: 201,
    display: "flex", flexDirection: "column",
    boxShadow: "-4px 0 28px rgba(0,0,0,0.14)", overflowY: "auto",
  },
  drawerHeader: {
    padding: "1rem 1.25rem", borderBottom: `1px solid ${C.border}`,
    background: C.surface, display: "flex", alignItems: "center", gap: "0.75rem",
    position: "sticky", top: 0, zIndex: 10,
  },
  drawerBody:  { padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" },
  tabsDrawer:  { display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface },
  tabDrawer: (active) => ({
    padding: "0.65rem 1.1rem", border: "none", background: "none",
    cursor: "pointer", fontSize: "0.82rem",
    fontWeight: active ? 600 : 400, color: active ? C.accent : C.muted,
    borderBottom: `2px solid ${active ? C.accent : "transparent"}`,
    fontFamily: "inherit",
  }),
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  metaCard:  { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0.75rem 1rem" },
  metaLabel: { margin: "0 0 3px", fontSize: "0.68rem", fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" },
  metaVal:   { margin: 0, fontSize: "0.9rem", fontWeight: 600, color: C.text },
  jsonBox: {
    background: "#1e293b", borderRadius: 8, padding: "1rem",
    fontFamily: "ui-monospace,'IBM Plex Mono',monospace",
    fontSize: "0.78rem", lineHeight: 1.7, color: "#94a3b8",
    maxHeight: 480, overflowY: "auto", overflowX: "auto",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────────────────────────────────────── */
const REPORT_TYPES = [
  { value: "daily",         label: "Journalier",      icon: "📅", color: C.accent,  lt: C.accentLt  },
  { value: "weekly",        label: "Hebdomadaire",    icon: "📊", color: C.green,   lt: C.greenLt   },
  { value: "production-of", label: "Production (OF)", icon: "📦", color: C.orange,  lt: C.orangeLt  },
  { value: "maintenance",   label: "Maintenance",     icon: "🔧", color: C.amber,   lt: C.amberLt   },
  { value: "performance",   label: "Perf. (OEE)",     icon: "⚡", color: C.purple,  lt: C.purpleLt  },
  { value: "traceability",  label: "Traçabilité",     icon: "🔍", color: C.sky,     lt: C.skyLt     },
];
const TYPE_MAP = Object.fromEntries(REPORT_TYPES.map(t => [t.value, t]));

const STATUS_CFG = {
  archived:  { bg: C.greenLt,  color: C.green,  border: "#bbf7d0", label: "✓ Archivé"  },
  processed: { bg: C.accentLt, color: C.accent, border: "#bfdbfe", label: "⚡ Traité"  },
  error:     { bg: C.redLt,    color: C.red,    border: "#fecaca", label: "✕ Erreur"   },
};

const todayISO  = () => new Date().toISOString().slice(0, 10);
const thirtyAgo = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
const dateShort = (d) => d
  ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";
const dateOnly = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("fr-FR") : "—";
const timeAgo  = (iso) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "à l'instant";
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
};
const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
};

/* ─────────────────────────────────────────────────────────────────────────────
   JSON VIEWER
───────────────────────────────────────────────────────────────────────────── */
const JsonLine = ({ data, depth = 0 }) => {
  const [open, setOpen] = React.useState(depth < 1);
  if (data === null)             return <span style={{ color: "#f87171" }}>null</span>;
  if (typeof data === "boolean") return <span style={{ color: "#c084fc" }}>{String(data)}</span>;
  if (typeof data === "number")  return <span style={{ color: "#fb923c" }}>{data}</span>;
  if (typeof data === "string")  return <span style={{ color: "#86efac" }}>"{data}"</span>;
  const isArr   = Array.isArray(data);
  const entries = isArr ? data.map((v, i) => [i, v]) : Object.entries(data);
  const [ob, cb] = isArr ? ["[", "]"] : ["{", "}"];
  if (!entries.length) return <span style={{ color: "#94a3b8" }}>{ob}{cb}</span>;
  return (
    <span>
      <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "0.78rem", padding: "0 2px", fontFamily: "inherit" }}>
        {open ? "▾" : "▸"}
      </button>
      <span style={{ color: "#94a3b8" }}>{ob}</span>
      {!open && <span><span style={{ color: "#475569", cursor: "pointer" }} onClick={() => setOpen(true)}>…{entries.length} éléments…</span><span style={{ color: "#94a3b8" }}>{cb}</span></span>}
      {open && (
        <span>
          {entries.map(([k, v], i) => (
            <div key={k} style={{ paddingLeft: 16 }}>
              {!isArr && <span style={{ color: "#38bdf8" }}>"{k}": </span>}
              <JsonLine data={v} depth={depth + 1} />
              {i < entries.length - 1 && <span style={{ color: "#475569" }}>,</span>}
            </div>
          ))}
          <div><span style={{ color: "#94a3b8" }}>{cb}</span></div>
        </span>
      )}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   DRAWER DÉTAIL
───────────────────────────────────────────────────────────────────────────── */
const DetailDrawer = ({ report, onClose }) => {
  const [tab, setTab] = useState("resume");
  const t       = TYPE_MAP[report.report_type] || REPORT_TYPES[0];
  const summary = report.payload?.summary || report.payload?.production || report.payload?.oee || {};
  const summaryEntries = Object.entries(summary).filter(([, v]) => typeof v !== "object" && v !== null);

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.drawer}>

        {/* Header */}
        <div style={s.drawerHeader}>
          <div style={{ ...s.kpiIcon(t.lt), width: 38, height: 38 }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: C.text }}>
              {t.label} — {report.period_label}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: C.muted }}>
              ID #{report.id} · reçu {dateShort(report.received_at)}
            </p>
          </div>
          <button style={s.btnGhost}
            onClick={() => downloadJSON(report.payload, `mes_rapport_${report.id}.json`)}>
            ⬇ JSON
          </button>
          <button onClick={onClose} style={{ ...s.btnGhost, padding: "0.45rem 0.7rem" }}>✕</button>
        </div>

        {/* Tabs drawer */}
        <div style={s.tabsDrawer}>
          {[["resume", "📋 Résumé"], ["payload", "{ } Données brutes"], ["meta", "ℹ️ Métadonnées"]].map(([k, l]) => (
            <button key={k} style={s.tabDrawer(tab === k)} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* Body */}
        <div style={s.drawerBody}>
          {tab === "resume" && (
            summaryEntries.length > 0
              ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.75rem" }}>
                  {summaryEntries.map(([k, v]) => (
                    <div key={k} style={s.metaCard}>
                      <p style={s.metaLabel}>{k.replace(/_/g, " ")}</p>
                      <p style={s.metaVal}>{typeof v === "number" ? v.toLocaleString("fr-FR") : String(v ?? "—")}</p>
                    </div>
                  ))}
                </div>
              : <div style={s.emptyState}><div style={s.emptyIcon}>📭</div><p>Pas de résumé pour ce type.</p></div>
          )}
          {tab === "payload" && (
            <div style={s.jsonBox}><JsonLine data={report.payload} depth={0} /></div>
          )}
          {tab === "meta" && (
            <div style={s.metaGrid}>
              {[
                ["ID",         `#${report.id}`],
                ["Type",       t.label],
                ["Période",    report.period_label],
                ["Du",         dateOnly(report.date_from)],
                ["Au",         dateOnly(report.date_to)],
                ["Reçu le",    dateShort(report.received_at)],
                ["Envoyé par", report.sent_by || "MES"],
                ["Statut",     report.status],
              ].map(([label, value]) => (
                <div key={label} style={s.metaCard}>
                  <p style={s.metaLabel}>{label}</p>
                  <p style={s.metaVal}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN — TOUS LES RAPPORTS SONT AFFICHÉS
───────────────────────────────────────────────────────────────────────────── */
const ReportsArchive = () => {
  const [tab,        setTab]        = useState("liste");
  const [reports,    setReports]    = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState({ text: "", type: "" });
  const [selected,   setSelected]   = useState(null);
  const [filterType, setFilterType] = useState("");
  const [dateFrom,   setDateFrom]   = useState(thirtyAgo());
  const [dateTo,     setDateTo]     = useState(todayISO());
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(0);
  const LIMIT = 50;

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  /* ── Appels API ── */
  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const r = await api.get("/api/erp/reports/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(r.data);
    } catch (e) {
      console.error("stats:", e.response?.status, e.response?.data || e.message);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = { limit: LIMIT, offset: page * LIMIT };
      if (filterType) params.report_type = filterType;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const r = await api.get("/api/erp/reports/", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      // TOUS les rapports sont affichés (pas de filtre)
      setReports(r.data);
      
    } catch (e) {
      showMsg("❌ " + (e.response?.data?.detail || "Impossible de charger les rapports archivés."), "error");
    } finally {
      setLoading(false);
    }
  }, [filterType, dateFrom, dateTo, page]);

  const loadDetail = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const r = await api.get(`/api/erp/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelected(r.data);
    } catch (e) {
      showMsg("❌ " + (e.response?.data?.detail || "Impossible de charger le détail."), "error");
    }
  };

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadReports(); }, [loadReports]);

  /* Filtrage texte côté client - TOUS les rapports */
  const displayed = search
    ? reports.filter(r =>
        r.period_label.toLowerCase().includes(search.toLowerCase()) ||
        r.report_type.toLowerCase().includes(search.toLowerCase()) ||
        (r.sent_by || "").toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  const tabs = [
    { id: "liste", label: "📋 Rapports archivés" },
    { id: "stats", label: "📊 Statistiques"       },
  ];

  /* ─── RENDER ─── */
  return (
    <div style={s.app}>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>R</div>
          <div>
            <p style={s.h1}>ERP — Archive des Rapports MES</p>
            <p style={s.h1sub}>Rapports reçus automatiquement depuis le système MES</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={s.badgeOnline}><span style={s.dot} />En ligne</span>
          <span style={s.badgeSync}>Sync MES</span>
          <button style={s.btnGhost} onClick={() => { loadReports(); loadStats(); }}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div style={s.main}>

        {/* MESSAGES */}
        {msg.text && (
          <div style={s.alertBox(
            msg.type === "error" ? C.redLt : C.greenLt,
            msg.type === "error" ? "#fecaca" : "#bbf7d0",
            msg.type === "error" ? C.red    : C.green,
          )}>
            {msg.text}
          </div>
        )}

        {/* INFO */}
        <div style={s.infoBox}>
          📊 Les rapports sont envoyés <strong>automatiquement</strong> par le MES après chaque génération.
          Ils sont archivés ici dans l'ERP pour consultation et traçabilité.
          <br />
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            Tous les types de rapports (journaliers, hebdomadaires, production, maintenance, performance, traçabilité) sont disponibles.
          </span>
        </div>

        {/* KPI STATS — cliquables pour filtrer */}
        <div style={s.kpiRow}>
          {REPORT_TYPES.map(t => {
            const count  = stats?.[t.value] ?? 0;
            const active = filterType === t.value;
            return (
              <div
                key={t.value}
                style={{
                  ...s.kpiCard,
                  border:     active ? `2px solid ${t.color}` : `1px solid ${C.border}`,
                  boxShadow:  active ? `0 0 0 3px ${t.color}22` : "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onClick={() => { setFilterType(active ? "" : t.value); setPage(0); }}
              >
                <div style={s.kpiIcon(t.lt)}>{t.icon}</div>
                <div>
                  <p style={s.kpiLabel}>{t.label}</p>
                  <p style={s.kpiVal(active ? t.color : C.text)}>{stats ? count : "…"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABS */}
        <div style={s.tabRow}>
          {tabs.map(t => (
            <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── LISTE ─────────────────────────────────────── */}
        {tab === "liste" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>Rapports archivés</p>
                <p style={s.sectionSub}>{displayed.length} rapport(s) affiché(s)</p>
              </div>
              {filterType && (
                <span style={s.pill(TYPE_MAP[filterType]?.lt, TYPE_MAP[filterType]?.color, `${TYPE_MAP[filterType]?.color}44`)}>
                  {TYPE_MAP[filterType]?.icon} {TYPE_MAP[filterType]?.label}
                  <button onClick={() => setFilterType("")}
                    style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4, color: "inherit", fontSize: "0.8rem" }}>
                    ✕
                  </button>
                </span>
              )}
            </div>

            {/* Filtres */}
            <div style={s.filterRow}>
              <div style={s.fg}>
                <label style={s.label}>Recherche</label>
                <input style={{ ...s.input, width: 220 }}
                  placeholder="Période, type, source…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>Type</label>
                <select style={{ ...s.select, width: 180 }} value={filterType}
                  onChange={e => { setFilterType(e.target.value); setPage(0); }}>
                  <option value="">Tous les types</option>
                  {REPORT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div style={s.fg}>
                <label style={s.label}>Du</label>
                <input style={s.input} type="date" value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPage(0); }} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>Au</label>
                <input style={s.input} type="date" value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPage(0); }} />
              </div>
              <button style={s.btnPrimary} onClick={() => { loadReports(); loadStats(); }}>
                🔍 Filtrer
              </button>
              <button style={s.btnGhost} onClick={() => {
                setFilterType(""); setDateFrom(thirtyAgo());
                setDateTo(todayISO()); setSearch(""); setPage(0);
              }}>
                ↺ Réinitialiser
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>⏳</div>
                <p style={{ fontWeight: 500, color: C.sub }}>Chargement…</p>
              </div>
            ) : displayed.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <p style={{ fontWeight: 500, color: C.sub }}>Aucun rapport archivé</p>
                <p style={{ fontSize: "0.85rem" }}>
                  Les rapports apparaîtront ici dès que le MES en enverra.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {["ID", "Type", "Période", "Du", "Au", "Reçu le", "Source", "Statut", "Actions"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((r, i) => {
                      const t  = TYPE_MAP[r.report_type] || REPORT_TYPES[0];
                      const sc = STATUS_CFG[r.status]    || STATUS_CFG.archived;
                      return (
                        <tr key={r.id} style={s.tr(i)}>
                          <td style={s.td}>
                            <code style={{ color: C.accent, fontSize: "0.8rem", background: C.accentLt, padding: "1px 6px", borderRadius: 4 }}>
                              #{r.id}
                            </code>
                           </td>
                          <td style={s.td}>
                            <span style={s.pill(t.lt, t.color, `${t.color}44`)}>
                              {t.icon} {t.label}
                            </span>
                           </td>
                          <td style={{ ...s.td, fontWeight: 600, color: C.text }}>{r.period_label}</td>
                          <td style={{ ...s.td, color: C.muted, fontSize: "0.82rem" }}>{dateOnly(r.date_from)}</td>
                          <td style={{ ...s.td, color: C.muted, fontSize: "0.82rem" }}>{dateOnly(r.date_to)}</td>
                          <td style={s.td}>
                            <span style={{ fontSize: "0.82rem" }}>{dateShort(r.received_at)}</span>
                            <br />
                            <span style={{ fontSize: "0.72rem", color: C.muted }}>{timeAgo(r.received_at)}</span>
                           </td>
                          <td style={s.td}>
                            <span style={s.pill(
                              (r.sent_by || "").includes("MES") ? C.purpleLt : C.accentLt,
                              (r.sent_by || "").includes("MES") ? C.purple   : C.accent,
                              (r.sent_by || "").includes("MES") ? "#ddd6fe"  : "#bfdbfe",
                            )}>
                              {r.sent_by || "MES"}
                            </span>
                           </td>
                          <td style={s.td}>
                            <span style={s.pill(sc.bg, sc.color, sc.border)}>{sc.label}</span>
                           </td>
                          <td style={s.td}>
                            <button style={s.btnGhost} onClick={() => loadDetail(r.id)}>
                              👁 Voir
                            </button>
                           </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && reports.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "0.75rem", borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: "0.8rem", color: C.muted }}>
                  Page {page + 1} · {displayed.length} entrée(s)
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={s.btnGhost} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                    ← Précédent
                  </button>
                  <button style={s.btnGhost} onClick={() => setPage(p => p + 1)} disabled={reports.length < LIMIT}>
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STATISTIQUES ─────────────────────────────── */}
        {tab === "stats" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>Statistiques par type de rapport</p>
                <p style={s.sectionSub}>Nombre de rapports archivés reçus depuis le MES</p>
              </div>
            </div>
            {!stats ? (
              <div style={s.emptyState}><div style={s.emptyIcon}>⏳</div><p>Chargement…</p></div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                  {REPORT_TYPES.map(t => {
                    const count = stats[t.value] ?? 0;
                    const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
                    const pct   = Math.round((count / total) * 100);
                    return (
                      <div key={t.value} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                          <div style={s.kpiIcon(t.lt)}>{t.icon}</div>
                          <div>
                            <p style={s.kpiLabel}>{t.label}</p>
                            <p style={s.kpiVal(t.color)}>{count}</p>
                          </div>
                        </div>
                        <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: t.color, borderRadius: 3 }} />
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: C.muted }}>{pct}% du total</p>
                      </div>
                    );
                  })}
                </div>
                <div style={s.infoBox}>
                  📊 Total archivé : <strong>{Object.values(stats).reduce((a, b) => a + b, 0)} rapport(s)</strong> reçus depuis le MES.
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* DRAWER */}
      {selected && <DetailDrawer report={selected} onClose={() => setSelected(null)} />}

    </div>
  );
};

export default ReportsArchive;