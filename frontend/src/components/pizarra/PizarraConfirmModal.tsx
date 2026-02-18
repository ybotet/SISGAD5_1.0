interface ConfirmProps {
    show: boolean;
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

export default function PizarraConfirmModal({ show, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', loading = false }: ConfirmProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-700 mb-4">{message}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded border">{cancelText}</button>
                    <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">{loading ? 'Eliminando...' : confirmText}</button>
                </div>
            </div>
        </div>
    );
}
