interface MaterialConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function MaterialConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
}: MaterialConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-start mb-4">
          <div className="bg-red-100 rounded-full p-2 mr-3">
            <i className="ri-error-warning-line text-red-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            {loading && <i className="ri-loader-4-line animate-spin"></i>}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
