interface MaterialErrorProps {
  error: string;
  onClose: () => void;
}

export default function MaterialError({ error, onClose }: MaterialErrorProps) {
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 flex justify-between items-start">
      <div>
        <div className="font-semibold">Error</div>
        <div className="text-sm">{error}</div>
      </div>
      <button
        onClick={onClose}
        className="text-red-600 hover:text-red-800"
        title="Cerrar"
      >
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}
