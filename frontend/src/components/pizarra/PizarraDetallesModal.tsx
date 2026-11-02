import type { PizarraItem } from '../../services/pizarraService';

interface DetallesProps {
    show: boolean;
    pizarra: PizarraItem | null;
    loading?: boolean;
    onClose: () => void;
}

export default function PizarraDetallesModal({ show, pizarra, loading = false, onClose }: DetallesProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Detalle de Pizarra</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><i className="ri-close-line"></i></button>
                </div>
                {loading ? (
                    <div className="text-center py-6"><i className="ri-loader-4-line animate-spin text-2xl text-blue-600"></i></div>
                ) : pizarra ? (
                    <div>
                        <p><strong>Nombre:</strong> {pizarra.nombre || '—'}</p>
                        <p><strong>Dirección:</strong> {pizarra.direccion || '—'}</p>
                        <p><strong>Observación:</strong> {pizarra.observacion || '—'}</p>
                        <p><strong>Tipo:</strong> {pizarra.tb_tipopizarra ? pizarra.tb_tipopizarra.tipo : '—'}</p>
                    </div>
                ) : (
                    <p>No hay detalles disponibles</p>
                )}
            </div>
        </div>
    );
}
