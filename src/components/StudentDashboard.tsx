import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Wallet, ShoppingBag, History, Users, Zap, Sparkles, Award, Gift } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { StudentProfile } from '../types';
import { getFinancialEducation, getHealthChallenges } from '../services/geminiService';
import { StudentRewardsDashboard } from './StudentRewardsDashboard';
import { RewardsMarketplace } from './RewardsMarketplace';

/**
 * Simplified StudentDashboard - Demo Mode
 * Works with or without Supabase
 * Now includes MeCard Rewards integration
 */
export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<'wallet' | 'shop' | 'history' | 'learning' | 'rewards' | 'marketplace'>('wallet');
  const [dailyLesson, setDailyLesson] = useState<string>('');
  const [dailyChallenge, setDailyChallenge] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  
  if (!isAuthenticated || !isStudent) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    loadAIContent();
  }, []);

  const loadAIContent = async () => {
    setAiLoading(true);
    try {
      const lesson = await getFinancialEducation(15, 'cafeteria');
      setDailyLesson(lesson);

      const challenge = await getHealthChallenges(15, [], []);
      setDailyChallenge(challenge);
    } catch (error) {
      console.error('Error loading AI content:', error);
    } finally {
      setAiLoading(false);
    }
  };

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

        {/* Tabs Grid - 2 rows x 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

          {/* Learning Tab */}
          <div
            onClick={() => setActiveTab('learning')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all ${
              activeTab === 'learning'
                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:shadow-lg'
            }`}
          >
            <Sparkles className="w-8 h-8 mb-4" />
            <h3 className="font-black text-lg mb-2">Aprender</h3>
            <p className={`text-sm ${activeTab === 'learning' ? 'text-indigo-100' : 'text-slate-500'}`}>
              Retos & Educación
            </p>
          </div>

          {/* Rewards Tab */}
          <div
            onClick={() => setActiveTab('rewards')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all ${
              activeTab === 'rewards'
                ? 'bg-yellow-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:shadow-lg'
            }`}
          >
            <Award className="w-8 h-8 mb-4" />
            <h3 className="font-black text-lg mb-2">Mis Puntos</h3>
            <p className={`text-sm ${activeTab === 'rewards' ? 'text-yellow-100' : 'text-slate-500'}`}>
              MeCard Rewards
            </p>
          </div>

          {/* Marketplace Tab */}
          <div
            onClick={() => setActiveTab('marketplace')}
            className={`p-6 rounded-[24px] cursor-pointer transition-all ${
              activeTab === 'marketplace'
                ? 'bg-rose-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:shadow-lg'
            }`}
          >
            <Gift className="w-8 h-8 mb-4" />
            <h3 className="font-black text-lg mb-2">Canjear</h3>
            <p className={`text-sm ${activeTab === 'marketplace' ? 'text-rose-100' : 'text-slate-500'}`}>
              Premios & Regalos
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {activeTab === 'wallet' && (
            <div className="bg-white rounded-[32px] p-8 shadow-lg">
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
            <div className="bg-white rounded-[32px] p-8 shadow-lg">
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
            <div className="bg-white rounded-[32px] p-8 shadow-lg">
              <h2 className="text-2xl font-black mb-6">Historial de Transacciones</h2>
              <p className="text-slate-500 text-lg">
                📊 No hay transacciones aún.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Tus compras aparecerán aquí.
              </p>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              {/* DAILY LESSON */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[24px] p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-black text-slate-900">Lección del Día 📚</h3>
                </div>
                {aiLoading ? (
                  <p className="text-slate-600 font-medium">Gemini está preparando tu lección...</p>
                ) : (
                  <p className="text-slate-800 leading-relaxed">{dailyLesson}</p>
                )}
              </div>

              {/* DAILY CHALLENGE */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[24px] p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-black text-slate-900">Reto de Hoy 🎮</h3>
                </div>
                {aiLoading ? (
                  <p className="text-slate-600 font-medium">Gemini está creando tu reto...</p>
                ) : (
                  <p className="text-slate-800 leading-relaxed">{dailyChallenge}</p>
                )}
                <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-[20px] text-[10px] uppercase tracking-[2px] transition-all">
                  ✓ Completar Reto
                </button>
              </div>

              {/* INFO */}
              <div className="bg-indigo-50 rounded-[24px] p-6 border-2 border-indigo-200">
                <p className="text-indigo-900 font-bold">
                  💡 <strong>Gemini AI Coach:</strong> Completa los retos y aprende lecciones diarias para desbloquear logros especiales.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <StudentRewardsDashboard
              studentId={profile.id}
              schoolId={profile.schoolId}
              onMarketplaceClick={() => setActiveTab('marketplace')}
            />
          )}

          {activeTab === 'marketplace' && (
            <RewardsMarketplace
              studentId={profile.id}
              schoolId={profile.schoolId}
              onRedemptionSuccess={() => setActiveTab('rewards')}
            />
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
