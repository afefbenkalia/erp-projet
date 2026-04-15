// layouts/MainLayout.jsx - Layout principal amélioré
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: "280px", 
        background: "#f5f7fb",
        minHeight: "100vh"
      }}>
        <Navbar />
        <main style={{ padding: "24px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}