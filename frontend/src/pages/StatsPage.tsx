import { useState } from 'react';
import {
    TelefonoModuleStats,
    LineaModuleStats,
    QuejaModuleStats,
    PizarraModuleStats,
    TrabajadorModuleStats
} from '../components/stats';

export default function StatsPage() {
    const [module, setModule] = useState('telefono');

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
                    <p className="text-gray-600">Visualizaciones agregadas por módulo</p>
                </div>
                <div>
                    <select
                        value={module}
                        onChange={(e) => setModule(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="telefono">Teléfonos</option>
                        <option value="linea">Líneas</option>
                        <option value="pizarra">Pizarras</option>
                        <option value="queja">Quejas</option>
                        <option value="trabajador">Trabajadores</option>
                    </select>
                </div>
            </div>

            {module === 'telefono' && <TelefonoModuleStats />}
            {module === 'linea' && <LineaModuleStats />}
            {module === 'pizarra' && <PizarraModuleStats />}
            {module === 'queja' && <QuejaModuleStats />}
            {module === 'trabajador' && <TrabajadorModuleStats />}
        </div>
    );
}
