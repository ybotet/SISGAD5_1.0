interface StockHeaderProps {
  title: string;
  description: string;
}

export default function StockHeader({ title, description }: StockHeaderProps) {
  return (
    <div className="mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
