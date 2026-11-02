interface StockStatsProps {
  showing: number;
  total: number;
  stockTotal: number;
  negativos: number;
}

export default function StockStats({ showing, total, stockTotal, negativos }: StockStatsProps) {
  return (
    <div className="ml-1 mb-4 text-sm text-gray-600 space-y-1">
      <p>
        Mostrando <span className="font-semibold text-gray-900">{showing}</span> de{" "}
        <span className="font-semibold text-gray-900">{total}</span> trabajadores
      </p>
      <p>
        Stock total:{" "}
        <span className="font-semibold text-gray-900">{stockTotal.toLocaleString()}</span> uds
        {negativos > 0 && (
          <span className="ml-3 text-red-600">
            · <span className="font-semibold">{negativos}</span> material(es) con stock negativo
          </span>
        )}
      </p>
    </div>
  );
}
