interface Props {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
}

export default function MovimientoPagination({
  page,
  pages,
  onPageChange,
}: Props) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end mt-4 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="px-3 py-1 bg-gray-100 rounded"
      >
        Anterior
      </button>
      <div className="px-3 py-1">
        {page} / {pages}
      </div>
      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        className="px-3 py-1 bg-gray-100 rounded"
      >
        Siguiente
      </button>
    </div>
  );
}
