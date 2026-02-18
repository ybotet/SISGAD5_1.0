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
import type { LineaItem } from '../../services/lineaService';
import { lineaService } from '../../services/lineaService';
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

export default function LineaModuleStats() {
    const [lineas, setLineas] = useState<LineaItem[]>([]);
    const [quejas, setQuejas] = useState<QuejaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [lineasResp, quejasResp] = await Promise.all([
                    lineaService.getLineas(1, 10000, '', ''),
                    quejaService.getQuejas(1, 10000, '', ''),
                ]);
                setLineas(lineasResp.data || []);
                setQuejas(quejasResp.data || []);
            } catch (err) {
                console.error('Error cargando líneas/quejas para stats', err);
                setLineas([]);
                setQuejas([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <div className="p-4 bg-white rounded shadow text-center">Cargando estadísticas de líneas...</div>;
    }

    // Línea por tipo (pie)
    const tipoGroups = groupBy(lineas, (l) => (l.tb_tipolinea ? l.tb_tipolinea.tipo : 'Sin tipo'));
    const tipoPieData = tipoGroups.map(([name, value]) => ({
        name: name.toString(),
        value,
    }));

    // Línea por propietario (barra horizontal)
    const propGroups = groupBy(lineas, (l) => (l.tb_propietario ? l.tb_propietario.nombre : 'Sin propietario'));
    const propBarData = propGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        cantidad: value,
    }));

    // Líneas creadas por año (línea)
    const yearGroups = groupBy(lineas, (l) => new Date(l.createdAt).getFullYear().toString());
    const yearLineData = yearGroups
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, count]) => ({
            year,
            cantidad: count,
        }));

    // Líneas por señalización (barra horizontal)
    const senalGroups = groupBy(lineas, (l) => (l.tb_senalizacion ? l.tb_senalizacion.senalizacion : 'Sin señalización'));
    const senalBarData = senalGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        cantidad: value,
    }));

    // Líneas por estado (pie: activas / inactivas)
    const activas = lineas.filter((l) => !l.esbaja).length;
    const inactivas = lineas.filter((l) => l.esbaja).length;
    const estadoPieData = [
        { name: 'Activas', value: activas },
        { name: 'Inactivas', value: inactivas },
    ];

    // Top 10 líneas con más quejas (barras verticales)
    const lineasQuejasGroups = groupBy(
        quejas.filter((q) => q.id_linea !== null),
        (q) => {
            if (q.tb_linea?.clavelinea) return q.tb_linea.clavelinea;
            if (q.id_linea != null) return `Línea ${q.id_linea}`;
            return 'Sin línea';
        }
    );
    const topLineasQuejas = lineasQuejasGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        cantidad: value,
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Línea por tipo (pie) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Líneas por tipo</h4>
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

            {/* Línea por propietario (barras horizontales) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Líneas por propietario</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        layout="vertical"
                        data={propBarData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Líneas creadas por año (línea) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Líneas creadas por año</h4>
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

            {/* Líneas por señalización (barras horizontales) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Líneas por señalización</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        layout="vertical"
                        data={senalBarData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={140} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Líneas por estado (pie) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Líneas por estado</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={estadoPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {estadoPieData.map((_, index) => (
                                <Cell key={`cell-estado-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Top 10 líneas con más quejas (barras verticales) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Top 10 líneas con más quejas</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topLineasQuejas} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#FF8042" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

