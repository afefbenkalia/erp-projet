// components/Sidebar.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { role } = useContext(AuthContext);
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "stock", "production"] },
    { path: "/GestionStock", label: "Gestion des Stocks", icon: "📦", roles: ["admin", "stock"] },
    { path: "/ordersfabricationerp", label: "Gestion de Production", icon: "📝", roles: ["admin", "production"] },
    { path: "/Approvisionnement", label: "Approvisionnement", icon: "🚚", roles: ["admin", "supply"] },

  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  const styles = {
    sidebar: {
      width: "280px",
      height: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "white",
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
      zIndex: 100,
    },
    header: {
      padding: "28px 24px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      marginBottom: "24px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoIcon: {
      fontSize: "28px",
    },
    logoText: {
      fontSize: "20px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    logoSub: {
      fontSize: "10px",
      color: "#94a3b8",
      marginTop: "4px",
      letterSpacing: "1px",
    },
    nav: {
      flex: 1,
      padding: "0 16px",
    },
    link: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "12px",
      color: "#cbd5e1",
      textDecoration: "none",
      marginBottom: "8px",
      transition: "all 0.2s ease",
      fontSize: "14px",
      fontWeight: "500",
    },
    linkActive: {
      background: "rgba(59, 130, 246, 0.2)",
      color: "#60a5fa",
      borderLeft: "3px solid #3b82f6",
    },
    linkHover: {
      background: "rgba(255,255,255,0.08)",
      color: "white",
      transform: "translateX(4px)",
    },
    icon: {
      fontSize: "20px",
      width: "24px",
    },
    footer: {
      padding: "20px 24px",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      fontSize: "11px",
      color: "#64748b",
      textAlign: "center",
    },
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏭</span>
          <div>
            <div style={styles.logoText}>ERP SYSTEM</div>
            <div style={styles.logoSub}>Enterprise Resource Planning</div>
          </div>
        </div>
      </div>

      <nav style={styles.nav}>
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              ...(isActive(item.path) ? styles.linkActive : {}),
              ...(hoveredItem === item.path ? styles.linkHover : {}),
            }}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div style={styles.footer}>
        <div>© 2024 ERP System</div>
        <div style={{ marginTop: "8px" }}>Version 2.0.0</div>
      </div>
    </div>
  );
}