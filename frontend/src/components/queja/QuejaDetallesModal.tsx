import type {
  QuejaItem,
  PruebaItem,
  TrabajoItem,
  AsignacionItem,
  Clave,
  Trabajador,
  ResultadoPrueba,
  HistorialEvento,
  CreateAsignacionRequest,
} from "../../services/quejaService";
import { quejaService } from "../../services/quejaService";
import { useState, useEffect } from "react";
import { formatDateTimeLocal } from "../../utils/dateFormats";

//#region Interfaces de props
interface QuejaDetallesModalProps {
  show: boolean;
  queja: QuejaItem | null;
  flujo?: any[];
  pruebas: PruebaItem[];
  trabajos: TrabajoItem[];
  asignacion: AsignacionItem[];
  loading: boolean;
  onClose: () => void;
  onDataUpdated?: () => void;
}
//#endregion

export default function QuejaDetallesModal({
  show,
  queja,
  flujo = [],
  pruebas,
  trabajos,
  asignacion = [],
  loading,
  onClose,
  onDataUpdated,
}: QuejaDetallesModalProps) {
  //#region Estados para UI (visibilidad de formularios)
  const [showNuevaPrueba, setShowNuevaPrueba] = useState(false);
  const [showNuevoTrabajo, setShowNuevoTrabajo] = useState(false);
  const [showNuevaAsignacion, setShowNuevaAsignacion] = useState(false);
  //#endregion

  //#region Estados para eliminación (loading por cada tipo)
  const [eliminandoPrueba, setEliminandoPrueba] = useState<number | null>(null);
  const [eliminandoTrabajo, setEliminandoTrabajo] = useState<number | null>(null);
  const [eliminandoAsignacion, setEliminandoAsignacion] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  //#endregion

  //#region Estado para el historial unificado
  const [historial, setHistorial] = useState<HistorialEvento[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  //#endregion

  //#region Estados para combos (datos de catálogos)
  const [claves, setClaves] = useState<Clave[]>([]);
  const [probadores, setProbadores] = useState<Trabajador[]>([]);
  const [resultados, setResultados] = useState<ResultadoPrueba[]>([]);
  const [_loadingCombos, setLoadingCombos] = useState<boolean>(false);
  //#endregion

  //#region Estados para formulario de nueva prueba
  const [nuevaPrueba, setNuevaPrueba] = useState({
    fecha: "",
    id_clave: "",
    id_resultado: "",
    id_trabajador: "",
  });
  //#endregion

  //#region Estados para formulario de nuevo trabajo
  const [nuevoTrabajo, setNuevoTrabajo] = useState({
    fecha: "",
    probador: "",
    estado: "",
    observaciones: "",
  });
  //#endregion

  //#region Estados para formulario de nueva asignación
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    fecha: "",
    trabajadores: [] as number[],
  });
  const [busquedaTrabajadores, setBusquedaTrabajadores] = useState("");
  //#endregion

  //#region Efectos (carga inicial y reactividad)
  // Cargar combos y historial al abrir el modal
  useEffect(() => {
    if (show && queja) {
      loadCombos();
      cargarHistorial();
    }
  }, [show, queja]);

  // Recargar historial cuando cambian los datos
  useEffect(() => {
    if (show && queja) {
      cargarHistorial();
    }
  }, [pruebas, trabajos, asignacion, flujo, show, queja]);

  // Prellenar fecha actual al abrir formulario de nueva prueba
  useEffect(() => {
    if (showNuevaPrueba) {
      setNuevaPrueba((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
      }));
    }
  }, [showNuevaPrueba]);

  // Prellenar fecha actual al abrir formulario de nuevo trabajo
  useEffect(() => {
    if (showNuevoTrabajo) {
      setNuevoTrabajo((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
      }));
    }
  }, [showNuevoTrabajo]);

  // Prellenar fecha actual al abrir formulario de nueva asignación
  useEffect(() => {
    if (showNuevaAsignacion) {
      setNuevaAsignacion((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
      }));
    }
  }, [showNuevaAsignacion]);
  //#endregion
  //#region Funciones de carga de datos (combos y catálogos)
  const loadCombos = async () => {
    try {
      setLoadingCombos(true);
      const [clavesData, resultadosData, probadoresData] = await Promise.all([
        quejaService.getClaves(),
        quejaService.getResultadosPrueba(),
        quejaService.getProbadores(),
      ]);
      setClaves(clavesData);
      setResultados(resultadosData);
      setProbadores(probadoresData);
    } catch (err) {
      console.error("Error cargando combos:", err);
      setError("Error al cargar datos adicionales");
    } finally {
      setLoadingCombos(false);
    }
  };
  //#endregion
  //#region Función principal: construcción del historial unificado
  const cargarHistorial = async () => {
    if (!queja) return;

    try {
      setCargandoHistorial(true);
      const eventos: HistorialEvento[] = [];

      // 1. Agregar clave inicial
      if (queja.tb_clave) {
        eventos.push({
          id: queja.id_queja,
          tipo: "clave_inicial",
          fecha: queja.fecha || new Date().toISOString(),
          titulo: "Clave Inicial",
          descripcion: `Se asignó la clave: ${queja.tb_clave.clave}`,
          realizadoPor: queja.reportado_por || undefined,
          detalles: {
            clave: queja.tb_clave.clave,
            id_clave: queja.tb_clave.id_clave,
          },
        });
      }

      // 2. Agregar pruebas realizadas
      pruebas.forEach((prueba) => {
        eventos.push({
          id: prueba.id_prueba,
          tipo: "prueba",
          fecha: prueba.fecha || new Date().toISOString(),
          titulo: "Prueba Realizada",
          descripcion: `Prueba con clave: ${prueba.tb_clave?.clave || "N/A"} - Resultado: ${prueba.tb_resultadoprueba?.resultado || "N/A"}`,
          realizadoPor: prueba.tb_trabajador?.clave_trabajador || undefined,
          detalles: {
            id_clave: prueba.id_clave,
            clave: prueba.tb_clave?.clave,
            id_resultado: prueba.id_resultado,
            resultado: prueba.tb_resultadoprueba?.resultado,
            id_trabajador: prueba.id_trabajador,
            trabajador: prueba.tb_trabajador?.clave_trabajador,
          },
        });
      });

      // 3. Agregar trabajos realizados
      trabajos.forEach((trabajo) => {
        eventos.push({
          id: trabajo.id_trabajo,
          tipo: "trabajo",
          fecha: trabajo.fecha || new Date().toISOString(),
          titulo: "Trabajo Realizado",
          descripcion: `Trabajo de: ${trabajo.tb_trabajador?.clave_trabajador || "N/A"} - Estado: ${trabajo.estado || "N/A"}`,
          realizadoPor: trabajo.tb_trabajador?.clave_trabajador || undefined,
          detalles: {
            id_trabajador: trabajo.tb_trabajador?.id_trabajador,
            trabajador: trabajo.tb_trabajador?.clave_trabajador,
            estado: trabajo.estado,
            observaciones: trabajo.observaciones,
          },
        });
      });

      // 4. Agregar asignaciones
      if (asignacion && asignacion.length > 0) {
        asignacion.forEach((asig) => {
          const trabajadoresNombres = asig.trabajadores
            .map(
              (t) => `${t.clave_trabajador || t.id_trabajador}${t.nombre ? ` (${t.nombre})` : ""}`,
            )
            .join(", ");

          eventos.push({
            id: asig.id_asignacion,
            tipo: "asignacion",
            fecha: asig.fechaAsignacion || new Date().toISOString(),
            titulo: "Asignación de Trabajadores",
            descripcion: `Se asignaron los trabajadores: ${trabajadoresNombres || "Ninguno"}`,
            realizadoPor: undefined,
            detalles: {
              id_asignacion: asig.id_asignacion,
              trabajadores: asig.trabajadores,
            },
          });
        });
      }

      // Ordenar por fecha (más antiguo primero)
      eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      setHistorial(eventos);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setCargandoHistorial(false);
    }
  };
  //#endregion

  //#region Funciones de creación (Prueba, Trabajo, Asignación)

  // Crear nueva prueba
  const handleCrearPrueba = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queja) return;

    try {
      setGuardando(true);
      setError("");

      await quejaService.createPrueba({
        fecha: nuevaPrueba.fecha || null,
        id_clave: nuevaPrueba.id_clave ? parseInt(nuevaPrueba.id_clave) : null,
        id_resultado: nuevaPrueba.id_resultado ? parseInt(nuevaPrueba.id_resultado) : null,
        id_trabajador: nuevaPrueba.id_trabajador ? parseInt(nuevaPrueba.id_trabajador) : null,
        id_queja: queja.id_queja,
      });

      // Limpiar formulario
      setNuevaPrueba({
        fecha: "",
        id_clave: "",
        id_resultado: "",
        id_trabajador: "",
      });
      setShowNuevaPrueba(false);

      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear la prueba");
      console.error("Error creando prueba:", err);
    } finally {
      setGuardando(false);
    }
  };

  // Crear nuevo trabajo
  const handleCrearTrabajo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queja) return;

    try {
      setGuardando(true);
      setError("");

      await quejaService.createTrabajo({
        fecha: nuevoTrabajo.fecha,
        probador: parseInt(nuevoTrabajo.probador),
        estado: nuevoTrabajo.estado ? parseInt(nuevoTrabajo.estado) : null,
        observaciones: nuevoTrabajo.observaciones || null,
        id_queja: queja.id_queja,
      });

      setNuevoTrabajo({
        fecha: "",
        probador: "",
        estado: "",
        observaciones: "",
      });
      setShowNuevoTrabajo(false);

      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear el trabajo");
      console.error("Error creando trabajo:", err);
    } finally {
      setGuardando(false);
    }
  };

  // Crear nueva asignación
  const handleCrearAsignacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queja) return;

    // Validar que al menos un trabajador esté seleccionado
    if (nuevaAsignacion.trabajadores.length === 0) {
      setError("Debe seleccionar al menos un trabajador");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const requestData: CreateAsignacionRequest = {
        id_queja: queja.id_queja,
        fechaAsignacion: nuevaAsignacion.fecha || new Date().toISOString(),
        trabajadores: nuevaAsignacion.trabajadores.map((id) => ({ id_trabajador: id })),
      };

      await quejaService.createAsignacion(requestData);

      // Limpiar formulario
      setNuevaAsignacion({
        fecha: "",
        trabajadores: [],
      });
      setShowNuevaAsignacion(false);

      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear la asignación");
      console.error("Error creando asignación:", err);
    } finally {
      setGuardando(false);
    }
  };
  //#endregion

  //#region Funciones de eliminación (Prueba, Trabajo, Asignación)

  const handleEliminarPrueba = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta prueba?")) return;

    try {
      setEliminandoPrueba(id);
      setError("");

      await quejaService.deletePrueba(id);
      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al eliminar la prueba");
      console.error("Error eliminando prueba:", err);
    } finally {
      setEliminandoPrueba(null);
    }
  };

  const handleEliminarTrabajo = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este trabajo?")) return;

    try {
      setEliminandoTrabajo(id);
      setError("");

      await quejaService.deleteTrabajo(id);
      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al eliminar el trabajo");
      console.error("Error eliminando trabajo:", err);
    } finally {
      setEliminandoTrabajo(null);
    }
  };

  const handleEliminarAsignacion = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta asignación?")) return;

    try {
      setEliminandoAsignacion(id);
      setError("");

      await quejaService.deleteAsignacion(id);
      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al eliminar la asignación");
      console.error("Error eliminando asignación:", err);
    } finally {
      setEliminandoAsignacion(null);
    }
  };
  //#endregion

  //#region Handlers de cambios en formularios

  const handlePruebaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaPrueba((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrabajoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNuevoTrabajo((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar selección/deselección de trabajadores en el formulario de asignación
  const handleTrabajadorToggle = (idTrabajador: number) => {
    setNuevaAsignacion((prev) => {
      const yaSeleccionado = prev.trabajadores.includes(idTrabajador);
      if (yaSeleccionado) {
        return {
          ...prev,
          trabajadores: prev.trabajadores.filter((id) => id !== idTrabajador),
        };
      } else {
        return {
          ...prev,
          trabajadores: [...prev.trabajadores, idTrabajador],
        };
      }
    });
  };
  //#endregion

  //#region Variables computadas (filtros)
  const probadoresFiltrados = probadores.filter((probador) => {
    if (!busquedaTrabajadores) return true;

    const busqueda = busquedaTrabajadores.toLowerCase().trim();
    const clave = (probador.clave_trabajador || "").toLowerCase();
    const nombre = (probador.nombre || "").toLowerCase();
    const apellidos = (probador.apellidos || "").toLowerCase();
    const id = probador.id_trabajador.toString();

    return (
      clave.includes(busqueda) ||
      nombre.includes(busqueda) ||
      apellidos.includes(busqueda) ||
      id.includes(busqueda)
    );
  });
  //#endregion

  //#region Funciones auxiliares de UI (íconos, colores, cierre)

  const getEventoIcono = (tipo: HistorialEvento["tipo"]) => {
    switch (tipo) {
      case "clave_inicial":
        return <i className="ri-key-line text-blue-500"></i>;
      case "prueba":
        return <i className="ri-flask-line text-purple-500"></i>;
      case "trabajo":
        return <i className="ri-tools-line text-green-500"></i>;
      case "asignacion":
        return <i className="ri-user-add-line text-orange-500"></i>;
      default:
        return <i className="ri-information-line text-gray-500"></i>;
    }
  };

  const getEventoColor = (tipo: HistorialEvento["tipo"]) => {
    switch (tipo) {
      case "clave_inicial":
        return "border-l-blue-500";
      case "prueba":
        return "border-l-purple-500";
      case "trabajo":
        return "border-l-green-500";
      case "asignacion":
        return "border-l-orange-500";
      default:
        return "border-l-gray-500";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };
  //#endregion

  //#region Renderizado condicional inicial
  if (!show) {
    return null;
  }
  //#endregion

  //#region Renderizado principal
  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleBackdropClick} />

      {/* Contenido del modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header fijo */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {loading
                  ? "Cargando detalles..."
                  : `Detalles de Queja #${queja?.num_reporte || "N/A"}`}
              </h3>
              <button
                onClick={handleCloseClick}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <i className="ri-loader-4-line animate-spin text-2xl text-blue-600 mb-2"></i>
                <p className="text-gray-600">Cargando detalles de la queja...</p>
              </div>
            ) : !queja ? (
              <div className="text-center py-8">
                <i className="ri-error-warning-line text-red-500 text-2xl mb-2"></i>
                <p className="text-gray-600">No se pudieron cargar los detalles de la queja</p>
              </div>
            ) : (
              <>
                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="ri-error-warning-line text-red-500 mr-2"></i>
                      <span className="text-red-700 text-sm">{error}</span>
                      <button
                        onClick={() => setError("")}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Información principal de la queja (omitida por brevedad, es igual a tu código original) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Número de Reporte</h4>
                      <p className="text-sm text-gray-900 font-medium">{queja.num_reporte}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Fecha Reporte</h4>
                      <p className="text-sm text-gray-900">
                        {new Date(queja.fecha).toLocaleDateString()}{" "}
                        {new Date(queja.fecha).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Servicio</h4>
                      <p className="text-sm text-gray-900">
                        {queja.tb_telefono ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Teléfono:
                            <i className="ri-phone-line mr-1"></i>
                            {queja.tb_telefono.telefono}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Línea: {queja.tb_linea?.clavelinea}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tipo de Queja</h4>
                      <p className="text-sm text-gray-900">
                        {queja.tb_tipoqueja ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {queja.tb_tipoqueja.tipoqueja}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Clave inicial</h4>
                      <p className="text-sm text-gray-900">
                        {queja.tb_clave ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {queja.tb_clave.clave}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Estado</h4>

                      {queja.estado === "Asignada" ? (
                        <div className="flex items-center mb-2">
                          <div className="bg-yellow-100 rounded-full p-1 mr-2">
                            <i className="ri-alarm-warning-line text-yellow-600 text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-yellow-700">Asignada</span>
                        </div>
                      ) : queja.estado === "Cerrada" ? (
                        <div className="flex items-center mb-2">
                          <div className="bg-green-100 rounded-full p-1 mr-2">
                            <i className="ri-checkbox-circle-line text-green-600 text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-green-700">Cerrada</span>
                        </div>
                      ) : queja.estado === "Abierta" ? (
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 rounded-full p-1 mr-2">
                            <i className="ri-user-line text-blue-600 text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-blue-700">Abierta</span>
                        </div>
                      ) : queja.estado === "Probada" ? (
                        <div className="flex items-center mb-2">
                          <div className="bg-gray-100 rounded-full p-1 mr-2">
                            <i className="ri-close-circle-line text-gray-600 text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Probada</span>
                        </div>
                      ) : queja.estado === "Pendiente" ? (
                        <div className="flex items-center mb-2">
                          <div className="bg-red-100 rounded-full p-1 mr-2">
                            <i className="ri-time-line text-red-600 text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-red-700">Pendiente</span>
                        </div>
                      ) : (
                        <div className="flex items-center mb-2">
                          <div className="bg-gray-100 rounded-full p-1 mr-2">
                            <i className="ri-question-line text-gray-600 text-xs"></i>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Sin estado</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Reportado por</h4>
                      <p className="text-sm text-gray-900">{queja.reportado_por || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Prioridad</h4>
                      <p className="text-sm text-gray-900">{queja.prioridad || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Probador</h4>
                      <p className="text-sm text-gray-900">
                        {queja.tb_trabajador?.clave_trabajador || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fechas importantes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* ... fechas ... */}
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <button
                    onClick={() => setShowNuevaPrueba(!showNuevaPrueba)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <i className={showNuevaPrueba ? "ri-close-line" : "ri-add-line"}></i>
                    <span>{showNuevaPrueba ? "Cancelar Prueba" : "Nueva Prueba"}</span>
                  </button>

                  <button
                    onClick={() => setShowNuevaAsignacion(!showNuevaAsignacion)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <i className={showNuevaAsignacion ? "ri-close-line" : "ri-user-add-line"}></i>
                    <span>
                      {showNuevaAsignacion ? "Cancelar Asignación" : "Asignar Operario(s)"}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowNuevoTrabajo(!showNuevoTrabajo)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <i className={showNuevoTrabajo ? "ri-close-line" : "ri-add-line"}></i>
                    <span>{showNuevoTrabajo ? "Cancelar Trabajo" : "Nuevo Trabajo"}</span>
                  </button>
                </div>

                {/* FORMULARIO: Nueva Prueba */}
                {showNuevaPrueba && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-blue-800 mb-3">
                      <i className="ri-add-circle-line mr-1"></i>
                      Nueva Prueba
                    </h5>
                    <form onSubmit={handleCrearPrueba} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha
                          </label>
                          <input
                            type="datetime-local"
                            name="fecha"
                            value={nuevaPrueba.fecha}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Probador
                          </label>
                          <select
                            name="id_trabajador"
                            value={nuevaPrueba.id_trabajador}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Seleccionar probador</option>
                            {probadores.map((probador) => (
                              <option key={probador.id_trabajador} value={probador.id_trabajador}>
                                {probador.clave_trabajador || `ID: ${probador.id_trabajador}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Clave
                          </label>
                          <select
                            name="id_clave"
                            value={nuevaPrueba.id_clave}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Seleccionar clave</option>
                            {claves.map((clave) => (
                              <option key={clave.id_clave} value={clave.id_clave}>
                                {clave.clave}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resultado
                          </label>
                          <select
                            name="id_resultado"
                            value={nuevaPrueba.id_resultado}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Seleccionar resultado</option>
                            {resultados.map((resultado) => (
                              <option
                                key={resultado.id_resultadoprueba}
                                value={resultado.id_resultadoprueba}
                              >
                                {resultado.resultado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={guardando}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center space-x-2 disabled:opacity-50"
                        >
                          {guardando && <i className="ri-loader-4-line animate-spin"></i>}
                          <span>Guardar Prueba</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORMULARIO: Nueva Asignación */}
                {showNuevaAsignacion && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-purple-800 mb-3">
                      <i className="ri-user-add-line mr-1"></i>
                      Asignar Operario(s)
                    </h5>
                    <form onSubmit={handleCrearAsignacion} className="space-y-4">
                      {/* Campo de fecha */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Asignación
                        </label>
                        <input
                          type="datetime-local"
                          name="fecha"
                          value={nuevaAsignacion.fecha}
                          onChange={(e) =>
                            setNuevaAsignacion((prev) => ({ ...prev, fecha: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      {/* 🔍 BUSCADOR DE TRABAJADORES */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Buscar Trabajador
                        </label>
                        <div className="relative">
                          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                          <input
                            type="text"
                            placeholder="Buscar por clave, nombre o ID..."
                            value={busquedaTrabajadores}
                            onChange={(e) => setBusquedaTrabajadores(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                          />
                          {busquedaTrabajadores && (
                            <button
                              type="button"
                              onClick={() => setBusquedaTrabajadores("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <i className="ri-close-circle-line"></i>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="ri-information-line mr-1"></i>
                          Escribe para filtrar trabajadores por clave, nombre o ID
                        </p>
                      </div>

                      {/* Lista de trabajadores filtrada */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Trabajadores
                          {busquedaTrabajadores && (
                            <span className="ml-2 text-xs text-purple-600">
                              ({probadoresFiltrados.length} resultados)
                            </span>
                          )}
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
                          {probadoresFiltrados.length === 0 ? (
                            <div className="col-span-full text-center py-4 text-gray-500 text-sm">
                              <i className="ri-user-search-line text-2xl mb-1 block"></i>
                              No se encontraron trabajadores
                              {busquedaTrabajadores && (
                                <button
                                  type="button"
                                  onClick={() => setBusquedaTrabajadores("")}
                                  className="ml-2 text-purple-600 hover:underline"
                                >
                                  Limpiar búsqueda
                                </button>
                              )}
                            </div>
                          ) : (
                            probadoresFiltrados.map((probador) => (
                              <label
                                key={probador.id_trabajador}
                                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                                  nuevaAsignacion.trabajadores.includes(probador.id_trabajador)
                                    ? "bg-purple-100 border border-purple-300"
                                    : "hover:bg-gray-50 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={nuevaAsignacion.trabajadores.includes(
                                    probador.id_trabajador,
                                  )}
                                  onChange={() => handleTrabajadorToggle(probador.id_trabajador)}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-800">
                                    {probador.clave_trabajador || `ID: ${probador.id_trabajador}`}
                                  </span>
                                  {probador.nombre && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      ({probador.nombre} {probador.apellidos || ""})
                                    </span>
                                  )}
                                </div>
                              </label>
                            ))
                          )}
                        </div>

                        {/* Contador de seleccionados */}
                        {nuevaAsignacion.trabajadores.length > 0 && (
                          <div className="mt-2 text-xs text-purple-600 flex items-center justify-between">
                            <span>
                              <i className="ri-checkbox-circle-line mr-1"></i>
                              {nuevaAsignacion.trabajadores.length} trabajador(es) seleccionado(s)
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setNuevaAsignacion((prev) => ({ ...prev, trabajadores: [] }))
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Limpiar todos
                            </button>
                          </div>
                        )}

                        {nuevaAsignacion.trabajadores.length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            <i className="ri-error-warning-line mr-1"></i>
                            Seleccione al menos un trabajador
                          </p>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNuevaAsignacion(false);
                            setBusquedaTrabajadores(""); // Limpiar búsqueda al cerrar
                            setNuevaAsignacion({ fecha: "", trabajadores: [] }); // Resetear formulario
                          }}
                          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardando || nuevaAsignacion.trabajadores.length === 0}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
                        >
                          {guardando && <i className="ri-loader-4-line animate-spin"></i>}
                          <i className="ri-user-add-line"></i>
                          <span>
                            Asignar{" "}
                            {nuevaAsignacion.trabajadores.length > 0 &&
                              `(${nuevaAsignacion.trabajadores.length})`}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORMULARIO: Nuevo Trabajo */}
                {showNuevoTrabajo && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-green-800 mb-3">
                      <i className="ri-add-circle-line mr-1"></i>
                      Nuevo Trabajo
                    </h5>
                    <form onSubmit={handleCrearTrabajo} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha *
                          </label>
                          <input
                            type="datetime-local"
                            name="fecha"
                            value={nuevoTrabajo.fecha}
                            onChange={handleTrabajoChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Probador *
                          </label>
                          <select
                            name="probador"
                            value={nuevoTrabajo.probador}
                            onChange={handleTrabajoChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Seleccionar probador</option>
                            {probadores.map((probador) => (
                              <option key={probador.id_trabajador} value={probador.id_trabajador}>
                                {probador.clave_trabajador || `ID: ${probador.id_trabajador}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                          </label>
                          <select
                            name="estado"
                            value={nuevoTrabajo.estado}
                            onChange={handleTrabajoChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="">Seleccionar estado</option>
                            {claves.map((clave) => (
                              <option key={clave.id_clave} value={clave.id_clave}>
                                {clave.clave}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          name="observaciones"
                          value={nuevoTrabajo.observaciones}
                          onChange={handleTrabajoChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Descripción del trabajo realizado..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={guardando}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center space-x-2 disabled:opacity-50"
                        >
                          {guardando && <i className="ri-loader-4-line animate-spin"></i>}
                          <span>Guardar Trabajo</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* HISTORIAL DE FLUJO */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-history-line mr-2 text-blue-500"></i>
                    Historial de Flujo
                  </h4>

                  {cargandoHistorial ? (
                    <div className="text-center py-8">
                      <i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i>
                      <p className="text-gray-500 mt-2">Cargando historial...</p>
                    </div>
                  ) : historial.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <i className="ri-inbox-line text-4xl text-gray-400"></i>
                      <p className="text-gray-500 mt-2">No hay eventos en el historial</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        {historial.map((evento, index) => (
                          <div
                            key={`${evento.tipo}-${evento.id}-${index}`}
                            className="relative pl-12"
                          >
                            <div
                              className={`absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 ${getEventoColor(evento.tipo)} flex items-center justify-center`}
                            >
                              <div className="w-2 h-2 rounded-full bg-current"></div>
                            </div>
                            <div
                              className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 ${getEventoColor(evento.tipo)}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getEventoIcono(evento.tipo)}
                                  <h5 className="font-semibold text-gray-900">{evento.titulo}</h5>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(evento.fecha).toLocaleString()}
                                  </span>
                                  {(evento.tipo === "prueba" ||
                                    evento.tipo === "trabajo" ||
                                    evento.tipo === "asignacion") && (
                                    <button
                                      onClick={() => {
                                        if (evento.tipo === "prueba")
                                          handleEliminarPrueba(evento.id);
                                        else if (evento.tipo === "trabajo")
                                          handleEliminarTrabajo(evento.id);
                                        else if (evento.tipo === "asignacion")
                                          handleEliminarAsignacion(evento.id);
                                      }}
                                      disabled={
                                        (evento.tipo === "prueba" &&
                                          eliminandoPrueba === evento.id) ||
                                        (evento.tipo === "trabajo" &&
                                          eliminandoTrabajo === evento.id) ||
                                        (evento.tipo === "asignacion" &&
                                          eliminandoAsignacion === evento.id)
                                      }
                                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                      {(evento.tipo === "prueba" &&
                                        eliminandoPrueba === evento.id) ||
                                      (evento.tipo === "trabajo" &&
                                        eliminandoTrabajo === evento.id) ||
                                      (evento.tipo === "asignacion" &&
                                        eliminandoAsignacion === evento.id) ? (
                                        <i className="ri-loader-4-line animate-spin"></i>
                                      ) : (
                                        <i className="ri-delete-bin-line"></i>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{evento.descripcion}</p>
                              {evento.realizadoPor && (
                                <div className="text-xs text-gray-500 flex items-center mt-2">
                                  <i className="ri-user-line mr-1"></i>
                                  Realizado por: {evento.realizadoPor}
                                </div>
                              )}
                              {evento.tipo === "trabajo" && evento.detalles.observaciones && (
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                                  <strong>Observaciones:</strong> {evento.detalles.observaciones}
                                </div>
                              )}
                              {evento.tipo === "prueba" && (
                                <div className="mt-2 flex gap-2 text-xs">
                                  {evento.detalles.clave && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                      Clave: {evento.detalles.clave}
                                    </span>
                                  )}
                                  {evento.detalles.resultado && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                      Resultado: {evento.detalles.resultado}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  //#endregion
}
