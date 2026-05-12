import { Navigate } from "react-router-dom";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/" replace />;

  const payload = decodeJwt(token);

  if (!payload) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  if (!payload.apps?.includes("ERP")) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          background: "#f5f7fb",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2
            style={{ color: "#1a2c4e", margin: "0 0 12px", fontSize: "20px" }}
          >
            Accès non autorisé
          </h2>
          <p
            style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px" }}
          >
            Votre compte n'est pas configuré pour accéder au système ERP.
            Contactez votre administrateur.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            style={{
              padding: "10px 24px",
              background: "#1a2c4e",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return children;
}
