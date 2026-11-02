interface AsignacionStatsProps {
  total: number;
  showing: number;
}

export default function AsignacionStats({ total, showing }: AsignacionStatsProps) {
  return (
    <div className="ml-1 mb-4 text-sm text-gray-600">
      <p>
        Mostrando <span className="font-semibold text-gray-900">{showing}</span> de{" "}
        <span className="font-semibold text-gray-900">{total}</span> asignaciones
      </p>
    </div>
  );
}
