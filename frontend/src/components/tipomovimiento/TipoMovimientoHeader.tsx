interface TipoMovimientoHeaderProps {
    title: string;
    description: string;
    onAdd: () => void;
}

export default function TipoMovimientoHeader({
    title,
    description,
    onAdd
}: TipoMovimientoHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600">{description}</p>
            </div>
            <button
                onClick={onAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap"
            >
                <i className="ri-add-line"></i>
                <span>Nuevo Tipo</span>
            </button>
        </div>
    );
}

