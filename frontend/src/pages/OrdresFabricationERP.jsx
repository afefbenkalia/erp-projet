// OrdresFabricationERP.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ERP_URL = "http://127.0.0.1:8001/api/erp/ordres-fabrication";

const MACHINES = ["Carde 01", "Carde 02", "Carde 03", "Carde 04", "Carde 05"];

const PRODUITS = [
  "Ruban  100% coton",
  "Ruban Polyester",
  "Ruban laine",
  "Ruban Acrylique",
  "Ruban Soie",
  "Ruban Lin",
];

// ── Utilitaires ────────────────────────────────────────────────────────────────

// Génère le numéro séquentiel basé sur les OF existants
const generateSequentialNumero = (existingOFs) => {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `OF-${yy}${mm}${dd}`;

  // Filtrer les OF du jour avec le même préfixe
  const todayOFs = existingOFs.filter(of => of.numero && of.numero.startsWith(prefix));
  
  // Extraire les numéros séquentiels existants
  const existingNumbers = todayOFs
    .map(of => {
      const match = of.numero.match(/OF-\d{6}-(\d{3})$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => num > 0);

  // Trouver le prochain numéro disponible
  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    const maxNumber = Math.max(...existingNumbers);
    nextNumber = maxNumber + 1;
  }

  // S'assurer que le numéro ne dépasse pas 999
  if (nextNumber > 999) {
    // Réinitialiser ou chercher un trou
    for (let i = 1; i <= 999; i++) {
      if (!existingNumbers.includes(i)) {
        nextNumber = i;
        break;
      }
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
};

const statutColor = {
  Brouillon: { bg: "#dbeafe", text: "#1e40af" },
  Envoyé: { bg: "#d1fae5", text: "#065f46" },
  Annulé: { bg: "#fee2e2", text: "#991b1b" },
};

const statutIcon = { Brouillon: "✏️", Envoyé: "✅", Annulé: "❌" };

// ── Composant principal ────────────────────────────────────────────────────────

const OrdresFabricationERP = () => {
  const [ofs, setOfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editOf, setEditOf] = useState(null);
  const [filterStatut, setFilterStatut] = useState("");
  const [filterMachine, setFilterMachine] = useState("");
  const [searchOF, setSearchOF] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    numero: "",
    machine: "",
    produit: "",
    quantite: "",
    date_debut: "",
    date_fin: "",
  });

  // ── API calls ──────────────────────────────────────────────────────────────

  const fetchOFs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(ERP_URL + "/");
      setOfs(res.data);
    } catch {
      showToast("Erreur de chargement des OFs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOFs();
  }, [fetchOFs]);

  // Mettre à jour le numéro OF quand le formulaire s'ouvre ou quand les OFs changent
  useEffect(() => {
    if (showForm && !editOf) {
      const newNumero = generateSequentialNumero(ofs);
      setForm(prev => ({ ...prev, numero: newNumero }));
    }
  }, [showForm, editOf, ofs]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (!form.machine || !form.produit || !form.quantite) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    // Vérifier l'unicité du numéro pour les nouveaux OFs
    if (!editOf) {
      const existingOF = ofs.find(of => of.numero === form.numero);
      if (existingOF) {
        // Générer un nouveau numéro en cas de collision
        const newNumero = generateSequentialNumero(ofs);
        setForm(prev => ({ ...prev, numero: newNumero }));
        showToast("Numéro déjà existant, nouveau numéro généré", "error");
        return;
      }
    }

    try {
      const payload = {
        ...form,
        quantite: parseInt(form.quantite),
        date_debut: form.date_debut || null,
        date_fin: form.date_fin || null,
      };

      if (editOf) {
        await axios.put(`${ERP_URL}/${editOf.id}`, payload);
        showToast(`OF ${form.numero} mis à jour avec succès`);
      } else {
        await axios.post(ERP_URL + "/", payload);
        showToast(`OF ${form.numero} créé avec succès`);
      }

      setShowForm(false);
      setEditOf(null);
      resetForm();
      fetchOFs();
    } catch (err) {
      const msg = err.response?.data?.detail || "Erreur lors de la sauvegarde";
      showToast(msg, "error");
    }
  };

  const handleEnvoyer = async (of) => {
    setSendingId(of.id);
    try {
      const res = await axios.post(`${ERP_URL}/${of.id}/envoyer-mes`);
      showToast(res.data.message || `OF ${of.numero} envoyé au MES`);
      fetchOFs();
    } catch (err) {
      const msg = err.response?.data?.detail || "Erreur lors de l'envoi au MES";
      showToast(msg, "error");
    } finally {
      setSendingId(null);
    }
  };

  const handleEnvoyerTous = async () => {
    setSendingId("all");
    try {
      const res = await axios.post(`${ERP_URL}/envoyer-tous-mes`);
      showToast(
        `${res.data.envoyes} OF(s) envoyés${res.data.erreurs > 0 ? `, ${res.data.erreurs} erreur(s)` : ""}`
      );
      fetchOFs();
    } catch (err) {
      showToast("Erreur lors de l'envoi en masse", "error");
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (of) => {
    try {
      await axios.delete(`${ERP_URL}/${of.id}`);
      showToast(`OF ${of.numero} supprimé`);
      setConfirmDelete(null);
      fetchOFs();
    } catch (err) {
      showToast(err.response?.data?.detail || "Erreur de suppression", "error");
    }
  };

  const openEdit = (of) => {
    setEditOf(of);
    setForm({
      numero: of.numero,
      machine: of.machine,
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
      machine: "",
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

  // ── Filtres ────────────────────────────────────────────────────────────────

  const filtered = ofs.filter(
    (o) =>
      (!filterStatut || o.statut_erp === filterStatut) &&
      (!filterMachine || o.machine === filterMachine) &&
      (!searchOF || o.numero.toLowerCase().includes(searchOF.toLowerCase()))
  );

  const totalBrouillon = ofs.filter((o) => o.statut_erp === "Brouillon").length;
  const totalEnvoye = ofs.filter((o) => o.statut_erp === "Envoyé").length;

  // ── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div style={s.container}>
      {/* TOAST */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === "error" ? "#fee2e2" : "#d1fae5", color: toast.type === "error" ? "#991b1b" : "#065f46" }}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: "2rem" }}>🏭</span>
          <div>
            <h1 style={s.title}>ERP – ORDRES DE FABRICATION</h1>
            <p style={s.subtitle}>Création &amp; Envoi vers le MES • Numérotation séquentielle automatique</p>
          </div>
        </div>
        <div style={s.headerActions}>
          {totalBrouillon > 0 && (
            <button
              style={s.btnSecondary}
              onClick={handleEnvoyerTous}
              disabled={sendingId === "all"}
            >
              {sendingId === "all" ? "⏳ Envoi..." : `🚀 Envoyer tout (${totalBrouillon})`}
            </button>
          )}
          <button style={s.btnPrimary} onClick={() => { setEditOf(null); resetForm(); setShowForm(true); }}>
            + Nouvel OF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={s.kpiGrid}>
        {[
          { label: "Total OFs", value: ofs.length, icon: "📊", color: "#2563eb" },
          { label: "Brouillons", value: totalBrouillon, icon: "✏️", color: "#d97706" },
          { label: "Envoyés au MES", value: totalEnvoye, icon: "✅", color: "#059669" },
        ].map((k) => (
          <div key={k.label} style={{ ...s.kpiCard, borderLeft: `4px solid ${k.color}` }}>
            <span style={{ fontSize: "1.8rem" }}>{k.icon}</span>
            <div>
              <p style={s.kpiLabel}>{k.label}</p>
              <p style={{ ...s.kpiValue, color: k.color }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div style={s.formCard}>
          <h2 style={s.sectionTitle}>{editOf ? "✏️ Modifier l'OF" : "➕ Créer un OF"}</h2>
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.label}>N° OF *</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...s.input, background: "#f8fafc", fontFamily: "monospace", fontWeight: "600" }}
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="OF-YYMMDD-XXX"
                  readOnly={!editOf}
                />
               
              </div>
              {!editOf && (
                <small style={s.helperText}>Numéro généré automatiquement (séquentiel par jour)</small>
              )}
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Machine *</label>
              <select
                style={s.select}
                value={form.machine}
                onChange={(e) => setForm({ ...form, machine: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                {MACHINES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Produit *</label>
              <select
                style={s.select}
                value={form.produit}
                onChange={(e) => setForm({ ...form, produit: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                {PRODUITS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Quantité (kg) *</label>
              <input
                style={s.input}
                type="number"
                min="1"
                value={form.quantite}
                onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                placeholder="Ex: 500"
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Date début</label>
              <input
                style={s.input}
                type="date"
                value={form.date_debut}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Date fin</label>
              <input
                style={s.input}
                type="date"
                value={form.date_fin}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
              />
            </div>
          </div>

          <div style={s.formActions}>
            <button style={s.btnCancel} onClick={cancelForm}>Annuler</button>
            <button style={s.btnPrimary} onClick={handleSubmit}>
              {editOf ? "💾 Mettre à jour" : "💾 Créer l'OF"}
            </button>
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div style={s.content}>
        <div style={s.filterRow}>
          <input
            style={{ ...s.input, maxWidth: "220px" }}
            placeholder="🔍 Rechercher N° OF..."
            value={searchOF}
            onChange={(e) => setSearchOF(e.target.value)}
          />
          <select style={{ ...s.select, maxWidth: "180px" }} value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)}>
            <option value="">Toutes machines</option>
            {MACHINES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={{ ...s.select, maxWidth: "160px" }} value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="Brouillon">✏️ Brouillon</option>
            <option value="Envoyé">✅ Envoyé</option>
            <option value="Annulé">❌ Annulé</option>
          </select>
        </div>

        {/* TABLEAU */}
        {loading ? (
          <div style={s.empty}>⏳ Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📭</span>
            Aucun ordre de fabrication
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["N° OF", "Machine", "Produit", "Qté (kg)", "Début", "Fin", "Statut ERP", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((of, i) => {
                  const sc = statutColor[of.statut_erp] || { bg: "#f1f5f9", text: "#475569" };
                  return (
                    <tr key={of.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <td style={s.td}><span style={s.ofTag}>{of.numero}</span></td>
                      <td style={s.td}>{of.machine}</td>
                      <td style={s.td}>{of.produit}</td>
                      <td style={s.td}><strong>{of.quantite}</strong></td>
                      <td style={s.td}>{of.date_debut || "—"}</td>
                      <td style={s.td}>{of.date_fin || "—"}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: sc.bg, color: sc.text }}>
                          {statutIcon[of.statut_erp]} {of.statut_erp}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {of.statut_erp === "Brouillon" && (
                            <>
                              <button style={s.btnAction} onClick={() => openEdit(of)} title="Modifier">✏️</button>
                              <button
                                style={{ ...s.btnAction, background: "#dbeafe", color: "#1e40af" }}
                                onClick={() => handleEnvoyer(of)}
                                disabled={sendingId === of.id}
                                title="Envoyer au MES"
                              >
                                {sendingId === of.id ? "⏳" : "🚀 MES"}
                              </button>
                              <button
                                style={{ ...s.btnAction, background: "#fee2e2", color: "#991b1b" }}
                                onClick={() => setConfirmDelete(of)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                          {of.statut_erp === "Envoyé" && (
                            <span style={{ color: "#059669", fontSize: "0.85rem" }}>Transmis ✓</span>
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

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete && (
        <div style={s.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem", color: "#0f172a" }}>Confirmer la suppression</h3>
            <p style={{ color: "#475569", margin: "0 0 1.5rem" }}>
              Voulez-vous supprimer l'OF <strong>{confirmDelete.numero}</strong> ?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button style={s.btnCancel} onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button
                style={{ ...s.btnPrimary, background: "#dc2626" }}
                onClick={() => handleDelete(confirmDelete)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  container: {
    padding: "2rem",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
  },
  toast: {
    position: "fixed",
    top: "1.5rem",
    right: "1.5rem",
    padding: "0.9rem 1.4rem",
    borderRadius: "10px",
    fontWeight: "500",
    fontSize: "0.95rem",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    maxWidth: "400px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "1.5rem 2rem",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  headerActions: { display: "flex", gap: "0.75rem", alignItems: "center" },
  title: { margin: 0, color: "#0f172a", fontSize: "1.6rem", fontWeight: "700" },
  subtitle: { margin: 0, color: "#64748b", fontSize: "0.85rem" },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  kpiCard: {
    background: "#fff",
    padding: "1.25rem 1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  kpiLabel: { margin: "0 0 0.25rem", color: "#64748b", fontSize: "0.9rem" },
  kpiValue: { margin: 0, fontSize: "2rem", fontWeight: "700" },
  formCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
    marginBottom: "2rem",
    border: "2px solid #3b82f6",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "1.25rem",
    marginBottom: "1.5rem",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.4rem", position: "relative" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#374151" },
  formActions: { display: "flex", gap: "1rem", justifyContent: "flex-end" },
  content: {
    background: "#fff",
    borderRadius: "16px",
    padding: "1.5rem 2rem",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
  },
  filterRow: { display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  sectionTitle: { margin: "0 0 1.5rem", color: "#0f172a", fontSize: "1.2rem", fontWeight: "600" },
  input: {
    padding: "0.7rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
    color: "#0f172a",
  },
  select: {
    padding: "0.7rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "#fff",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    color: "#0f172a",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    borderBottom: "2px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  td: { padding: "0.75rem 1rem", borderBottom: "1px solid #f1f5f9", color: "#1e293b" },
  ofTag: {
    background: "#e2e8f0",
    color: "#334155",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.82rem",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.82rem",
    fontWeight: "600",
    display: "inline-block",
    whiteSpace: "nowrap",
  },
  btnPrimary: {
    padding: "0.7rem 1.4rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  btnSecondary: {
    padding: "0.7rem 1.4rem",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },
  btnCancel: {
    padding: "0.7rem 1.4rem",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  btnAction: {
    padding: "0.3rem 0.6rem",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.95rem" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9000,
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "420px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  autoBadge: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "#3b82f6",
    color: "#fff",
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: "12px",
    fontWeight: "600",
  },
  helperText: {
    fontSize: "0.7rem",
    color: "#64748b",
    marginTop: "4px",
  },
};

export default OrdresFabricationERP;