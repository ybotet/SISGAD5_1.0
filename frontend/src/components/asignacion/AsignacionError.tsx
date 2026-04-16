interface AsignacionErrorProps {
  message: string;
  onClose: () => void;
}

export default function AsignacionError({ message, onClose }: AsignacionErrorProps) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
      <div className="flex items-start gap-3">
        <i className="ri-error-warning-line text-red-600 text-lg mt-0.5"></i>
        <div>
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      </div>
      <button onClick={onClose} className="text-red-600 hover:text-red-800 text-lg">
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
}
