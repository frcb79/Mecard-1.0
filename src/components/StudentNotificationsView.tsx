import React, { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, Clock, Filter, Smartphone } from 'lucide-react';
import { MOCK_STUDENT_NOTIFICATIONS } from '../constants';
import type { StudentNotification } from '../types';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `Hace ${diffDays} día(s)`;
  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
}

function getNotifColor(type: string): string {
  switch (type) {
    case 'purchase': return 'bg-cyan-50 border-cyan-200';
    case 'deposit': return 'bg-emerald-50 border-emerald-200';
    case 'low_balance': return 'bg-amber-50 border-amber-200';
    case 'gift_received': return 'bg-pink-50 border-pink-200';
    case 'gift_sent': return 'bg-purple-50 border-purple-200';
    case 'reward_earned': return 'bg-amber-50 border-amber-200';
    case 'limit_changed': return 'bg-slate-50 border-slate-200';
    case 'trip_reminder': return 'bg-teal-50 border-teal-200';
    case 'permission_created': return 'bg-blue-50 border-blue-200';
    case 'restriction_added': return 'bg-red-50 border-red-200';
    default: return 'bg-slate-50 border-slate-200';
  }
}

export default function StudentNotificationsView() {
  const [notifications, setNotifications] = useState<StudentNotification[]>(MOCK_STUDENT_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markRead(id: string) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800">Notificaciones</h1>
              <p className="text-xs text-slate-500">{unreadCount} sin leer</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-emerald-100">
              <CheckCheck size={14} /> Marcar todas
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all' as const, label: `Todas (${notifications.length})` },
            { key: 'unread' as const, label: `Sin leer (${unreadCount})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f.key ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">Sin notificaciones</p>
              <p className="text-xs">Estás al día 🎉</p>
            </div>
          ) : (
            filtered
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(n => (
                <button key={n.id} onClick={() => markRead(n.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${getNotifColor(n.type)} ${!n.read ? 'shadow-sm' : 'opacity-70'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{n.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold ${!n.read ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={9} /> {timeAgo(n.timestamp)}
                        <span>•</span>
                        {new Date(n.timestamp).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
