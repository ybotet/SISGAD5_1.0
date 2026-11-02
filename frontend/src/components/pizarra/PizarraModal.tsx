import { useEffect, useState } from 'react';
import type { PizarraItem } from '../../services/pizarraService';
import { pizarraService } from '../../services/pizarraService';

interface PizarraModalProps {
    show: boolean;
    editingItem: PizarraItem | null;
    saving: boolean;
    onClose: () => void;
    onSave: (formData: FormData) => Promise<void>;
}

export default function PizarraModal({ show, editingItem, saving, onClose, onSave }: PizarraModalProps) {
    const [tipos, setTipos] = useState<any[]>([]);

    useEffect(() => {
        if (!show) return;
        (async () => {
            const t = await pizarraService.getTiposPizarra();
            setTipos(t);
        })();
    }, [show]);

    if (!show) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.target);
        await onSave(form);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-lg p-6">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Editar Pizarra' : 'Nueva Pizarra'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-600">Nombre *</label>
                        <input name="nombre" defaultValue={editingItem?.nombre || ''} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-600">Dirección *</label>
                        <input name="direccion" defaultValue={editingItem?.direccion || ''} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-600">Observación</label>
                        <input name="observacion" defaultValue={editingItem?.observacion || ''} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-600">Tipo</label>
                        <select name="id_tipopizarra" defaultValue={editingItem?.id_tipopizarra || ''} className="w-full border rounded px-3 py-2">
                            <option value="">-- Seleccionar --</option>
                            {tipos.map((t: any) => (
                                <option key={t.id_tipopizarra} value={t.id_tipopizarra}>{t.tipo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
