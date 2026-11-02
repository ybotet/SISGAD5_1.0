interface Props {
  message: string;
  onClose?: () => void;
}

export default function MovimientoError({ message, onClose }: Props) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 flex justify-between items-start">
      <div>{message}</div>
      {onClose && (
        <button onClick={onClose} className="text-red-600 ml-4">
          Cerrar
        </button>
      )}
    </div>
  );
}
