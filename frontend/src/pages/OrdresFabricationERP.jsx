// OrdresFabricationERP.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ERP_BASE_URL = "http://127.0.0.1:8001/api/erp/ordres-fabrication";

// ─── Palette claire (identique au module stock) ────────────────────────────
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

// ─── Styles (identique au module stock) ────────────────────────────────────
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
    gridTemplateColumns: "repeat(3, 1fr)",
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

  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
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

  btnRow: { display: "flex", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: `1px solid ${C.border}`, justifyContent: "flex-end" },
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
    background: C.green, color: "#fff",
    border: "none",
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
  emptyState: {
    textAlign: "center", padding: "3rem",
    color: C.muted,
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
  },
  emptyIcon: { fontSize: "2.5rem" },
  filterRow: {
    display: "flex", gap: "0.75rem",
    marginBottom: "1.25rem", flexWrap: "wrap",
    alignItems: "flex-end",
  },
  filterGroup: { flex: 1, minWidth: "180px" },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: C.surface,
    borderRadius: 12,
    padding: "1.5rem",
    maxWidth: 450,
    width: "90%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  modalActions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" },
};

const PRODUITS = [
  "Ruban 100% coton",
  "Ruban Polyester",
  "Ruban laine",
  "Ruban Acrylique",
  "Ruban Soie",
  "Ruban Lin",
];

const statutColor = {
  Brouillon: { bg: C.amberLt, text: C.amber },
  Envoyé: { bg: C.greenLt, text: C.green },
  Annulé: { bg: C.redLt, text: C.red },
};

const statutIcon = { Brouillon: "✏️", Envoyé: "✅", Annulé: "❌" };

// Génération du numéro séquentiel
const generateSequentialNumero = (existingOFs) => {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `OF-${yy}${mm}${dd}`;

  const todayOFs = existingOFs.filter(of => of.numero && of.numero.startsWith(prefix));
  const existingNumbers = todayOFs
    .map(of => {
      const match = of.numero.match(/OF-\d{6}-(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => num > 0);

  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    const maxNumber = Math.max(...existingNumbers);
    nextNumber = maxNumber + 1;
  }

  if (nextNumber > 999) {
    for (let i = 1; i <= 999; i++) {
      if (!existingNumbers.includes(i)) {
        nextNumber = i;
        break;
      }
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
};

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

const OrdresFabricationERP = () => {
  const [ofs, setOfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [editOf, setEditOf] = useState(null);
  const [filterProduit, setFilterProduit] = useState("");  // ← Changé ici
  const [filterStatut, setFilterStatut] = useState("");
  const [searchOF, setSearchOF] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    numero: "",
    produit: "",
    quantite: "",
    date_debut: "",
    date_fin: "",
  });

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const fetchOFs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(ERP_BASE_URL + "/");
      setOfs(res.data);
    } catch {
      showMsg("Erreur de chargement des OFs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOFs();
  }, [fetchOFs]);

  useEffect(() => {
    if (showForm && !editOf) {
      const newNumero = generateSequentialNumero(ofs);
      setForm(prev => ({ ...prev, numero: newNumero }));
    }
  }, [showForm, editOf, ofs]);

  const handleSubmit = async () => {
    if (!form.produit || !form.quantite) {
      showMsg("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    if (!editOf) {
      const existingOF = ofs.find(of => of.numero === form.numero);
      if (existingOF) {
        const newNumero = generateSequentialNumero(ofs);
        setForm(prev => ({ ...prev, numero: newNumero }));
        showMsg("Numéro déjà existant, nouveau numéro généré", "error");
        return;
      }
    }

    try {
      const payload = {
        numero: form.numero,
        produit: form.produit,
        quantite: parseInt(form.quantite),
        date_debut: form.date_debut || null,
        date_fin: form.date_fin || null,
      };

      if (editOf) {
        await axios.put(`${ERP_BASE_URL}/${editOf.id}`, payload);
        showMsg(`OF ${form.numero} mis à jour`);
      } else {
        await axios.post(ERP_BASE_URL + "/", payload);
        showMsg(`OF ${form.numero} créé`);
      }

      setShowForm(false);
      setEditOf(null);
      resetForm();
      fetchOFs();
    } catch (err) {
      const msg = err.response?.data?.detail || "Erreur lors de la sauvegarde";
      showMsg(msg, "error");
    }
  };

  const handleEnvoyer = async (of) => {
    setSendingId(of.id);
    try {
      await axios.post(`${ERP_BASE_URL}/${of.id}/envoyer-mes`);
      showMsg(`OF ${of.numero} envoyé au MES`);
      fetchOFs();
    } catch (err) {
      const msg = err.response?.data?.detail || "Erreur lors de l'envoi";
      showMsg(msg, "error");
    } finally {
      setSendingId(null);
    }
  };

  const handleEnvoyerTous = async () => {
    setSendingId("all");
    try {
      const res = await axios.post(`${ERP_BASE_URL}/envoyer-tous-mes`);
      showMsg(`${res.data.envoyes} OF(s) envoyés${res.data.erreurs > 0 ? `, ${res.data.erreurs} erreur(s)` : ""}`);
      fetchOFs();
    } catch {
      showMsg("Erreur lors de l'envoi en masse", "error");
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (of) => {
    try {
      await axios.delete(`${ERP_BASE_URL}/${of.id}`);
      showMsg(`OF ${of.numero} supprimé`);
      setConfirmDelete(null);
      fetchOFs();
    } catch (err) {
      showMsg(err.response?.data?.detail || "Erreur de suppression", "error");
    }
  };

  const openEdit = (of) => {
    setEditOf(of);
    setForm({
      numero: of.numero,
      produit: of.produit,
      quantite: String(of.quantite),
      date_debut: of.date_debut || "",
      date_fin: of.date_fin || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    const newNumero = generateSequentialNumero(ofs);
    setForm({
      numero: newNumero,
      produit: "",
      quantite: "",
      date_debut: "",
      date_fin: "",
    });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditOf(null);
    resetForm();
  };

  // Filtrage par produit (au lieu de machine)
  const filtered = ofs.filter((o) => {
    const matchProduit = !filterProduit || o.produit === filterProduit;
    const matchStatut = !filterStatut || o.statut_erp === filterStatut;
    const matchSearch = !searchOF || o.numero.toLowerCase().includes(searchOF.toLowerCase());
    return matchProduit && matchStatut && matchSearch;
  });

  const totalBrouillon = ofs.filter(o => o.statut_erp === "Brouillon").length;
  const totalEnvoye = ofs.filter(o => o.statut_erp === "Envoyé").length;

  return (
    <div style={s.app}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>E</div>
          <div>
            <p style={s.h1}>ERP — Ordres de Fabrication</p>
            <p style={s.h1sub}>Gestion des OF et interface MES</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={s.badgeOnline}><span style={s.dot} />En ligne</span>
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
            {msg.type === "error" ? "⚠️" : "✅"} {msg.text}
          </div>
        )}

        {/* KPI ROW */}
        <div style={s.kpiRow}>
          {[
            { label: "Total OFs", val: ofs.length, icon: "📊", color: C.accent, lt: C.accentLt },
            { label: "Brouillons", val: totalBrouillon, icon: "✏️", color: C.amber, lt: C.amberLt },
            { label: "Envoyés au MES", val: totalEnvoye, icon: "✅", color: C.green, lt: C.greenLt },
          ].map(k => (
            <div key={k.label} style={s.kpiCard(k.color, k.lt)}>
              <div style={s.kpiIcon(k.lt)}>{k.icon}</div>
              <div>
                <p style={s.kpiLabel}>{k.label}</p>
                <p style={s.kpiVal(k.color)}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIONS BAR */}
        <div style={{ ...s.section, padding: "1rem 1.5rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {totalBrouillon > 0 && (
                <button style={s.btnSecondary} onClick={handleEnvoyerTous} disabled={sendingId === "all"}>
                  {sendingId === "all" ? "⏳ Envoi..." : `🚀 Envoyer tout (${totalBrouillon})`}
                </button>
              )}
              <button style={s.btnPrimary} onClick={() => { setEditOf(null); resetForm(); setShowForm(true); }}>
                + Nouvel OF
              </button>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{ ...s.section, border: `2px solid ${C.accent}` }}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{editOf ? "✏️ Modifier l'OF" : "➕ Créer un OF"}</p>
                <p style={s.sectionSub}>Numérotation séquentielle automatique</p>
              </div>
              <button style={s.btnGhost} onClick={cancelForm}>✕ Annuler</button>
            </div>

            <div style={s.grid3}>
              <div style={s.fg}>
                <label style={s.label}>N° OF <span style={s.req}>*</span></label>
                <input
                  style={{ ...s.input, background: editOf ? C.inputBg : C.accentLt, fontFamily: "monospace", fontWeight: 600 }}
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="OF-YYMMDD-XXX"
                  readOnly={!editOf}
                />
                {!editOf && <small style={{ fontSize: "0.7rem", color: C.muted }}>Auto-généré (séquentiel par jour)</small>}
              </div>

              <div style={s.fg}>
                <label style={s.label}>Produit <span style={s.req}>*</span></label>
                <select style={s.select} value={form.produit} onChange={e => setForm({ ...form, produit: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {PRODUITS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div style={s.fg}>
                <label style={s.label}>Quantité (kg) <span style={s.req}>*</span></label>
                <input style={s.input} type="number" min="1" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} placeholder="Ex: 500" />
              </div>

              <div style={s.fg}>
                <label style={s.label}>Date début</label>
                <input style={s.input} type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} />
              </div>

              <div style={s.fg}>
                <label style={s.label}>Date fin</label>
                <input style={s.input} type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })} />
              </div>
            </div>

            <div style={s.btnRow}>
              <button type="button" style={s.btnGhost} onClick={cancelForm}>Annuler</button>
              <button style={s.btnPrimary} onClick={handleSubmit}>
                {editOf ? "💾 Mettre à jour" : "💾 Créer l'OF"}
              </button>
            </div>
          </div>
        )}

        {/* FILTRES & TABLEAU */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <div>
              <p style={s.sectionTitle}>Liste des ordres de fabrication</p>
              <p style={s.sectionSub}>{filtered.length} OF(s) affiché(s) sur {ofs.length}</p>
            </div>
          </div>

          <div style={s.filterRow}>
            <div style={s.filterGroup}>
              <label style={s.label}>🔍 Recherche</label>
              <input style={s.input} placeholder="N° OF..." value={searchOF} onChange={e => setSearchOF(e.target.value)} />
            </div>
            <div style={s.filterGroup}>
              <label style={s.label}>Produit</label>  {/* ← Changé ici */}
              <select style={s.select} value={filterProduit} onChange={e => setFilterProduit(e.target.value)}>
                <option value="">Tous les produits</option>
                {PRODUITS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={s.filterGroup}>
              <label style={s.label}>Statut</label>
              <select style={s.select} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
                <option value="">Tous statuts</option>
                <option value="Brouillon">✏️ Brouillon</option>
                <option value="Envoyé">✅ Envoyé</option>
                <option value="Annulé">❌ Annulé</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>⏳</div>
              <p>Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📭</div>
              <p>Aucun ordre de fabrication</p>
              <button style={s.btnPrimary} onClick={() => setShowForm(true)}>+ Créer un OF</button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead style={s.thead}>
                  <tr>
                    {["N° OF", "Produit", "Qté (kg)", "Date début", "Date fin", "Statut", "Actions"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((of, i) => {
                    const sc = statutColor[of.statut_erp] || { bg: C.bg, text: C.muted };
                    return (
                      <tr key={of.id} style={s.tr(i)}>
                        <td style={s.td}>
                          <code style={{ background: C.accentLt, padding: "2px 8px", borderRadius: 4, fontSize: "0.8rem", fontFamily: "monospace" }}>
                            {of.numero}
                          </code>
                        </td>
                        <td style={s.td}>{of.produit}</td>
                        <td style={s.td}><strong>{fmt(of.quantite)} kg</strong></td>
                        <td style={s.td}>{of.date_debut || "—"}</td>
                        <td style={s.td}>{of.date_fin || "—"}</td>
                        <td style={s.td}>
                          <span style={s.pill(sc.bg, sc.text, "transparent")}>
                            {statutIcon[of.statut_erp]} {of.statut_erp}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {of.statut_erp === "Brouillon" && (
                              <>
                                <button style={s.btnGhost} onClick={() => openEdit(of)} title="Modifier">✏️</button>
                                <button
                                  style={{ ...s.btnSecondary, padding: "0.4rem 0.85rem" }}
                                  onClick={() => handleEnvoyer(of)}
                                  disabled={sendingId === of.id}
                                  title="Envoyer au MES"
                                >
                                  {sendingId === of.id ? "⏳" : "🚀 Envoyer"}
                                </button>
                                <button
                                  style={{ ...s.btnDanger }}
                                  onClick={() => setConfirmDelete(of)}
                                  title="Supprimer"
                                >
                                  🗑
                                </button>
                              </>
                            )}
                            {of.statut_erp === "Envoyé" && (
                              <span style={{ color: C.green, fontSize: "0.8rem", fontWeight: 500 }}>✓ Transmis au MES</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CONFIRMATION */}
      {confirmDelete && (
        <div style={s.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 0.5rem", color: C.text }}>Confirmer la suppression</h3>
            <p style={{ color: C.sub, marginBottom: "1.5rem" }}>
              Voulez-vous supprimer l'OF <strong>{confirmDelete.numero}</strong> ?
            </p>
            <div style={s.modalActions}>
              <button style={s.btnGhost} onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button style={{ ...s.btnDanger, padding: "0.6rem 1.25rem" }} onClick={() => handleDelete(confirmDelete)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdresFabricationERP;