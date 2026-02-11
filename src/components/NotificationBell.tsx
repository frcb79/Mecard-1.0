// ============================================
// ARCHIVO 4: components/NotificationBell.tsx
// ============================================

import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationBellProps {
  userId: string;
  role: string;
}

export function NotificationBell({ userId, role }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({ userId, role });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all relative group"
      >
        <Bell size={22} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center px-1">
            <span className="text-white text-[10px] font-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-4 w-96 max-h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Notificaciones
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {unreadCount} sin leer
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
                >
                  <Check size={14} />
                  Marcar todas
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-sm font-bold text-slate-400">
                    Sin notificaciones
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.readAt && markAsRead(notif.id)}
                      className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notif.readAt ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {!notif.readAt && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-2">
                            {new Date(notif.createdAt).toLocaleString('es-MX')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
