interface Props {
  onCreate?: () => void;
  title?: string;
  description?: string;
}

export default function MovimientoHeader({
  onCreate,
  title = "Movimientos",
  description = "Gestiona los movimientos",
}: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {onCreate && (
        <button
          onClick={onCreate}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo movimiento
        </button>
      )}
    </div>
  );
}
