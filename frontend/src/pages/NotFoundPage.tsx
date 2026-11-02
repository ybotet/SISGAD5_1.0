import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-white rounded shadow">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Página no encontrada — El enlace es incorrecto o no existe.</p>
        <div className="flex justify-center gap-4">
          <Link to="/sistema" className="px-4 py-2 bg-blue-600 text-white rounded">Ir al panel</Link>
          {/* <Link to="/auth/login" className="px-4 py-2 border rounded">Ir a login</Link> */}
        </div>
      </div>
    </div>
  );
}
