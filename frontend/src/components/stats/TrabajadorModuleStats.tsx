import { useEffect, useState } from 'react';
import {
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import type { TrabajadorItem } from '../../services/trabajadorService';
import { trabajadorService } from '../../services/trabajadorService';

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function TrabajadorModuleStats() {
    const [trabajadores, setTrabajadores] = useState<TrabajadorItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const resp = await trabajadorService.getTrabajadores(1, 10000, '');
                setTrabajadores(resp.data || []);
            } catch (err) {
                console.error('Error cargando trabajadores para stats', err);
                setTrabajadores([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <div className="p-4 bg-white rounded shadow text-center">Cargando estadísticas de trabajadores...</div>;
    }

    const activos = trabajadores.filter((t) => t.activo);
    const grupoCounts = new Map<string, number>();

    for (const t of activos) {
        const nombreGrupo = t.tb_grupow?.grupo ?? 'Sin grupo';
        grupoCounts.set(nombreGrupo, (grupoCounts.get(nombreGrupo) || 0) + 1);
    }

    const pieData = Array.from(grupoCounts.entries()).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold mb-3">Trabajadores por grupo (solo activos)</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((_, index) => (
                                <Cell key={`cell-grupo-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

