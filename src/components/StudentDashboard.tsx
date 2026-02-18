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
    <div className="min-h-screen bg-surface-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-surface-800 tracking-tight mb-1">
            ¡Hola, {profile.firstName}! 👋
          </h1>
          <p className="text-surface-400 text-sm">
            Bienvenido a tu panel de control
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 sm:p-8 text-white mb-6 shadow-md">
          <p className="text-brand-100 text-xs font-semibold uppercase tracking-wider mb-1">Tu Saldo Disponible</p>
          <div className="flex items-baseline justify-between">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">${profile.balance.toFixed(2)}</h2>
            <div className="text-right">
              <p className="text-brand-100 text-xs">Gastado hoy</p>
              <p className="text-xl font-bold">${profile.spentToday}</p>
            </div>
          </div>
        </div>

        {/* Tab Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6" role="tablist" aria-label="Secciones del estudiante">
          {([
            { key: 'wallet', icon: <Wallet size={22} />, label: 'Billetera', desc: 'Gestiona tu saldo', activeColor: 'bg-brand-500' },
            { key: 'shop', icon: <ShoppingBag size={22} />, label: 'Tienda', desc: 'Compra productos', activeColor: 'bg-trust-500' },
            { key: 'history', icon: <History size={22} />, label: 'Historial', desc: 'Transacciones', activeColor: 'bg-purple-600' },
            { key: 'learning', icon: <Sparkles size={22} />, label: 'Aprender', desc: 'Retos & Educación', activeColor: 'bg-brand-600' },
            { key: 'rewards', icon: <Award size={22} />, label: 'Mis Puntos', desc: 'MeCard Rewards', activeColor: 'bg-warm-500' },
            { key: 'marketplace', icon: <Gift size={22} />, label: 'Canjear', desc: 'Premios & Regalos', activeColor: 'bg-rose-600' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`p-4 sm:p-5 rounded-xl text-left transition-all ${
                activeTab === tab.key
                  ? `${tab.activeColor} text-white shadow-md scale-[1.02]`
                  : 'bg-white text-surface-700 hover:shadow-sm border border-surface-100'
              }`}
            >
              <span className="mb-2 block">{tab.icon}</span>
              <h3 className="font-bold text-sm mb-0.5">{tab.label}</h3>
              <p className={`text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-surface-400'}`}>{tab.desc}</p>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === 'wallet' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-surface-100">
              <h2 className="text-xl font-bold mb-4 text-surface-800">Mi Billetera</h2>
              <div className="space-y-2">
                {[
                  { label: 'Saldo Actual', value: `$${profile.balance}`, color: 'text-brand-600' },
                  { label: 'Límite Diario', value: `$${profile.dailyLimit}`, color: 'text-surface-800' },
                  { label: 'Disponible Hoy', value: `$${(profile.dailyLimit - profile.spentToday).toFixed(2)}`, color: 'text-trust-600' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center p-3.5 bg-surface-50 rounded-xl">
                    <span className="font-medium text-sm text-surface-600">{row.label}</span>
                    <span className={`text-lg font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-surface-100">
              <h2 className="text-xl font-bold mb-3 text-surface-800">Tienda</h2>
              <p className="text-surface-500 text-sm">La tienda estará disponible pronto en el modo completo.</p>
              <p className="text-surface-400 text-xs mt-1">Podrás comprar productos de la cafetería, papelería y más.</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-surface-100">
              <h2 className="text-xl font-bold mb-3 text-surface-800">Historial de Transacciones</h2>
              <p className="text-surface-500 text-sm">No hay transacciones aún.</p>
              <p className="text-surface-400 text-xs mt-1">Tus compras aparecerán aquí.</p>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-4">
              <div className="bg-brand-50 rounded-xl p-5 border border-brand-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-brand-600" />
                  <h3 className="text-base font-bold text-surface-800">Lección del Día</h3>
                </div>
                {aiLoading ? (
                  <p className="text-surface-500 text-sm">Preparando tu lección…</p>
                ) : (
                  <p className="text-surface-700 text-sm leading-relaxed">{dailyLesson}</p>
                )}
              </div>
              <div className="bg-trust-50 rounded-xl p-5 border border-trust-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={18} className="text-trust-600" />
                  <h3 className="text-base font-bold text-surface-800">Reto de Hoy</h3>
                </div>
                {aiLoading ? (
                  <p className="text-surface-500 text-sm">Creando tu reto…</p>
                ) : (
                  <p className="text-surface-700 text-sm leading-relaxed">{dailyChallenge}</p>
                )}
                <button className="mt-3 bg-trust-500 hover:bg-trust-600 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors">
                  Completar Reto
                </button>
              </div>
              <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-100">
                <p className="text-brand-800 text-xs font-medium">
                  <strong>Gemini AI Coach:</strong> Completa retos y lecciones para desbloquear logros.
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

        {/* Demo info */}
        <div className="mt-6 bg-brand-50 border border-brand-200 rounded-xl p-4 flex gap-3">
          <Zap size={18} className="text-brand-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-brand-900 text-sm mb-0.5">Modo Demo Activado</p>
            <p className="text-brand-700 text-xs">Los datos reales se cargarán cuando se conecte Supabase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
