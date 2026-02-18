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
import type { TelefonoItem } from '../../services/telefonoService';
import { telefonoService } from '../../services/telefonoService';

function groupBy<T, K extends string | number>(items: T[], keyFn: (i: T) => K | undefined) {
    const map = new Map<K, number>();
    for (const it of items) {
        const k = keyFn(it as any);
        if (k === undefined || k === null) continue;
        map.set(k, (map.get(k as K) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function SimpleBar({ label, value, max }: { label: string; value: number; max: number }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="py-1">
            <div className="flex justify-between text-sm mb-1">
                <div className="text-gray-700">{label}</div>
                <div className="text-gray-700 font-semibold">{value}</div>
            </div>
            <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
                <div className="bg-blue-500 h-3" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function TelefonoModuleStats() {
    const [items, setItems] = useState<TelefonoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // intentar traer muchos registros; ajustar si la DB es grande
                const resp = await telefonoService.getTelefonos(1, 10000, '', '');
                setItems(resp.data || []);
            } catch (err) {
                console.error('Error cargando telefonos para stats', err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <div className="p-4 bg-white rounded shadow text-center">Cargando estadísticas de teléfonos...</div>;
    }

    // extensiones
    const extGroups = groupBy(items, (t) => (t.extensiones ?? 0).toString());
    // mandos
    const mandoGroups = groupBy(items, (t) => t.tb_mando ? t.tb_mando.mando : 'Sin mando');
    // clasificacion
    const clasifGroups = groupBy(items, (t) => t.tb_clasificacion ? t.tb_clasificacion.nombre : 'Sin clasificación');
    // año creación
    const yearGroups = groupBy(items, (t) => new Date(t.createdAt).getFullYear().toString());

    const maxCount = Math.max(
        extGroups[0]?.[1] || 0,
        mandoGroups[0]?.[1] || 0,
        clasifGroups[0]?.[1] || 0,
        yearGroups[0]?.[1] || 0
    );

    // Datos para gráfico de barras verticales (extensiones)
    const barData = extGroups.slice(0, 10).map(([name, value]) => ({
        name: `${name} ext.`,
        cantidad: value
    }));

    // Datos para gráfico de líneas (años)
    const lineData = yearGroups.sort((a, b) => a[0].localeCompare(b[0])).map(([year, count]) => ({
        year: year,
        cantidad: count
    }));

    // Datos para gráfico de pastel (clasificación)
    const pieData = clasifGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        value: value
    }));

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gráfico de barras verticales para extensiones */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Teléfonos por extensiones</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={barData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Teléfonos por mando</h4>
                {mandoGroups.slice(0, 10).map(([k, v]) => (
                    <SimpleBar key={k} label={k.toString()} value={v} max={maxCount} />
                ))}
            </div>

            {/* Gráfico de líneas para años */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Teléfonos creados por año</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cantidad" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Teléfonos por clasificación</h4>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
