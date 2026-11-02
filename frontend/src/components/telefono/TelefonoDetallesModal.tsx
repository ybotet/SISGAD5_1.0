import type {
  TelefonoItem,
  RecorridoItem,
  QuejaItem,
  Cable,
  Planta,
  Sistema,
  Propietario,
} from "../../services/telefonoService";
import { telefonoService } from "../../services/telefonoService";
import type { MovimientoItem } from "../../services/movimientoService";
import { movimientoService } from "../../services/movimientoService";
import { useState, useEffect } from "react";

interface TelefonoDetallesModalProps {
  show: boolean;
  telefono: TelefonoItem | null;
  recorridos: RecorridoItem[];
  quejas: QuejaItem[];
  loading: boolean;
  onClose: () => void;
  onDataUpdated?: () => void;
}

const TABS = ["datos", "movimientos", "recorridos", "quejas"] as const;

export default function TelefonoDetallesModal({
  show,
  telefono,
  recorridos,
  quejas,
  loading,
  onClose,
  onDataUpdated,
}: TelefonoDetallesModalProps) {
  const [showNuevoRecorrido, setShowNuevoRecorrido] = useState(false);
  const [editandoRecorrido, setEditandoRecorrido] =
    useState<RecorridoItem | null>(null);
  const [eliminandoRecorrido, setEliminandoRecorrido] = useState<number | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [movimientosLocales, setMovimientosLocales] = useState<MovimientoItem[]>(
    [],
  );
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [recorridosLocales, setRecorridosLocales] = useState<RecorridoItem[]>(
    [],
  );

  const [cables, setCables] = useState<Cable[]>([]);
  const [plantas, setPlantas] = useState<Planta[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [sistemas, setSistemas] = useState<Sistema[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);

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

  const [tabActiva, setTabActiva] = useState("datos");

  useEffect(() => {
    if (recorridos) setRecorridosLocales(recorridos);
  }, [recorridos]);

  useEffect(() => {
    if (show && telefono) {
      loadCombos();
      cargarMovimientos();
    }
  }, [show, telefono]);

  useEffect(() => {
    if (!showNuevoRecorrido && !editandoRecorrido) resetFormRecorrido();
  }, [showNuevoRecorrido, editandoRecorrido]);

  const loadCombos = async () => {
    try {
      setLoadingCombos(true);
      const [cablesData, plantasData, propietariosData, sistemasData] =
        await Promise.all([
          telefonoService.getCables(),
          telefonoService.getPlantas(),
          telefonoService.getPropietarios(),
          telefonoService.getSistemas(),
        ]);
      setCables(cablesData);
      setPlantas(plantasData);
      setPropietarios(propietariosData);
      setSistemas(sistemasData);
    } catch (err) {
      console.error("Error cargando combos:", err);
      setError("Error al cargar datos adicionales");
    } finally {
      setLoadingCombos(false);
    }
  };

  const cargarMovimientos = async () => {
    if (!telefono) return;
    try {
      setLoadingMovimientos(true);
      const response = await movimientoService.getMovimientosTelefono(
        telefono.id_telefono,
        1,
        100,
      );
      const arr = Array.isArray(response.data)
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

  const recargarRecorridos = async () => {
    if (!telefono) return;
    try {
      const response = await telefonoService.getRecorridosTelefono(
        telefono.id_telefono,
        1,
        100,
      );
      if (response.data && Array.isArray(response.data)) {
        setRecorridosLocales(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setRecorridosLocales(response.data.data);
      }
      if (onDataUpdated) onDataUpdated();
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCloseClick = () => {
    onClose();
    resetFormRecorrido();
    setShowNuevoRecorrido(false);
    setError("");
  };

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

  const parseCampoInt = (val: string) => (val ? parseInt(val, 10) : null);

  const handleGuardarRecorrido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefono) return;

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
        id_telefono: telefono.id_telefono,
        id_cable: parseCampoInt(formRecorrido.id_cable),
        id_planta: parseCampoInt(formRecorrido.id_planta),
        id_sistema: parseCampoInt(formRecorrido.id_sistema),
        id_propietario: parseCampoInt(formRecorrido.id_propietario),
      };

      if (editandoRecorrido) {
        await telefonoService.updateRecorrido(
          editandoRecorrido.id_recorrido,
          recorridoData,
        );
      } else {
        await telefonoService.createRecorrido(recorridoData);
      }

      await recargarRecorridos();
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
      await telefonoService.deleteRecorrido(id);
      await recargarRecorridos();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al eliminar el recorrido");
      console.error("Error eliminando recorrido:", err);
    } finally {
      setEliminandoRecorrido(null);
    }
  };

  const handleRecorridoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormRecorrido((prev) => ({ ...prev, [name]: value }));
  };

  const renderCampoRelacionado = (recorrido: RecorridoItem) => {
    const campos = [];
    if (recorrido.tb_planta?.planta) {
      campos.push(
        <div key="planta" className="flex items-center gap-1">
          <i className="ri-building-line text-gray-400 text-xs" />
          <span className="text-xs text-gray-600">Planta:</span>
          <span className="text-xs text-gray-900">
            {recorrido.tb_planta.planta}
          </span>
        </div>,
      );
    }
    if (recorrido.tb_sistema?.sistema) {
      campos.push(
        <div key="sistema" className="flex items-center gap-1">
          <i className="ri-server-line text-gray-400 text-xs" />
          <span className="text-xs text-gray-600">Sistema:</span>
          <span className="text-xs text-gray-900">
            {recorrido.tb_sistema.sistema}
          </span>
        </div>,
      );
    }
    if (recorrido.tb_propietario?.nombre) {
      campos.push(
        <div key="propietario" className="flex items-center gap-1">
          <i className="ri-user-line text-gray-400 text-xs" />
          <span className="text-xs text-gray-600">Propietario:</span>
          <span className="text-xs text-gray-900">
            {recorrido.tb_propietario.nombre}
          </span>
        </div>,
      );
    }
    return campos.length > 0 ? (
      <div className="space-y-0.5">{campos}</div>
    ) : (
      <span className="text-xs text-gray-400">N/A</span>
    );
  };

  if (!show) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 text-center shadow-xl">
          <i className="ri-loader-4-line animate-spin text-3xl text-blue-600 mb-3" />
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!telefono) return null;

  const tabs = [
    { id: "datos", label: "Datos del Teléfono", icon: "ri-information-line" },
    { id: "movimientos", label: "Movimientos", icon: "ri-arrow-left-right-line" },
    { id: "recorridos", label: "Recorridos", icon: "ri-route-line" },
    { id: "quejas", label: "Quejas", icon: "ri-bug-line" },
  ];

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-50 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header moderno */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <i className="ri-smartphone-line text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {telefono.telefono || "Sin teléfono"}
                </h3>
                <p className="text-sm text-gray-300">
                  {telefono.nombre || "Sin nombre"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  telefono.esbaja
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    telefono.esbaja ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                {telefono.esbaja ? "Baja" : "Activo"}
              </span>
              <button
                onClick={handleCloseClick}
                className="text-gray-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-error-warning-line" />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          )}

          {/* Navegación por pestañas */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex gap-2 px-6" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  onClick={() => setTabActiva(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    tabActiva === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <i className={tab.icon} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de pestañas */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-170px)]">
            {/* TAB: Datos del Teléfono */}
            {tabActiva === "datos" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoCard
                    icon="ri-user-line"
                    label="Nombre"
                    value={telefono.nombre || "N/A"}
                  />
                  <InfoCard
                    icon="ri-map-pin-line"
                    label="Dirección"
                    value={telefono.direccion || "N/A"}
                  />
                  <InfoCard
                    icon="ri-edit-license-line"
                    label="LIC"
                    value={telefono.lic || "N/A"}
                  />
                  <InfoCard
                    icon="ri-zone-line"
                    label="Zona"
                    value={telefono.zona || "N/A"}
                  />
                </div>
                <div className="space-y-4">
                  <InfoCard
                    icon="ri-classification-line"
                    label="Clasificación"
                    value={telefono.tb_clasificacion?.nombre || "N/A"}
                  />
                  <InfoCard
                    icon="ri-number-1-line"
                    label="Extensiones"
                    value={telefono.extensiones?.toString() || "0"}
                  />
                  <InfoCard
                    icon="ri-bill-line"
                    label="Facturado"
                    value={telefono.facturado || "N/A"}
                  />
                  <InfoCard
                    icon="ri-store-line"
                    label="Sector"
                    value={telefono.sector || "N/A"}
                  />
                </div>
              </div>
            )}

            {/* TAB: Movimientos */}
            {tabActiva === "movimientos" && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  <tbody className="divide-y divide-gray-200">
                    {loadingMovimientos ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <i className="ri-loader-4-line animate-spin mr-2" />
                          Cargando movimientos...
                        </td>
                      </tr>
                    ) : movimientosLocales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          <i className="ri-inbox-line text-3xl mb-2 block" />
                          No hay movimientos registrados
                        </td>
                      </tr>
                    ) : (
                      movimientosLocales.map((movimiento, index) => (
                        <tr key={movimiento.id_movimiento} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {movimiento.tb_tipomovimiento?.movimiento ||
                              "desconocido"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {movimiento.fecha
                              ? new Date(movimiento.fecha).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {movimiento.motivo || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: Recorridos */}
            {tabActiva === "recorridos" && (
              <>
                {/* Toolbar de recorridos */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="ri-route-line text-blue-600" />
                    Recorridos
                  </h4>
                  <button
                    onClick={() => {
                      resetFormRecorrido();
                      setShowNuevoRecorrido(!showNuevoRecorrido);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                      showNuevoRecorrido
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <i
                      className={
                        showNuevoRecorrido ? "ri-close-line" : "ri-add-line"
                      }
                    />
                    {showNuevoRecorrido ? "Cancelar" : "Nuevo Recorrido"}
                  </button>
                </div>

                {/* Formulario de recorrido */}
                {showNuevoRecorrido && (
                  <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                      <i
                        className={
                          editandoRecorrido
                            ? "ri-edit-line"
                            : "ri-add-circle-line"
                        }
                      />
                      {editandoRecorrido
                        ? "Editar Recorrido"
                        : "Nuevo Recorrido"}
                    </h5>
                    <form
                      onSubmit={handleGuardarRecorrido}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <FormField
                        label="Número *"
                        name="numero"
                        type="number"
                        value={formRecorrido.numero}
                        onChange={handleRecorridoChange}
                        required
                        disabled={guardando}
                        placeholder="Ej: 238971"
                      />
                      <FormField
                        label="Par"
                        name="par"
                        value={formRecorrido.par}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: 52"
                      />
                      <FormField
                        label="Terminal"
                        name="terminal"
                        value={formRecorrido.terminal}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: 8Q"
                      />
                      <FormField
                        label="De"
                        name="de"
                        value={formRecorrido.de}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: 1"
                      />
                      <FormField
                        label="A"
                        name="a"
                        value={formRecorrido.a}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: 100"
                      />
                      <FormField
                        label="Dir. Ter."
                        name="dirter"
                        value={formRecorrido.dirter}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: DAAFAR"
                      />
                      <FormField
                        label="Soporte"
                        name="soporte"
                        value={formRecorrido.soporte}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: Soporte técnico"
                      />
                      <FormField
                        label="Canal"
                        name="canal"
                        value={formRecorrido.canal}
                        onChange={handleRecorridoChange}
                        disabled={guardando}
                        placeholder="Ej: Canal de comunicación"
                      />
                      <SelectField
                        label="Cable"
                        name="id_cable"
                        value={formRecorrido.id_cable}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        placeholder="Seleccionar cable"
                        options={cables.map((c) => ({
                          value: c.id_cable,
                          label: c.numero,
                        }))}
                      />
                      <SelectField
                        label="Planta"
                        name="id_planta"
                        value={formRecorrido.id_planta}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        placeholder="Seleccionar planta"
                        options={plantas.map((p) => ({
                          value: p.id_planta,
                          label: p.planta,
                        }))}
                      />
                      <SelectField
                        label="Propietario"
                        name="id_propietario"
                        value={formRecorrido.id_propietario}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        placeholder="Seleccionar propietario"
                        options={propietarios.map((p) => ({
                          value: p.id_propietario,
                          label: p.nombre,
                        }))}
                      />
                      <SelectField
                        label="Sistema"
                        name="id_sistema"
                        value={formRecorrido.id_sistema}
                        onChange={handleRecorridoChange}
                        disabled={guardando || loadingCombos}
                        placeholder="Seleccionar sistema"
                        options={sistemas.map((s) => ({
                          value: s.id_sistema,
                          label: s.sistema,
                        }))}
                      />

                      <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNuevoRecorrido(false);
                            resetFormRecorrido();
                          }}
                          disabled={guardando}
                          className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardando}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          {guardando && (
                            <i className="ri-loader-4-line animate-spin" />
                          )}
                          {editandoRecorrido ? "Actualizar" : "Guardar"} Recorrido
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tabla de Recorridos */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                          Cable/Par
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          De/A
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Relaciones
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recorridosLocales.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            <i className="ri-inbox-line text-3xl mb-2 block" />
                            No hay recorridos registrados
                          </td>
                        </tr>
                      ) : (
                        recorridosLocales.map((recorrido, index) => (
                          <tr key={recorrido.id_recorrido} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {recorrido.terminal || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span>
                                  Cable: {recorrido.tb_cable?.numero || "N/A"}
                                </span>
                                <span>Par: {recorrido.par || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span>De: {recorrido.de || "N/A"}</span>
                                <span>A: {recorrido.a || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {renderCampoRelacionado(recorrido)}
                            </td>
                            <td className="px-4 py-3 text-right space-x-1">
                              <button
                                onClick={() => handleEditarRecorrido(recorrido)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Editar recorrido"
                              >
                                <i className="ri-edit-line" />
                              </button>
                              <button
                                onClick={() =>
                                  handleEliminarRecorrido(recorrido.id_recorrido)
                                }
                                disabled={
                                  eliminandoRecorrido === recorrido.id_recorrido
                                }
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Eliminar recorrido"
                              >
                                {eliminandoRecorrido === recorrido.id_recorrido ? (
                                  <i className="ri-loader-4-line animate-spin" />
                                ) : (
                                  <i className="ri-delete-bin-line" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB: Quejas */}
            {tabActiva === "quejas" && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  <tbody className="divide-y divide-gray-200">
                    {quejas.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          <i className="ri-inbox-line text-3xl mb-2 block" />
                          No hay quejas registradas
                        </td>
                      </tr>
                    ) : (
                      quejas.map((queja) => (
                        <tr key={queja.num_reporte} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <a
                              href={`./quejas/${queja.num_reporte}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {queja.num_reporte}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(queja.fecha).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {queja.tb_trabajador?.clave_trabajador || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {queja.claveok || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {queja.fechaok
                              ? new Date(queja.fechaok).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <i className={`${icon} text-gray-400 text-lg mt-0.5`} />
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-sm text-gray-900 mt-1 break-words">{value}</p>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  options: { value: number; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
