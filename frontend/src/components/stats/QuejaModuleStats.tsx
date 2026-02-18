import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import type { QuejaItem } from '../../services/quejaService';
import { quejaService } from '../../services/quejaService';

function groupBy<T, K extends string | number>(items: T[], keyFn: (i: T) => K | undefined) {
    const map = new Map<K, number>();
    for (const it of items) {
        const k = keyFn(it as any);
        if (k === undefined || k === null) continue;
        map.set(k, (map.get(k as K) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function QuejaModuleStats() {
    const [quejas, setQuejas] = useState<QuejaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const resp = await quejaService.getQuejas(1, 10000, '', '');
                setQuejas(resp.data || []);
            } catch (err) {
                console.error('Error cargando quejas para stats', err);
                setQuejas([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <div className="p-4 bg-white rounded shadow text-center">Cargando estadísticas de quejas...</div>;
    }

    // quejas por servicio [telefono, linea, pizarra] (pie)
    const servicioCounts = {
        Teléfono: 0,
        Línea: 0,
        Pizarra: 0,
        Otro: 0,
    };
    for (const q of quejas) {
        if (q.id_telefono) servicioCounts.Teléfono++;
        else if (q.id_linea) servicioCounts.Línea++;
        else if (q.id_pizarra) servicioCounts.Pizarra++;
        else servicioCounts.Otro++;
    }
    const servicioPieData = Object.entries(servicioCounts)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    // quejas por tipo de queja (pie)
    const tipoGroups = groupBy(quejas, (q) => (q.tb_tipoqueja ? q.tb_tipoqueja.tipoqueja : 'Sin tipo'));
    const tipoPieData = tipoGroups.map(([name, value]) => ({
        name: name.toString(),
        value,
    }));

    // quejas creadas por año (líneas)
    const yearGroups = groupBy(quejas, (q) => new Date(q.fecha).getFullYear().toString());
    const yearLineData = yearGroups
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, count]) => ({
            year,
            cantidad: count,
        }));

    // quejas por clave (barras)
    const claveGroups = groupBy(quejas, (q) => (q.tb_clave ? q.tb_clave.clave : 'Sin clave'));
    const claveBarData = claveGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        cantidad: value,
    }));

    // diferencia fecha - fecha OK (dona)
    const diffBuckets: Record<string, number> = {
        '≤ 24 h': 0,
        '≤ 48 h': 0,
        '≤ 72 h': 0,
        '> 72 h': 0,
    };

    for (const q of quejas) {
        if (!q.fecha || !q.fechaok) continue;
        const inicio = new Date(q.fecha).getTime();
        const fin = new Date(q.fechaok).getTime();
        if (isNaN(inicio) || isNaN(fin) || fin < inicio) continue;
        const horas = (fin - inicio) / (1000 * 60 * 60);
        if (horas <= 24) diffBuckets['≤ 24 h']++;
        else if (horas <= 48) diffBuckets['≤ 48 h']++;
        else if (horas <= 72) diffBuckets['≤ 72 h']++;
        else diffBuckets['> 72 h']++;
    }

    const diffPieData = Object.entries(diffBuckets)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quejas por servicio (pie) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Quejas por servicio</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={servicioPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {servicioPieData.map((_, index) => (
                                <Cell key={`cell-serv-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Quejas por tipo de queja (pie) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Quejas por tipo</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={tipoPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {tipoPieData.map((_, index) => (
                                <Cell key={`cell-tipo-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Quejas creadas por año (líneas) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Quejas creadas por año</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={yearLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cantidad" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Quejas por clave (barras) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Quejas por clave</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={claveBarData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Diferencia fecha - fecha OK (dona) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Tiempo de resolución de quejas</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={diffPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {diffPieData.map((_, index) => (
                                <Cell key={`cell-diff-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

