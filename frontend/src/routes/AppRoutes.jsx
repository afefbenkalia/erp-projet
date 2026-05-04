import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";



import OrdresFabricationERP from "../pages/OrdresFabricationERP";
import GestionStock from "../pages/GestionStock";
import Approvisionnement from "../pages/Approvisionnement";

import ReportsArchive from "../pages/ReportsArchive";
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
          path="/GestionStock"
          element={
            <ProtectedRoute>
              <MainLayout>
                <GestionStock />
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
          path="/Approvisionnement"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Approvisionnement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

<Route
  path="/ReportsArchive"
  element={
    <ProtectedRoute>
      <MainLayout>
        <ReportsArchive />
      </MainLayout>
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}