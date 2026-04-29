// frontend/src/pages/StatsPage.tsx
import { useState } from "react";
import DateRangePicker from "../components/ui/DateRangePicker";
import TelefonoModuleStats from "../components/stats/TelefonoModuleStats";
import LineaModuleStats from "../components/stats/LineaModuleStats";
import QuejaModuleStats from "../components/stats/QuejaModuleStats";
import PizarraModuleStats from "../components/stats/PizarraModuleStats";
import TrabajadorModuleStats from "../components/stats/TrabajadorModuleStats";
import MaterialesModuleStats from "../components/stats/MaterialesModuleStats";

type Periodo = string;

export default function StatsPage() {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [activeTab, setActiveTab] = useState<string>("telefono");

  const handleDateRangeChange = (desde: string, hasta: string, periodoSeleccionado: Periodo) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setPeriodo(periodoSeleccionado);
  };

  const tabs = [
    {
      id: "telefono",
      label: "📞 Teléfonos",
      component: (
        <TelefonoModuleStats fechaDesde={fechaDesde} fechaHasta={fechaHasta} periodo={periodo} />
      ),
    },
    {
      id: "materiales",
      label: "📦 Materiales",
      component: (
        <MaterialesModuleStats fechaDesde={fechaDesde} fechaHasta={fechaHasta} periodo={periodo} />
      ),
    },
    // Estos componentes aún NO soportan filtro de fechas (no reciben props)
    {
      id: "linea",
      label: "🔌 Líneas",
      component: (
        <LineaModuleStats fechaDesde={fechaDesde} fechaHasta={fechaHasta} periodo={periodo} />
      ),
    },
    { id: "pizarra", label: "📋 Pizarras", component: <PizarraModuleStats /> },
    {
      id: "queja",
      label: "⚠️ Quejas",
      component: (
        <QuejaModuleStats fechaDesde={fechaDesde} fechaHasta={fechaHasta} periodo={periodo} />
      ),
    },
    {
      id: "trabajador",
      label: "👥 Trabajadores",
      component: (
        <TrabajadorModuleStats fechaDesde={fechaDesde} fechaHasta={fechaHasta} periodo={periodo} />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-600">Visualizaciones agregadas por módulo</p>
      </div>

      {/* Selector de tiempo global */}
      <div className="mb-6">
        <DateRangePicker onDateRangeChange={handleDateRangeChange} />
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <div className="mt-4">{tabs.find((tab) => tab.id === activeTab)?.component}</div>
    </div>
  );
}
