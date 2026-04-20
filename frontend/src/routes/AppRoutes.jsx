import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Stock from "../pages/Stock";


import OrdresFabricationERP from "../pages/OrdresFabricationERP";


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
          path="/ordersfabricationerp"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrdresFabricationERP />
              </MainLayout>
            </ProtectedRoute>
          }
        />



      </Routes>
    </BrowserRouter>
  );
}