
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ShoppingCart, AlertTriangle, ShieldCheck, Landmark } from 'lucide-react';
import { NotificationService } from '../services/notificationService';
import { Notification, NotificationType } from '../types';

export const NotificationCenter: React.FC<{ userId: string }> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = () => setNotifications(NotificationService.getNotifications(userId));
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const getIcon = (type: NotificationType) => {
    switch(type) {
      case NotificationType.PURCHASE_ALERT: return <ShoppingCart size={18} className="text-indigo-600"/>;
      case NotificationType.LOW_BALANCE: return <AlertTriangle size={18} className="text-rose-500"/>;
      case NotificationType.LOW_STOCK_ALERT: return <AlertTriangle size={18} className="text-amber-500"/>;
      case NotificationType.DEPOSIT_CONFIRMED: return <ShieldCheck size={18} className="text-emerald-500"/>;
      case NotificationType.SETTLEMENT_READY: return <Landmark size={18} className="text-indigo-600"/>;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-3 hover:bg-slate-100 rounded-2xl transition-all group">
        <Bell size={24} className="text-slate-400 group-hover:text-indigo-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-4 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-white rounded-[40px] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">Alertas</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={18}/></button>
            </div>
            <div className="max-h-[480px] overflow-y-auto p-4 space-y-2">
              {notifications.length === 0 ? (
                <div className="p-12 text-center opacity-20"><Bell size={48} className="mx-auto mb-4"/><p className="font-black uppercase text-[10px] tracking-widest">Sin notificaciones</p></div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => NotificationService.markAsRead(n.id)} className={`p-6 rounded-3xl border transition-all cursor-pointer ${!n.readAt ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-sm leading-tight">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-3 tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</p>
                      </div>
                      {!n.readAt && <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-2"></div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
