/**
 * StudentRewardsDashboard Component
 * Panel de puntos y rewards del estudiante
 */

import React from 'react';
import {
  Zap,
  Trophy,
  TrendingUp,
  Flame,
  ChevronRight,
  Gift,
  Clock,
  Award,
  Crown
} from 'lucide-react';
import { useRewards } from '../hooks/useRewards';
import { rewardsService } from '../services/rewardsService';
import { RewardsTier } from '../types';

interface StudentRewardsDashboardProps {
  studentId: string;
  schoolId: string;
  onMarketplaceClick?: () => void;
}

export const StudentRewardsDashboard: React.FC<StudentRewardsDashboardProps> = ({
  studentId,
  schoolId,
  onMarketplaceClick
}) => {
  const { studentPoints, config, transactions, loading, error, refresh } = useRewards({
    studentId,
    schoolId,
    autoLoad: true
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Cargando tus puntos...</p>
        </div>
      </div>
    );
  }

  if (error || !studentPoints || !config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-700 font-semibold">Error: {error || 'No se pudo cargar los puntos'}</p>
      </div>
    );
  }

  const tierInfo = rewardsService.getTierInfo(studentPoints.tier);
  const nextTierInfo = rewardsService.calculateProgressToNextTier(
    studentPoints.earnedThisCycle,
    studentPoints.tier,
    config.tierThresholds
  );
  const multiplier = rewardsService.getPointsMultiplier(studentPoints.tier);
  const cycleEnd = new Date(config.cycleEndDate);

  return (
    <div className="space-y-6">
      {/* Header con puntos principales */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-indigo-100 text-sm font-semibold mb-2 flex items-center gap-2">
              <Zap size={16} />
              Puntos Disponibles
            </p>
            <h2 className="text-5xl font-black">{rewardsService.formatPoints(studentPoints.totalPoints)}</h2>
          </div>
          <Crown className="text-yellow-300" size={64} opacity={0.3} />
        </div>

        {/* Tier actual */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${tierInfo.color}`}>
              <span className="text-2xl">{tierInfo.icon}</span>
            </div>
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase">Nivel Actual</p>
              <p className="text-white font-black text-lg">{tierInfo.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-indigo-100 text-xs font-bold">Multiplicador</p>
            <p className="text-yellow-300 font-black text-lg">{(multiplier * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Barra de progreso */}
        {nextTierInfo.nextTier && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-indigo-100 text-sm font-bold">Progreso a {nextTierInfo.nextTier}</span>
              <span className="text-yellow-300 font-bold text-sm">
                {nextTierInfo.pointsNeeded.toLocaleString()} pts restantes
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="bg-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${nextTierInfo.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Este Ciclo</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{rewardsService.formatPoints(studentPoints.earnedThisCycle)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gift className="text-purple-600" size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Canjeados</p>
          </div>
          <p className="text-2xl font-black text-slate-900">{rewardsService.formatPoints(studentPoints.redeemedThisCycle)}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={20} />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Expira</p>
          </div>
          <p className="text-sm font-black text-slate-900">
            {cycleEnd.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* CTA Marketplace */}
      <button
        onClick={onMarketplaceClick}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 rounded-2xl p-4 text-white font-bold flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <Gift size={20} />
          <span>Ir al Marketplace</span>
        </div>
        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
      </button>

      {/* Transacciones recientes */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Actividad Reciente
          </h3>

          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'EARN' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'EARN' ? (
                      <TrendingUp className="text-green-600" size={16} />
                    ) : (
                      <Gift className="text-red-600" size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
                <p className={`font-black text-sm ${
                  tx.pointsAmount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.pointsAmount > 0 ? '+' : ''}{rewardsService.formatPoints(tx.pointsAmount)}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={refresh}
            className="w-full mt-4 text-indigo-600 font-bold text-sm hover:text-indigo-700 py-2"
          >
            Actualizar Historial
          </button>
        </div>
      )}

      {/* Info de tier benefits */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-start gap-3">
          <Award className="text-amber-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-black text-amber-900 mb-1">Beneficios del Tier {tierInfo.label}</p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• Ganas el {(multiplier * 100).toFixed(0)}% de puntos extra por compra</li>
              <li>• Acceso prioritario a productos limitados</li>
              <li>• Validez de puntos hasta {cycleEnd.toLocaleDateString('es-MX')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
