/**
 * ERP — ReportsArchive.jsx
 * Rend la totalité du payload MES sans perte : toutes les sections,
 * tous les tableaux imbriqués, tous les scalaires.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";

/* ─────────────────────────────────────────────────────────────────────────────
   TRADUCTIONS
───────────────────────────────────────────────────────────────────────────── */
const translations = {
  fr: {
    // Général
    loading: "Chargement...",
    saving: "Enregistrement...",
    error: "Erreur",
    success: "Succès",
    close: "Fermer",
    cancel: "Annuler",
    confirm: "Confirmer",
    delete: "Supprimer",
    filter: "Filtrer",
    reset: "Réinitialiser",
    see: "Voir",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    entries: "entrée(s)",
    
    // Topbar
    appTitle: "ERP — Archive des Rapports MES",
    appSubtitle: "Rapports reçus automatiquement depuis le système MES",
    online: "En ligne",
    syncMES: "Sync MES",
    
    // Info box
    infoTitle: "📊 Rapports MES",
    infoText: "Les rapports sont envoyés automatiquement par le MES après chaque génération. Ils sont archivés ici dans l'ERP pour consultation et traçabilité. Le payload MES est affiché de façon lisible, avec certains détails techniques masqués selon le type de rapport.",
    infoHint: "Cliquez sur \"Voir\" pour ouvrir le rapport complet (toutes sections, tableaux, KPIs, étapes, rejets…).",
    
    // Report types
    reportTypes: {
      daily: "Journalier",
      weekly: "Hebdomadaire",
      "production-of": "Production (OF)",
      maintenance: "Maintenance",
      performance: "Perf. (OEE)",
      traceability: "Traçabilité",
    },
    
    // Status
    status: {
      archived: "✓ Archivé",
      processed: "⚡ Traité",
      error: "✕ Erreur",
    },
    
    // Tabs
    tabList: "📋 Rapports archivés",
    tabStats: "📊 Statistiques",
    
    // Filters
    search: "Recherche",
    searchPlaceholder: "Période, type, source…",
    reportType: "Type",
    allTypes: "Tous les types",
    from: "Du",
    to: "Au",
    
    // Table headers
    colId: "ID",
    colType: "Type",
    colPeriod: "Période",
    colFrom: "Du",
    colTo: "Au",
    colReceived: "Reçu le",
    colSource: "Source",
    colStatus: "Statut",
    colActions: "Actions",
    
    // Drawer
    drawerTitle: "Rapport complet MES",
    drawerSubtitle: "section(s) dans le payload",
    metadata: "Métadonnées du rapport",
    receivedAt: "Reçu le",
    source: "Source",
    attachments: "Fichiers joints MES",
    downloadPDF: "Télécharger PDF",
    downloadExcel: "Télécharger Excel",
    emptyPayload: "Payload vide — aucune donnée MES.",
    
    // Stats
    statsTitle: "Statistiques par type de rapport",
    statsSubtitle: "Nombre de rapports archivés reçus depuis le MES",
    totalArchived: "Total archivé",
    ofTotal: "du total",
    rapport: "rapport",
    rapports: "rapports",
    
    // Messages
    errorLoadReports: "Impossible de charger les rapports archivés.",
    errorLoadDetail: "Impossible de charger le détail.",
    errorLoadStats: "Impossible de charger les statistiques.",
    noReports: "Aucun rapport archivé",
    noReportsHint: "Les rapports apparaîtront ici dès que le MES en enverra.",
    noStats: "Chargement…",
  },
  en: {
    // General
    loading: "Loading...",
    saving: "Saving...",
    error: "Error",
    success: "Success",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    filter: "Filter",
    reset: "Reset",
    see: "View",
    previous: "Previous",
    next: "Next",
    page: "Page",
    entries: "entry(s)",
    
    // Topbar
    appTitle: "ERP — MES Reports Archive",
    appSubtitle: "Reports automatically received from MES system",
    online: "Online",
    syncMES: "MES Sync",
    
    // Info box
    infoTitle: "📊 MES Reports",
    infoText: "Reports are automatically sent by MES after each generation. They are archived here in the ERP for consultation and traceability. The MES payload is displayed in a readable format, with some technical details hidden depending on the report type.",
    infoHint: "Click \"View\" to open the complete report (all sections, tables, KPIs, steps, rejects…).",
    
    // Report types
    reportTypes: {
      daily: "Daily",
      weekly: "Weekly",
      "production-of": "Production (MO)",
      maintenance: "Maintenance",
      performance: "Performance (OEE)",
      traceability: "Traceability",
    },
    
    // Status
    status: {
      archived: "✓ Archived",
      processed: "⚡ Processed",
      error: "✕ Error",
    },
    
    // Tabs
    tabList: "📋 Archived Reports",
    tabStats: "📊 Statistics",
    
    // Filters
    search: "Search",
    searchPlaceholder: "Period, type, source…",
    reportType: "Type",
    allTypes: "All types",
    from: "From",
    to: "To",
    
    // Table headers
    colId: "ID",
    colType: "Type",
    colPeriod: "Period",
    colFrom: "From",
    colTo: "To",
    colReceived: "Received",
    colSource: "Source",
    colStatus: "Status",
    colActions: "Actions",
    
    // Drawer
    drawerTitle: "Complete MES Report",
    drawerSubtitle: "section(s) in payload",
    metadata: "Report Metadata",
    receivedAt: "Received",
    source: "Source",
    attachments: "MES Attachments",
    downloadPDF: "Download PDF",
    downloadExcel: "Download Excel",
    emptyPayload: "Empty payload — no MES data.",
    
    // Stats
    statsTitle: "Statistics by report type",
    statsSubtitle: "Number of archived reports received from MES",
    totalArchived: "Total archived",
    ofTotal: "of total",
    rapport: "report",
    rapports: "reports",
    
    // Messages
    errorLoadReports: "Unable to load archived reports.",
    errorLoadDetail: "Unable to load details.",
    errorLoadStats: "Unable to load statistics.",
    noReports: "No archived reports",
    noReportsHint: "Reports will appear here as soon as MES sends them.",
    noStats: "Loading…",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   PALETTE FACTORY (dark / light)
───────────────────────────────────────────────────────────────────────────── */
const makeC = (isDark) => ({
  bg:       isDark ? "#0f172a" : "#f4f6f9",
  surface:  isDark ? "#1e293b" : "#ffffff",
  border:   isDark ? "#334155" : "#e3e8ef",
  accent:   "#2563eb",
  accentLt: isDark ? "#1e3a5f" : "#eff4ff",
  green:    "#16a34a",
  greenLt:  isDark ? "#14532d" : "#f0fdf4",
  red:      "#dc2626",
  redLt:    isDark ? "#7f1d1d" : "#fef2f2",
  amber:    "#d97706",
  amberLt:  isDark ? "#78350f" : "#fffbeb",
  purple:   "#7c3aed",
  purpleLt: isDark ? "#3b0764" : "#f5f3ff",
  sky:      "#0284c7",
  skyLt:    isDark ? "#082f49" : "#f0f9ff",
  orange:   "#ea580c",
  orangeLt: isDark ? "#7c2d12" : "#fff7ed",
  text:     isDark ? "#f1f5f9" : "#111827",
  sub:      isDark ? "#cbd5e1" : "#374151",
  muted:    isDark ? "#94a3b8" : "#6b7280",
  inputBg:  isDark ? "#0f172a" : "#f9fafb",
  trOdd:    isDark ? "#1e293b" : "#ffffff",
  trEven:   isDark ? "#162032" : "#f4f6f9",
});

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES FACTORY (dynamique avec thème)
───────────────────────────────────────────────────────────────────────────── */
const makeS = (C) => ({
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
  tr: (i) => ({ background: i % 2 === 0 ? C.trOdd : C.trEven }),
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
    fontSize: "0.85rem", color: C.accent, lineHeight: 1.5,
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
    width: "min(920px,96vw)", background: C.bg, zIndex: 201,
    display: "flex", flexDirection: "column",
    boxShadow: "-4px 0 28px rgba(0,0,0,0.14)", overflowY: "auto",
  },
  drawerHeader: {
    padding: "1rem 1.25rem", borderBottom: `1px solid ${C.border}`,
    background: C.surface, display: "flex", alignItems: "center", gap: "0.75rem",
    position: "sticky", top: 0, zIndex: 10, flexWrap: "wrap",
  },
  drawerBody:  { padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" },
  metaCard:  { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "0.75rem 1rem" },
  metaLabel: { margin: "0 0 3px", fontSize: "0.68rem", fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" },
  metaVal:   { margin: 0, fontSize: "0.9rem", fontWeight: 600, color: C.text },
});

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTES (dynamiques avec le thème)
───────────────────────────────────────────────────────────────────────────── */
const getReportTypes = (C, t) => [
  { value: "daily",         label: t.reportTypes.daily,      icon: "📅", color: C.accent,  lt: C.accentLt  },
  { value: "weekly",        label: t.reportTypes.weekly,     icon: "📊", color: C.green,   lt: C.greenLt   },
  { value: "production-of", label: t.reportTypes["production-of"], icon: "📦", color: C.orange,  lt: C.orangeLt  },
  { value: "maintenance",   label: t.reportTypes.maintenance,icon: "🔧", color: C.amber,   lt: C.amberLt   },
  { value: "performance",   label: t.reportTypes.performance,icon: "⚡", color: C.purple,  lt: C.purpleLt  },
  { value: "traceability",  label: t.reportTypes.traceability,icon: "🔍", color: C.sky,     lt: C.skyLt     },
];

const getStatusCfg = (C, t) => ({
  archived:  { bg: C.greenLt,  color: C.green,  border: "#bbf7d0", label: t.status.archived  },
  processed: { bg: C.accentLt, color: C.accent, border: "#bfdbfe", label: t.status.processed  },
  error:     { bg: C.redLt,    color: C.red,    border: "#fecaca", label: t.status.error     },
});

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITAIRES DATE
───────────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS PAYLOAD
───────────────────────────────────────────────────────────────────────────── */
const fmtKey = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const fmtVal = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "number")  return v.toLocaleString("fr-FR");
  return String(v);
};

/* Aplatit récursivement tout le payload pour l'export CSV. */
const flattenJSON = (obj, prefix = "") => {
  const result = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          Object.assign(result, flattenJSON(item, `${key}[${i}]`));
        } else {
          result[`${key}[${i}]`] = item;
        }
      });
    } else if (typeof v === "object" && v !== null) {
      Object.assign(result, flattenJSON(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
};

const HIDDEN_DAILY_DETAIL_KEY_RE = /(production.*detail|detail.*production|productions?.*detail|detail.*productions?)/i;

const pruneReportPayload = (value, reportType) => {
  if (Array.isArray(value)) {
    return value.map(item => pruneReportPayload(item, reportType));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !(reportType === "daily" && HIDDEN_DAILY_DETAIL_KEY_RE.test(key)))
        .map(([key, childValue]) => [key, pruneReportPayload(childValue, reportType)])
    );
  }

  return value;
};

const getReportPayload = (report) => pruneReportPayload(report?.payload || {}, report?.report_type);

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT JSON
───────────────────────────────────────────────────────────────────────────── */
const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT CSV — payload complet aplati
───────────────────────────────────────────────────────────────────────────── */
const downloadCSV = (report, t, reportTypeLabel) => {
  const flatPayload = flattenJSON(getReportPayload(report));
  const rows = [
    ["Champ", "Valeur"],
    ["--- Métadonnées rapport ---", ""],
    ["ID", `#${report.id}`],
    ["Type", reportTypeLabel],
    ["Période", report.period_label],
    ["Du", dateOnly(report.date_from)],
    ["Au", dateOnly(report.date_to)],
    ["Reçu le", dateShort(report.received_at)],
    ["Envoyé par", report.sent_by || "MES"],
    ["Statut", report.status],
    ["--- Données MES (payload complet) ---", ""],
    ...Object.entries(flatPayload).map(([k, v]) => [
      k.replace(/_/g, " ").replace(/\./g, " > "),
      typeof v === "number" ? v : String(v ?? ""),
    ]),
  ];
  const csv = rows.map(r =>
    r.map(cell => typeof cell === "number" ? cell : `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), {
    href: url,
    download: `rapport_${report.id}_${report.period_label}_complet.csv`,
  }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ─────────────────────────────────────────────────────────────────────────────
   TÉLÉCHARGEMENT FICHIER SERVEUR
───────────────────────────────────────────────────────────────────────────── */
const downloadServerFile = async (reportId, fileType) => {
  const token = localStorage.getItem("token");
  const base  = api.defaults.baseURL || "";
  const res   = await fetch(`${base}/api/erp/reports/${reportId}/download/${fileType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const cd   = res.headers.get("content-disposition") || "";
  const match = cd.match(/filename="?([^"]+)"?/);
  const name  = match ? match[1] : `rapport_${reportId}.${fileType === "pdf" ? "pdf" : "xlsx"}`;
  const url   = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ─────────────────────────────────────────────────────────────────────────────
   GÉNÉRATEUR DE RAPPORT HTML COMPLET (style PDF industriel)
───────────────────────────────────────────────────────────────────────────── */
const buildReportHTML = (report, t, reportType) => {
  const payload = getReportPayload(report);

  /* Rendu HTML récursif d'une valeur quelconque */
  const renderHTML = (key, value, depth = 0) => {
    if (value === null || value === undefined) return "";

    /* Scalaire */
    if (typeof value !== "object") {
      return `<div class="kv">
        <span class="kv-key">${fmtKey(key)}</span>
        <span class="kv-val">${fmtVal(value)}</span>
      </div>`;
    }

    /* Tableau */
    if (Array.isArray(value)) {
      if (value.length === 0) return "";
      /* Tableau de primitives */
      if (typeof value[0] !== "object" || value[0] === null) {
        return `<div class="kv">
          <span class="kv-key">${fmtKey(key)}</span>
          <span class="kv-val">${value.map(fmtVal).join(" · ")}</span>
        </div>`;
      }
      /* Tableau d'objets → table HTML */
      const cols = [...new Set(value.flatMap(item => Object.keys(item)))];
      return `<div class="table-wrap">
        <div class="table-title">${fmtKey(key)} <span class="badge">${value.length}</span></div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr>${cols.map(c => `<th>${fmtKey(c)}</th>`).join("")}</thead>
            <tbody>${value.map((row, i) =>
              `<tr class="${i % 2 === 0 ? "" : "alt"}">${cols.map(c =>
                `<td>${fmtVal(row[c])}</td>`).join("")}`
            ).join("")}</tbody>
          </table>
        </div>
      </div>`;
    }

    /* Objet */
    const entries = Object.entries(value);
    const allScalar = entries.every(([, v]) => typeof v !== "object" || v === null);

    if (allScalar && depth === 0) {
      /* Section de premier niveau avec uniquement des scalaires → KPI grid */
      return `<div class="section">
        <div class="section-head">${fmtKey(key)}</div>
        <div class="kpi-grid">${entries.map(([k, v]) =>
          `<div class="kpi-card">
            <div class="kpi-label">${fmtKey(k)}</div>
            <div class="kpi-val">${fmtVal(v)}</div>
          </div>`
        ).join("")}</div>
      </div>`;
    }

    if (allScalar && depth > 0) {
      /* Objet imbriqué avec uniquement des scalaires → mini-grid */
      return `<div class="subsection">
        <div class="sub-head">${fmtKey(key)}</div>
        <div class="kpi-grid-sm">${entries.map(([k, v]) =>
          `<div class="kpi-card-sm">
            <div class="kpi-label-sm">${fmtKey(k)}</div>
            <div class="kpi-val-sm">${fmtVal(v)}</div>
          </div>`
        ).join("")}</div>
      </div>`;
    }

    /* Objet mixte (scalaires + objets/tableaux imbriqués) */
    const body = entries.map(([k, v]) => {
      if (typeof v !== "object" || v === null) {
        return `<div class="kv">
          <span class="kv-key">${fmtKey(k)}</span>
          <span class="kv-val">${fmtVal(v)}</span>
        </div>`;
      }
      return renderHTML(k, v, depth + 1);
    }).join("");

    if (depth === 0) {
      return `<div class="section">
        <div class="section-head">${fmtKey(key)}</div>
        <div class="section-body">${body}</div>
      </div>`;
    }
    return `<div class="subsection">
      <div class="sub-head">${fmtKey(key)}</div>
      ${body}
    </div>`;
  };

  const sectionsHTML = Object.entries(payload)
    .map(([k, v]) => renderHTML(k, v, 0))
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>Rapport ${reportType.label} #${report.id} — ${report.period_label}</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI','Arial',sans-serif;font-size:10.5pt;color:#111827;background:#fff;padding:15mm 12mm}

  /* En-tête */
  .report-header{border-bottom:3px solid #2563eb;padding-bottom:1rem;margin-bottom:1.5rem}
  .report-title{font-size:15pt;font-weight:700;color:#1e3a8a}
  .report-subtitle{font-size:9.5pt;color:#6b7280;margin-top:4px}
  .report-meta{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:0.75rem;font-size:9pt;color:#374151}
  .meta-item strong{color:#111827}

  /* Sections */
  .section{margin-bottom:1.25rem;border:1px solid #e3e8ef;border-radius:6px;overflow:hidden;page-break-inside:avoid}
  .section-head{background:#eef2ff;padding:0.55rem 1rem;font-size:9.5pt;font-weight:700;color:#1e3a8a;border-bottom:1px solid #e3e8ef;text-transform:uppercase;letter-spacing:.04em}
  .section-body{padding:0.85rem 1rem}

  /* Sous-sections */
  .subsection{margin-bottom:0.85rem;padding:0.6rem 0.85rem;background:#f9fafb;border:1px solid #f0f0f0;border-radius:5px}
  .sub-head{font-size:8.5pt;font-weight:700;color:#374151;margin-bottom:0.4rem;padding-bottom:0.25rem;border-bottom:1px dashed #e3e8ef;text-transform:uppercase;letter-spacing:.03em}

  /* KPI grids */
  .kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0.55rem;padding:0.85rem 1rem}
  .kpi-card{border:1px solid #e3e8ef;border-radius:6px;padding:0.55rem 0.7rem;background:#fff}
  .kpi-label{font-size:7.5pt;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
  .kpi-val{font-size:12.5pt;font-weight:700;color:#111827}

  .kpi-grid-sm{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:0.4rem}
  .kpi-card-sm{border:1px solid #e3e8ef;border-radius:5px;padding:0.4rem 0.55rem;background:#fff}
  .kpi-label-sm{font-size:7pt;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}
  .kpi-val-sm{font-size:9.5pt;font-weight:700;color:#111827}

  /* Lignes clé-valeur */
  .kv{display:flex;justify-content:space-between;align-items:baseline;padding:0.28rem 0;border-bottom:1px solid #f3f4f6}
  .kv:last-child{border-bottom:none}
  .kv-key{font-size:8.5pt;color:#6b7280;font-weight:500}
  .kv-val{font-size:9pt;font-weight:600;color:#111827;text-align:right;max-width:60%}

  /* Tables */
  .table-wrap{margin-bottom:0.85rem}
  .table-title{font-size:8.5pt;font-weight:700;color:#374151;margin-bottom:0.4rem}
  .badge{background:#eff4ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:10px;padding:1px 6px;font-size:7.5pt;font-weight:600}
  table{width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:0.4rem}
  thead{background:#f4f6f9}
  th{padding:0.35rem 0.55rem;text-align:left;font-weight:700;color:#374151;border:1px solid #e3e8ef;font-size:7.5pt;text-transform:uppercase;letter-spacing:.03em}
  td{padding:0.3rem 0.55rem;border:1px solid #e3e8ef;color:#374151}
  tr.alt{background:#f9fafb}

  /* Pied de page */
  .report-footer{margin-top:1.5rem;padding-top:0.6rem;border-top:1px solid #e3e8ef;font-size:7.5pt;color:#9ca3af;display:flex;justify-content:space-between}

  @media print{
    body{padding:0}
    @page{margin:12mm 8mm;size:A4}
    .section{page-break-inside:avoid}
    tr{page-break-inside:avoid}
  }
</style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">${reportType.icon} ${reportType.label} — ${report.period_label}</div>
    <div class="report-subtitle">Rapport #${report.id} · Système ERP ↔ MES · Rapport industriel complet</div>
    <div class="report-meta">
      <span class="meta-item">Période : <strong>${dateOnly(report.date_from)} → ${dateOnly(report.date_to)}</strong></span>
      <span class="meta-item">Reçu le : <strong>${dateShort(report.received_at)}</strong></span>
      <span class="meta-item">Source : <strong>${report.sent_by || "MES"}</strong></span>
      <span class="meta-item">Statut : <strong>${report.status}</strong></span>
    </div>
  </div>

  ${sectionsHTML || '<p style="color:#6b7280;text-align:center;padding:2rem;font-style:italic">Payload vide — aucune donnée à afficher.</p>'}

  <div class="report-footer">
    <span>ERP — Archive Rapports MES</span>
    <span>Généré le ${new Date().toLocaleString("fr-FR")}</span>
  </div>
</body>
</html>`;
};

const printReport = (report, t, reportType) => {
  const html = buildReportHTML(report, t, reportType);
  const win = window.open("", "_blank", "width=1050,height=750");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
};

/* ─────────────────────────────────────────────────────────────────────────────
   COMPOSANTS RENDU PAYLOAD — REACT (drawer)
───────────────────────────────────────────────────────────────────────────── */

/** Carte scalaire (label + valeur). */
const ScalarCard = ({ label, value, C, s }) => (
  <div style={s.metaCard}>
    <p style={s.metaLabel}>{fmtKey(label)}</p>
    <p style={s.metaVal}>{fmtVal(value)}</p>
  </div>
);

/** Tableau d'objets ou de primitives. */
const ArrayTable = ({ data, label, C, s }) => {
  if (!data || data.length === 0) return null;

  /* Primitives */
  if (typeof data[0] !== "object" || data[0] === null) {
    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <p style={{ ...s.metaLabel, marginBottom: "0.4rem" }}>{fmtKey(label)}</p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {data.map((v, i) => (
            <span key={i} style={{
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 4, padding: "2px 8px", fontSize: "0.82rem", color: C.sub,
            }}>
              {fmtVal(v)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /* Objets → table */
  const cols = [...new Set(data.flatMap(item => Object.keys(item)))];
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <p style={{ ...s.metaLabel, margin: 0 }}>{fmtKey(label)}</p>
        <span style={s.pill(C.accentLt, C.accent, "#bfdbfe")}>{data.length}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ ...s.table, fontSize: "0.8rem" }}>
          <thead style={s.thead}>
            <tr>{cols.map(c => <th key={c} style={s.th}>{fmtKey(c)}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={s.tr(i)}>
                {cols.map(c => (
                  <td key={c} style={{ ...s.td, fontSize: "0.79rem" }}>
                    {fmtVal(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Rendu récursif d'une section du payload.
 */
const PayloadSection = ({ label, data, depth = 0, C, s }) => {
  if (data === null || data === undefined) return null;

  /* Scalaire */
  if (typeof data !== "object") {
    return <ScalarCard label={label} value={data} C={C} s={s} />;
  }

  /* Tableau */
  if (Array.isArray(data)) {
    return <ArrayTable data={data} label={label} C={C} s={s} />;
  }

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  /* Objet tout-scalaire → grille de cartes */
  const allScalar = entries.every(([, v]) => typeof v !== "object" || v === null);
  if (allScalar) {
    return (
      <div>
        {label && (
          <p style={{
            margin: "0 0 0.6rem",
            fontSize: depth === 0 ? "0.85rem" : "0.78rem",
            fontWeight: 700, color: C.text,
            paddingBottom: "0.35rem",
            borderBottom: depth === 0 ? `1px solid ${C.border}` : "none",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            {fmtKey(label)}
          </p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.5rem" }}>
          {entries.map(([k, v]) => <ScalarCard key={k} label={k} value={v} C={C} s={s} />)}
        </div>
      </div>
    );
  }

  /* Objet mixte */
  const scalars = entries.filter(([, v]) => typeof v !== "object" || v === null);
  const nested  = entries.filter(([, v]) => typeof v === "object" && v !== null);

  return (
    <div>
      {label && (
        <p style={{
          margin: "0 0 0.65rem",
          fontSize: depth === 0 ? "0.85rem" : "0.78rem",
          fontWeight: 700, color: C.text,
          paddingBottom: "0.35rem",
          borderBottom: depth === 0 ? `1px solid ${C.border}` : "none",
          textTransform: "uppercase", letterSpacing: "0.04em",
        }}>
          {fmtKey(label)}
        </p>
      )}

      {/* Scalaires en grid */}
      {scalars.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {scalars.map(([k, v]) => <ScalarCard key={k} label={k} value={v} C={C} s={s} />)}
        </div>
      )}

      {/* Imbriqués en blocs */}
      {nested.map(([k, v]) => (
        <div key={k} style={{
          background: depth % 2 === 0 ? C.surface : C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 7,
          padding: "0.75rem 1rem",
          marginBottom: "0.65rem",
        }}>
          <PayloadSection label={k} data={v} depth={depth + 1} C={C} s={s} />
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   DRAWER DÉTAIL — PAYLOAD COMPLET
───────────────────────────────────────────────────────────────────────────── */
const DetailDrawer = ({ report, onClose, C, s, t }) => {
  const REPORT_TYPES = getReportTypes(C, t);
  const reportType = REPORT_TYPES.find(rt => rt.value === report.report_type) || REPORT_TYPES[0];
  const payload = getReportPayload(report);
  const sections = Object.entries(payload);

  const btnExport = {
    ...s.btnGhost, fontSize: "0.78rem", padding: "0.4rem 0.75rem", whiteSpace: "nowrap",
  };

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.drawer} onClick={e => e.stopPropagation()}>

        {/* En-tête du drawer */}
        <div style={s.drawerHeader}>
          <div style={{ ...s.kpiIcon(reportType.lt), width: 38, height: 38, flexShrink: 0 }}>{reportType.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: C.text }}>
              {reportType.label} — {report.period_label}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: C.muted }}>
              ID #{report.id} · {t.receivedAt} {dateShort(report.received_at)} · {sections.length} {t.drawerSubtitle}
            </p>
          </div>

          {/* Boutons export */}
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", flexWrap: "wrap" }}>
            <button style={btnExport} onClick={() => printReport(report, t, reportType)}>
              📄 PDF
            </button>
            <button style={btnExport} onClick={() => downloadCSV(report, t, reportType.label)}>
              📊 Excel
            </button>
            <button onClick={onClose} style={{ ...btnExport, padding: "0.4rem 0.65rem" }}>✕</button>
          </div>
        </div>

        {/* Corps — payload MES complet rendu section par section */}
        <div style={s.drawerBody}>

          {/* Métadonnées du rapport */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "0.85rem 1rem",
          }}>
            <p style={{ ...s.metaLabel, marginBottom: "0.6rem" }}>{t.metadata}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.5rem" }}>
              {[
                ["Type", reportType.label],
                ["Période", report.period_label],
                ["Du", dateOnly(report.date_from)],
                ["Au", dateOnly(report.date_to)],
                ["Reçu le", dateShort(report.received_at)],
                ["Source", report.sent_by || "MES"],
                ["Statut", report.status],
              ].map(([k, v]) => (
                <div key={k} style={s.metaCard}>
                  <p style={s.metaLabel}>{k}</p>
                  <p style={s.metaVal}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payload MES — toutes les sections */}
          {sections.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📭</div>
              <p>{t.emptyPayload}</p>
            </div>
          ) : sections.map(([sectionKey, sectionData]) => (
            <div key={sectionKey} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "1rem 1.1rem",
            }}>
              <PayloadSection label={sectionKey} data={sectionData} depth={0} C={C} s={s} />
            </div>
          ))}

          {/* Fichiers joints reçus depuis le MES */}
          {(report.pdf_path || report.excel_path) && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "1rem" }}>
              <p style={{ ...s.metaLabel, marginBottom: "0.75rem" }}>{t.attachments}</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {report.pdf_path && (
                  <button
                    style={{ ...s.btnGhost, color: C.red, border: `1px solid #fecaca`, background: C.redLt }}
                    onClick={() => downloadServerFile(report.id, "pdf")}
                  >
                    📄 {t.downloadPDF}
                  </button>
                )}
                {report.excel_path && (
                  <button
                    style={{ ...s.btnGhost, color: C.green, border: `1px solid #bbf7d0`, background: C.greenLt }}
                    onClick={() => downloadServerFile(report.id, "excel")}
                  >
                    📊 {t.downloadExcel}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────────────────────────────────────── */
const ReportsArchive = () => {
  const { isDark } = useTheme();
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;

  const C = makeC(isDark);
  const s = makeS(C);
  const REPORT_TYPES = getReportTypes(C, t);
  const STATUS_CFG = getStatusCfg(C, t);
  const TYPE_MAP = Object.fromEntries(REPORT_TYPES.map(rt => [rt.value, rt]));

  const [tab,           setTab]          = useState("liste");
  const [reports,       setReports]      = useState([]);
  const [stats,         setStats]        = useState(null);
  const [loading,       setLoading]      = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [msg,           setMsg]          = useState({ text: "", type: "" });
  const [selected,      setSelected]     = useState(null);
  const [filterType,    setFilterType]   = useState("");
  const [dateFrom,      setDateFrom]     = useState(thirtyAgo());
  const [dateTo,        setDateTo]       = useState(todayISO());
  const [search,        setSearch]       = useState("");
  const [page,          setPage]         = useState(0);
  const LIMIT = 50;

  // ── Refs for lifecycle management ────────────────────────────────────────────
  const mountedRef     = useRef(true);
  const msgTimerRef    = useRef(null);
  const statsAbortRef  = useRef(null);
  const reportsAbortRef = useRef(null);
  const detailAbortRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (msgTimerRef.current)    clearTimeout(msgTimerRef.current);
      statsAbortRef.current?.abort();
      reportsAbortRef.current?.abort();
      detailAbortRef.current?.abort();
    };
  }, []);

  const showMsg = useCallback((text, type = "success") => {
    if (!mountedRef.current) return;
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    setMsg({ text, type });
    msgTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setMsg({ text: "", type: "" });
    }, 4000);
  }, []);

  const loadStats = useCallback(async () => {
    statsAbortRef.current?.abort();
    const ctrl = new AbortController();
    statsAbortRef.current = ctrl;
    try {
      const r = await api.get("/api/erp/reports/stats", { signal: ctrl.signal });
      if (mountedRef.current) setStats(r.data);
    } catch (e) {
      if (e.code === "ERR_CANCELED" || e.name === "AbortError" || e.name === "CanceledError") return;
      console.error("[ERP] stats error:", e.response?.status, e.response?.data || e.message);
    }
  }, []);

  const loadReports = useCallback(async () => {
    reportsAbortRef.current?.abort();
    const ctrl = new AbortController();
    reportsAbortRef.current = ctrl;

    if (mountedRef.current) setLoading(true);
    try {
      const params = { limit: LIMIT, offset: page * LIMIT };
      if (filterType) params.report_type = filterType;
      if (dateFrom)   params.date_from   = dateFrom;
      if (dateTo)     params.date_to     = dateTo;

      const r = await api.get("/api/erp/reports/", { params, signal: ctrl.signal });

      if (mountedRef.current && !ctrl.signal.aborted) setReports(r.data);
    } catch (e) {
      if (e.code === "ERR_CANCELED" || e.name === "AbortError" || e.name === "CanceledError") return;
      showMsg("❌ " + (e.response?.data?.detail || t.errorLoadReports), "error");
    } finally {
      if (mountedRef.current && !ctrl.signal.aborted) setLoading(false);
    }
  }, [filterType, dateFrom, dateTo, page, showMsg, t]);

  const loadDetail = useCallback(async (id) => {
    detailAbortRef.current?.abort();
    const ctrl = new AbortController();
    detailAbortRef.current = ctrl;

    if (mountedRef.current) setLoadingDetail(true);
    try {
      const r = await api.get(`/api/erp/reports/${id}`, { signal: ctrl.signal });
      if (mountedRef.current && !ctrl.signal.aborted) setSelected(r.data);
    } catch (e) {
      if (e.code === "ERR_CANCELED" || e.name === "AbortError" || e.name === "CanceledError") return;
      showMsg("❌ " + (e.response?.data?.detail || t.errorLoadDetail), "error");
    } finally {
      if (mountedRef.current && !ctrl.signal.aborted) setLoadingDetail(false);
    }
  }, [showMsg, t]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadReports(); }, [loadReports]);

  const displayed = search
    ? reports.filter(r =>
        r.period_label.toLowerCase().includes(search.toLowerCase()) ||
        r.report_type.toLowerCase().includes(search.toLowerCase()) ||
        (r.sent_by || "").toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  const tabs = [
    { id: "liste", label: t.tabList },
    { id: "stats", label: t.tabStats },
  ];

  return (
    <div style={s.app}>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>R</div>
          <div>
            <p style={s.h1}>{t.appTitle}</p>
            <p style={s.h1sub}>{t.appSubtitle}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={s.badgeOnline}><span style={s.dot} />{t.online}</span>
          <span style={s.badgeSync}>{t.syncMES}</span>
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
          {t.infoTitle} : {t.infoText}
          <br />
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
            {t.infoHint}
          </span>
        </div>

        {/* KPI STATS — cliquables pour filtrer */}
        <div style={s.kpiRow}>
          {REPORT_TYPES.map(rt => {
            const count  = stats?.[rt.value] ?? 0;
            const active = filterType === rt.value;
            return (
              <div
                key={rt.value}
                style={{
                  ...s.kpiCard,
                  border:    active ? `2px solid ${rt.color}` : `1px solid ${C.border}`,
                  boxShadow: active ? `0 0 0 3px ${rt.color}22` : "0 1px 3px rgba(0,0,0,0.04)",
                }}
                onClick={() => { setFilterType(active ? "" : rt.value); setPage(0); }}
              >
                <div style={s.kpiIcon(rt.lt)}>{rt.icon}</div>
                <div>
                  <p style={s.kpiLabel}>{rt.label}</p>
                  <p style={s.kpiVal(active ? rt.color : C.text)}>{stats ? count : "…"}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABS */}
        <div style={s.tabRow}>
          {tabs.map(tabItem => (
            <button key={tabItem.id} style={s.tab(tab === tabItem.id)} onClick={() => setTab(tabItem.id)}>
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* ── LISTE ─────────────────────────────────────── */}
        {tab === "liste" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{t.tabList}</p>
                <p style={s.sectionSub}>{displayed.length} {t.entries}</p>
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
                <label style={s.label}>{t.search}</label>
                <input style={{ ...s.input, width: 220 }}
                  placeholder={t.searchPlaceholder}
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>{t.reportType}</label>
                <select style={{ ...s.select, width: 180 }} value={filterType}
                  onChange={e => { setFilterType(e.target.value); setPage(0); }}>
                  <option value="">{t.allTypes}</option>
                  {REPORT_TYPES.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.icon} {rt.label}</option>
                  ))}
                </select>
              </div>
              <div style={s.fg}>
                <label style={s.label}>{t.from}</label>
                <input style={s.input} type="date" value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPage(0); }} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>{t.to}</label>
                <input style={s.input} type="date" value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPage(0); }} />
              </div>
              <button style={s.btnPrimary} onClick={() => { loadReports(); loadStats(); }}>
                🔍 {t.filter}
              </button>
              <button style={s.btnGhost} onClick={() => {
                setFilterType(""); setDateFrom(thirtyAgo());
                setDateTo(todayISO()); setSearch(""); setPage(0);
              }}>
                ↺ {t.reset}
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>⏳</div>
                <p style={{ fontWeight: 500, color: C.sub }}>{t.loading}</p>
              </div>
            ) : displayed.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <p style={{ fontWeight: 500, color: C.sub }}>{t.noReports}</p>
                <p style={{ fontSize: "0.85rem" }}>
                  {t.noReportsHint}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {[t.colId, t.colType, t.colPeriod, t.colFrom, t.colTo, t.colReceived, t.colSource, t.colStatus, t.colActions].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((r, i) => {
                      const rt = TYPE_MAP[r.report_type] || REPORT_TYPES[0];
                      const sc = STATUS_CFG[r.status]    || STATUS_CFG.archived;
                      return (
                        <tr key={r.id} style={s.tr(i)}>
                          <td style={s.td}>
                            <code style={{ color: C.accent, fontSize: "0.8rem", background: C.accentLt, padding: "1px 6px", borderRadius: 4 }}>
                              #{r.id}
                            </code>
                          </td>
                          <td style={s.td}>
                            <span style={s.pill(rt.lt, rt.color, `${rt.color}44`)}>
                              {rt.icon} {rt.label}
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
                            <button
                              style={{ ...s.btnGhost, opacity: loadingDetail ? 0.6 : 1 }}
                              disabled={loadingDetail}
                              onClick={() => loadDetail(r.id)}
                            >
                              {loadingDetail ? "⏳" : "👁"} {t.see}
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
                  {t.page} {page + 1} · {displayed.length} {t.entries}
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={s.btnGhost} onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                    ← {t.previous}
                  </button>
                  <button style={s.btnGhost} onClick={() => setPage(p => p + 1)} disabled={reports.length < LIMIT}>
                    {t.next} →
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
                <p style={s.sectionTitle}>{t.statsTitle}</p>
                <p style={s.sectionSub}>{t.statsSubtitle}</p>
              </div>
            </div>
            {!stats ? (
              <div style={s.emptyState}><div style={s.emptyIcon}>⏳</div><p>{t.noStats}</p></div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                  {REPORT_TYPES.map(rt => {
                    const count = stats[rt.value] ?? 0;
                    const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
                    const pct   = Math.round((count / total) * 100);
                    return (
                      <div key={rt.value} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                          <div style={s.kpiIcon(rt.lt)}>{rt.icon}</div>
                          <div>
                            <p style={s.kpiLabel}>{rt.label}</p>
                            <p style={s.kpiVal(rt.color)}>{count}</p>
                          </div>
                        </div>
                        <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: rt.color, borderRadius: 3 }} />
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: C.muted }}>{pct}% {t.ofTotal}</p>
                      </div>
                    );
                  })}
                </div>
                <div style={s.infoBox}>
                  📊 {t.totalArchived} : <strong>{Object.values(stats).reduce((a, b) => a + b, 0)} {Object.values(stats).reduce((a, b) => a + b, 0) > 1 ? t.rapports : t.rapport}</strong> {t.statsSubtitle.toLowerCase()}.
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* DRAWER — onClose also cancels any pending loadDetail request */}
      {selected && (
        <DetailDrawer
          report={selected}
          onClose={() => {
            detailAbortRef.current?.abort();
            setSelected(null);
            setLoadingDetail(false);
          }}
          C={C}
          s={s}
          t={t}
        />
      )}

    </div>
  );
};

export default ReportsArchive;