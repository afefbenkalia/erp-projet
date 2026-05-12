import { createContext, useState } from "react";

export const AuthContext = createContext();

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

function buildUser(payload) {
  if (!payload) return null;
  return {
    email: payload.sub,
    name: payload.name || payload.sub,
    role: payload.role || "user",
    apps: payload.apps || [],
    userType: payload.userType || "pro",
  };
}

export default function AuthProvider({ children }) {
  const storedToken = localStorage.getItem("token");
  const [user, setUser] = useState(
    buildUser(storedToken ? decodeJwt(storedToken) : null)
  );

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(buildUser(decodeJwt(token)));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        userType: user?.userType || "pro",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
