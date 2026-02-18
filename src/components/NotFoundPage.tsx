import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Página no encontrada</h1>
        <p className="text-slate-500 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            Regresar
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-medium hover:shadow-lg transition-all"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
