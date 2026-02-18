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
    Line
} from 'recharts';
import type { PizarraItem } from '../../services/pizarraService';
import pizarraService from '../../services/pizarraService';
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

export default function PizarraModuleStats() {
    const [pizarras, setPizarras] = useState<PizarraItem[]>([]);
    const [quejas, setQuejas] = useState<QuejaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [pizarrasResp, quejasResp] = await Promise.all([
                    pizarraService.getPizarras(1, 10000, '', ''),
                    quejaService.getQuejas(1, 10000, '', ''),
                ]);
                setPizarras(pizarrasResp.data || []);
                setQuejas(quejasResp.data || []);
            } catch (err) {
                console.error('Error cargando pizarras/quejas para stats', err);
                setPizarras([]);
                setQuejas([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <div className="p-4 bg-white rounded shadow text-center">Cargando estadísticas de pizarras...</div>;
    }

    // pizarra por tipos (barras horizontales)
    const tipoGroups = groupBy(pizarras, (p) => (p.tb_tipopizarra ? p.tb_tipopizarra.tipo : 'Sin tipo'));
    const tipoBarData = tipoGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        cantidad: value,
    }));

    // pizarras creadas por año (líneas)
    const yearGroups = groupBy(pizarras, (p) => new Date(p.createdAt).getFullYear().toString());
    const yearLineData = yearGroups
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, count]) => ({
            year,
            cantidad: count,
        }));

    // Top 10 pizarras con más quejas (barras verticales)
    const pizarrasQuejasGroups = groupBy(
        quejas.filter((q) => q.id_pizarra !== null),
        (q) => {
            if (q.tb_pizarra?.nombre) return q.tb_pizarra.nombre;
            if (q.id_pizarra != null) return `Pizarra ${q.id_pizarra}`;
            return 'Sin pizarra';
        }
    );
    const topPizarrasQuejas = pizarrasQuejasGroups.slice(0, 10).map(([name, value]) => ({
        name: name.toString(),
        cantidad: value,
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pizarras por tipo (barras horizontales) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Pizarras por tipo</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        layout="vertical"
                        data={tipoBarData}
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

            {/* Pizarras creadas por año (líneas) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Pizarras creadas por año</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={yearLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cantidad" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top 10 pizarras con más quejas (barras verticales) */}
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Top 10 pizarras con más quejas</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topPizarrasQuejas} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
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

