// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SistemaLayout from './layouts/SistemaLayout';
import LoginPage from './pages/auth/LoginPage';

import DebugLogin from './pages/auth/DebugLogin';
import ProfilePage from './pages/auth/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ClasificacionPage from './pages/nomencladores/ClasificacionPage';
import MandosPage from './pages/nomencladores/MandosPage';
import GruposTrabajoPage from './pages/nomencladores/GruposTrabajoPage';
import PropietariosPage from './pages/nomencladores/PropietariosPage';
import TipoMovimientoPage from './pages/nomencladores/TipoMovimientoPage';
import TipolineaPage from './pages/nomencladores/TipolineaPage';
import ClasificadorClavePage from './pages/nomencladores/ClasificadorClavePage';
import ClasifpizarraPage from './pages/nomencladores/ClasifpizarraPage';
import TipoQuejaPage from './pages/nomencladores/TipoquejaPage';
import CablePage from './pages/nomencladores/CablePage';
import PlantaPage from './pages/nomencladores/PlantaPage';
import TipoPizarraPage from './pages/nomencladores/TipopizarraPage';
import ClavePage from './pages/nomencladores/ClavePage';
import ResultadoPruebaPage from './pages/nomencladores/ResultadoPruebaPage';
import SenalizacionPage from './pages/nomencladores/SenalizacionPage';
import SistemaPage from './pages/nomencladores/SistemaPage';
import TrabajadorPage from './pages/TrabajadorPage';
import TelefonoPage from './pages/TelefonoPage';
import LineaPage from './pages/LineaPage';
import QuejaPage from './pages/quejaPage';
import PizarraPage from './pages/PizarraPage';
import UsuariosPage from './pages/auth/admin/UsuariosPage';
import RolesPage from './pages/auth/admin/RolesPage';
import StatsPage from './pages/StatsPage';
import NotFoundPage from './pages/NotFoundPage';

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
        <Route path="main/lineas" element={
          <ProtectedRoute permission="lineas.ver">
            <LineaPage />
          </ProtectedRoute>
          } />
        <Route path="main/pizarras" element={<PizarraPage />} />
        <Route path="stats" element={
          <ProtectedRoute permission="estadisticas.ver">
            <StatsPage />
          </ProtectedRoute>} />
          
        <Route path="main/quejas" element={
           <ProtectedRoute permission="quejas.ver">
            <QuejaPage />
           </ProtectedRoute>} />
        <Route path="operarios" element={
          <ProtectedRoute permission="trabajadores.gestionar">
            <TrabajadorPage />
          </ProtectedRoute>} />
        <Route path="admin/usuarios" element={
          <ProtectedRoute permission="usuarios.ver">
            <UsuariosPage />
          </ProtectedRoute>
        } />
        <Route
          path="admin/roles"
          element={
            <ProtectedRoute permission="roles.ver">
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route path="nomencladores/clasificacion" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <ClasificacionPage type=''/>
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/mandos" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <MandosPage />
          </ProtectedRoute> } 
        />
        <Route path="nomencladores/grupostrabajo" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <GruposTrabajoPage />
            </ProtectedRoute>} 
          />
        <Route path="nomencladores/propietarios" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <PropietariosPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/tipomovimientos" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <TipoMovimientoPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/tipolinea" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <TipolineaPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/clasificadorclave" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <ClasificadorClavePage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/clasifpizarra" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <ClasifpizarraPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/tipoqueja" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <TipoQuejaPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/cable" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <CablePage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/planta" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <PlantaPage />
          </ProtectedRoute>  } 
        /> 
        <Route path="nomencladores/tipopizarra" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <TipoPizarraPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/clave" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <ClavePage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/resultadoprueba" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <ResultadoPruebaPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/senalizaciones" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <SenalizacionPage />
          </ProtectedRoute>} 
        />
        <Route path="nomencladores/sistema" element={
          <ProtectedRoute permission="nomencladores.gestionar">
            <SistemaPage />
          </ProtectedRoute>} 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}