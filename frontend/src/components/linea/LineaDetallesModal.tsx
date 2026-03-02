import type {
  LineaItem,
  RecorridoItem,
  QuejaItem,
  Cable,
  Planta,
  Sistema,
  Propietario,
} from "../../services/lineaService";
import { lineaService } from "../../services/lineaService";
import type { MovimientoItem } from "../../services/movimientoService";
import { movimientoService } from "../../services/movimientoService";
import { useState, useEffect } from "react";

interface LineaDetallesModalProps {
  show: boolean;
  linea: LineaItem | null;
  recorridos: RecorridoItem[];
  quejas: QuejaItem[];
  loading: boolean;
  onClose: () => void;
  onDataUpdated?: () => void;
  movimientos?: MovimientoItem[];
}

export default function LineaDetallesModal({
  show,
  linea,
  recorridos,
  quejas,
  loading,
  onClose,
  onDataUpdated,
}: LineaDetallesModalProps) {
  // Estados para gestión de recorridos
  const [showNuevoRecorrido, setShowNuevoRecorrido] = useState(false);
  const [editandoRecorrido, setEditandoRecorrido] =
    useState<RecorridoItem | null>(null);
  const [eliminandoRecorrido, setEliminandoRecorrido] = useState<number | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Estado local para recorridos
  const [movimientosLocales, setMovimientosLocales] = useState<
    MovimientoItem[]
  >([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [recorridosLocales, setRecorridosLocales] = useState<RecorridoItem[]>(
    [],
  );

  // Estados para combos
  const [cables, setCables] = useState<Cable[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);

  // Estado para formulario de recorrido
  const [formRecorrido, setFormRecorrido] = useState({
    numero: "",
    par: "",
    terminal: "",
    de: "",
    a: "",
    dirter: "",
    soporte: "",
    canal: "",
    id_cable: "",
    id_planta: "",
    id_sistema: "",
    id_propietario: "",
  });

  // Inicializar recorridosLocales con los props cuando cambian
  useEffect(() => {
    if (recorridos) {
      setRecorridosLocales(recorridos);
    }
  }, [recorridos]);

  // Cargar combos y movimientos al abrir el modal o cambiar de línea
  useEffect(() => {
    if (show && linea) {
      loadCombos();
      cargarMovimientos();
    }
  }, [show, linea]);

  // Resetear formulario cuando se cierra o cambia el estado
  useEffect(() => {
    if (!showNuevoRecorrido && !editandoRecorrido) {
      resetFormRecorrido();
    }
  }, [showNuevoRecorrido, editandoRecorrido]);

  const loadCombos = async () => {
    try {
      setLoadingCombos(true);
      const [cablesData, plantasData, sistemasData, propietariosData] =
        await Promise.all([
          lineaService.getCables(),
          lineaService.getPlantas(),
          lineaService.getSistemas(),
          lineaService.getPropietarios(),
        ]);
      setCables(cablesData);
      setPlantas(plantasData);
      setSistemas(sistemasData);
      setPropietarios(propietariosData);
    } catch (error) {
      console.error("Error cargando combos:", error);
    } finally {
      setLoadingCombos(false);
    }
  };

  // Cargar movimientos cuando se abre el modal
  useEffect(() => {
    if (show && linea) {
      cargarMovimientos();
    }
  }, [show, linea]);

  const cargarMovimientos = async () => {
    if (!linea) return;
    try {
      setLoadingMovimientos(true);
      const response = await movimientoService.getMovimientosLinea(
        linea.id_linea,
        1,
        100,
      );
      console.log("movimientos linea response", response);
      const arr =
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      setMovimientosLocales(arr);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  // Función para recargar los recorridos desde el servidor
  const recargarRecorridos = async () => {
    if (!linea) return;

    try {
      const response = await lineaService.getRecorridosLinea(
        linea.id_linea,
        1,
        100,
      );

      if (response.data && Array.isArray(response.data)) {
        setRecorridosLocales(response.data);
      }

      // También notificar al componente padre
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (err) {
      console.error("Error recargando recorridos:", err);
    }
  };

  const resetFormRecorrido = () => {
    setFormRecorrido({
      numero: "",
      par: "",
      terminal: "",
      de: "",
      a: "",
      dirter: "",
      soporte: "",
      canal: "",
      id_cable: "",
      id_planta: "",
      id_sistema: "",
      id_propietario: "",
    });
    setEditandoRecorrido(null);
  };

  const handleGuardarRecorrido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linea) return;

    try {
      setGuardando(true);
      setError("");

      const recorridoData = {
        numero: parseInt(formRecorrido.numero),
        par: formRecorrido.par || null,
        terminal: formRecorrido.terminal || null,
        de: formRecorrido.de || null,
        a: formRecorrido.a || null,
        dirter: formRecorrido.dirter || null,
        soporte: formRecorrido.soporte || null,
        canal: formRecorrido.canal || null,
        id_linea: linea.id_linea,
        id_cable: formRecorrido.id_cable
          ? parseInt(formRecorrido.id_cable)
          : null,
        id_planta: formRecorrido.id_planta
          ? parseInt(formRecorrido.id_planta)
          : null,
        id_sistema: formRecorrido.id_sistema
          ? parseInt(formRecorrido.id_sistema)
          : null,
        id_propietario: formRecorrido.id_propietario
          ? parseInt(formRecorrido.id_propietario)
          : null,
      };

      if (editandoRecorrido) {
        await lineaService.updateRecorrido(
          editandoRecorrido.id_recorrido,
          recorridoData,
        );
      } else {
        await lineaService.createRecorrido(recorridoData);
      }

      // ¡IMPORTANTE! Recargar los recorridos después de guardar
      await recargarRecorridos();

      // Cerrar formulario y resetear
      setShowNuevoRecorrido(false);
      resetFormRecorrido();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        (editandoRecorrido
          ? "Error al actualizar el recorrido"
          : "Error al crear el recorrido");
      setError(errorMsg);
      console.error("Error guardando recorrido:", err);
    } finally {
      setGuardando(false);
    }
  };

  // Manejar eliminación de recorrido
  const handleEliminarRecorrido = async (id: number) => {
    if (
      !confirm(
        "¿Está seguro de eliminar este recorrido? Esta acción no se puede deshacer.",
      )
    )
      return;

    try {
      setEliminandoRecorrido(id);
      setError("");

      await lineaService.deleteRecorrido(id);

      // ¡IMPORTANTE! Recargar los recorridos después de eliminar
      await recargarRecorridos();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al eliminar el recorrido");
      console.error("Error eliminando recorrido:", err);
    } finally {
      setEliminandoRecorrido(null);
    }
  };

  // Manejar cambios en formulario
  const handleRecorridoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormRecorrido((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar edición de recorrido
  const handleEditarRecorrido = (recorrido: RecorridoItem) => {
    setEditandoRecorrido(recorrido);
    setFormRecorrido({
      numero: recorrido.numero.toString(),
      par: recorrido.par || "",
      terminal: recorrido.terminal || "",
      de: recorrido.de || "",
      a: recorrido.a || "",
      dirter: recorrido.dirter || "",
      soporte: recorrido.soporte || "",
      canal: recorrido.canal || "",
      id_cable: recorrido.id_cable?.toString() || "",
      id_planta: recorrido.id_planta?.toString() || "",
      id_sistema: recorrido.id_sistema?.toString() || "",
      id_propietario: recorrido.id_propietario?.toString() || "",
    });
    setShowNuevoRecorrido(true);
  };


  // Si no se debe mostrar, no renderizar nada
  if (!show) return null;

  // Mostrar loading si está cargando
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  // Si no hay línea (aunque show sea true), no renderizar el modal
  if (!linea) {
    console.warn("LineaDetallesModal: show es true pero linea es null");
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header fijo */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalles de la Línea: {linea?.clavelinea || "No disponible"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
              aria-label="Cerrar"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Información de la Línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Clave Línea
                </h4>
                <p className="text-sm text-gray-900">
                  {linea.clavelinea || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Desde</h4>
                <p className="text-sm text-gray-900">{linea.desde || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Dirección Desde
                </h4>
                <p className="text-sm text-gray-900">{linea.dirde || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Zona Desde
                </h4>
                <p className="text-sm text-gray-900">{linea.zd || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Hilos</h4>
                <p className="text-sm text-gray-900">{linea.hilos || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Hasta</h4>
                <p className="text-sm text-gray-900">{linea.hasta || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Dirección Hasta
                </h4>
                <p className="text-sm text-gray-900">{linea.dirha || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Zona Hasta
                </h4>
                <p className="text-sm text-gray-900">{linea.zh || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Tipo Línea
                </h4>
                <p className="text-sm text-gray-900">
                  {linea.tb_tipolinea?.tipo || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    linea.esbaja
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {linea.esbaja ? "Baja" : "Activo"}
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Movimientos
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Movimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Motivo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingMovimientos ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Cargando movimientos...
                      </td>
                    </tr>
                  ) : movimientosLocales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No hay movimientos registrados
                      </td>
                    </tr>
                  ) : (
                    movimientosLocales.map((movimiento, index) => (
                      <tr key={movimiento.id_movimiento}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movimiento.tb_tipomovimiento?.movimiento || "desconocido"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movimiento.fecha
                            ? new Date(movimiento.fecha).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {movimiento.motivo || "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Recorridos */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Recorridos
              </h4>
              <button
                onClick={() => {
                  resetFormRecorrido();
                  setShowNuevoRecorrido(!showNuevoRecorrido);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-2"
              >
                <i
                  className={
                    showNuevoRecorrido ? "ri-close-line" : "ri-add-line"
                  }
                ></i>
                <span>
                  {showNuevoRecorrido ? "Cancelar" : "Nuevo Recorrido"}
                </span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {/* Formulario para nuevo/editar recorrido */}
            {showNuevoRecorrido && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-semibold text-blue-800 mb-3">
                  <i className="ri-add-circle-line mr-1"></i>
                  {editandoRecorrido ? "Editar Recorrido" : "Nuevo Recorrido"}
                </h5>
                <form onSubmit={handleGuardarRecorrido} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="number"
                        name="numero"
                        value={formRecorrido.numero}
                        onChange={handleRecorridoChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Par
                      </label>
                      <input
                        type="text"
                        name="par"
                        value={formRecorrido.par}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terminal
                      </label>
                      <input
                        type="text"
                        name="terminal"
                        value={formRecorrido.terminal}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        De
                      </label>
                      <input
                        type="text"
                        name="de"
                        value={formRecorrido.de}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        A
                      </label>
                      <input
                        type="text"
                        name="a"
                        value={formRecorrido.a}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dir. Terminal
                      </label>
                      <input
                        type="text"
                        name="dirter"
                        value={formRecorrido.dirter}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Soporte
                      </label>
                      <input
                        type="text"
                        name="soporte"
                        value={formRecorrido.soporte}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Canal
                      </label>
                      <input
                        type="text"
                        name="canal"
                        value={formRecorrido.canal}
                        onChange={handleRecorridoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cable
                      </label>
                      <select
                        name="id_cable"
                        value={formRecorrido.id_cable}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                      >
                        <option value="">Seleccionar cable</option>
                        {cables.map((c) => (
                          <option key={c.id_cable} value={c.id_cable}>
                            {c.numero}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Planta
                      </label>
                      <select
                        name="id_planta"
                        value={formRecorrido.id_planta}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                      >
                        <option value="">Seleccionar planta</option>
                        {plantas.map((p) => (
                          <option key={p.id_planta} value={p.id_planta}>
                            {p.planta}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sistema
                      </label>
                      <select
                        name="id_sistema"
                        value={formRecorrido.id_sistema}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                      >
                        <option value="">Seleccionar sistema</option>
                        {sistemas.map((s) => (
                          <option key={s.id_sistema} value={s.id_sistema}>
                            {s.sistema}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Propietario
                      </label>
                      <select
                        name="id_propietario"
                        value={formRecorrido.id_propietario}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                      >
                        <option value="">Seleccionar propietario</option>
                        {propietarios.map((p) => (
                          <option
                            key={p.id_propietario}
                            value={p.id_propietario}
                          >
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNuevoRecorrido(false);
                        resetFormRecorrido();
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-blue-400"
                    >
                      <i className="ri-check-line mr-1"></i>
                      <span>
                        {editandoRecorrido ? "Actualizar" : "Guardar"}{" "}
                        Recorrido
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabla de Recorridos - ¡AHORA USA recorridosLocales! */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terminal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cable
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Par
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      De/A
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recorridosLocales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No hay recorridos registrados
                      </td>
                    </tr>
                  ) : (
                    recorridosLocales.map((recorrido, index) => (
                      <tr key={recorrido.id_recorrido}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recorrido.terminal || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recorrido.tb_cable?.numero || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recorrido.par || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {recorrido.de || ""} / {recorrido.a || ""}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleEditarRecorrido(recorrido)}
                            disabled={guardando || eliminandoRecorrido !== null}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() =>
                              handleEliminarRecorrido(recorrido.id_recorrido)
                            }
                            disabled={
                              guardando ||
                              eliminandoRecorrido === recorrido.id_recorrido
                            }
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Quejas */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quejas</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Reporte
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probador
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clave OK
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha OK
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quejas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-sm text-gray-500"
                      >
                        No hay quejas registradas para esta línea
                      </td>
                    </tr>
                  ) : (
                    quejas.map((queja) => (
                      <tr key={queja.num_reporte}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {queja.num_reporte}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {queja.fecha
                            ? new Date(queja.fecha).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {queja.probador1 || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {queja.claveok || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {queja.fechaok
                            ? new Date(queja.fechaok).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              queja.red
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {queja.red ? "En Red" : "Resuelta"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
