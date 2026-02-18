interface TrabajadorStatsProps {
    total: number;
    showing: number;
    page: number;
    pages: number;
    limit: number;
}

export default function TrabajadorStats({
    total,
    showing,
    page,
    pages,
    limit
}: TrabajadorStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                    <div className="bg-blue-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                        <i className="ri-team-line text-white"></i>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total General</p>
                        <p className="text-lg font-semibold text-gray-900">{total}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                    <div className="bg-green-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                        <i className="ri-eye-line text-white"></i>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Mostrando</p>
                        <p className="text-lg font-semibold text-gray-900">{showing}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                    <div className="bg-purple-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                        <i className="ri-file-list-line text-white"></i>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Página</p>
                        <p className="text-lg font-semibold text-gray-900">{page} / {pages}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                    <div className="bg-orange-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                        <i className="ri-bar-chart-line text-white"></i>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Por página</p>
                        <p className="text-lg font-semibold text-gray-900">{limit}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

