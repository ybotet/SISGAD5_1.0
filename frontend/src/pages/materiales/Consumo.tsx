import { useState } from "react";
import { consumoService } from "../../services/consumoService";
import { quejaService } from "../../services/quejaService";
import { materialService } from "../../services/materialService";
import ConsumoTable from "../../components/consumo/ConsumoTable";
import ConsumoModal from "../../components/consumo/ConsumoModal";

export default function ConsumoPage() {
  const [numReporte, setNumReporte] = useState("");
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [selectedTrabajo, setSelectedTrabajo] = useState<any | null>(null);
  const [consumos, setConsumos] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const buscarQueja = async () => {
    try {
      const resp = await quejaService.getQuejas(1, 10, numReporte);
      if (resp.data && resp.data.length > 0) {
        const q = resp.data[0];
        const detalles = await quejaService.getQuejaDetalles(q.id_queja);
        setTrabajos(detalles.trabajos || []);
      } else {
        setTrabajos([]);
      }
    } catch (err) {
      console.error("Error buscando queja:", err);
    }
  };

  const seleccionarTrabajo = async (t: any) => {
    setSelectedTrabajo(t);
    try {
      const c = await consumoService.getConsumosPorTrabajo(t.id_trabajo);
      setConsumos(c || []);
    } catch (err) {
      console.error("Error cargando consumos:", err);
    }
  };

  const loadMateriales = async () => {
    try {
      const r = await materialService.getMaterials(1, 1000);
      setMateriales(r.data || []);
    } catch (err) {
      console.error("Error cargando materiales:", err);
    }
  };

  const handleCreateConsumo = async (payload: any) => {
    try {
      await consumoService.createConsumo(payload);
      if (selectedTrabajo) seleccionarTrabajo(selectedTrabajo);
      setShowModal(false);
    } catch (err) {
      console.error("Error creando consumo:", err);
      alert("Error creando consumo");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Consumos</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={numReporte}
            onChange={(e) => setNumReporte(e.target.value)}
            placeholder="Buscar por num_reporte"
            className="px-3 py-2 border rounded flex-1"
          />
          <button onClick={buscarQueja} className="px-4 py-2 bg-blue-600 text-white rounded">
            Buscar
          </button>
        </div>

        {trabajos.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600">Trabajos encontrados:</p>
            <ul className="mt-2 space-y-2">
              {trabajos.map((t) => (
                <li
                  key={t.id_trabajo}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div>
                    <div className="font-medium">
                      Trabajo {t.id_trabajo} — {new Date(t.fecha).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Probador: {t.probador}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => seleccionarTrabajo(t)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Seleccionar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTrabajo(t);
                        loadMateriales();
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Nuevo consumo
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedTrabajo && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Consumos para trabajo {selectedTrabajo.id_trabajo}</h3>
            <div>
              <button
                onClick={() => {
                  loadMateriales();
                  setShowModal(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Añadir consumo
              </button>
            </div>
          </div>

          <ConsumoTable
            items={consumos}
            materialesMap={Object.fromEntries((materiales || []).map((m: any) => [m.id, m]))}
          />
        </div>
      )}

      <ConsumoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateConsumo}
        trabajoId={selectedTrabajo?.id_trabajo ?? null}
        materiales={materiales}
      />
    </div>
  );
}
