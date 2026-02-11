import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, ShoppingBag, History, Users, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { StudentProfile } from '../types';

/**
 * Simplified StudentDashboard - Demo Mode
 * Works with or without Supabase
 */
export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth();
  
  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  const [activeTab, setActiveTab] = useState<'wallet' | 'shop' | 'history'>('wallet');

  // Demo student profile
  const profile: StudentProfile = {
    id: user?.id || 'student-001',
    userId: user?.id || 'student-001',
    studentId: 'STU-001',
    fullName: user?.fullName || 'Demo Student',
    firstName: user?.fullName?.split(' ')[0] || 'Demo',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || 'Student',
    grade: '10',
    schoolId: user?.schoolId || 'school-001',
    balance: 250.75,
    dailyLimit: 100,
    spentToday: 25.50,
    totalSpent: 500,
    restrictions: {
      restrictedCategories: [],
      restrictedProducts: [],
      allergens: []
    },
    parentId: 'parent-001',
    parentName: 'Demo Parent',
    photo: undefined,
    enrollmentDate: new Date().toISOString(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    credential: {
      id: user?.id || 'student-001',
      studentId: 'STU-001',
      qrCode: `MECARD_STU001`,
      issuedAt: new Date().toISOString(),
      isActive: true,
      usageCount: 12
    },
    favorites: [],
    favoritesPublic: false
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            ¡Hola, {profile.firstName}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Bienvenido a tu panel de control del estudiante
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] p-8 text-white mb-8 shadow-xl">
          <p className="text-blue-100 text-sm font-bold uppercase mb-2">Tu Saldo Disponible</p>
          <div className="flex items-baseline justify-between">
            <h2 className="text-5xl font-black">${profile.balance.toFixed(2)}</h2>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Gastado hoy</p>
              <p className="text-2xl font-bold">${profile.spentToday}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Tab */}
          <div
            onClick={() => setActiveTab('wallet')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all ${
              activeTab === 'wallet'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:shadow-lg'
            }`}
          >
            <Wallet className="w-8 h-8 mb-4" />
            <h3 className="font-black text-lg mb-2">Mi Billetera</h3>
            <p className={`text-sm ${activeTab === 'wallet' ? 'text-blue-100' : 'text-slate-500'}`}>
              Gestiona tu saldo
            </p>
          </div>

          {/* Shop Tab */}
          <div
            onClick={() => setActiveTab('shop')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all ${
              activeTab === 'shop'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:shadow-lg'
            }`}
          >
            <ShoppingBag className="w-8 h-8 mb-4" />
            <h3 className="font-black text-lg mb-2">Tienda</h3>
            <p className={`text-sm ${activeTab === 'shop' ? 'text-green-100' : 'text-slate-500'}`}>
              Compra productos
            </p>
          </div>

          {/* History Tab */}
          <div
            onClick={() => setActiveTab('history')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:shadow-lg'
            }`}
          >
            <History className="w-8 h-8 mb-4" />
            <h3 className="font-black text-lg mb-2">Historial</h3>
            <p className={`text-sm ${activeTab === 'history' ? 'text-purple-100' : 'text-slate-500'}`}>
              Tus transacciones
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8 bg-white rounded-[32px] p-8 shadow-lg">
          {activeTab === 'wallet' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Mi Billetera</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-[20px]">
                  <span className="font-bold text-slate-700">Saldo Actual</span>
                  <span className="text-2xl font-black text-blue-600">${profile.balance}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-[20px]">
                  <span className="font-bold text-slate-700">Límite Diario</span>
                  <span className="text-lg font-bold text-slate-900">${profile.dailyLimit}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-[20px]">
                  <span className="font-bold text-slate-700">Disponible Hoy</span>
                  <span className="text-lg font-bold text-green-600">
                    ${(profile.dailyLimit - profile.spentToday).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Tienda</h2>
              <p className="text-slate-500 text-lg">
                🎯 La tienda estará disponible pronto en el modo completo.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Puedes comprar productos de la cafetería, papelería y más.
              </p>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Historial de Transacciones</h2>
              <p className="text-slate-500 text-lg">
                📊 No hay transacciones aún.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Tus compras aparecerán aquí.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-[24px] p-6">
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-black text-blue-900 mb-1">Modo Demo Activado</p>
              <p className="text-blue-700 text-sm">
                Estás viendo datos de demostración. Los datos reales se cargarán cuando se conecte Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
