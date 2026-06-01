import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";

const BASE = "http://127.0.0.1:8001/api/appro";
const STOCK_URL = "http://127.0.0.1:8001/api/stock/articles";

// ─── Traductions ────────────────────────────────────────────
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
    
    // Topbar
    appTitle: "ERP — Approvisionnement",
    appSubtitle: "Fournisseurs • Commandes Achat • Réceptions",
    online: "En ligne",
    activeSuppliers: "fournisseurs actifs",
    
    // KPIs
    totalOrders: "Total commandes",
    sentOrders: "Envoyées",
    receivedOrders: "Reçues",
    delayedOrders: "En retard",
    
    // Tabs
    tabOrders: "🛒 Commandes achat",
    tabSuppliers: "🏢 Fournisseurs",
    tabReceipts: "📦 Réceptions",
    
    // Commandes
    ordersTitle: "Commandes achat",
    newOrder: "Nouvelle commande",
    editOrder: "Modifier la commande",
    orderNumber: "N° Commande",
    supplier: "Fournisseur",
    article: "Article",
    quantityOrdered: "Quantité commandée (kg)",
    orderDate: "Date commande",
    comment: "Commentaire",
    createOrder: "Créer la commande",
    updateOrder: "Mettre à jour",
    noOrders: "Aucune commande trouvée",
    searchPlaceholder: "N° ou article...",
    allStatus: "Tous les statuts",
    allSuppliers: "Tous les fournisseurs",
    qtyOrdered: "Qté commandée",
    qtyReceived: "Reçue",
    progress: "Avancement",
    status: "Statut",
    actions: "Actions",
    send: "Envoyer",
    receive: "Réceptionner",
    complete: "Compléter",
    received: "Reçue",
    delete: "Supprimer",
    
    // Fournisseurs
    suppliersTitle: "Fournisseurs enregistrés",
    newSupplier: "Nouveau fournisseur",
    editSupplier: "Modifier le fournisseur",
    supplierCode: "Code",
    supplierName: "Nom",
    contact: "Contact",
    phone: "Téléphone",
    email: "Email",
    deliveryDelay: "Délai livraison (jours)",
    suppliedArticle: "Article fourni",
    statusActive: "Statut",
    active: "Actif",
    inactive: "Inactif",
    address: "Adresse",
    multiple: "Multiple",
    noSuppliers: "Aucun fournisseur enregistré",
    phoneInvalid: "Veuillez entrer 8 chiffres",
    phoneValid: "Numéro valide",
    phonePlaceholder: "+216 XX XXX XXX",
    
    // Réceptions
    receiptsTitle: "Historique des réceptions",
    receiptsSubtitle: "réception(s) — Stock mis à jour automatiquement",
    receiptInfo: "ℹ️ Chaque réception crée automatiquement un mouvement de stock ENTRÉE dans le module stock ERP.",
    noReceipts: "Aucune réception enregistrée",
    receiptHint: "Réceptionnez une commande depuis l'onglet 'Commandes achat'",
    orderNum: "N° Commande",
    qtyReceivedLabel: "Quantité reçue",
    receiptDate: "Date réception",
    stockMovement: "Mvt. stock",
    
    // Modal
    receiveOrder: "Réceptionner la commande",
    commanded: "Commandée",
    alreadyReceived: "Déjà reçue",
    remaining: "Reste à livrer",
    qtyToReceive: "Quantité reçue (kg)",
    receiptDateLabel: "Date réception",
    observation: "Observations éventuelles",
    confirmReceipt: "Confirmer la réception",
    cancelOrder: "Annuler la commande",
    deleteOrder: "Supprimer la commande",
    cancelConfirm: "La commande sera marquée comme annulée.",
    deleteConfirm: "La commande sera supprimée définitivement.",
    back: "Retour",
    
    // Messages feedback
    orderCreated: "Commande créée",
    orderUpdated: "Commande mise à jour",
    orderSent: "Commande envoyée au fournisseur",
    orderCancelled: "Commande annulée",
    orderDeleted: "Commande supprimée",
    receiptSaved: "Réception enregistrée — stock mis à jour automatiquement ✅",
    supplierCreated: "Fournisseur créé",
    supplierUpdated: "Fournisseur mis à jour",
    supplierDeleted: "Fournisseur supprimé",
    fillRequiredFields: "Remplissez tous les champs obligatoires",
    errorLoading: "Erreur de chargement",
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
    
    // Topbar
    appTitle: "ERP — Procurement",
    appSubtitle: "Suppliers • Purchase Orders • Receipts",
    online: "Online",
    activeSuppliers: "active suppliers",
    
    // KPIs
    totalOrders: "Total Orders",
    sentOrders: "Sent",
    receivedOrders: "Received",
    delayedOrders: "Delayed",
    
    // Tabs
    tabOrders: "🛒 Purchase Orders",
    tabSuppliers: "🏢 Suppliers",
    tabReceipts: "📦 Receipts",
    
    // Orders
    ordersTitle: "Purchase Orders",
    newOrder: "New Order",
    editOrder: "Edit Order",
    orderNumber: "Order #",
    supplier: "Supplier",
    article: "Article",
    quantityOrdered: "Quantity ordered (kg)",
    orderDate: "Order Date",
    comment: "Comment",
    createOrder: "Create Order",
    updateOrder: "Update",
    noOrders: "No orders found",
    searchPlaceholder: "Order # or article...",
    allStatus: "All statuses",
    allSuppliers: "All suppliers",
    qtyOrdered: "Qty Ordered",
    qtyReceived: "Received",
    progress: "Progress",
    status: "Status",
    actions: "Actions",
    send: "Send",
    receive: "Receive",
    complete: "Complete",
    received: "Received",
    delete: "Delete",
    
    // Suppliers
    suppliersTitle: "Registered Suppliers",
    newSupplier: "New Supplier",
    editSupplier: "Edit Supplier",
    supplierCode: "Code",
    supplierName: "Name",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    deliveryDelay: "Delivery delay (days)",
    suppliedArticle: "Supplied Article",
    statusActive: "Status",
    active: "Active",
    inactive: "Inactive",
    address: "Address",
    multiple: "Multiple",
    noSuppliers: "No suppliers registered",
    phoneInvalid: "Please enter 8 digits",
    phoneValid: "Valid number",
    phonePlaceholder: "+216 XX XXX XXX",
    
    // Receipts
    receiptsTitle: "Receipts History",
    receiptsSubtitle: "receipt(s) — Stock automatically updated",
    receiptInfo: "ℹ️ Each receipt automatically creates an ENTRY stock movement in the stock ERP module.",
    noReceipts: "No receipts recorded",
    receiptHint: "Receive an order from the 'Purchase Orders' tab",
    orderNum: "Order #",
    qtyReceivedLabel: "Quantity received",
    receiptDate: "Receipt Date",
    stockMovement: "Stock Mov.",
    
    // Modal
    receiveOrder: "Receive Order",
    commanded: "Ordered",
    alreadyReceived: "Already received",
    remaining: "Remaining to deliver",
    qtyToReceive: "Quantity received (kg)",
    receiptDateLabel: "Receipt Date",
    observation: "Observations",
    confirmReceipt: "Confirm Receipt",
    cancelOrder: "Cancel Order",
    deleteOrder: "Delete Order",
    cancelConfirm: "The order will be marked as cancelled.",
    deleteConfirm: "The order will be permanently deleted.",
    back: "Back",
    
    // Messages feedback
    orderCreated: "Order created",
    orderUpdated: "Order updated",
    orderSent: "Order sent to supplier",
    orderCancelled: "Order cancelled",
    orderDeleted: "Order deleted",
    receiptSaved: "Receipt recorded — stock automatically updated ✅",
    supplierCreated: "Supplier created",
    supplierUpdated: "Supplier updated",
    supplierDeleted: "Supplier deleted",
    fillRequiredFields: "Please fill all required fields",
    errorLoading: "Loading error",
  },
};

// ─── Palette factory (dark / light) ────────────────────────
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

// ─── Couleurs statut commande (dynamiques avec le thème) ───
const getStatutStyle = (C) => ({
  "Brouillon": { bg: C.amberLt, color: C.amber, border: "#fde68a", icon: "✏️" },
  "Envoyée": { bg: "#fef9c3", color: "#854d0e", border: "#fde68a", icon: "📤" },
  "Reçue partielle": { bg: "#fed7aa", color: "#9a3412", border: "#fdba74", icon: "⚠️" },
  "Reçue totale": { bg: C.greenLt, color: C.green, border: "#bbf7d0", icon: "✅" },
  "Annulée": { bg: C.redLt, color: C.red, border: "#fecaca", icon: "❌" },
});

// ─── Style factory (dynamique avec le thème) ───────────────
const makeS = (C) => ({
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
  kpiCard: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "1.1rem 1.25rem",
    display: "flex", alignItems: "center", gap: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
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
    border: "none", borderRadius: 7,
    cursor: "pointer", fontSize: "0.85rem",
    fontWeight: active ? 600 : 400,
    background: active ? C.accent : "transparent",
    color: active ? "#fff" : C.muted,
    transition: "all 0.15s", fontFamily: "inherit",
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

  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" },
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
  inputReadOnly: {
    padding: "0.6rem 0.85rem",
    background: isDark => isDark ? "#1e293b" : "#f3f4f6",
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    color: C.muted,
    fontSize: "0.875rem",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
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
  textarea: {
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
    resize: "vertical",
    minHeight: 60,
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
    background: C.inputBg, color: C.sub,
    border: `1px solid ${C.border}`,
    borderRadius: 7, padding: "0.6rem 1.25rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.875rem",
    cursor: "pointer",
  },
  btnAction: (bg, color, border) => ({
    background: bg, color,
    border: `1px solid ${border}`,
    borderRadius: 6, padding: "0.3rem 0.65rem",
    fontFamily: "inherit", fontWeight: 500, fontSize: "0.78rem",
    cursor: "pointer",
  }),

  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  thead: { background: C.bg },
  th: {
    textAlign: "left", padding: "0.6rem 0.9rem",
    borderBottom: `1px solid ${C.border}`,
    color: C.muted, fontWeight: 600, fontSize: "0.72rem",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  tr: (i) => ({
    background: i % 2 === 0 ? C.trOdd : C.trEven,
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
    color: C.accent,
    lineHeight: 1.5,
  },
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
  filterGroup: { flex: 1, minWidth: "160px" },
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
  progressBar: (pct, color) => ({
    height: 6, borderRadius: 3,
    background: `linear-gradient(to right, ${color} ${pct}%, #e5e7eb ${pct}%)`,
  }),
});

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 });

// ─── Générateur de numéro séquentiel ────────────────────────
const genNumero = (prefix, existing) => {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const pref = `${prefix}-${yy}${mm}${dd}`;
  const nums = existing
    .filter((x) => x.numero?.startsWith(pref))
    .map((x) => {
      const m = x.numero?.match(/-(\d{3})$/);
      return m ? parseInt(m[1]) : 0;
    });
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${pref}-${String(next).padStart(3, "0")}`;
};

// ─── Fonctions pour le téléphone tunisien ────────────────────
const extractPhoneDigits = (phone) => {
  if (!phone) return "";
  return phone.replace(/\D/g, '');
};

const formatTunisianPhone = (digits) => {
  if (!digits || digits.length === 0) return "+216 ";
  const cleanDigits = digits.slice(0, 8);
  let formatted = "+216 ";
  if (cleanDigits.length >= 1) {
    formatted += cleanDigits.slice(0, Math.min(2, cleanDigits.length));
    if (cleanDigits.length >= 3) {
      formatted += " " + cleanDigits.slice(2, Math.min(5, cleanDigits.length));
      if (cleanDigits.length >= 6) {
        formatted += " " + cleanDigits.slice(5, Math.min(8, cleanDigits.length));
      }
    }
  }
  return formatted;
};

const validateTunisianPhone = (phone) => {
  if (!phone || phone.trim() === "" || phone === "+216 ") return true;
  const digits = extractPhoneDigits(phone);
  let cleanDigits = digits;
  if (cleanDigits.startsWith('216')) {
    cleanDigits = cleanDigits.slice(3);
  }
  return cleanDigits.length === 8 && /^\d{8}$/.test(cleanDigits);
};

// ══════════════════════════════════════════════════════════════════════════════
const Approvisionnement = () => {
  const { isDark } = useTheme();
  const { lang } = useLang();
  const t = translations[lang] || translations.fr;

  const C = makeC(isDark);
  const STATUT_STYLE = getStatutStyle(C);
  const s = makeS(C);

  const [tab, setTab] = useState("commandes");
  const [commandes, setCommandes] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [receptions, setReceptions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const [showFormCmd, setShowFormCmd] = useState(false);
  const [showFormFour, setShowFormFour] = useState(false);
  const [showReception, setShowReception] = useState(null);
  const [editCmd, setEditCmd] = useState(null);
  const [editFour, setEditFour] = useState(null);
  const [confirmAnnuler, setConfirmAnnuler] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [filterStatut, setFilterStatut] = useState("");
  const [filterFour, setFilterFour] = useState("");
  const [searchCmd, setSearchCmd] = useState("");

  const [formCmd, setFormCmd] = useState({
    numero: "", fournisseur_id: "", fournisseur_nom: "",
    article_code: "", article_nom: "",
    quantite_commandee: "", unite: "kg",
    commentaire: "",
  });

  const [formFour, setFormFour] = useState({
    code: "", nom: "", contact: "", telephone: "+216 ",
    email: "", adresse: "", article_code: "", article_nom: "",
    delai_livraison_jours: 7, actif: "Actif",
  });

  const [formRec, setFormRec] = useState({
    quantite_recue: "", date_reception: "", commentaire: "",
  });

  const todayDate = new Date().toISOString().slice(0, 10);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const loadAll = useCallback(async () => {
    try {
      const [cmdRes, fourRes, artRes, recRes, dashRes] = await Promise.all([
        axios.get(`${BASE}/commandes`),
        axios.get(`${BASE}/fournisseurs`),
        axios.get(STOCK_URL),
        axios.get(`${BASE}/receptions`),
        axios.get(`${BASE}/dashboard`),
      ]);
      setCommandes(cmdRes.data);
      setFournisseurs(fourRes.data);
      setArticles(artRes.data);
      setReceptions(recRes.data);
      setDashboard(dashRes.data);
    } catch { showMsg(t.errorLoading, "error"); }
  }, [t]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (showFormCmd && !editCmd) {
      setFormCmd(prev => ({ ...prev, numero: genNumero("CA", commandes) }));
    }
  }, [showFormCmd, editCmd, commandes]);

  useEffect(() => {
    if (showFormFour && !editFour && formFour.telephone === "") {
      setFormFour(prev => ({ ...prev, telephone: "+216 " }));
    }
  }, [showFormFour, editFour]);

  const handleSubmitCmd = async () => {
    if (!formCmd.fournisseur_id || !formCmd.article_code || !formCmd.quantite_commandee) {
      return showMsg(t.fillRequiredFields, "error");
    }
    setLoading(true);
    try {
      const payload = {
        ...formCmd,
        fournisseur_id: parseInt(formCmd.fournisseur_id),
        quantite_commandee: parseFloat(formCmd.quantite_commandee),
        date_commande: todayDate,
        date_livraison_prevue: null,
        prix_unitaire: null,
      };
      if (editCmd) {
        await axios.put(`${BASE}/commandes/${editCmd.id}`, payload);
        showMsg(`${t.orderUpdated} ${formCmd.numero}`);
      } else {
        await axios.post(`${BASE}/commandes`, payload);
        showMsg(`${t.orderCreated} ${formCmd.numero}`);
      }
      setShowFormCmd(false); setEditCmd(null); resetFormCmd();
      loadAll();
    } catch (err) {
      showMsg(err.response?.data?.detail || t.error, "error");
    } finally { setLoading(false); }
  };

  const handleEnvoyer = async (c) => {
    try {
      await axios.post(`${BASE}/commandes/${c.id}/envoyer`);
      showMsg(`${t.orderSent} ${c.numero}`);
      loadAll();
    } catch (err) { showMsg(err.response?.data?.detail || t.error, "error"); }
  };

  const handleAnnuler = async () => {
    try {
      await axios.post(`${BASE}/commandes/${confirmAnnuler.id}/annuler`);
      showMsg(`${t.orderCancelled} ${confirmAnnuler.numero}`);
      setConfirmAnnuler(null); loadAll();
    } catch (err) { showMsg(err.response?.data?.detail || t.error, "error"); }
  };

  const handleDeleteCmd = async () => {
    try {
      await axios.delete(`${BASE}/commandes/${confirmDelete.id}`);
      showMsg(`${t.orderDeleted} ${confirmDelete.numero}`);
      setConfirmDelete(null); loadAll();
    } catch (err) { showMsg(err.response?.data?.detail || t.error, "error"); }
  };

  const openEditCmd = (c) => {
    setEditCmd(c);
    setFormCmd({
      numero: c.numero,
      fournisseur_id: String(c.fournisseur_id),
      fournisseur_nom: c.fournisseur_nom,
      article_code: c.article_code,
      article_nom: c.article_nom,
      quantite_commandee: String(c.quantite_commandee),
      unite: c.unite,
      commentaire: c.commentaire || "",
    });
    setShowFormCmd(true);
  };

  const resetFormCmd = () => setFormCmd({
    numero: genNumero("CA", commandes), fournisseur_id: "", fournisseur_nom: "",
    article_code: "", article_nom: "",
    quantite_commandee: "", unite: "kg",
    commentaire: "",
  });

  const handleReception = async () => {
    if (!formRec.quantite_recue || !formRec.date_reception) {
      return showMsg(t.fillRequiredFields, "error");
    }
    setLoading(true);
    try {
      await axios.post(`${BASE}/receptions`, {
        commande_id: showReception.id,
        quantite_recue: parseFloat(formRec.quantite_recue),
        date_reception: formRec.date_reception,
        commentaire: formRec.commentaire || null,
      });
      showMsg(t.receiptSaved);
      setShowReception(null);
      setFormRec({ quantite_recue: "", date_reception: "", commentaire: "" });
      loadAll();
    } catch (err) {
      showMsg(err.response?.data?.detail || t.error, "error");
    } finally { setLoading(false); }
  };

  const handleSubmitFour = async () => {
    if (!formFour.code || !formFour.nom) {
      return showMsg(t.fillRequiredFields, "error");
    }
    
    if (formFour.telephone && formFour.telephone !== "+216 " && !validateTunisianPhone(formFour.telephone)) {
      return showMsg(t.phoneInvalid, "error");
    }
    
    setLoading(true);
    try {
      const cleanedForm = { ...formFour };
      if (cleanedForm.telephone && cleanedForm.telephone !== "+216 ") {
        let digits = extractPhoneDigits(cleanedForm.telephone);
        if (digits.startsWith('216')) {
          digits = digits.slice(3);
        }
        cleanedForm.telephone = digits.slice(0, 8);
      } else {
        cleanedForm.telephone = "";
      }
      
      if (editFour) {
        await axios.put(`${BASE}/fournisseurs/${editFour.id}`, cleanedForm);
        showMsg(`${t.supplierUpdated} ${formFour.nom}`);
      } else {
        await axios.post(`${BASE}/fournisseurs`, cleanedForm);
        showMsg(`${t.supplierCreated} ${formFour.nom}`);
      }
      setShowFormFour(false); setEditFour(null);
      setFormFour({ code: "", nom: "", contact: "", telephone: "+216 ", email: "", adresse: "", article_code: "", article_nom: "", delai_livraison_jours: 7, actif: "Actif" });
      loadAll();
    } catch (err) {
      showMsg(err.response?.data?.detail || t.error, "error");
    } finally { setLoading(false); }
  };

  const handleDeleteFour = async (f) => {
    if (!window.confirm(`${t.supplierDeleted} ${f.nom} ?`)) return;
    try {
      await axios.delete(`${BASE}/fournisseurs/${f.id}`);
      showMsg(`${t.supplierDeleted} ${f.nom}`);
      loadAll();
    } catch (err) { showMsg(err.response?.data?.detail || t.error, "error"); }
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    if (!input.startsWith('+216')) {
      setFormFour({ ...formFour, telephone: "+216 " });
      return;
    }
    let digits = input.replace('+216', '').replace(/\D/g, '');
    digits = digits.slice(0, 8);
    const formatted = formatTunisianPhone(digits);
    setFormFour({ ...formFour, telephone: formatted });
  };

  const filtered = commandes.filter((c) =>
    (!filterStatut || c.statut === filterStatut) &&
    (!filterFour || String(c.fournisseur_id) === filterFour) &&
    (!searchCmd || c.numero.toLowerCase().includes(searchCmd.toLowerCase()) ||
      c.article_nom.toLowerCase().includes(searchCmd.toLowerCase()))
  );

  const kpis = [
    { label: t.totalOrders, val: dashboard?.total_commandes ?? 0, color: C.accent, lt: C.accentLt, icon: "🛒" },
    { label: t.sentOrders, val: dashboard?.commandes_envoyees ?? 0, color: C.amber, lt: C.amberLt, icon: "📤" },
    { label: t.receivedOrders, val: dashboard?.commandes_recues ?? 0, color: C.green, lt: C.greenLt, icon: "✅" },
    { label: t.delayedOrders, val: dashboard?.commandes_en_retard ?? 0, color: C.red, lt: C.redLt, icon: "⏰" },
  ];

  const tabs = [
    { id: "commandes", label: t.tabOrders },
    { id: "fournisseurs", label: t.tabSuppliers },
    { id: "receptions", label: t.tabReceipts },
  ];

  return (
    <div style={s.app}>
      <div style={s.topbar}>
        <div style={s.logoRow}>
          <div style={s.logo}>A</div>
          <div>
            <p style={s.h1}>{t.appTitle}</p>
            <p style={s.h1sub}>{t.appSubtitle}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={s.badgeOnline}><span style={s.dot} />{t.online}</span>
          <span style={s.badgeSync}>{dashboard?.fournisseurs_actifs ?? 0} {t.activeSuppliers}</span>
        </div>
      </div>

      <div style={s.main}>
        {msg.text && (
          <div style={s.alertBox(
            msg.type === "error" ? C.redLt : C.greenLt,
            msg.type === "error" ? "#fecaca" : "#bbf7d0",
            msg.type === "error" ? C.red : C.green
          )}>
            {msg.type === "error" ? "⚠️" : "✅"} {msg.text}
          </div>
        )}

        <div style={s.kpiRow}>
          {kpis.map((k, idx) => (
            <div key={idx} style={s.kpiCard}>
              <div style={s.kpiIcon(k.lt)}>{k.icon}</div>
              <div>
                <p style={s.kpiLabel}>{k.label.toUpperCase()}</p>
                <p style={s.kpiVal(k.color)}>{k.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={s.tabRow}>
          {tabs.map((tabItem) => (
            <button key={tabItem.id} style={s.tab(tab === tabItem.id)} onClick={() => setTab(tabItem.id)}>
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* COMMANDES ACHAT */}
        {tab === "commandes" && (
          <>
            {showFormCmd && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <div>
                    <p style={s.sectionTitle}>{editCmd ? t.editOrder : t.newOrder}</p>
                  </div>
                  <button style={s.btnGhost} onClick={() => { setShowFormCmd(false); setEditCmd(null); }}>✕ {t.close}</button>
                </div>

                <div style={s.grid3}>
                  <div style={s.fg}>
                    <label style={s.label}>{t.orderNumber}</label>
                    <input style={{ ...s.input, fontFamily: "monospace", fontWeight: 600, background: C.inputBg }}
                      value={formCmd.numero} readOnly={!editCmd}
                      onChange={(e) => setFormCmd({ ...formCmd, numero: e.target.value })} />
                  </div>
                 
                  <div style={s.fg}>
                    <label style={s.label}>{t.supplier} <span style={s.req}>*</span></label>
                    <select style={s.select} value={formCmd.fournisseur_id}
                      onChange={(e) => {
                        const f = fournisseurs.find((x) => x.id === parseInt(e.target.value));
                        setFormCmd({
                          ...formCmd,
                          fournisseur_id: e.target.value,
                          fournisseur_nom: f?.nom || "",
                          article_code: f?.article_code || formCmd.article_code,
                          article_nom: f?.article_nom || formCmd.article_nom,
                        });
                      }}>
                      <option value="">{t.allSuppliers}</option>
                      {fournisseurs.filter((f) => f.actif === "Actif").map((f) => (
                        <option key={f.id} value={f.id}>{f.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.article} <span style={s.req}>*</span></label>
                    <select style={s.select} value={formCmd.article_code}
                      onChange={(e) => {
                        const a = articles.find((x) => x.code === e.target.value);
                        setFormCmd({ ...formCmd, article_code: e.target.value, article_nom: a?.nom || "" });
                      }}>
                      <option value="">{t.allSuppliers}</option>
                      {articles.filter((a) => a.type_article === "matiere_premiere").map((a) => (
                        <option key={a.code} value={a.code}>{a.code} — {a.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.quantityOrdered} <span style={s.req}>*</span></label>
                    <input style={s.input} type="number" min="0.01" step="0.01" placeholder="500"
                      value={formCmd.quantite_commandee}
                      onChange={(e) => setFormCmd({ ...formCmd, quantite_commandee: e.target.value })} />
                  </div>
                   <div style={s.fg}>
                    <label style={s.label}>{t.orderDate}</label>
                    <input style={s.inputReadOnly} type="date" value={todayDate} readOnly disabled />
                  </div>
                  <div style={{ ...s.fg, gridColumn: "span 2" }}>
                    <label style={s.label}>{t.comment}</label>
                    <textarea style={s.textarea} value={formCmd.commentaire}
                      onChange={(e) => setFormCmd({ ...formCmd, commentaire: e.target.value })}
                      placeholder="Instructions de livraison, référence contrat..." />
                  </div>
                </div>

                <div style={s.btnRow}>
                  <button style={s.btnSecondary} onClick={() => { setShowFormCmd(false); setEditCmd(null); }}>{t.cancel}</button>
                  <button style={s.btnPrimary} onClick={handleSubmitCmd} disabled={loading}>
                    {loading ? t.saving : editCmd ? t.updateOrder : t.createOrder}
                  </button>
                </div>
              </div>
            )}

            <div style={s.section}>
              <div style={s.sectionHeader}>
                <div>
                  <p style={s.sectionTitle}>{t.ordersTitle}</p>
                  <p style={s.sectionSub}>{filtered.length} commande(s)</p>
                </div>
                {!showFormCmd && (
                  <button style={s.btnPrimary} onClick={() => { setEditCmd(null); resetFormCmd(); setShowFormCmd(true); }}>
                    + {t.newOrder}
                  </button>
                )}
              </div>

              <div style={s.filterRow}>
                <div style={s.filterGroup}>
                  <label style={s.label}>🔍 {t.searchPlaceholder}</label>
                  <input style={s.input} placeholder={t.searchPlaceholder} value={searchCmd} onChange={(e) => setSearchCmd(e.target.value)} />
                </div>
                <div style={s.filterGroup}>
                  <label style={s.label}>{t.status}</label>
                  <select style={s.select} value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
                    <option value="">{t.allStatus}</option>
                    {Object.keys(STATUT_STYLE).map((s_) => (
                      <option key={s_} value={s_}>{STATUT_STYLE[s_].icon} {s_}</option>
                    ))}
                  </select>
                </div>
                <div style={s.filterGroup}>
                  <label style={s.label}>{t.supplier}</label>
                  <select style={s.select} value={filterFour} onChange={(e) => setFilterFour(e.target.value)}>
                    <option value="">{t.allSuppliers}</option>
                    {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyIcon}>🛒</div>
                  <p style={{ fontWeight: 500 }}>{t.noOrders}</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead style={s.thead}>
                      <tr>
                        {[t.orderNumber, t.orderDate, t.supplier, t.article, t.qtyOrdered, t.qtyReceived, t.progress, t.status, t.actions].map((h) => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c, i) => {
                        const st = STATUT_STYLE[c.statut] || { bg: C.bg, color: C.muted, border: C.border, icon: "?" };
                        const pct = c.quantite_commandee > 0
                          ? Math.min(100, Math.round((c.quantite_recue / c.quantite_commandee) * 100))
                          : 0;
                        return (
                          <tr key={c.id} style={s.tr(i)}>
                            <td style={s.td}>
                              <code style={{ color: C.accent, fontSize: "0.8rem", fontFamily: "monospace", background: C.accentLt, padding: "1px 6px", borderRadius: 4 }}>
                                {c.numero}
                              </code>
                            </td>
                            <td style={s.td}>{c.date_commande || "—"}</td>
                            <td style={s.td}><strong>{c.fournisseur_nom}</strong></td>
                            <td style={s.td}>
                              <div style={{ fontSize: "0.8rem", color: C.muted }}>{c.article_code}</div>
                              <div>{c.article_nom}</div>
                            </td>
                            <td style={s.td}><strong>{fmt(c.quantite_commandee)}</strong> {c.unite}</td>
                            <td style={s.td}>{fmt(c.quantite_recue)} {c.unite}</td>
                            <td style={{ ...s.td, minWidth: 120 }}>
                              <div style={{ marginBottom: 4, fontSize: "0.75rem", color: C.muted }}>{pct}%</div>
                              <div style={s.progressBar(pct, pct === 100 ? C.green : C.accent)} />
                            </td>
                            <td style={s.td}>
                              <span style={s.pill(st.bg, st.color, st.border)}>
                                {st.icon} {c.statut}
                              </span>
                            </td>
                            <td style={s.td}>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {c.statut === "Brouillon" && (
                                  <>
                                    <button style={s.btnGhost} onClick={() => openEditCmd(c)} title={t.editOrder}>✏️</button>
                                    <button style={s.btnAction(C.accentLt, C.accent, "#bfdbfe")} onClick={() => handleEnvoyer(c)}>📤 {t.send}</button>
                                    <button style={s.btnDanger} onClick={() => setConfirmDelete(c)}>🗑</button>
                                  </>
                                )}
                                {c.statut === "Envoyée" && (
                                  <>
                                    <button style={s.btnAction(C.greenLt, C.green, "#bbf7d0")} onClick={() => { setShowReception(c); setFormRec({ quantite_recue: "", date_reception: new Date().toISOString().slice(0, 10), commentaire: "" }); }}>
                                      📦 {t.receive}
                                    </button>
                                    <button style={s.btnDanger} onClick={() => setConfirmAnnuler(c)}>✕</button>
                                  </>
                                )}
                                {c.statut === "Reçue partielle" && (
                                  <button style={s.btnAction(C.greenLt, C.green, "#bbf7d0")} onClick={() => { setShowReception(c); setFormRec({ quantite_recue: "", date_reception: new Date().toISOString().slice(0, 10), commentaire: "" }); }}>
                                    📦 {t.complete}
                                  </button>
                                )}
                                {c.statut === "Reçue totale" && (
                                  <span style={{ color: C.green, fontSize: "0.8rem", fontWeight: 500 }}>✓ {t.received}</span>
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
          </>
        )}

        {/* FOURNISSEURS */}
        {tab === "fournisseurs" && (
          <>
            {showFormFour && (
              <div style={s.section}>
                <div style={s.sectionHeader}>
                  <div>
                    <p style={s.sectionTitle}>{editFour ? t.editSupplier : t.newSupplier}</p>
                  </div>
                  <button style={s.btnGhost} onClick={() => { setShowFormFour(false); setEditFour(null); }}>✕ {t.close}</button>
                </div>
                <div style={s.grid3}>
                  <div style={s.fg}>
                    <label style={s.label}>{t.supplierCode} <span style={s.req}>*</span></label>
                    <input style={s.input} placeholder="ex: FOUR-001" value={formFour.code}
                      onChange={(e) => setFormFour({ ...formFour, code: e.target.value.toUpperCase() })}
                      disabled={!!editFour} />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.supplierName} <span style={s.req}>*</span></label>
                    <input style={s.input} placeholder="Nom du fournisseur" value={formFour.nom}
                      onChange={(e) => setFormFour({ ...formFour, nom: e.target.value })} />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.contact}</label>
                    <input style={s.input} placeholder="Nom du contact" value={formFour.contact}
                      onChange={(e) => setFormFour({ ...formFour, contact: e.target.value })} />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.phone}</label>
                    <input 
                      style={{
                        ...s.input,
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                        borderColor: formFour.telephone && formFour.telephone !== "+216 " && !validateTunisianPhone(formFour.telephone) ? C.red : C.border
                      }}
                      placeholder={t.phonePlaceholder}
                      value={formFour.telephone}
                      onChange={handlePhoneChange}
                    />
                    {formFour.telephone && formFour.telephone !== "+216 " && !validateTunisianPhone(formFour.telephone) && (
                      <div style={{ color: C.red, fontSize: "0.7rem", marginTop: "0.25rem" }}>
                        ❌ {t.phoneInvalid}
                      </div>
                    )}
                    {formFour.telephone && formFour.telephone !== "+216 " && validateTunisianPhone(formFour.telephone) && (
                      <div style={{ color: C.green, fontSize: "0.7rem", marginTop: "0.25rem" }}>
                        ✓ {t.phoneValid}
                      </div>
                    )}
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.email}</label>
                    <input style={s.input} type="email" placeholder="contact@fournisseur.com" value={formFour.email}
                      onChange={(e) => setFormFour({ ...formFour, email: e.target.value })} />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.deliveryDelay}</label>
                    <input style={s.input} type="number" min="1" value={formFour.delai_livraison_jours}
                      onChange={(e) => setFormFour({ ...formFour, delai_livraison_jours: parseInt(e.target.value) })} />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.suppliedArticle}</label>
                    <select style={s.select} value={formFour.article_code}
                      onChange={(e) => {
                        const a = articles.find((x) => x.code === e.target.value);
                        setFormFour({ ...formFour, article_code: e.target.value, article_nom: a?.nom || "" });
                      }}>
                      <option value="">{t.multiple}</option>
                      {articles.filter((a) => a.type_article === "matiere_premiere").map((a) => (
                        <option key={a.code} value={a.code}>{a.code} — {a.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>{t.statusActive}</label>
                    <select style={s.select} value={formFour.actif}
                      onChange={(e) => setFormFour({ ...formFour, actif: e.target.value })}>
                      <option value="Actif">{t.active}</option>
                      <option value="Inactif">{t.inactive}</option>
                    </select>
                  </div>
                  <div style={{ ...s.fg, gridColumn: "span 3" }}>
                    <label style={s.label}>{t.address}</label>
                    <textarea style={s.textarea} value={formFour.adresse}
                      onChange={(e) => setFormFour({ ...formFour, adresse: e.target.value })}
                      placeholder={t.address} />
                  </div>
                </div>
                <div style={s.btnRow}>
                  <button style={s.btnSecondary} onClick={() => { setShowFormFour(false); setEditFour(null); }}>{t.cancel}</button>
                  <button style={s.btnPrimary} onClick={handleSubmitFour} disabled={loading}>
                    {loading ? t.saving : editFour ? t.updateOrder : t.newSupplier}
                  </button>
                </div>
              </div>
            )}

            <div style={s.section}>
              <div style={s.sectionHeader}>
                <div>
                  <p style={s.sectionTitle}>{t.suppliersTitle}</p>
                  <p style={s.sectionSub}>{fournisseurs.length} fournisseur(s)</p>
                </div>
                {!showFormFour && (
                  <button style={s.btnPrimary} onClick={() => { setEditFour(null); setShowFormFour(true); }}>
                    + {t.newSupplier}
                  </button>
                )}
              </div>

              {fournisseurs.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyIcon}>🏢</div>
                  <p style={{ fontWeight: 500 }}>{t.noSuppliers}</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={s.table}>
                    <thead style={s.thead}>
                      <tr>
                        {[t.supplierCode, t.supplierName, t.contact, t.phone, t.suppliedArticle, t.deliveryDelay, t.statusActive, t.actions].map((h) => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fournisseurs.map((f, i) => {
                        let displayPhone = f.telephone || "—";
                        if (displayPhone !== "—" && displayPhone.length === 8 && /^\d{8}$/.test(displayPhone)) {
                          displayPhone = `+216 ${displayPhone.slice(0,2)} ${displayPhone.slice(2,5)} ${displayPhone.slice(5)}`;
                        } else if (displayPhone !== "—" && displayPhone.length > 0 && displayPhone !== "+216 ") {
                          if (!displayPhone.includes('+216')) {
                            displayPhone = `+216 ${displayPhone}`;
                          }
                        }
                        return (
                          <tr key={f.id} style={s.tr(i)}>
                            <td style={s.td}>
                              <code style={{ color: C.accent, fontSize: "0.8rem", background: C.accentLt, padding: "1px 6px", borderRadius: 4 }}>
                                {f.code}
                              </code>
                            </td>
                            <td style={{ ...s.td, fontWeight: 600 }}>{f.nom}</td>
                            <td style={s.td}>{f.contact || "—"}</td>
                            <td style={s.td}>{displayPhone}</td>
                            <td style={s.td}>
                              {f.article_code
                                ? <span style={s.pill(C.purpleLt, C.purple, "#ddd6fe")}>{f.article_code}</span>
                                : <span style={{ color: C.muted, fontSize: "0.8rem" }}>{t.multiple}</span>}
                            </td>
                            <td style={s.td}>{f.delai_livraison_jours} j</td>
                            <td style={s.td}>
                              <span style={s.pill(
                                f.actif === "Actif" ? C.greenLt : C.redLt,
                                f.actif === "Actif" ? C.green : C.red,
                                f.actif === "Actif" ? "#bbf7d0" : "#fecaca"
                              )}>
                                {f.actif === "Actif" ? `● ${t.active}` : `○ ${t.inactive}`}
                              </span>
                            </td>
                            <td style={s.td}>
                              <div style={{ display: "flex", gap: 4 }}>
                                <button style={s.btnGhost} onClick={() => {
                                  setEditFour(f);
                                  let phoneValue = f.telephone || "";
                                  if (phoneValue && phoneValue.length === 8 && /^\d{8}$/.test(phoneValue)) {
                                    phoneValue = formatTunisianPhone(phoneValue);
                                  } else if (phoneValue && !phoneValue.includes('+216') && phoneValue !== "") {
                                    phoneValue = `+216 ${phoneValue}`;
                                  } else if (!phoneValue) {
                                    phoneValue = "+216 ";
                                  }
                                  setFormFour({ 
                                    code: f.code, 
                                    nom: f.nom, 
                                    contact: f.contact || "", 
                                    telephone: phoneValue, 
                                    email: f.email || "", 
                                    adresse: f.adresse || "", 
                                    article_code: f.article_code || "", 
                                    article_nom: f.article_nom || "", 
                                    delai_livraison_jours: f.delai_livraison_jours, 
                                    actif: f.actif 
                                  });
                                  setShowFormFour(true);
                                }}>✏️</button>
                                <button style={s.btnDanger} onClick={() => handleDeleteFour(f)}>🗑</button>
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
          </>
        )}

        {/* RÉCEPTIONS */}
        {tab === "receptions" && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <div>
                <p style={s.sectionTitle}>{t.receiptsTitle}</p>
                <p style={s.sectionSub}>{receptions.length} {t.receiptsSubtitle}</p>
              </div>
            </div>
            <div style={s.infoBox}>
              ℹ️ {t.receiptInfo}
            </div>
            {receptions.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📦</div>
                <p style={{ fontWeight: 500 }}>{t.noReceipts}</p>
                <p style={{ fontSize: "0.85rem" }}>{t.receiptHint}</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={s.table}>
                  <thead style={s.thead}>
                    <tr>
                      {[t.orderNum, t.qtyReceivedLabel, t.receiptDate, t.stockMovement, t.comment].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {receptions.map((r, i) => (
                      <tr key={r.id} style={s.tr(i)}>
                        <td style={s.td}>
                          <code style={{ color: C.accent, fontSize: "0.8rem", background: C.accentLt, padding: "1px 6px", borderRadius: 4 }}>
                            {r.commande_numero}
                          </code>
                        </td>
                        <td style={s.td}><strong style={{ color: C.green }}>+{fmt(r.quantite_recue)} kg</strong></td>
                        <td style={s.td}>{r.date_reception}</td>
                        <td style={s.td}>
                          {r.mouvement_stock_ref
                            ? <span style={s.pill(C.greenLt, C.green, "#bbf7d0")}>✅ {r.mouvement_stock_ref}</span>
                            : <span style={{ color: C.muted, fontSize: "0.8rem" }}>—</span>}
                        </td>
                        <td style={{ ...s.td, color: C.muted, fontSize: "0.85rem" }}>{r.commentaire || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL RÉCEPTION */}
      {showReception && (
        <div style={s.modalOverlay} onClick={() => setShowReception(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 0.25rem", color: C.text, fontSize: "1rem" }}>📦 {t.receiveOrder}</h3>
            <p style={{ margin: "0 0 1.25rem", color: C.muted, fontSize: "0.85rem" }}>
              {showReception.numero} · {showReception.article_nom}
            </p>
            <div style={{ background: C.bg, borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: C.muted }}>{t.commanded}</span>
                <strong>{fmt(showReception.quantite_commandee)} kg</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: C.muted }}>{t.alreadyReceived}</span>
                <strong style={{ color: C.green }}>{fmt(showReception.quantite_recue)} kg</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.muted }}>{t.remaining}</span>
                <strong style={{ color: C.amber }}>{fmt(showReception.quantite_commandee - showReception.quantite_recue)} kg</strong>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={s.fg}>
                <label style={s.label}>{t.qtyToReceive} <span style={s.req}>*</span></label>
                <input style={s.input} type="number" min="0.01" step="0.01"
                  max={showReception.quantite_commandee - showReception.quantite_recue}
                  value={formRec.quantite_recue}
                  onChange={(e) => setFormRec({ ...formRec, quantite_recue: e.target.value })} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>{t.receiptDateLabel} <span style={s.req}>*</span></label>
                <input style={s.input} type="date" value={formRec.date_reception}
                  onChange={(e) => setFormRec({ ...formRec, date_reception: e.target.value })} />
              </div>
              <div style={s.fg}>
                <label style={s.label}>{t.comment}</label>
                <input style={s.input} placeholder={t.observation}
                  value={formRec.commentaire}
                  onChange={(e) => setFormRec({ ...formRec, commentaire: e.target.value })} />
              </div>
            </div>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowReception(null)}>{t.cancel}</button>
              <button style={s.btnPrimary} onClick={handleReception} disabled={loading}>
                {loading ? t.saving : t.confirmReceipt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANNULER */}
      {confirmAnnuler && (
        <div style={s.modalOverlay} onClick={() => setConfirmAnnuler(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem", color: C.text }}>{t.cancelOrder} ?</h3>
            <p style={{ color: C.muted, margin: "0 0 1.5rem" }}>
              {t.cancelConfirm} <strong>{confirmAnnuler.numero}</strong>.
            </p>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setConfirmAnnuler(null)}>{t.back}</button>
              <button style={{ ...s.btnPrimary, background: C.red }} onClick={handleAnnuler}>{t.cancelOrder}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {confirmDelete && (
        <div style={s.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem", color: C.text }}>{t.deleteOrder} ?</h3>
            <p style={{ color: C.muted, margin: "0 0 1.5rem" }}>
              {t.deleteConfirm} <strong>{confirmDelete.numero}</strong>.
            </p>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setConfirmDelete(null)}>{t.back}</button>
              <button style={{ ...s.btnPrimary, background: C.red }} onClick={handleDeleteCmd}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvisionnement;