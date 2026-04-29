// src/App.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SistemaLayout from "./layouts/SistemaLayout";
import LoginPage from "./pages/auth/LoginPage";

import DebugLogin from "./pages/auth/DebugLogin";
import ProfilePage from "./pages/auth/ProfilePage";

// MP
import DashboardPage from "./pages/DashboardPage";
import ClasificacionPage from "./pages/nomencladores/ClasificacionPage";
import MandosPage from "./pages/nomencladores/MandosPage";
import GruposTrabajoPage from "./pages/nomencladores/GruposTrabajoPage";
import PropietariosPage from "./pages/nomencladores/PropietariosPage";
import TipoMovimientoPage from "./pages/nomencladores/TipoMovimientoPage";
import TipolineaPage from "./pages/nomencladores/TipolineaPage";
import ClasificadorClavePage from "./pages/nomencladores/ClasificadorClavePage";
import ClasifpizarraPage from "./pages/nomencladores/ClasifpizarraPage";
import TipoQuejaPage from "./pages/nomencladores/TipoquejaPage";
import CablePage from "./pages/nomencladores/CablePage";
import PlantaPage from "./pages/nomencladores/PlantaPage";
import TipoPizarraPage from "./pages/nomencladores/TipopizarraPage";
import MovimientoPage from "./pages/MovimientoPage";
import ClavePage from "./pages/nomencladores/ClavePage";
import ResultadoPruebaPage from "./pages/nomencladores/ResultadoPruebaPage";
import SenalizacionPage from "./pages/nomencladores/SenalizacionPage";
import SistemaPage from "./pages/nomencladores/SistemaPage";
import TrabajadorPage from "./pages/TrabajadorPage";
import TelefonoPage from "./pages/TelefonoPage";
import LineaPage from "./pages/LineaPage";
import QuejaPage from "./pages/quejaPage";
import DashboardQuejaPage from "./pages/queja/DashboardQuejaPage";
import PizarraPage from "./pages/PizarraPage";

//Users y Roles
import UsuariosPage from "./pages/auth/admin/UsuariosPage";
import RolesPage from "./pages/auth/admin/RolesPage";

//Stats
import StatsPage from "./pages/StatsPage";

// Materiales
import UnidadMedidaPage from "./pages/nomencladores/UnidadMedida";
import CategoriaMaterialPage from "./pages/nomencladores/CategoriaMaterial";
import AsignacionPage from "./pages/materiales/Asignacion";
import MaterialesPage from "./pages/materiales/MaterialesPage";
import ConsumoPage from "./pages/materiales/Consumo";

//404
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="auth/login" element={<LoginPage />} />
      <Route path="/debug-login" element={<DebugLogin />} />
      <Route path="/sistema/*" element={<SistemaLayout />}>
        <Route
          index
          element={
            <ProtectedRoute /* sin permiso concreto, solo autenticado */>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="main/telefonos"
          element={
            <ProtectedRoute permission="telefonos.ver">
              <TelefonoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="main/lineas"
          element={
            <ProtectedRoute permission="lineas.ver">
              <LineaPage />
            </ProtectedRoute>
          }
        />
        <Route path="main/pizarras" element={<PizarraPage />} />
        <Route
          path="stats"
          element={
            <ProtectedRoute permission="estadisticas.ver">
              <StatsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="main/quejas"
          element={
            <ProtectedRoute permission="quejas.ver">
              <QuejaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="main/quejas/dashboard"
          element={
            <ProtectedRoute permission="quejas.ver">
              <DashboardQuejaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="operarios"
          element={
            <ProtectedRoute permission="trabajadores.gestionar">
              <TrabajadorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/usuarios"
          element={
            <ProtectedRoute permission="usuarios.ver">
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/roles"
          element={
            <ProtectedRoute permission="roles.ver">
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="operaciones/movimientos"
          element={
            <ProtectedRoute permission="movimientos.gestionar">
              <MovimientoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/clasificacion"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <ClasificacionPage type="" />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/mandos"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <MandosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/grupostrabajo"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <GruposTrabajoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/propietarios"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <PropietariosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/tipomovimientos"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <TipoMovimientoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/tipolinea"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <TipolineaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/clasificadorclave"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <ClasificadorClavePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/clasifpizarra"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <ClasifpizarraPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/tipoqueja"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <TipoQuejaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/cable"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <CablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/unidadmedida"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <UnidadMedidaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/categoriamaterial"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <CategoriaMaterialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/planta"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <PlantaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/tipopizarra"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <TipoPizarraPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/clave"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <ClavePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/resultadoprueba"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <ResultadoPruebaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/senalizaciones"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <SenalizacionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="nomencladores/sistema"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <SistemaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="materiales/materiales"
          element={
            <ProtectedRoute permission="materiales.gestionar">
              <MaterialesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="materiales/asignacion"
          element={
            <ProtectedRoute permission="nomencladores.gestionar">
              <AsignacionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="materiales/consumos"
          element={
            <ProtectedRoute permission="materiales.gestionar">
              <ConsumoPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
