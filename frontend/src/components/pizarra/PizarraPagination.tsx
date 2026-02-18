interface PaginationProps {
    pagination: { page: number; limit: number; total: number; pages: number };
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function PizarraPagination({ pagination, onLimitChange, onNext, onPrev }: PaginationProps) {
    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Página {pagination.page} de {pagination.pages}</div>
            <div className="flex items-center space-x-2">
                <button onClick={onPrev} className="px-3 py-1 bg-gray-100 rounded">Anterior</button>
                <button onClick={onNext} className="px-3 py-1 bg-gray-100 rounded">Siguiente</button>
                <select value={pagination.limit} onChange={(e) => onLimitChange(parseInt(e.target.value))} className="border rounded px-2 py-1">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>
    );
}
