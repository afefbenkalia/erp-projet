import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

import logo from "../assets/logo_sitex.jpg"; // Place the logo in public/assets/

// ── Icons ────────────────────────────────────────────────
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 13H11V3H4V13ZM4 21H11V15H4V21ZM13 21H20V11H13V21ZM13 3V9H20V3H13Z" />
  </svg>
);
const StockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 5V7H5V5H19ZM5 19V9H19V19H5Z" />
    <rect x="7" y="11" width="4" height="2" /><rect x="13" y="11" width="4" height="2" /><rect x="7" y="15" width="10" height="2" />
  </svg>
);
const ProductionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.37 2.61 14.2 2.46 14 2.46H10C9.8 2.46 9.63 2.61 9.6 2.81L9.24 5.35C8.65 5.59 8.12 5.92 7.62 6.29L5.23 5.33C5.01 5.26 4.76 5.34 4.64 5.55L2.72 8.87C2.61 9.07 2.66 9.34 2.84 9.48L4.87 11.06C4.82 11.36 4.8 11.68 4.8 12C4.8 12.32 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.63 21.39 9.8 21.54 10 21.54H14C14.2 21.54 14.37 21.39 14.4 21.19L14.76 18.65C15.35 18.41 15.88 18.08 16.38 17.71L18.77 18.67C18.99 18.74 19.24 18.66 19.36 18.45L21.28 15.13C21.39 14.93 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" />
  </svg>
);
const SupplyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM19.5 9.5L21.46 12H17V9.5H19.5ZM6 18C5.45 18 5 17.55 5 17C5 16.45 5.45 16 6 16C6.55 16 7 16.45 7 17C7 17.55 6.55 18 6 18ZM18 18C17.45 18 17 17.55 17 17C17 16.45 17.45 16 18 16C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18Z" />
  </svg>
);
const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 7H12V9H7V7ZM7 11H12V13H7V11ZM7 15H17V17H7V15ZM14 7H17V12H14V7Z" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.37 2.61 14.2 2.46 14 2.46H10C9.8 2.46 9.63 2.61 9.6 2.81L9.24 5.35C8.65 5.59 8.12 5.92 7.62 6.29L5.23 5.33C5.01 5.26 4.76 5.34 4.64 5.55L2.72 8.87C2.61 9.07 2.66 9.34 2.84 9.48L4.87 11.06C4.82 11.36 4.8 11.68 4.8 12C4.8 12.32 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.63 21.39 9.8 21.54 10 21.54H14C14.2 21.54 14.37 21.39 14.4 21.19L14.76 18.65C15.35 18.41 15.88 18.08 16.38 17.71L18.77 18.67C18.99 18.74 19.24 18.66 19.36 18.45L21.28 15.13C21.39 14.93 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" />
  </svg>
);
const QualityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" />
  </svg>
);
const MonitorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4C2.9 3 2 3.9 2 5V15C2 16.1 2.9 17 4 17H10L8 20V21H16V20L14 17H20C21.1 17 22 16.1 22 15V5C22 3.9 21.1 3 20 3ZM20 15H4V5H20V15Z" />
    <path d="M6 13H9V7H6V13ZM10 13H14V9H10V13ZM15 13H18V10H15V13Z" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12Z" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12Z" />
  </svg>
);

// ── Color tokens ─────────────────────────────────────────
const NAVY = "#1a2c4e";
const NAVY_MID = "#243b61";
const NAVY_LIGHT = "#2e4a78";
const ACCENT = "#4a7fc1";
const ACCENT_GLOW = "rgba(74,127,193,0.18)";
const WHITE = "#ffffff";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const TEXT_DIM = "rgba(255,255,255,0.7)";
const BORDER_SUBTLE = "rgba(255,255,255,0.08)";

// ── Menu config ──────────────────────────────────────────
const menuItems = {
  pro: [
    //{ path: "/dashboard", label: "Tableau de Bord", icon: <DashboardIcon />, roles: ["admin", "stock", "production"] },
    { path: "/GestionStock", label: "Gestion des Stocks", icon: <StockIcon />, roles: ["admin", "stock"] },
    { path: "/ordersfabricationerp", label: "Ordres de Fabrication", icon: <ProductionIcon />, roles: ["admin", "production"] },
    { path: "/Approvisionnement", label: "Approvisionnement", icon: <SupplyIcon />, roles: ["admin", "supply"] },
    { path: "/ReportsArchive", label: "Archives & Rapports", icon: <ReportsIcon />, roles: ["admin"] },
  ],
  industrielle: [
   // { path: "/dashboard", label: "Tableau de Bord Usine", icon: <DashboardIcon />, roles: ["admin", "production"] },
    { path: "/ProductionLine", label: "Ligne de Production", icon: <ProductionIcon />, roles: ["admin", "production"] },
    { path: "/MachineMonitoring", label: "Monitoring Machines", icon: <MonitorIcon />, roles: ["admin", "production"] },
    { path: "/ordersfabricationerp", label: "Planning Production", icon: <ProductionIcon />, roles: ["admin", "production"] },
    { path: "/ReportsArchive", label: "Rapports Industriels", icon: <ReportsIcon />, roles: ["admin"] },
  ],
};

export default function Sidebar() {
  const { role, userType } = useContext(AuthContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, text: "", y: 0 });

  const currentMenu = userType === "industrielle" ? menuItems.industrielle : menuItems.pro;
  const filteredItems = currentMenu.filter((item) => item.roles.includes(role));
  const isActive = (path) => location.pathname === path;

  const handleMouseEnter = (e, label) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({ show: true, text: label, y: rect.top + rect.height / 2 });
    }
  };

  return (
    <>
      <aside
        style={{
          ...S.sidebar,
          width: isCollapsed ? "72px" : "260px",
        }}
      >
        {/* Toggle button */}
        <button
          style={{
            ...S.collapseBtn,
            right: isCollapsed ? "-14px" : "-14px",
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Développer" : "Réduire"}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

      {/* Brand header */}
<div style={S.header}>
  <div style={S.logoBox}>
    <img
      src={logo}
      alt="Logo"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    />
  </div>

  {!isCollapsed && (
    <div style={S.brandText}>
      <div style={S.brandName}>SITEX</div>
      <div style={S.brandSub}>Sousse · Cardage ERP</div>
    </div>
  )}
</div>

        {/* User-type badge */}
        {!isCollapsed && (
          <div style={S.badge}>
            <span style={S.badgeDot} />
            {userType === "industrielle" ? "Vue Industrielle" : "Vue Professionnelle"}
          </div>
        )}

        {/* Navigation */}
        <nav style={S.nav}>
          {filteredItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...S.navLink,
                  ...(active ? S.navLinkActive : {}),
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  padding: isCollapsed ? "12px 0" : "12px 16px",
                }}
                onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                onMouseLeave={() => setTooltip({ show: false, text: "", y: 0 })}
              >
                <span
                  style={{
                    ...S.iconWrap,
                    ...(active ? S.iconWrapActive : {}),
                  }}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span style={{ ...S.navLabel, ...(active ? S.navLabelActive : {}) }}>
                    {item.label}
                  </span>
                )}
                {active && !isCollapsed && <span style={S.activePip} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={S.footer}>
          {!isCollapsed ? (
            <>
              <div style={S.footerVersion}>ERP Cardage · v3.1.0</div>
              <div style={S.footerCopy}>© 2026 SITEX Sousse</div>
            </>
          ) : (
            <div style={S.footerCollapsed}>v3</div>
          )}
        </div>
      </aside>

      {/* Tooltip for collapsed mode */}
      {tooltip.show && (
        <div
          style={{
            ...S.tooltip,
            top: tooltip.y - 18,
            left: "84px",
          }}
        >
          {tooltip.text}
        </div>
      )}

      <style>{`
        a[style] { text-decoration: none !important; }
        aside a:hover > span:first-child {
          background: rgba(74,127,193,0.2) !important;
          color: #fff !important;
        }
        aside a:hover > span:nth-child(2) {
          color: #fff !important;
        }
      `}</style>
    </>
  );
}

const S = {
  sidebar: {
    height: "100vh",
    background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_MID} 60%, ${NAVY_LIGHT} 100%)`,
    color: WHITE,
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 24px rgba(0,0,0,0.22)",
    zIndex: 100,
    transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "visible",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },

  collapseBtn: {
    position: "absolute",
    top: "76px",
    right: "-14px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: NAVY_LIGHT,
    border: `2px solid rgba(255,255,255,0.25)`,
    color: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 101,
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    transition: "background 0.2s",
    padding: 0,
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 16px 18px",
    borderBottom: `1px solid ${BORDER_SUBTLE}`,
    flexShrink: 0,
  },
  logoBox: {
    width: "60px",
    height: "60px",
    borderRadius: "10px",
    background: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  },
  logoImg: {
    width: "38px",
    height: "38px",
    objectFit: "contain",
  },
  brandText: {
    overflow: "hidden",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "700",
    color: WHITE,
    letterSpacing: "-0.3px",
    lineHeight: "1.2",
  },
  brandSub: {
    fontSize: "10px",
    color: TEXT_MUTED,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    marginTop: "2px",
  },

  // Badge
  badge: {
    margin: "12px 14px",
    padding: "8px 14px",
    background: "rgba(74,127,193,0.15)",
    border: "1px solid rgba(74,127,193,0.28)",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: "0.3px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  badgeDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4ade80",
    flexShrink: 0,
    boxShadow: "0 0 6px #4ade80",
  },

  // Nav
  nav: {
    flex: 1,
    padding: "8px 10px",
    overflowY: "auto",
    overflowX: "hidden",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "12px",
    textDecoration: "none",
    marginBottom: "4px",
    transition: "all 0.2s ease",
    position: "relative",
  },
  navLinkActive: {
    background: ACCENT_GLOW,
  },
  iconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: TEXT_DIM,
    transition: "all 0.2s",
  },
  iconWrapActive: {
    background: ACCENT,
    color: WHITE,
    boxShadow: `0 4px 12px rgba(74,127,193,0.4)`,
  },
  navLabel: {
    fontSize: "13.5px",
    fontWeight: "500",
    color: TEXT_DIM,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    transition: "color 0.2s",
    flex: 1,
  },
  navLabelActive: {
    color: WHITE,
    fontWeight: "600",
  },
  activePip: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: ACCENT,
    flexShrink: 0,
    marginRight: "2px",
  },

  // Footer
  footer: {
    padding: "16px",
    borderTop: `1px solid ${BORDER_SUBTLE}`,
    flexShrink: 0,
    textAlign: "center",
  },
  footerVersion: {
    fontSize: "11px",
    color: TEXT_MUTED,
    fontWeight: "500",
    marginBottom: "3px",
  },
  footerCopy: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
  },
  footerCollapsed: {
    fontSize: "11px",
    color: TEXT_MUTED,
    fontWeight: "600",
  },

  // Tooltip
  tooltip: {
    position: "fixed",
    background: NAVY_LIGHT,
    color: WHITE,
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    zIndex: 200,
    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.1)",
    pointerEvents: "none",
    letterSpacing: "0.2px",
  },
};