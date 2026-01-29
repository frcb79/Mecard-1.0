
import { Notification, NotificationType } from '../types';

export class NotificationService {
  private static STORAGE_KEY = 'mecard_notifications_v1';

  static getNotifications(recipientId: string): Notification[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const all: Notification[] = saved ? JSON.parse(saved) : [];
    return all.filter(n => n.recipientId === recipientId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  static send(recipientId: string, type: NotificationType, title: string, body: string) {
    const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const newNotification: Notification = {
      id: `not_${Date.now()}`,
      recipientId,
      type,
      title,
      body,
      readAt: null,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([newNotification, ...notifications]));
    return newNotification;
  }

  static markAsRead(id: string) {
    const notifications: Notification[] = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const updated = notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }
}
