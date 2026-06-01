import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";

const ERP_BASE_URL = "http://127.0.0.1:8001/api/stock";

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const dateShort = (d) =>
  d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

// ── Traductions ────────────────────────────────────────────
const translations = {
  fr: {
    // Général
    loading: "Chargement...",
    saving: "Enregistrement...",
    error: "Erreur",
    success: "Succès",
    
    // Topbar
    appTitle: "ERP — Gestion des Stocks",
    appSubtitle: "Système intégré MES + ERP",
    online: "En ligne",
    syncMES: "Sync MES",
    
    // KPIs
    totalArticles: "Articles total",
    stockMP: "Stock MP (kg)",
    stockPF: "Stock PF (kg)",
    stockAlert: "Alertes stock",
    
    // Messages
    stockCritical: "Stock critique",
    
    // Tabs
    tabStock: "📦 Stock",
    tabArticle: "➕ Article",
    tabMovement: "🔄 Mouvement",
    tabHistory: "📋 Historique",
    
    // Stock table
    stockState: "État du stock",
    articlesCount: "article(s) enregistré(s)",
    allTypes: "Tous les types",
    rawMaterials: "Matières premières",
    finishedProducts: "Produits finis",
    noArticles: "Aucun article en stock",
    createArticleHint: "Créez vos articles dans l'onglet \"Article\"",
    colCode: "Code",
    colName: "Nom",
    colType: "Type",
    colQuantity: "Qté stock",
    colThreshold: "Seuil alerte",
    colUnit: "Unité",
    colStatus: "Statut",
    colActions: "Actions",
    mp: "MP",
    pf: "PF",
    critical: "⚠ Critique",
    ok: "✓ OK",
    edit: "Modifier",
    delete: "🗑",
    
    // Article form
    editArticle: "Modifier l'article",
    createArticle: "Créer un article",
    articleInfo: "Renseignez les informations de l'article",
    cancelEdit: "✕ Annuler la modification",
    articleCode: "Code article",
    articleName: "Nom",
    articleType: "Type",
    initialQuantity: "Quantité initiale (kg)",
    alertThreshold: "Seuil d'alerte (kg)",
    unit: "Unité",
    reset: "Réinitialiser",
    create: "➕ Créer l'article",
    update: "💾 Mettre à jour",
    
    // Movement form
    manualStockMovement: "Mouvement de stock manuel",
    movementSubtitle: "Pour les ajustements, achats et inventaires",
    movementInfo: "ℹ️ Les mouvements liés aux productions MES sont créés automatiquement. Cet onglet est uniquement pour les ajustements manuels.",
    selectArticle: "-- Sélectionner un article --",
    movementType: "Type de mouvement",
    entry: "↑ Entrée — augmente le stock",
    exit: "↓ Sortie — diminue le stock",
    adjustment: "⇄ Ajustement — remplace la valeur",
    quantity: "Quantité (kg)",
    source: "Source",
    manual: "Manuel",
    inventory: "Inventaire",
    purchase: "Achat",
    return: "Retour",
    reference: "Référence",
    comment: "Commentaire",
    resetForm: "Réinitialiser",
    saveMovement: "🔄 Enregistrer le mouvement",
    
    // History
    movementHistory: "Historique des mouvements",
    movementsCount: "mouvement(s) enregistré(s)",
    noMovements: "Aucun mouvement enregistré",
    colDate: "Date",
    colBefore: "Avant",
    colAfter: "Après",
    
    // Messages feedback
    articleUpdated: "✅ Article mis à jour",
    articleCreated: "✅ Article créé",
    articleDeleted: "🗑️ Article supprimé",
    movementSaved: "✅ Mouvement enregistré",
    confirmDelete: "Supprimer cet article ?",
  },
  en: {
    // General
    loading: "Loading...",
    saving: "Saving...",
    error: "Error",
    success: "Success",
    
    // Topbar
    appTitle: "ERP — Stock Management",
    appSubtitle: "Integrated MES + ERP System",
    online: "Online",
    syncMES: "MES Sync",
    
    // KPIs
    totalArticles: "Total Articles",
    stockMP: "Raw Material Stock (kg)",
    stockPF: "Finished Product Stock (kg)",
    stockAlert: "Stock Alerts",
    
    // Messages
    stockCritical: "Critical stock",
    
    // Tabs
    tabStock: "📦 Stock",
    tabArticle: "➕ Article",
    tabMovement: "🔄 Movement",
    tabHistory: "📋 History",
    
    // Stock table
    stockState: "Stock Status",
    articlesCount: "article(s) registered",
    allTypes: "All types",
    rawMaterials: "Raw materials",
    finishedProducts: "Finished products",
    noArticles: "No articles in stock",
    createArticleHint: "Create your articles in the \"Article\" tab",
    colCode: "Code",
    colName: "Name",
    colType: "Type",
    colQuantity: "Stock Qty",
    colThreshold: "Alert threshold",
    colUnit: "Unit",
    colStatus: "Status",
    colActions: "Actions",
    mp: "RM",
    pf: "FP",
    critical: "⚠ Critical",
    ok: "✓ OK",
    edit: "Edit",
    delete: "🗑",
    
    // Article form
    editArticle: "Edit article",
    createArticle: "Create article",
    articleInfo: "Enter article information",
    cancelEdit: "✕ Cancel edit",
    articleCode: "Article code",
    articleName: "Name",
    articleType: "Type",
    initialQuantity: "Initial quantity (kg)",
    alertThreshold: "Alert threshold (kg)",
    unit: "Unit",
    reset: "Reset",
    create: "➕ Create article",
    update: "💾 Update",
    
    // Movement form
    manualStockMovement: "Manual stock movement",
    movementSubtitle: "For adjustments, purchases and inventories",
    movementInfo: "ℹ️ Movements related to MES productions are created automatically. This tab is only for manual adjustments.",
    selectArticle: "-- Select an article --",
    movementType: "Movement type",
    entry: "↑ Entry — increases stock",
    exit: "↓ Exit — decreases stock",
    adjustment: "⇄ Adjustment — replaces value",
    quantity: "Quantity (kg)",
    source: "Source",
    manual: "Manual",
    inventory: "Inventory",
    purchase: "Purchase",
    return: "Return",
    reference: "Reference",
    comment: "Comment",
    resetForm: "Reset",
    saveMovement: "🔄 Save movement",
    
    // History
    movementHistory: "Movement history",
    movementsCount: "movement(s) recorded",
    noMovements: "No movements recorded",
    colDate: "Date",
    colBefore: "Before",
    colAfter: "After",
    
    // Messages feedback
    articleUpdated: "✅ Article updated",
    articleCreated: "✅ Article created",
    articleDeleted: "🗑️ Article deleted",
    movementSaved: "✅ Movement saved",
    confirmDelete: "Delete this article?",
  },
};

// ── Palette factory (dark / light) ────────────────────────
const makeC = (isDark) => ({
  bg: isDark ? "#0f172a" : "#f4f6f9",
  surface: isDark ? "#1e293b" : "#ffffff",
  border: isDark ? "#334155" : "#e3e8ef",
  accent: "#2563eb",
  accentLt: isDark ? "#1e3a5f" : "#eff4ff",
  green: "#16a34a",
  greenLt: isDark ? "#14532d" : "#f0fdf4",
  red: "#dc2626",
  redLt: isDark ? "#7f1d1d" : "#fef2f2",
  amber: "#d97706",
  amberLt: isDark ? "#78350f" : "#fffbeb",
  purple: "#7c3aed",
  purpleLt: isDark ? "#3b0764" : "#f5f3ff",
  text: isDark ? "#f1f5f9" : "#111827",
  sub: isDark ? "#cbd5e1" : "#374151",
  muted: isDark ? "#94a3b8" : "#6b7280",
  inputBg: isDark ? "#0f172a" : "#f9fafb",
  trOdd: isDark ? "#1e293b" : "#ffffff",
  trEven: isDark ? "#162032" : "#f4f6f9",
});

// ── Style factory ─────────────────────────────────────────
const makeS = (C) => ({
  app: { fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", color: C.text },
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
    fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em",
  },
  h1: { margin: 0, fontSize: "1rem", fontWeight: 600, color: C.text, letterSpacing: "-0.01em" },
  h1sub: { margin: 0, fontSize: "0.75rem", color: C.muted },
  badgeOnline: {
    background: C.greenLt, color: C.green, border: `1px solid #bbf7d0`,
    borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600,
    display: "flex", alignItems: "center", gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" },
  badgeSync: {
    background: C.accentLt, color: C.accent, border: `1px solid #bfdbfe`,
    borderRadius: 20, padding: "3px 10px", fontSize: "0.72rem", fontWeight: 600,
  },
  main: { padding: "1.75rem 2rem", maxWidth: 1400, margin: "0 auto" },
  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" },
  kpiCard: {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "1.1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  kpiIcon: (lt) => ({
    width: 40, height: 40, borderRadius: 8, background: lt,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.15rem", flexShrink: 0,
  }),
  kpiLabel: { margin: "0 0 2px", fontSize: "0.72rem", color: C.muted, fontWeight: 500, letterSpacing: "0.03em" },
  kpiVal: (color) => ({ margin: 0, fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1 }),
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
  sectionSub: { margin: 0, fontSize: "0.78rem", color: C.muted },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
  fg: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.78rem", fontWeight: 500, color: C.sub },
  req: { color: C.red, marginLeft: 2 },
  input: {
    padding: "0.6rem 0.85rem", background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: 7, color: C.text, fontSize: "0.875rem", fontFamily: "inherit",
    outline: "none", width: "100%", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  select: {
    padding: "0.6rem 0.85rem", background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: 7, color: C.text, fontSize: "0.875rem", fontFamily: "inherit",
    outline: "none", width: "100%", boxSizing: "border-box", cursor: "pointer",
  },
  btnRow: {
    display: "flex", gap: "0.75rem", marginTop: "1.25rem",
    paddingTop: "1rem", borderTop: `1px solid ${C.border}`,
  },
  btnPrimary: {
    background: C.accent, color: "#fff", border: "none", borderRadius: 7,
    padding: "0.6rem 1.5rem", fontFamily: "inherit", fontWeight: 600,
    fontSize: "0.875rem", cursor: "pointer", transition: "opacity .15s",
  },
  btnDanger: {
    background: C.redLt, color: C.red, border: `1px solid #fecaca`,
    borderRadius: 7, padding: "0.5rem 0.85rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.8rem", cursor: "pointer",
  },
  btnGhost: {
    background: C.inputBg, color: C.sub, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "0.5rem 0.85rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.8rem", cursor: "pointer",
  },
  btnSecondary: {
    background: C.inputBg, color: C.sub, border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "0.6rem 1.25rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  thead: { background: C.bg },
  th: {
    textAlign: "left", padding: "0.6rem 0.9rem", borderBottom: `1px solid ${C.border}`,
    color: C.muted, fontWeight: 600, fontSize: "0.72rem",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  tr: (i) => ({ background: i % 2 === 0 ? C.trOdd : C.trEven }),
  td: { padding: "0.7rem 0.9rem", borderBottom: `1px solid ${C.border}`, color: C.sub, verticalAlign: "middle" },
  pill: (bg, color, border) => ({
    display: "inline-flex", alignItems: "center", padding: "2px 9px",
    borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
    background: bg, color, border: `1px solid ${border}`,
  }),
  alertBox: (bg, border, color) => ({
    background: bg, border: `1px solid ${border}`, borderLeft: `3px solid ${color}`,
    borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem",
    fontSize: "0.85rem", color, display: "flex", alignItems: "flex-start", gap: "0.5rem",
  }),
  infoBox: {
    background: C.accentLt, border: `1px solid #bfdbfe`,
    borderLeft: `3px solid ${C.accent}`, borderRadius: 8,
    padding: "0.75rem 1rem", marginBottom: "1.25rem",
    fontSize: "0.85rem", color: "#1d4ed8", lineHeight: 1.5,
  },
  emptyState: {
    textAlign: "center", padding: "3rem", color: C.muted,
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
  },
  emptyIcon: { fontSize: "2.5rem" },
});

// ══════════════════════════════════════════════════════════
const GestionStock = () => {
  const { isDark } = useTheme();
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;

  const C = makeC(isDark);
  const s = makeS(C);

  const [tab, setTab] = useState("stock");
  const [articles, setArticles] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [formArticle, setFormArticle] = useState({
    code: "", nom: "", type_article: "matiere_premiere",
    unite: "kg", quantite: "", quantite_min: "",
  });
  const [formMouvement, setFormMouvement] = useState({
    article_id: "", type_mouvement: "entree", quantite: "",
    source: "MANUEL", reference: "", commentaire: "",
  });
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState("");

  const loadArticles = useCallback(async () => {
    try {
      const url = filterType ? `${ERP_BASE_URL}/articles?type_article=${filterType}` : `${ERP_BASE_URL}/articles`;
      const r = await axios.get(url);
      setArticles(r.data);
    } catch (e) { console.error(e); }
  }, [filterType]);

  const loadMouvements = useCallback(async () => {
    try {
      const r = await axios.get(`${ERP_BASE_URL}/mouvements?limit=100`);
      setMouvements(r.data);
    } catch (e) { console.error(e); }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const r = await axios.get(`${ERP_BASE_URL}/dashboard`);
      setDashboard(r.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    loadArticles();
    loadMouvements();
    loadDashboard();
  }, [loadArticles, loadMouvements, loadDashboard]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${ERP_BASE_URL}/articles/${editId}`, formArticle);
        showMsg(t.articleUpdated);
      } else {
        await axios.post(`${ERP_BASE_URL}/articles`, formArticle);
        showMsg(t.articleCreated);
      }
      setFormArticle({ code: "", nom: "", type_article: "matiere_premiere", unite: "kg", quantite: "", quantite_min: "" });
      setEditId(null);
      loadArticles(); loadDashboard();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.detail || err.message), "error");
    } finally { setLoading(false); }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setFormArticle({ code: a.code, nom: a.nom, type_article: a.type_article, unite: a.unite, quantite: a.quantite, quantite_min: a.quantite_min });
    setTab("gestion");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await axios.delete(`${ERP_BASE_URL}/articles/${id}`);
      showMsg(t.articleDeleted);
      loadArticles(); loadDashboard();
    } catch (err) { showMsg("❌ " + (err.response?.data?.detail || err.message), "error"); }
  };

  const handleMouvementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${ERP_BASE_URL}/mouvements`, formMouvement);
      showMsg(t.movementSaved);
      setFormMouvement({ article_id: "", type_mouvement: "entree", quantite: "", source: "MANUEL", reference: "", commentaire: "" });
      loadArticles(); loadMouvements(); loadDashboard();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.detail || err.message), "error");
    } finally { setLoading(false); }
  };

  const kpis = [
    { label: t.totalArticles, val: dashboard?.total_articles ?? 0, color: C.accent, lt: C.accentLt, icon: "📦" },
    { label: t.stockMP, val: fmt(dashboard?.total_stock_mp_kg), color: C.purple, lt: C.purpleLt, icon: "🌾" },
    { label: t.stockPF, val: fmt(dashboard?.total_stock_pf_kg), color: C.green, lt: C.greenLt, icon: "✅" },
    {
      label: t.stockAlert, val: dashboard?.nb_alertes_stock ?? 0,
      color: (dashboard?.nb_alertes_stock > 0) ? C.red : C.green,
      lt: (dashboard?.nb_alertes_stock > 0) ? C.redLt : C.greenLt, icon: "⚠️"
    },
  ];

  const movColor = { entree: C.green, sortie: C.red, ajustement: C.amber };
  const movBg = { entree: C.greenLt, sortie: C.redLt, ajustement: C.amberLt };
  const movBorder = { entree: "#bbf7d0", sortie: "#fecaca", ajustement: "#fde68a" };
  const movIcon = { entree: "↑", sortie: "↓", ajustement: "⇄" };

  const tabs = [
    { id: "stock", label: t.tabStock },
    { id: "gestion", label: t.tabArticle },
    { id: "mouvement", label: t.tabMovement },
    { id: "historique", label: t.tabHistory },
  ];

  return (
    <div style={s.app}>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>S</div>
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
            msg.type === "error" ? C.red : C.green
          )}>
            {msg.text}
          </div>
        )}

        {/* ALERTES STOCK */}
        {dashboard?.articles_en_alerte?.length > 0 && (
          <div style={s.alertBox(C.amberLt, "#fde68a", C.amber)}>
            ⚠️ {t.stockCritical} : {dashboard.articles_en_alerte.map(a => `${a.nom} (${fmt(a.quantite)} kg)`).join(" • ")}
          </div>
        )}

        {/* KPI ROW */}
        <div style={s.kpiRow}>
          {kpis.map((k, idx) => (
            <div key={idx} style={s.kpiCard}>
              <div style={s.kpiIcon(k.lt)}>{k.icon}</div>
              <div>
                <p style={s.kpiLabel}>{k.label}</p>
                <p style={s.kpiVal(k.color)}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={s.tabRow}>
          {tabs.map((tabItem) => (
            <button key={tabItem.id} style={s.tab(tab === tabItem.id)}
              onClick={() => { setTab(tabItem.id); setEditId(null); }}>
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* ── STOCK ────────────────────────────────────── */}
        {tab === "stock" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{t.stockState}</p>
                <p style={s.sectionSub}>{articles.length} {t.articlesCount}</p>
              </div>
              <select
                style={{ ...s.select, width: "auto", padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">{t.allTypes}</option>
                <option value="matiere_premiere">{t.rawMaterials}</option>
                <option value="produit_fini">{t.finishedProducts}</option>
              </select>
            </div>

            {articles.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <p style={{ fontWeight: 500, color: C.sub }}>{t.noArticles}</p>
                <p style={{ fontSize: "0.85rem" }}>{t.createArticleHint}</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {[t.colCode, t.colName, t.colType, t.colQuantity, t.colThreshold, t.colUnit, t.colStatus, t.colActions].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((a, i) => (
                      <tr key={a.id} style={s.tr(i)}>
                        <td style={s.td}>
                          <code style={{ color: C.accent, fontSize: "0.8rem", fontFamily: "monospace", background: C.accentLt, padding: "1px 6px", borderRadius: 4 }}>
                            {a.code}
                          </code>
                        </td>
                        <td style={{ ...s.td, fontWeight: a.en_alerte ? 600 : 400, color: a.en_alerte ? C.amber : C.sub }}>
                          {a.nom}
                        </td>
                        <td style={s.td}>
                          {a.type_article === "matiere_premiere"
                            ? <span style={s.pill(C.purpleLt, C.purple, "#ddd6fe")}>{t.mp}</span>
                            : <span style={s.pill(C.greenLt, C.green, "#bbf7d0")}>{t.pf}</span>}
                        </td>
                        <td style={s.td}>
                          <strong style={{ color: a.en_alerte ? C.red : C.text, fontSize: "0.9rem" }}>
                            {fmt(a.quantite)}
                          </strong>
                        </td>
                        <td style={{ ...s.td, color: C.muted }}>{fmt(a.quantite_min)}</td>
                        <td style={{ ...s.td, color: C.muted }}>{a.unite}</td>
                        <td style={s.td}>
                          {a.en_alerte
                            ? <span style={s.pill(C.redLt, C.red, "#fecaca")}>{t.critical}</span>
                            : <span style={s.pill(C.greenLt, C.green, "#bbf7d0")}>{t.ok}</span>}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button style={s.btnGhost} onClick={() => handleEdit(a)}>{t.edit}</button>
                            <button style={s.btnDanger} onClick={() => handleDelete(a.id)}>{t.delete}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── GESTION ────────────────────────────────── */}
        {tab === "gestion" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{editId ? t.editArticle : t.createArticle}</p>
                <p style={s.sectionSub}>{t.articleInfo}</p>
              </div>
              {editId && (
                <button style={s.btnGhost} onClick={() => { setEditId(null); setFormArticle({ code: "", nom: "", type_article: "matiere_premiere", unite: "kg", quantite: "", quantite_min: "" }); }}>
                  {t.cancelEdit}
                </button>
              )}
            </div>

            <form onSubmit={handleArticleSubmit}>
              <div style={s.grid3}>
                <div style={s.fg}>
                  <label style={s.label}>{t.articleCode} <span style={s.req}>*</span></label>
                  <input style={s.input} required placeholder="ex: MP-COTON-BRUT"
                    value={formArticle.code}
                    onChange={e => setFormArticle({ ...formArticle, code: e.target.value })}
                    disabled={!!editId} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.articleName} <span style={s.req}>*</span></label>
                  <input style={s.input} required placeholder="ex: Coton brut"
                    value={formArticle.nom}
                    onChange={e => setFormArticle({ ...formArticle, nom: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.articleType} <span style={s.req}>*</span></label>
                  <select style={s.select} value={formArticle.type_article}
                    onChange={e => setFormArticle({ ...formArticle, type_article: e.target.value })}>
                    <option value="matiere_premiere">{t.rawMaterials}</option>
                    <option value="produit_fini">{t.finishedProducts}</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.initialQuantity}</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0"
                    value={formArticle.quantite}
                    onChange={e => setFormArticle({ ...formArticle, quantite: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.alertThreshold}</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0"
                    value={formArticle.quantite_min}
                    onChange={e => setFormArticle({ ...formArticle, quantite_min: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.unit}</label>
                  <select style={s.select} value={formArticle.unite}
                    onChange={e => setFormArticle({ ...formArticle, unite: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="pièce">pièce</option>
                    <option value="litre">litre</option>
                    <option value="mètre">mètre</option>
                  </select>
                </div>
              </div>
              <div style={s.btnRow}>
                <button type="button" style={s.btnSecondary} onClick={() => {
                  setEditId(null);
                  setFormArticle({ code: "", nom: "", type_article: "matiere_premiere", unite: "kg", quantite: "", quantite_min: "" });
                }}>
                  {t.reset}
                </button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? t.saving : editId ? t.update : t.create}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── MOUVEMENT ────────────────────────────────── */}
        {tab === "mouvement" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{t.manualStockMovement}</p>
                <p style={s.sectionSub}>{t.movementSubtitle}</p>
              </div>
            </div>

            <div style={s.infoBox}>
              {t.movementInfo}
            </div>

            <form onSubmit={handleMouvementSubmit}>
              <div style={s.grid3}>
                <div style={s.fg}>
                  <label style={s.label}>{t.articleName} <span style={s.req}>*</span></label>
                  <select style={s.select} required value={formMouvement.article_id}
                    onChange={e => setFormMouvement({ ...formMouvement, article_id: e.target.value })}>
                    <option value="">{t.selectArticle}</option>
                    {articles.map(a => (
                      <option key={a.id} value={a.id}>{a.code} — {a.nom} ({fmt(a.quantite)} kg)</option>
                    ))}
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.movementType} <span style={s.req}>*</span></label>
                  <select style={s.select} value={formMouvement.type_mouvement}
                    onChange={e => setFormMouvement({ ...formMouvement, type_mouvement: e.target.value })}>
                    <option value="entree">{t.entry}</option>
                    <option value="sortie">{t.exit}</option>
                    <option value="ajustement">{t.adjustment}</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.quantity} <span style={s.req}>*</span></label>
                  <input style={s.input} type="number" step="0.01" required placeholder="0"
                    value={formMouvement.quantite}
                    onChange={e => setFormMouvement({ ...formMouvement, quantite: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.source}</label>
                  <select style={s.select} value={formMouvement.source}
                    onChange={e => setFormMouvement({ ...formMouvement, source: e.target.value })}>
                    <option value="MANUEL">{t.manual}</option>
                    <option value="INVENTAIRE">{t.inventory}</option>
                    <option value="ACHAT">{t.purchase}</option>
                    <option value="RETOUR">{t.return}</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.reference}</label>
                  <input style={s.input} placeholder="N° BL, facture..."
                    value={formMouvement.reference}
                    onChange={e => setFormMouvement({ ...formMouvement, reference: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>{t.comment}</label>
                  <input style={s.input} placeholder={t.comment}
                    value={formMouvement.commentaire}
                    onChange={e => setFormMouvement({ ...formMouvement, commentaire: e.target.value })} />
                </div>
              </div>
              <div style={s.btnRow}>
                <button type="button" style={s.btnSecondary} onClick={() =>
                  setFormMouvement({ article_id: "", type_mouvement: "entree", quantite: "", source: "MANUEL", reference: "", commentaire: "" })
                }>{t.resetForm}</button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? t.saving : t.saveMovement}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── HISTORIQUE ────────────────────────────────── */}
        {tab === "historique" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{t.movementHistory}</p>
                <p style={s.sectionSub}>{mouvements.length} {t.movementsCount}</p>
              </div>
            </div>

            {mouvements.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <p style={{ fontWeight: 500, color: C.sub }}>{t.noMovements}</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {[t.colDate, t.colName, t.movementType, t.quantity, t.colBefore, t.colAfter, t.source, t.reference].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mouvements.map((m, i) => (
                      <tr key={m.id} style={s.tr(i)}>
                        <td style={{ ...s.td, color: C.muted, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {dateShort(m.created_at)}
                        </td>
                        <td style={s.td}>
                          <code style={{ color: C.accent, fontSize: "0.78rem", background: C.accentLt, padding: "1px 5px", borderRadius: 4 }}>
                            {m.article_code}
                          </code>
                          <div style={{ fontSize: "0.78rem", color: C.muted, marginTop: 2 }}>{m.article_nom}</div>
                        </td>
                        <td style={s.td}>
                          <span style={s.pill(movBg[m.type_mouvement], movColor[m.type_mouvement], movBorder[m.type_mouvement])}>
                            {movIcon[m.type_mouvement]} {m.type_mouvement === "entree" ? "entry" : m.type_mouvement === "sortie" ? "exit" : "adjustment"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <strong style={{ color: movColor[m.type_mouvement] }}>
                            {m.type_mouvement === "sortie" ? "-" : "+"}{fmt(m.quantite)} kg
                          </strong>
                        </td>
                        <td style={{ ...s.td, color: C.muted }}>{fmt(m.quantite_avant)} kg</td>
                        <td style={{ ...s.td, fontWeight: 500 }}>{fmt(m.quantite_apres)} kg</td>
                        <td style={s.td}>
                          <span style={s.pill(
                            m.source === "MES_PRODUCTION" ? C.purpleLt : C.accentLt,
                            m.source === "MES_PRODUCTION" ? C.purple : C.accent,
                            m.source === "MES_PRODUCTION" ? "#ddd6fe" : "#bfdbfe"
                          )}>
                            {m.source === "MANUEL" ? t.manual : m.source === "INVENTAIRE" ? t.inventory : m.source === "ACHAT" ? t.purchase : m.source === "RETOUR" ? t.return : m.source || "-"}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: C.muted, fontSize: "0.8rem" }}>{m.reference || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default GestionStock;