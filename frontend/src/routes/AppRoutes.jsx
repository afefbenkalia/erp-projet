import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Stock from "../pages/Stock";
import Production from "../pages/Production";
import HR from "../pages/HR";
import OrdresFabricationERP from "../pages/OrdresFabricationERP";
import Commande from "../pages/Commande";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Stock />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/production"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Production />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HR />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ordersfabricationerp"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrdresFabricationERP />
              </MainLayout>
            </ProtectedRoute>
          }
        />

         <Route
  path="/commande"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Commande />
      </MainLayout>
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}