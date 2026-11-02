import { useState, useEffect } from "react";

type Periodo = "hoy" | "semana" | "mes" | "trimestre" | "ano" | "todo" | "personalizado";

interface DateRangePickerProps {
  onDateRangeChange: (desde: string, hasta: string, periodo: Periodo) => void;
  initialDesde?: string;
  initialHasta?: string;
}

export default function DateRangePicker({
  onDateRangeChange,
  initialDesde,
  initialHasta,
}: DateRangePickerProps) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [desde, setDesde] = useState(initialDesde || "");
  const [hasta, setHasta] = useState(initialHasta || "");
  const [showCustom, setShowCustom] = useState(false);

  const calcularFechas = (periodoSeleccionado: Periodo): { desde: string; hasta: string } => {
    const hoy = new Date();
    let desdeDate = new Date();
    let hastaDate = new Date();

    switch (periodoSeleccionado) {
      case "hoy":
        desdeDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        hastaDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case "semana":
        desdeDate = new Date(hoy);
        desdeDate.setDate(hoy.getDate() - 7);
        hastaDate = hoy;
        break;
      case "mes":
        desdeDate = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        hastaDate = hoy;
        break;
      case "trimestre":
        const trimestre = Math.floor(hoy.getMonth() / 3);
        desdeDate = new Date(hoy.getFullYear(), trimestre * 3, 1);
        hastaDate = hoy;
        break;
      case "ano":
        desdeDate = new Date(hoy.getFullYear(), 0, 1);
        hastaDate = hoy;
        break;
      case "todo":
        return { desde: "", hasta: "" };
      default:
        return { desde, hasta };
    }

    return {
      desde: desdeDate.toISOString().split("T")[0],
      hasta: hastaDate.toISOString().split("T")[0],
    };
  };

  const handlePeriodoChange = (nuevoPeriodo: Periodo) => {
    setPeriodo(nuevoPeriodo);
    setShowCustom(nuevoPeriodo === "personalizado");

    if (nuevoPeriodo !== "personalizado") {
      const fechas = calcularFechas(nuevoPeriodo);
      setDesde(fechas.desde);
      setHasta(fechas.hasta);
      onDateRangeChange(fechas.desde, fechas.hasta, nuevoPeriodo);
    }
  };

  const handleCustomApply = () => {
    if (desde && hasta) {
      setPeriodo("personalizado");
      onDateRangeChange(desde, hasta, "personalizado");
    }
  };

  useEffect(() => {
    const fechasIniciales = calcularFechas("mes");
    setDesde(fechasIniciales.desde);
    setHasta(fechasIniciales.hasta);
    onDateRangeChange(fechasIniciales.desde, fechasIniciales.hasta, "mes");
  }, []);

  const periodos: { value: Periodo; label: string }[] = [
    { value: "hoy", label: "Hoy" },
    { value: "semana", label: "Últ. 7 días" },
    { value: "mes", label: "Este mes" },
    { value: "trimestre", label: "Este trimestre" },
    { value: "ano", label: "Este año" },
    { value: "todo", label: "Todo el historial" },
    { value: "personalizado", label: "Personalizado" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <div className="flex flex-wrap gap-1">
        {periodos.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodoChange(p.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              periodo === p.value ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={handleCustomApply}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Aplicar
          </button>
        </div>
      )}

      {periodo !== "todo" && desde && hasta && periodo !== "personalizado" && (
        <div className="ml-2 text-xs text-gray-400">
          📅 {desde} → {hasta}
        </div>
      )}
      {periodo === "todo" && <div className="ml-2 text-xs text-gray-400">📅 Todo el historial</div>}
    </div>
  );
}
