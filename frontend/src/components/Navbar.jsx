import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";
import { useNavigate } from "react-router-dom";

// ── Palette harmonisée avec les tokens navy du Sidebar ──────────────
// Ces couleurs sont extraites directement du fichier Sidebar pour une cohérence parfaite
const NAVY       = "#1a2c4e";
const NAVY_MID   = "#243b61";
const NAVY_LIGHT = "#2e4a78";
const DARK_NAVY      = "#0f1f36";
const DARK_NAVY_MID  = "#162741";
const DARK_NAVY_LIGHT= "#1e3554";

const DARK = {
  bg:            DARK_NAVY,        // aligné avec le fond du Sidebar en mode dark
  border:        "rgba(255,255,255,0.07)",
  shadow:        "0 1px 0 rgba(255,255,255,0.04)",
  title:         "#f1f5f9",
  muted:         "#475569",
  mutedActive:   "#94a3b8",
  surface:       DARK_NAVY_MID,    // aligné avec la couleur mid du Sidebar
  surfaceBorder: "rgba(255,255,255,0.08)", // identique à BORDER_SUBTLE du Sidebar
  pillBg:        DARK_NAVY_LIGHT,  // aligné avec la couleur light du Sidebar
  pillBorder:    "rgba(255,255,255,0.1)",
  pillActive:    DARK_NAVY_MID,
  pillActiveShadow: "0 1px 4px rgba(0,0,0,0.45)",
  divider:       "rgba(255,255,255,0.08)",
  dropBg:        DARK_NAVY_MID,
  dropBorder:    "rgba(255,255,255,0.12)",
  dropShadow:    "0 16px 48px rgba(0,0,0,0.55)",
  dropHover:     "rgba(74,127,193,0.15)", // accent Sidebar
};

const LIGHT = {
  bg:            "#ffffff",
  border:        "#e2e8f0",
  shadow:        "0 1px 0 #e2e8f0",
  title:         NAVY,             // aligné avec la couleur principale du Sidebar light
  muted:         "#b0bac7",
  mutedActive:   "#64748b",
  surface:       "#f8fafc",
  surfaceBorder: "#e2e8f0",
  pillBg:        "#f1f5f9",
  pillBorder:    "#e2e8f0",
  pillActive:    "#ffffff",
  pillActiveShadow: "0 1px 4px rgba(0,0,0,0.12)",
  divider:       "#e2e8f0",
  dropBg:        "#ffffff",
  dropBorder:    "#e2e8f0",
  dropShadow:    "0 16px 48px rgba(0,0,0,0.10)",
  dropHover:     "#f8fafc",
};

export default function Navbar() {
  const { role, user }          = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const { t, toggleLang, lang } = useLang();
  const navigate                = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef(null);

  const C = isDark ? DARK : LIGHT;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // ── Shared icon button style ──────────────────────────
  const iconBtn = {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    width:          "34px",
    height:         "34px",
    borderRadius:   "50%",
    background:     "transparent",
    border:         "none",
    cursor:         "pointer",
    fontSize:       "15px",
    transition:     "background 0.2s",
    flexShrink:     0,
  };

  // ── Pill button (active / inactive) ──────────────────
  const pillBtn = (active) => ({
    ...iconBtn,
    background:  active ? C.pillActive : "transparent",
    boxShadow:   active ? C.pillActiveShadow : "none",
  });

  return (
    <div
      style={{
        height:         "64px",
        background:     C.bg,
        borderBottom:   `1px solid ${C.border}`,
        boxShadow:      C.shadow,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 28px",
        position:       "sticky",
        top:            0,
        zIndex:         99,
        transition:     "background 0.25s, border-color 0.25s",
      }}
    >
      {/* ── Left: Brand + Breadcrumb ─────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize:      "16px",
            fontWeight:    "700",
            color:         C.title,
            letterSpacing: "-0.2px",
            fontFamily:    "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {t("navbar.title")}
        </span>
        <span style={{ color: C.divider, fontSize: "18px", lineHeight: 1 }}>
          /
        </span>
        <span
          style={{
            fontSize:   "12px",
            color:      C.mutedActive,
            fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {t("navbar.breadcrumb")}
        </span>
      </div>

      {/* ── Right: Controls ──────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* ── Theme pill toggle (☀️ / 🌙) ── */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            background:   C.pillBg,
            border:       `1px solid ${C.pillBorder}`,
            borderRadius: "999px",
            padding:      "3px",
            gap:          "2px",
          }}
        >
          {/* Light mode button */}
          <button
            onClick={() => isDark && toggleTheme()}
            title={t("theme.light")}
            style={pillBtn(!isDark)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={!isDark ? NAVY : C.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1"  x2="12" y2="3"  />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1"  y1="12" x2="3"  y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
            </svg>
          </button>

          {/* Dark mode button */}
          <button
            onClick={() => !isDark && toggleTheme()}
            title={t("theme.dark")}
            style={pillBtn(isDark)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? "#f1f5f9" : C.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>

        {/* ── Language toggle ── */}
        <button
          onClick={toggleLang}
          title={lang === "fr" ? "Switch to English" : "Passer en français"}
          style={{
            height:        "36px",
            padding:       "0 13px",
            borderRadius:  "999px",
            background:    C.pillBg,
            border:        `1px solid ${C.pillBorder}`,
            cursor:        "pointer",
            fontSize:      "11px",
            fontWeight:    "700",
            letterSpacing: "0.6px",
            color:         C.mutedActive,
            transition:    "all 0.2s",
            fontFamily:    "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {lang === "fr" ? "EN" : "FR"}
        </button>

        {/* ── Divider ── */}
        <div
          style={{
            width:      "1px",
            height:     "24px",
            background: C.divider,
            margin:     "0 2px",
            flexShrink: 0,
          }}
        />

        {/* ── Notification bell ── */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              ...iconBtn,
              width:      "36px",
              height:     "36px",
              background: C.surface,
              border:     `1px solid ${C.surfaceBorder}`,
              borderRadius: "10px",
            }}
            title={t("navbar.notifications")}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.mutedActive}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {/* Badge */}
          <span
            style={{
              position:     "absolute",
              top:          "7px",
              right:        "7px",
              width:        "7px",
              height:       "7px",
              borderRadius: "50%",
              background:   "#ef4444",
              border:       `2px solid ${C.bg}`,
            }}
          />
        </div>

        {/* ── User chip + dropdown ── */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown((s) => !s)}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "10px",
              padding:      "5px 10px 5px 5px",
              borderRadius: "12px",
              background:   C.surface,
              border:       `1px solid ${C.surfaceBorder}`,
              cursor:       "pointer",
              transition:   "all 0.2s",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width:          "34px",
                height:         "34px",
                borderRadius:   "9px",
                background:     "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                color:          "#fff",
                fontWeight:     "700",
                fontSize:       "13px",
                flexShrink:     0,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            {/* Name & role */}
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize:   "13px",
                  fontWeight: "600",
                  color:      C.title,
                  lineHeight: "1.25",
                  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {user?.name || t("navbar.guest")}
              </div>
              <div
                style={{
                  fontSize:        "10px",
                  color:           C.mutedActive,
                  textTransform:   "capitalize",
                  fontFamily:      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {role || t("navbar.guest")}
              </div>
            </div>

            {/* Chevron */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={C.mutedActive}
              style={{
                transform:  showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                flexShrink: 0,
              }}
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {/* ── Dropdown menu ── */}
          {showDropdown && (
            <div
              style={{
                position:     "absolute",
                top:          "calc(100% + 8px)",
                right:        0,
                background:   C.dropBg,
                border:       `1px solid ${C.dropBorder}`,
                borderRadius: "14px",
                boxShadow:    C.dropShadow,
                minWidth:     "200px",
                overflow:     "hidden",
                zIndex:       200,
              }}
            >
              {/* User header inside dropdown */}
              <div
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        "10px",
                  padding:    "14px 16px",
                  borderBottom: `1px solid ${C.divider}`,
                }}
              >
                <div
                  style={{
                    width:          "36px",
                    height:         "36px",
                    borderRadius:   "9px",
                    background:     "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "#fff",
                    fontWeight:     "700",
                    fontSize:       "14px",
                    flexShrink:     0,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: C.title }}>
                    {user?.name || t("navbar.guest")}
                  </div>
                  <div style={{ fontSize: "11px", color: C.mutedActive }}>
                    {user?.email || ""}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              {[
                {
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  ),
                  label: t("navbar.profile"),
                },
                {
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/>
                    </svg>
                  ),
                  label: t("navbar.settings"),
                },
              ].map(({ icon, label }) => (
                <DropItem key={label} icon={icon} label={label} color={C.title} hoverBg={C.dropHover} />
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.dropHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                style={{
                  padding:      "11px 16px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                  fontSize:     "13px",
                  color:        "#ef4444",
                  cursor:       "pointer",
                  border:       "none",
                  borderTop:    `1px solid ${C.divider}`,
                  background:   "transparent",
                  width:        "100%",
                  textAlign:    "left",
                  transition:   "background 0.15s",
                  fontFamily:   "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {t("navbar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable dropdown item ────────────────────────────────
function DropItem({ icon, label, color, hoverBg, onClick }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      style={{
        padding:    "11px 16px",
        display:    "flex",
        alignItems: "center",
        gap:        "10px",
        fontSize:   "13px",
        color:      color,
        cursor:     "pointer",
        border:     "none",
        background: "transparent",
        width:      "100%",
        textAlign:  "left",
        transition: "background 0.15s",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {icon}
      {label}
    </button>
  );
}