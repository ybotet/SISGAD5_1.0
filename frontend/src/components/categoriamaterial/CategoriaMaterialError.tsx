interface CategoriaMaterialErrorProps {
  message: string;
  onClose: () => void;
}

export default function CategoriaMaterialError({ message, onClose }: CategoriaMaterialErrorProps) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center">
        <i className="ri-error-warning-line text-red-500 mr-2"></i>
        <span className="text-red-700">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto text-red-500 hover:text-red-700"
          aria-label="Cerrar mensaje de error"
        >
          <i className="ri-close-line"></i>
        </button>
      </div>
    </div>
  );
}
