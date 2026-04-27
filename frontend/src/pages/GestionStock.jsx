import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ERP_BASE_URL = "http://127.0.0.1:8001/api/stock";

// ─── Palette claire ────────────────────────────────────────────
const C = {
  bg:       "#f4f6f9",
  surface:  "#ffffff",
  card:     "#ffffff",
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
  text:     "#111827",
  sub:      "#374151",
  muted:    "#6b7280",
  inputBg:  "#f9fafb",
};

const s = {
  app: {
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    background: C.bg,
    minHeight: "100vh",
    color: C.text,
  },
  topbar: {
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: "0.75rem" },
  logo: {
    width: 34, height: 34,
    background: C.accent,
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1rem", fontWeight: 700, color: "#fff",
    letterSpacing: "-0.03em",
  },
  h1: { margin: 0, fontSize: "1rem", fontWeight: 600, color: C.text, letterSpacing: "-0.01em" },
  h1sub: { margin: 0, fontSize: "0.75rem", color: C.muted },
  badgeOnline: {
    background: C.greenLt, color: C.green,
    border: `1px solid #bbf7d0`,
    borderRadius: 20, padding: "3px 10px",
    fontSize: "0.72rem", fontWeight: 600,
    display: "flex", alignItems: "center", gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" },
  badgeSync: {
    background: C.accentLt, color: C.accent,
    border: `1px solid #bfdbfe`,
    borderRadius: 20, padding: "3px 10px",
    fontSize: "0.72rem", fontWeight: 600,
  },

  main: { padding: "1.75rem 2rem", maxWidth: 1400, margin: "0 auto" },

  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "1.75rem",
  },
  kpiCard: (accent, lt) => ({
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "1.1rem 1.25rem",
    display: "flex", alignItems: "center", gap: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }),
  kpiIcon: (lt) => ({
    width: 40, height: 40, borderRadius: 8,
    background: lt,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.15rem", flexShrink: 0,
  }),
  kpiLabel: { margin: "0 0 2px", fontSize: "0.72rem", color: C.muted, fontWeight: 500, letterSpacing: "0.03em" },
  kpiVal: (color) => ({ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: color, lineHeight: 1 }),

  tabRow: {
    display: "flex", gap: "0.25rem", marginBottom: "1.5rem",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "4px",
    width: "fit-content",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  tab: (active) => ({
    padding: "0.5rem 1.1rem",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: active ? 600 : 400,
    background: active ? C.accent : "transparent",
    color: active ? "#fff" : C.muted,
    transition: "all 0.15s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  }),

  section: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "1.5rem",
    marginBottom: "1.25rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "1.25rem",
    paddingBottom: "0.75rem",
    borderBottom: `1px solid ${C.border}`,
  },
  sectionTitle: { margin: 0, fontSize: "0.9rem", fontWeight: 600, color: C.text },
  sectionSub: { margin: 0, fontSize: "0.78rem", color: C.muted },

  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" },
  fg: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.78rem", fontWeight: 500, color: C.sub },
  req: { color: C.red, marginLeft: 2 },
  input: {
    padding: "0.6rem 0.85rem",
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    color: C.text,
    fontSize: "0.875rem",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  select: {
    padding: "0.6rem 0.85rem",
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    color: C.text,
    fontSize: "0.875rem",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },

  btnRow: { display: "flex", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}` },
  btnPrimary: {
    background: C.accent, color: "#fff",
    border: "none", borderRadius: 7,
    padding: "0.6rem 1.5rem",
    fontFamily: "inherit", fontWeight: 600, fontSize: "0.875rem",
    cursor: "pointer", transition: "opacity .15s",
  },
  btnDanger: {
    background: C.redLt, color: C.red,
    border: `1px solid #fecaca`,
    borderRadius: 7, padding: "0.5rem 0.85rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.8rem",
    cursor: "pointer",
  },
  btnGhost: {
    background: C.inputBg, color: C.sub,
    border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "0.5rem 0.85rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.8rem",
    cursor: "pointer",
  },
  btnSecondary: {
    background: C.inputBg, color: C.sub,
    border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "0.6rem 1.25rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.875rem",
    cursor: "pointer",
  },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  thead: { background: C.bg },
  th: {
    textAlign: "left", padding: "0.6rem 0.9rem",
    borderBottom: `1px solid ${C.border}`,
    color: C.muted, fontWeight: 600, fontSize: "0.72rem",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  tr: (i) => ({
    background: i % 2 === 0 ? "#fff" : C.bg,
  }),
  td: { padding: "0.7rem 0.9rem", borderBottom: `1px solid ${C.border}`, color: C.sub, verticalAlign: "middle" },

  pill: (bg, color, border) => ({
    display: "inline-flex", alignItems: "center",
    padding: "2px 9px", borderRadius: 20,
    fontSize: "0.72rem", fontWeight: 600,
    background: bg, color: color,
    border: `1px solid ${border}`,
  }),

  alertBox: (bg, border, color) => ({
    background: bg,
    border: `1px solid ${border}`,
    borderLeft: `3px solid ${color}`,
    borderRadius: 8,
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.85rem",
    color: color,
    display: "flex", alignItems: "flex-start", gap: "0.5rem",
  }),
  infoBox: {
    background: C.accentLt,
    border: `1px solid #bfdbfe`,
    borderLeft: `3px solid ${C.accent}`,
    borderRadius: 8,
    padding: "0.75rem 1rem",
    marginBottom: "1.25rem",
    fontSize: "0.85rem",
    color: "#1d4ed8",
    lineHeight: 1.5,
  },
  emptyState: {
    textAlign: "center", padding: "3rem",
    color: C.muted,
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
  },
  emptyIcon: { fontSize: "2.5rem" },
};

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
const dateShort = (d) => d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

const GestionStock = () => {
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
        showMsg("✅ Article mis à jour");
      } else {
        await axios.post(`${ERP_BASE_URL}/articles`, formArticle);
        showMsg("✅ Article créé");
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
    if (!window.confirm("Supprimer cet article ?")) return;
    try {
      await axios.delete(`${ERP_BASE_URL}/articles/${id}`);
      showMsg("🗑️ Article supprimé");
      loadArticles(); loadDashboard();
    } catch (err) { showMsg("❌ " + (err.response?.data?.detail || err.message), "error"); }
  };

  const handleMouvementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${ERP_BASE_URL}/mouvements`, formMouvement);
      showMsg("✅ Mouvement enregistré");
      setFormMouvement({ article_id: "", type_mouvement: "entree", quantite: "", source: "MANUEL", reference: "", commentaire: "" });
      loadArticles(); loadMouvements(); loadDashboard();
    } catch (err) {
      showMsg("❌ " + (err.response?.data?.detail || err.message), "error");
    } finally { setLoading(false); }
  };

  const kpis = [
    { label: "Articles total",  val: dashboard?.total_articles ?? 0,             color: C.accent, lt: C.accentLt, icon: "📦" },
    { label: "Stock MP (kg)",   val: fmt(dashboard?.total_stock_mp_kg),           color: C.purple, lt: C.purpleLt, icon: "🌾" },
    { label: "Stock PF (kg)",   val: fmt(dashboard?.total_stock_pf_kg),           color: C.green,  lt: C.greenLt,  icon: "✅" },
    { label: "Alertes stock",   val: dashboard?.nb_alertes_stock ?? 0,
      color: (dashboard?.nb_alertes_stock > 0) ? C.red : C.green,
      lt: (dashboard?.nb_alertes_stock > 0) ? C.redLt : C.greenLt, icon: "⚠️" },
  ];

  const movColor  = { entree: C.green,  sortie: C.red,    ajustement: C.amber };
  const movBg     = { entree: C.greenLt, sortie: C.redLt, ajustement: C.amberLt };
  const movBorder = { entree: "#bbf7d0", sortie: "#fecaca", ajustement: "#fde68a" };
  const movIcon   = { entree: "↑",       sortie: "↓",      ajustement: "⇄" };

  const tabs = [
    { id: "stock",      label: "📦 Stock" },
    { id: "gestion",    label: "➕ Article" },
    { id: "mouvement",  label: "🔄 Mouvement" },
    { id: "historique", label: "📋 Historique" },
  ];

  return (
    <div style={s.app}>

      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>S</div>
          <div>
            <p style={s.h1}>ERP — Gestion des Stocks</p>
            <p style={s.h1sub}>Système intégré MES + ERP</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={s.badgeOnline}><span style={s.dot}/>En ligne</span>
          <span style={s.badgeSync}>Sync MES</span>
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
            ⚠️ Stock critique : {dashboard.articles_en_alerte.map(a => `${a.nom} (${fmt(a.quantite)} kg)`).join(" • ")}
          </div>
        )}

        {/* KPI ROW */}
        <div style={s.kpiRow}>
          {kpis.map(k => (
            <div key={k.label} style={s.kpiCard(k.color, k.lt)}>
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
          {tabs.map(t => (
            <button key={t.id} style={s.tab(tab === t.id)}
              onClick={() => { setTab(t.id); setEditId(null); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── STOCK ────────────────────────────────────── */}
        {tab === "stock" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>État du stock</p>
                <p style={s.sectionSub}>{articles.length} article(s) enregistré(s)</p>
              </div>
              <select
                style={{ ...s.select, width: "auto", padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="matiere_premiere">Matières premières</option>
                <option value="produit_fini">Produits finis</option>
              </select>
            </div>

            {articles.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <p style={{ fontWeight: 500, color: C.sub }}>Aucun article en stock</p>
                <p style={{ fontSize: "0.85rem" }}>Créez vos articles dans l'onglet "Article"</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {["Code", "Nom", "Type", "Qté stock", "Seuil alerte", "Unité", "Statut", "Actions"].map(h => (
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
                            ? <span style={s.pill(C.purpleLt, C.purple, "#ddd6fe")}>MP</span>
                            : <span style={s.pill(C.greenLt, C.green, "#bbf7d0")}>PF</span>}
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
                            ? <span style={s.pill(C.redLt, C.red, "#fecaca")}>⚠ Critique</span>
                            : <span style={s.pill(C.greenLt, C.green, "#bbf7d0")}>✓ OK</span>}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button style={s.btnGhost} onClick={() => handleEdit(a)}>✏️ Modifier</button>
                            <button style={s.btnDanger} onClick={() => handleDelete(a.id)}>🗑</button>
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
                <p style={s.sectionTitle}>{editId ? "Modifier l'article" : "Créer un article"}</p>
                <p style={s.sectionSub}>Renseignez les informations de l'article</p>
              </div>
              {editId && (
                <button style={s.btnGhost} onClick={() => { setEditId(null); setFormArticle({ code: "", nom: "", type_article: "matiere_premiere", unite: "kg", quantite: "", quantite_min: "" }); }}>
                  ✕ Annuler la modification
                </button>
              )}
            </div>

            <form onSubmit={handleArticleSubmit}>
              <div style={s.grid3}>
                <div style={s.fg}>
                  <label style={s.label}>Code article <span style={s.req}>*</span></label>
                  <input style={s.input} required placeholder="ex: MP-COTON-BRUT"
                    value={formArticle.code}
                    onChange={e => setFormArticle({ ...formArticle, code: e.target.value })}
                    disabled={!!editId} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Nom <span style={s.req}>*</span></label>
                  <input style={s.input} required placeholder="ex: Coton brut"
                    value={formArticle.nom}
                    onChange={e => setFormArticle({ ...formArticle, nom: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Type <span style={s.req}>*</span></label>
                  <select style={s.select} value={formArticle.type_article}
                    onChange={e => setFormArticle({ ...formArticle, type_article: e.target.value })}>
                    <option value="matiere_premiere">Matière première</option>
                    <option value="produit_fini">Produit fini</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Quantité initiale (kg)</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0"
                    value={formArticle.quantite}
                    onChange={e => setFormArticle({ ...formArticle, quantite: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Seuil d'alerte (kg)</label>
                  <input style={s.input} type="number" step="0.01" placeholder="0"
                    value={formArticle.quantite_min}
                    onChange={e => setFormArticle({ ...formArticle, quantite_min: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Unité</label>
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
                  Réinitialiser
                </button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "⏳ Enregistrement..." : editId ? "💾 Mettre à jour" : "➕ Créer l'article"}
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
                <p style={s.sectionTitle}>Mouvement de stock manuel</p>
                <p style={s.sectionSub}>Pour les ajustements, achats et inventaires</p>
              </div>
            </div>

            <div style={s.infoBox}>
              ℹ️ Les mouvements liés aux productions MES sont créés <strong>automatiquement</strong>. Cet onglet est uniquement pour les ajustements manuels.
            </div>

            <form onSubmit={handleMouvementSubmit}>
              <div style={s.grid3}>
                <div style={s.fg}>
                  <label style={s.label}>Article <span style={s.req}>*</span></label>
                  <select style={s.select} required value={formMouvement.article_id}
                    onChange={e => setFormMouvement({ ...formMouvement, article_id: e.target.value })}>
                    <option value="">-- Sélectionner un article --</option>
                    {articles.map(a => (
                      <option key={a.id} value={a.id}>{a.code} — {a.nom} ({fmt(a.quantite)} kg)</option>
                    ))}
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Type de mouvement <span style={s.req}>*</span></label>
                  <select style={s.select} value={formMouvement.type_mouvement}
                    onChange={e => setFormMouvement({ ...formMouvement, type_mouvement: e.target.value })}>
                    <option value="entree">↑ Entrée — augmente le stock</option>
                    <option value="sortie">↓ Sortie — diminue le stock</option>
                    <option value="ajustement">⇄ Ajustement — remplace la valeur</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Quantité (kg) <span style={s.req}>*</span></label>
                  <input style={s.input} type="number" step="0.01" required placeholder="0"
                    value={formMouvement.quantite}
                    onChange={e => setFormMouvement({ ...formMouvement, quantite: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Source</label>
                  <select style={s.select} value={formMouvement.source}
                    onChange={e => setFormMouvement({ ...formMouvement, source: e.target.value })}>
                    <option value="MANUEL">Manuel</option>
                    <option value="INVENTAIRE">Inventaire</option>
                    <option value="ACHAT">Achat</option>
                    <option value="RETOUR">Retour</option>
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Référence</label>
                  <input style={s.input} placeholder="N° BL, facture..."
                    value={formMouvement.reference}
                    onChange={e => setFormMouvement({ ...formMouvement, reference: e.target.value })} />
                </div>
                <div style={s.fg}>
                  <label style={s.label}>Commentaire</label>
                  <input style={s.input} placeholder="Optionnel"
                    value={formMouvement.commentaire}
                    onChange={e => setFormMouvement({ ...formMouvement, commentaire: e.target.value })} />
                </div>
              </div>
              <div style={s.btnRow}>
                <button type="button" style={s.btnSecondary} onClick={() =>
                  setFormMouvement({ article_id: "", type_mouvement: "entree", quantite: "", source: "MANUEL", reference: "", commentaire: "" })
                }>Réinitialiser</button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "⏳ Enregistrement..." : "🔄 Enregistrer le mouvement"}
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
                <p style={s.sectionTitle}>Historique des mouvements</p>
                <p style={s.sectionSub}>{mouvements.length} mouvement(s) enregistré(s)</p>
              </div>
            </div>

            {mouvements.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                <p style={{ fontWeight: 500, color: C.sub }}>Aucun mouvement enregistré</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {["Date", "Article", "Type", "Quantité", "Avant", "Après", "Source", "Référence"].map(h => (
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
                            {movIcon[m.type_mouvement]} {m.type_mouvement}
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
                            {m.source || "-"}
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