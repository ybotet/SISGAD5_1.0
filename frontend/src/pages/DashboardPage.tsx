// import { useState } from 'react';
// import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { telefonoService } from '../services/telefonoService';
import { lineaService } from '../services/lineaService';
import pizarraService from '../services/pizarraService';
import { quejaService } from '../services/quejaService';
import { trabajadorService } from '../services/trabajadorService';
import { clasificacionService } from '../services/clasificacionService';

export default function DashboardPage() {
    const navigate = useNavigate();

    const [counts, setCounts] = useState({
        telefonos: 0,
        lineas: 0,
        pizarras: 0,
        quejas: 0,
        operarios: 0,
        nomencladores: 0,
    });
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const [telRes, linRes, pizRes, quejaRes, traRes, clasRes] = await Promise.all([
                    telefonoService.getTelefonos(1, 1),
                    lineaService.getLineas(1, 1),
                    pizarraService.getPizarras(1, 1),
                    quejaService.getQuejas(1, 5),
                    trabajadorService.getTrabajadores(1, 1),
                    clasificacionService.getClasificaciones('', 1, 1),
                ]);

                if (!mounted) return;

                setCounts({
                    telefonos: telRes?.pagination?.total || 0,
                    lineas: linRes?.pagination?.total || 0,
                    pizarras: pizRes?.pagination?.total || 0,
                    quejas: quejaRes?.pagination?.total || 0,
                    operarios: traRes?.pagination?.total || 0,
                    nomencladores: clasRes?.pagination?.total || 0,
                });

                setRecent((quejaRes?.data || []).slice(0, 5).map((q: any) => ({
                    id: q.id_queja || q.num_reporte,
                    type: 'complaint',
                    title: `Queja #${q.num_reporte || q.id_queja}`,
                    desc: q.createdAt ? new Date(q.createdAt).toLocaleString() : '',
                })));
            } catch (err) {
                console.error('Error cargando datos del dashboard', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, []);

    const stats = [
        { title: 'Teléfonos', value: counts.telefonos, color: 'bg-blue-700', path: '/sistema/main/telefonos' },
        { title: 'Líneas', value: counts.lineas, color: 'bg-indigo-700', path: '/sistema/main/lineas' },
        { title: 'Pizarras', value: counts.pizarras, color: 'bg-sky-700', path: '/sistema/main/pizarras' },
        { title: 'Quejas', value: counts.quejas, color: 'bg-red-600', path: '/sistema/main/quejas' },
        { title: 'Operarios', value: counts.operarios, color: 'bg-emerald-600', path: '/sistema/operarios' },
        { title: 'Nomencladores', value: counts.nomencladores, color: 'bg-violet-600', path: '' },
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-2xl font-semibold">Bienvenido al Sistema SISGAD5</h1>
                    <p className="text-sm text-gray-500">Gestión eficiente de los reportes y servicios de telecomunicaciones</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {stats.map((s) => (
                        <button
                            key={s.title}
                            onClick={() => navigate(s.path)}
                            className="bg-white rounded-lg shadow p-4 flex items-center gap-4 text-left hover:shadow-md transition cursor-pointer"
                        >
                            <div className={`p-3 rounded-md text-white ${s.color}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">{s.title}</div>
                                <div className="text-2xl font-bold text-gray-800">{loading ? '…' : String(s.value)}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Acciones Rápidas</h2>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => navigate('/sistema/main/quejas')} className="bg-blue-800 text-white px-5 py-2 rounded-md shadow">+ Nueva Queja</button>
                        <button onClick={() => navigate('/sistema/main/telefonos')} className="bg-emerald-600 text-white px-5 py-2 rounded-md shadow">Registrar Teléfono</button>
                        <button onClick={() => navigate('/sistema/operarios')} className="bg-violet-600 text-white px-5 py-2 rounded-md shadow">Nuevo trabajador</button>
                        <button onClick={() => navigate('/sistema/stats')} className="bg-orange-500 text-white px-5 py-2 rounded-md shadow">Ver Estadísticas</button>
                    </div>
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-4">Actividad Reciente</h3>
                        <ul className="space-y-3">
                            {recent.length === 0 && !loading && (
                                <li className="text-sm text-gray-500">No hay actividad reciente.</li>
                            )}
                            {recent.map((r, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                                    <div className="flex-none text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">{r.title}</div>
                                        <div className="text-sm text-gray-500">{r.desc}</div>
                                        <div className="mt-2">
                                            <button onClick={() => navigate('/sistema/main/quejas')} className="text-xs text-blue-600 hover:underline">Ver queja</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-4">Resumen</h3>
                        <p className="text-sm text-gray-600">gráficos rápidos, estadísticas o enlaces a reportes detallados.</p>
                        <div className="mt-4">
                            <button onClick={() => navigate('/sistema/stats')} className="bg-indigo-600 text-white px-4 py-2 rounded">Ir a estadísticas</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}