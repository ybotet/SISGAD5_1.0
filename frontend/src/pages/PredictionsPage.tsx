import { useEffect, useState } from "react";
import predictionsService, {
  type AnomaliasResponse,
  type DemandaResponse,
  type FallosResponse,
  type PrioridadResponse,
  type TiempoResolucionResponse,
} from "../services/predictionsApi";

type ActiveTab = "demanda" | "tiempo" | "anomalias" | "prioridad" | "fallos";

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("demanda");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demanda
  const [demandaData, setDemandaData] = useState<DemandaResponse | null>(null);
  const [diasFuturos, setDiasFuturos] = useState(30);

  // Tiempo resolución
  const [tiempoData, setTiempoData] = useState<TiempoResolucionResponse | null>(null);
  const [quejaIdInput, setQuejaIdInput] = useState("");

  // Anomalías
  const [anomaliasData, setAnomaliasData] = useState<AnomaliasResponse | null>(null);
  const [limiteAnomalias, setLimiteAnomalias] = useState(100);

  // Prioridad
  const [prioridadData, setPrioridadData] = useState<PrioridadResponse | null>(null);
  const [quejaIdPrioridad, setQuejaIdPrioridad] = useState("");

  // Fallos
  const [fallosData, setFallosData] = useState<FallosResponse | null>(null);
  const [limiteFallos, setLimiteFallos] = useState(100);

  const loadDemanda = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionsService.getDemandaMateriales(diasFuturos);
      setDemandaData(data);
    } catch (err: any) {
      setError(err.message || "Error cargando predicción de demanda");
    } finally {
      setLoading(false);
    }
  };

  const loadTiempo = async () => {
    if (!quejaIdInput) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictionsService.getTiempoResolucion(parseInt(quejaIdInput));
      setTiempoData(data);
    } catch (err: any) {
      setError(err.message || "Error cargando predicción de tiempo");
    } finally {
      setLoading(false);
    }
  };

  const loadAnomalias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionsService.getAnomaliasConsumo(limiteAnomalias);
      setAnomaliasData(data);
    } catch (err: any) {
      setError(err.message || "Error cargando detección de anomalías");
    } finally {
      setLoading(false);
    }
  };

  const loadPrioridad = async () => {
    if (!quejaIdPrioridad) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictionsService.getPrioridadQueja(parseInt(quejaIdPrioridad));
      setPrioridadData(data);
    } catch (err: any) {
      setError(err.message || "Error cargando predicción de prioridad");
    } finally {
      setLoading(false);
    }
  };

  const loadFallos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionsService.getFallosInfraestructura(limiteFallos);
      setFallosData(data);
    } catch (err: any) {
      setError(err.message || "Error cargando predicción de fallos");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "demanda", label: "📦 Demanda Materiales" },
    { id: "tiempo", label: "⏱️ Tiempo de Resolución" },
    { id: "anomalias", label: "⚠️ Anomalías de Consumo" },
    { id: "prioridad", label: "🎯 Prioridad de Queja" },
    { id: "fallos", label: "🔧 Fallos de Infraestructura" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Predictivo</h1>
          <p className="text-sm text-gray-500">
            Modelos de ML: Prophet, XGBoost, IsolationForest, RandomForestClassifier
          </p>
        </div>

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

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        {/* ── TAB: Demanda Materiales ── */}
        {activeTab === "demanda" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Días futuros</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={diasFuturos}
                  onChange={(e) => setDiasFuturos(parseInt(e.target.value) || 30)}
                  className="border border-gray-300 rounded px-3 py-2 w-24"
                />
              </div>
              <button
                onClick={loadDemanda}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Predecir"}
              </button>
            </div>

            {demandaData && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-2">
                  Modelo v{demandaData.modelo_version} · Generado:{" "}
                  {new Date(demandaData.fecha_generacion).toLocaleString()}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2">Fecha</th>
                        <th className="pb-2">Categoría</th>
                        <th className="pb-2">Predicción</th>
                        <th className="pb-2">Límite inferior</th>
                        <th className="pb-2">Límite superior</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandaData.predicciones.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td>{new Date(item.fecha).toLocaleDateString()}</td>
                          <td>{item.categoria}</td>
                          <td className="font-medium">{item.cantidad_predicha}</td>
                          <td>{item.limite_inferior}</td>
                          <td>{item.limite_superior}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!demandaData && !loading && (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                Ingresa los parámetros y haz clic en "Predecir".
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Tiempo de Resolución ── */}
        {activeTab === "tiempo" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID de Queja</label>
                <input
                  type="number"
                  placeholder="Ej: 12345"
                  value={quejaIdInput}
                  onChange={(e) => setQuejaIdInput(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
              </div>
              <button
                onClick={loadTiempo}
                disabled={loading || !quejaIdInput}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Predecir"}
              </button>
            </div>

            {tiempoData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-700">
                      {tiempoData.tiempo_predicho_horas}h
                    </div>
                    <div className="text-sm text-gray-500">Tiempo estimado</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-700">
                      {Math.round(tiempoData.nivel_confianza * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Nivel de confianza</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Modelo v{tiempoData.modelo_version}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Anomalías de Consumo ── */}
        {activeTab === "anomalias" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Límite de registros</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={limiteAnomalias}
                  onChange={(e) => setLimiteAnomalias(parseInt(e.target.value) || 100)}
                  className="border border-gray-300 rounded px-3 py-2 w-24"
                />
              </div>
              <button
                onClick={loadAnomalias}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Detectar"}
              </button>
            </div>

            {anomaliasData && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-2">
                  Modelo v{anomaliasData.modelo_version} · Analizados: {anomaliasData.total_analizados} ·
                  Anómalos:{" "}
                  {anomaliasData.anomalias.filter((a) => a.es_anomalo).length}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2">Material ID</th>
                        <th className="pb-2">Categoría</th>
                        <th className="pb-2">Consumo Real</th>
                        <th className="pb-2">Consumo Esperado</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">¿Anómalo?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomaliasData.anomalias.map((a) => (
                        <tr
                          key={a.material_id}
                          className={a.es_anomalo ? "bg-red-50 border-b" : "border-b"}
                        >
                          <td>{a.material_id}</td>
                          <td>{a.categoria}</td>
                          <td>{a.consumo_real}</td>
                          <td>{a.consumo_esperado}</td>
                          <td>{a.score_anomalia}</td>
                          <td>
                            {a.es_anomalo ? (
                              <span className="text-red-600 font-medium">Sí</span>
                            ) : (
                              "No"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Prioridad de Queja ── */}
        {activeTab === "prioridad" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID de Queja</label>
                <input
                  type="number"
                  placeholder="Ej: 12345"
                  value={quejaIdPrioridad}
                  onChange={(e) => setQuejaIdPrioridad(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
              </div>
              <button
                onClick={loadPrioridad}
                disabled={loading || !quejaIdPrioridad}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Predecir"}
              </button>
            </div>

            {prioridadData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Resultado</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-4xl font-bold text-orange-700">
                      Prioridad {prioridadData.prioridad_predicha}
                    </div>
                    <div className="text-sm text-gray-500">
                      Modelo v{prioridadData.modelo_version}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(prioridadData.probabilidades).map(([label, prob]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-12 text-sm">Prioridad {label}:</span>
                        <div className="flex-1 bg-gray-200 rounded h-5">
                          <div
                            className="bg-blue-600 h-5 rounded"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm font-medium">{Math.round(prob * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Fallos de Infraestructura ── */}
        {activeTab === "fallos" && (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Límite de registros</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={limiteFallos}
                  onChange={(e) => setLimiteFallos(parseInt(e.target.value) || 100)}
                  className="border border-gray-300 rounded px-3 py-2 w-24"
                />
              </div>
              <button
                onClick={loadFallos}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Predecir"}
              </button>
            </div>

            {fallosData && (
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-2">
                  Modelo v{fallosData.modelo_version} · Analizados: {fallosData.total_analizados} ·
                  Críticos: {fallosData.predicciones.filter((f) => f.es_critico).length}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2">Elemento ID</th>
                        <th className="pb-2">Tipo</th>
                        <th className="pb-2">Probabilidad</th>
                        <th className="pb-2">Crítico</th>
                        <th className="pb-2">Factores de riesgo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fallosData.predicciones.map((f) => (
                        <tr
                          key={f.elemento_id}
                          className={f.es_critico ? "bg-red-50 border-b" : "border-b"}
                        >
                          <td>{f.elemento_id}</td>
                          <td>{f.tipo_elemento}</td>
                          <td>{Math.round(f.probabilidad_fallo * 100)}%</td>
                          <td>
                            {f.es_critico ? (
                              <span className="text-red-600 font-medium">Sí</span>
                            ) : (
                              "No"
                            )}
                          </td>
                          <td>{f.factores_riesgo.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
