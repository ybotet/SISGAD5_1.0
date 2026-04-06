import type {
  QuejaItem,
  PruebaItem,
  TrabajoItem,
  AsignacionItem,
  Clave,
  Trabajador,
  ResultadoPrueba,
  HistorialEvento,
  CreateTrabajoRequest,
} from "../../services/quejaService";
import { quejaService } from "../../services/quejaService";
import { useState, useEffect } from "react";
import { formatDateTimeLocal } from "../../utils/dateFormats";

//#region Interfaces de props
interface QuejaDetallesModalProps {
  show: boolean;
  queja: QuejaItem | null;
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
  const [showCerrarQueja, setShowCerrarQueja] = useState(false);
  //#endregion

  //#region Estados para eliminación
  const [_eliminandoPrueba, _setEliminandoPrueba] = useState<number | null>(null);
  const [_eliminandoTrabajo, _setEliminandoTrabajo] = useState<number | null>(null);
  const [_eliminandoAsignacion, _setEliminandoAsignacion] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  //#endregion

  //#region Estado para el historial unificado
  const [historial, setHistorial] = useState<HistorialEvento[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  //#endregion

  //#region Estados para combos
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

  //#region Estado para cerrar queja
  const [cerrarQueja, setCerrarQueja] = useState({
    fecha: "",
    id_clavecierre: "",
  });
  //#endregion

  //#region Estados para formulario de nuevo trabajo
  const [nuevoTrabajo, setNuevoTrabajo] = useState({
    fecha: "",
    probador: "",
    estado: "",
    observaciones: "",
    trabajadores: [] as number[],
  });
  //#endregion

  //#region Estados para formulario de nueva asignación
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    fecha: "",
    trabajadores: [] as number[],
  });
  //#endregion

  //#region Efectos
  useEffect(() => {
    if (show && queja) {
      loadCombos();
      cargarHistorial();
    }
  }, [show, queja]);

  useEffect(() => {
    if (show && queja) {
      cargarHistorial();
    }
  }, [pruebas, trabajos, asignacion, show, queja]);

  useEffect(() => {
    if (showNuevaPrueba) {
      setNuevaPrueba((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
      }));
    }
  }, [showNuevaPrueba]);

  useEffect(() => {
    if (showNuevoTrabajo) {
      setNuevoTrabajo((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
        trabajadores: [],
      }));
    }
  }, [showNuevoTrabajo]);

  useEffect(() => {
    if (showNuevaAsignacion) {
      setNuevaAsignacion((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
      }));
    }
  }, [showNuevaAsignacion]);

  useEffect(() => {
    if (showCerrarQueja) {
      setCerrarQueja((prev) => ({
        ...prev,
        fecha: formatDateTimeLocal(),
      }));
    }
  }, [showCerrarQueja]);
  //#endregion

  //#region Funciones de carga
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
  // const clavesCierre = claves.filter((clave) => clave.es_pendiente === false);
  //#endregion

  //#region Función para cargar historial
  const cargarHistorial = async () => {
    if (!queja) return;

    try {
      setCargandoHistorial(true);
      const eventos: HistorialEvento[] = [];

      // 1. Clave inicial
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

      // 2. Pruebas
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

      // 3. Trabajos
      trabajos.forEach((trabajo) => {
        const trabajadoresNombres = trabajo.trabajadores
          .map((t) => `${t.clave_trabajador || t.id_trabajador}`)
          .join(", ");

        eventos.push({
          id: trabajo.id_trabajo,
          tipo: "trabajo",
          fecha: trabajo.fecha || new Date().toISOString(),
          titulo: "Trabajo Realizado",
          descripcion: `Trabajo realizado por: ${trabajadoresNombres} - Estado: ${trabajo.estado || "N/A"} - Probador: ${trabajo.tb_trabajador?.clave_trabajador || "N/A"}`,
          realizadoPor: trabajadoresNombres || undefined,
          detalles: {
            id_trabajador: trabajo.tb_trabajador?.id_trabajador,
            trabajador: trabajo.tb_trabajador?.clave_trabajador,
            estado: trabajo.tb_clave?.clave,
            observaciones: trabajo.observaciones,
            trabajadores: trabajo.trabajadores,
          },
        });
      });

      // 4. Asignaciones
      if (asignacion && asignacion.length > 0) {
        asignacion.forEach((asig) => {
          const trabajadoresNombres = asig.trabajadores
            .map((t) => `${t.clave_trabajador || t.id_trabajador}`)
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

      // 5. Evento de cierre (si la queja está cerrada y tiene clave de cierre)
      if (queja.estado === "Cerrada" && queja.id_clavecierre && claves.length > 0) {
        const claveCierre = claves.find((c) => c.id_clave === queja.id_clavecierre);
        eventos.push({
          id: queja.id_queja,
          tipo: "cierre",
          fecha: queja.fechaok || queja.updatedAt,
          titulo: "Queja Cerrada",
          descripcion: `Queja cerrada con clave: ${claveCierre?.clave || queja.id_clavecierre}`,
          realizadoPor: undefined,
          detalles: {
            id_clavecierre: queja.id_clavecierre,
            clave: claveCierre?.clave,
            fechaok: queja.fechaok,
          },
        });
      }

      eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      setHistorial(eventos);
    } catch (err) {
      console.error("Error cargando historial:", err);
    } finally {
      setCargandoHistorial(false);
    }
  };
  //#endregion

  //#region Handlers de creación
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

  const handleCrearTrabajo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queja) return;

    if (!nuevoTrabajo.probador) {
      setError("Debe seleccionar un probador");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const requestData: CreateTrabajoRequest = {
        fecha: nuevoTrabajo.fecha || new Date().toISOString(),
        probador: parseInt(nuevoTrabajo.probador),
        estado: nuevoTrabajo.estado ? parseInt(nuevoTrabajo.estado) : null,
        observaciones: nuevoTrabajo.observaciones || null,
        id_queja: queja.id_queja,
        trabajadores: nuevoTrabajo.trabajadores.map((id) => ({ id_trabajador: id })),
      };

      console.log("📝 Creando trabajo:", requestData);
      await quejaService.createTrabajo(requestData);

      setNuevoTrabajo({
        fecha: "",
        probador: "",
        estado: "",
        observaciones: "",
        trabajadores: [],
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

  const handleCrearAsignacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queja) return;

    if (nuevaAsignacion.trabajadores.length === 0) {
      setError("Debe seleccionar al menos un trabajador");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await quejaService.createAsignacion({
        id_queja: queja.id_queja,
        fechaAsignacion: nuevaAsignacion.fecha || new Date().toISOString(),
        trabajadores: nuevaAsignacion.trabajadores.map((id) => ({ id_trabajador: id })),
      });

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

  const handleCerrarQueja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queja) return;

    if (!cerrarQueja.id_clavecierre) {
      setError("Debe seleccionar una clave de cierre");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await quejaService.cerrarQueja(queja.id_queja, {
        id_clavecierre: parseInt(cerrarQueja.id_clavecierre),
        fechaok: cerrarQueja.fecha || new Date().toISOString(),
      });

      setCerrarQueja({
        fecha: "",
        id_clavecierre: "",
      });
      setShowCerrarQueja(false);

      await cargarHistorial();
      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al cerrar la queja");
      console.error("Error cerrando queja:", err);
    } finally {
      setGuardando(false);
    }
  };
  //#endregion

  //#region Handlers de eliminación
  // const handleEliminarPrueba = async (id: number) => {
  //   if (!confirm("¿Está seguro de eliminar esta prueba?")) return;

  //   try {
  //     setEliminandoPrueba(id);
  //     setError("");
  //     await quejaService.deletePrueba(id);
  //     await cargarHistorial();
  //     if (onDataUpdated) onDataUpdated();
  //   } catch (err: any) {
  //     setError(err?.response?.data?.error || "Error al eliminar la prueba");
  //   } finally {
  //     setEliminandoPrueba(null);
  //   }
  // };

  // const handleEliminarTrabajo = async (id: number) => {
  //   if (!confirm("¿Está seguro de eliminar este trabajo?")) return;

  //   try {
  //     setEliminandoTrabajo(id);
  //     setError("");
  //     await quejaService.deleteTrabajo(id);
  //     await cargarHistorial();
  //     if (onDataUpdated) onDataUpdated();
  //   } catch (err: any) {
  //     setError(err?.response?.data?.error || "Error al eliminar el trabajo");
  //   } finally {
  //     setEliminandoTrabajo(null);
  //   }
  // };

  // const handleEliminarAsignacion = async (id: number) => {
  //   if (!confirm("¿Está seguro de eliminar esta asignación?")) return;

  //   try {
  //     setEliminandoAsignacion(id);
  //     setError("");
  //     await quejaService.deleteAsignacion(id);
  //     await cargarHistorial();
  //     if (onDataUpdated) onDataUpdated();
  //   } catch (err: any) {
  //     setError(err?.response?.data?.error || "Error al eliminar la asignación");
  //   } finally {
  //     setEliminandoAsignacion(null);
  //   }
  // };
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

  const handleTrabajadorTrabajoToggle = (idTrabajador: number) => {
    setNuevoTrabajo((prev) => {
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

  const handleTrabajadorAsignacionToggle = (idTrabajador: number) => {
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

  //#region Funciones auxiliares UI
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
      case "cierre":
        return <i className="ri-lock-line text-red-500"></i>;
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
      case "cierre":
        return "border-l-red-500";
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleBackdropClick} />
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {loading
                  ? "Cargando detalles..."
                  : `Detalles de Queja #${queja?.num_reporte || "N/A"}`}
              </h3>
              <button onClick={handleCloseClick} className="text-gray-400 hover:text-gray-600">
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
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 text-sm">{error}</span>
                      <button onClick={() => setError("")} className="text-red-500">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                )}

                {/* Información principal de la queja */}
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
                            Teléfono: {queja.tb_telefono.telefono}
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

                {/* BOTONES DE ACCIÓN */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <button
                    onClick={() => setShowNuevaPrueba(!showNuevaPrueba)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <i className={showNuevaPrueba ? "ri-close-line" : "ri-add-line"}></i>
                    <span>{showNuevaPrueba ? "Cancelar Prueba" : "Insertar Datos Prueba"}</span>
                  </button>

                  <button
                    onClick={() => setShowNuevaAsignacion(!showNuevaAsignacion)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <i className={showNuevaAsignacion ? "ri-close-line" : "ri-user-add-line"}></i>
                    <span>
                      {showNuevaAsignacion ? "Cancelar Asignación" : "Asignar Operario(s)"}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowNuevoTrabajo(!showNuevoTrabajo)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <i className={showNuevoTrabajo ? "ri-close-line" : "ri-add-line"}></i>
                    <span>{showNuevoTrabajo ? "Cancelar Trabajo" : "Insertar Datos Trabajo"}</span>
                  </button>

                  {queja?.estado !== "Cerrada" && (
                    <button
                      onClick={() => setShowCerrarQueja(!showCerrarQueja)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <i className={showCerrarQueja ? "ri-close-line" : "ri-lock-line"}></i>
                      <span>{showCerrarQueja ? "Cancelar Cierre" : "Cerrar Queja"}</span>
                    </button>
                  )}
                </div>

                {/* FORMULARIO: Insertar Datos Prueba */}
                {showNuevaPrueba && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-3">Insertar Datos Prueba</h5>
                    <form onSubmit={handleCrearPrueba} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Fecha</label>
                          <input
                            type="datetime-local"
                            name="fecha"
                            value={nuevaPrueba.fecha}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Probador</label>
                          <select
                            name="id_trabajador"
                            value={nuevaPrueba.id_trabajador}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar</option>
                            {probadores.map((p) => (
                              <option key={p.id_trabajador} value={p.id_trabajador}>
                                {p.clave_trabajador}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Clave</label>
                          <select
                            name="id_clave"
                            value={nuevaPrueba.id_clave}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar</option>
                            {claves.map((c) => (
                              <option key={c.id_clave} value={c.id_clave}>
                                {c.clave}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Resultado</label>
                          <select
                            name="id_resultado"
                            value={nuevaPrueba.id_resultado}
                            onChange={handlePruebaChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar</option>
                            {resultados.map((r) => (
                              <option key={r.id_resultadoprueba} value={r.id_resultadoprueba}>
                                {r.resultado}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={guardando}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          {guardando ? "Guardando..." : "Guardar Prueba"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORMULARIO: Nueva Asignación */}
                {showNuevaAsignacion && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-semibold text-purple-800 mb-3">Asignar Operario(s)</h5>
                    <form onSubmit={handleCrearAsignacion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Fecha de Asignación
                        </label>
                        <input
                          type="datetime-local"
                          value={nuevaAsignacion.fecha}
                          onChange={(e) =>
                            setNuevaAsignacion((prev) => ({ ...prev, fecha: e.target.value }))
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Seleccionar Trabajadores
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
                          {probadores.map((probador) => (
                            <label
                              key={probador.id_trabajador}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={nuevaAsignacion.trabajadores.includes(
                                  probador.id_trabajador,
                                )}
                                onChange={() =>
                                  handleTrabajadorAsignacionToggle(probador.id_trabajador)
                                }
                                className="rounded border-gray-300 text-purple-600"
                              />
                              <span className="text-sm">
                                {probador.clave_trabajador}
                                {probador.nombre && (
                                  <span className="text-gray-500 ml-1">({probador.nombre})</span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNuevaAsignacion(false)}
                          className="px-4 py-2 bg-gray-300 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardando || nuevaAsignacion.trabajadores.length === 0}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {guardando ? "Guardando..." : "Asignar"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORMULARIO: Insertar Datos Trabajo */}
                {showNuevoTrabajo && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-3">Insertar Datos Trabajo</h5>
                    <form onSubmit={handleCrearTrabajo} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Fecha *</label>
                          <input
                            type="datetime-local"
                            name="fecha"
                            value={nuevoTrabajo.fecha}
                            onChange={handleTrabajoChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Probador *</label>
                          <select
                            name="probador"
                            value={nuevoTrabajo.probador}
                            onChange={handleTrabajoChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar probador</option>
                            {probadores.map((p) => (
                              <option key={p.id_trabajador} value={p.id_trabajador}>
                                {p.clave_trabajador} {p.nombre ? `- ${p.nombre}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Estado (Clave)</label>
                          <select
                            name="estado"
                            value={nuevoTrabajo.estado}
                            onChange={handleTrabajoChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar estado</option>
                            {claves.map((c) => (
                              <option key={c.id_clave} value={c.id_clave}>
                                {c.clave}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Operarios que realizan el trabajo
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
                          {probadores.map((probador) => (
                            <label
                              key={probador.id_trabajador}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={nuevoTrabajo.trabajadores.includes(probador.id_trabajador)}
                                onChange={() =>
                                  handleTrabajadorTrabajoToggle(probador.id_trabajador)
                                }
                                className="rounded border-gray-300 text-green-600"
                              />
                              <span className="text-sm">
                                {probador.clave_trabajador}
                                {probador.nombre && (
                                  <span className="text-gray-500 ml-1">({probador.nombre})</span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                        {nuevoTrabajo.trabajadores.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Seleccione los operarios que realizan el trabajo
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Observaciones</label>
                        <textarea
                          name="observaciones"
                          value={nuevoTrabajo.observaciones}
                          onChange={handleTrabajoChange}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Descripción del trabajo realizado..."
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNuevoTrabajo(false)}
                          className="px-4 py-2 bg-gray-300 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardando || !nuevoTrabajo.probador}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {guardando ? "Guardando..." : "Guardar Trabajo"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORMULARIO: Cerrar Queja */}
                {showCerrarQueja && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <i className="ri-lock-line"></i>
                      Cerrar Queja
                    </h5>
                    <form onSubmit={handleCerrarQueja} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Fecha de Cierre *
                          </label>
                          <input
                            type="datetime-local"
                            value={cerrarQueja.fecha}
                            onChange={(e) =>
                              setCerrarQueja((prev) => ({ ...prev, fecha: e.target.value }))
                            }
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Clave de Cierre *
                          </label>
                          <select
                            value={cerrarQueja.id_clavecierre}
                            onChange={(e) =>
                              setCerrarQueja((prev) => ({
                                ...prev,
                                id_clavecierre: e.target.value,
                              }))
                            }
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Seleccionar clave de cierre</option>
                            {claves
                              .filter((clave) => clave.es_pendiente === false)
                              .map((clave) => (
                                <option key={clave.id_clave} value={clave.id_clave}>
                                  {clave.clave} {clave.descripcion ? `- ${clave.descripcion}` : ""}
                                </option>
                              ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Solo se muestran claves que no son pendientes
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                          <i className="ri-alert-line"></i>
                          <strong>Advertencia:</strong> Al cerrar esta queja, no podrá realizar más
                          cambios.
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCerrarQueja(false)}
                          className="px-4 py-2 bg-gray-300 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardando}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                          {guardando ? (
                            <>
                              <i className="ri-loader-4-line animate-spin"></i>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <i className="ri-check-line"></i>
                              Confirmar Cierre
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* HISTORIAL */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <i className="ri-history-line text-blue-500"></i>
                    Historial de Flujo
                  </h4>
                  {cargandoHistorial ? (
                    <div className="text-center py-8">Cargando historial...</div>
                  ) : historial.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No hay eventos</div>
                  ) : (
                    <div className="relative pl-6">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        {historial.map((evento, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div
                              className={`absolute left-0 w-4 h-4 rounded-full border-2 bg-white ${getEventoColor(evento.tipo)}`}
                            ></div>
                            <div
                              className={`bg-white border rounded-lg p-4 border-l-4 ${getEventoColor(evento.tipo)}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  {getEventoIcono(evento.tipo)}
                                  <h5 className="font-semibold">{evento.titulo}</h5>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(evento.fecha).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{evento.descripcion}</p>
                              {evento.realizadoPor && (
                                <div className="text-xs text-gray-400 mt-2">
                                  Realizado por: {evento.realizadoPor}
                                </div>
                              )}
                              {evento.tipo === "trabajo" && evento.detalles.observaciones && (
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  <strong>Observaciones:</strong> {evento.detalles.observaciones}
                                  <div className="mt-1 flex gap-2">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                      Clave: {evento.detalles.estado}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {evento.tipo === "prueba" && evento.detalles.clave && (
                                <div className="mt-2 flex gap-2 text-xs">
                                  <span className="px-2 py-1 bg-purple-100 rounded">
                                    Clave: {evento.detalles.clave}
                                  </span>
                                  {evento.detalles.resultado && (
                                    <span className="px-2 py-1 bg-blue-100 rounded">
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
}
