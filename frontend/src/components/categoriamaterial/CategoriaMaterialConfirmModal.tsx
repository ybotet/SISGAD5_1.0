interface CategoriaMaterialConfirmModalProps {
  showConfirmModal: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function CategoriaMaterialConfirmModal({
  showConfirmModal,
  onConfirm,
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  loading = false,
}: CategoriaMaterialConfirmModalProps) {
  if (!showConfirmModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-start mb-4">
          <div className="bg-red-100 rounded-full p-2 mr-3">
            <i className="ri-error-warning-line text-red-600 text-lg"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
            <p className="text-gray-600 mt-1">
              ¿Está seguro de que desea eliminar esta categoría de material? Esta acción no se puede
              deshacer.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <i className="ri-loader-4-line animate-spin"></i>}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
