interface AsignacionHeaderProps {
  title: string;
  description: string;
  onAdd: () => void;
}

export default function AsignacionHeader({ title, description, onAdd }: AsignacionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Nueva asignación
        </button>
      </div>
    </div>
  );
}
