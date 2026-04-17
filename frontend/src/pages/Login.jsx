import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

     // Changement ici : access_token → token
login(res.data.token, res.data.role);  // au lieu de res.data.access_token
      window.location.href = "/dashboard";
    } catch {
      alert("Login failed ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1 style={styles.title}>🏭 ERP SYSTEM</h1>
        <p style={styles.subtitle}>Login to dashboard</p>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        <p style={styles.footer}>ERP Management © 2026</p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
  },

  card: {
    width: "360px",
    background: "white",
    padding: "35px",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    textAlign: "center",
  },

  title: {
    fontSize: "28px",
    marginBottom: "10px",
    color: "#1e293b",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  footer: {
    marginTop: "15px",
    fontSize: "12px",
    color: "#94a3b8",
  },
};