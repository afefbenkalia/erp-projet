// components/Navbar.jsx - Navbar professionnelle
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { role, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const styles = {
    navbar: {
      height: "70px",
      background: "white",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      position: "sticky",
      top: 0,
      zIndex: 99,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    title: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1e293b",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    breadcrumb: {
      fontSize: "13px",
      color: "#64748b",
      fontWeight: "400",
    },
    right: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    notification: {
      position: "relative",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "10px",
      transition: "background 0.2s",
    },
    notificationBadge: {
      position: "absolute",
      top: "4px",
      right: "4px",
      width: "8px",
      height: "8px",
      background: "#ef4444",
      borderRadius: "50%",
      border: "2px solid white",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
      padding: "6px 12px",
      borderRadius: "12px",
      background: "#f8fafc",
      transition: "all 0.2s",
      position: "relative",
    },
    avatar: {
      width: "36px",
      height: "36px",
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "600",
      fontSize: "14px",
    },
    userText: {
      textAlign: "right",
    },
    userName: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#1e293b",
    },
    userRole: {
      fontSize: "11px",
      color: "#64748b",
      textTransform: "capitalize",
    },
    dropdown: {
      position: "absolute",
      top: "100%",
      right: 0,
      marginTop: "8px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
      minWidth: "200px",
      overflow: "hidden",
      zIndex: 1000,
    },
    dropdownItem: {
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#1e293b",
      cursor: "pointer",
      transition: "background 0.2s",
      border: "none",
      background: "white",
      width: "100%",
      textAlign: "left",
    },
    logoutItem: {
      color: "#ef4444",
      borderTop: "1px solid #e2e8f0",
    },
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.title}>
        Dashboard ERP
        <span style={styles.breadcrumb}>/ Vue d'ensemble</span>
      </div>

      <div style={styles.right}>
        <div style={styles.notification}>
          <span style={{ fontSize: "20px" }}>🔔</span>
          <span style={styles.notificationBadge}></span>
        </div>

        <div
          style={styles.userInfo}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div style={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={styles.userText}>
            <div style={styles.userName}>{user?.name || "Utilisateur"}</div>
            <div style={styles.userRole}>{role || "Invité"}</div>
          </div>

          {showDropdown && (
            <div style={styles.dropdown}>
              <button style={styles.dropdownItem}>
                <span>👤</span> Mon profil
              </button>
              <button style={styles.dropdownItem}>
                <span>⚙️</span> Paramètres
              </button>
              <button
                style={{ ...styles.dropdownItem, ...styles.logoutItem }}
                onClick={handleLogout}
              >
                <span>🚪</span> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}