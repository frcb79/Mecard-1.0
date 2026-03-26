// ============================================
// ARCHIVO 2: hooks/useNotifications.ts
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Notification, NotificationType } from '../types';
import { logger } from '../lib/logger';

interface UseNotificationsProps {
  userId: string;
  role: string;
}

export function useNotifications({ userId, role }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar notificaciones
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data) {
          const mapped = data.map((n: any) => ({
            id: n.id,
            recipientId: n.recipient_id,
            recipientRole: role,
            type: n.type as NotificationType,
            title: n.title,
            body: n.body,
            data: n.data,
            readAt: n.read_at,
            createdAt: n.created_at,
            expiresAt: n.expires_at
          }));

          setNotifications(mapped);
          setUnreadCount(mapped.filter(n => !n.readAt).length);
        }
      } catch (err) {
        logger.error('hooks.notifications', 'Error loading notifications', err, {
          userId,
          role,
        });
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Suscripción a nuevas notificaciones
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new as any;
        setNotifications(prev => [{
          id: newNotif.id,
          recipientId: newNotif.recipient_id,
          recipientRole: role,
          type: newNotif.type,
          title: newNotif.title,
          body: newNotif.body,
          data: newNotif.data,
          readAt: null,
          createdAt: newNotif.created_at,
          expiresAt: newNotif.expires_at
        }, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role]);

  // Marcar como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      logger.error('hooks.notifications', 'Error marking notification as read', err, {
        userId,
        notificationId,
      });
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.readAt).map(n => n.id);

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      logger.error('hooks.notifications', 'Error marking all notifications as read', err, {
        userId,
        unreadCount,
      });
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
}
