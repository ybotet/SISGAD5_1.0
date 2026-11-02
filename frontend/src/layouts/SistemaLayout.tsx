// src/layouts/SistemaLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function SistemaLayout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-50">
                <Outlet /> {/* Aquí se renderizan las páginas hijas */}
            </main>
        </div>
    );
}