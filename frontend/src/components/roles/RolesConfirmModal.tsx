interface Props {
  show: boolean;
  title?: string;
  message?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RolesConfirmModal({ show, title = 'Confirmar', message = '¿Está seguro?', loading, onConfirm, onCancel }: Props) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded" disabled={loading}>{loading ? '...' : 'Eliminar'}</button>
        </div>
      </div>
    </div>
  );
}
