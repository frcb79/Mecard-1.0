/**
 * Alerting Service
 * Maneja alertas para padres sobre actividad de sus hijos
 */

import { supabaseClient } from './supabaseClient';

export interface Alert {
  id?: bigint;
  parentUserId: string;
  studentId: bigint;
  schoolId: bigint;
  type: 'high_spending' | 'limit_exceeded' | 'suspicious_activity' | 'balance_low';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface AlertConfig {
  id?: bigint;
  studentId: bigint;
  schoolId: bigint;
  dailyAlertThreshold: number; // Gasto diario que dispara alerta
  monthlyAlertThreshold: number; // Gasto mensual que dispara alerta
  lowBalanceThreshold: number; // Balance bajo que dispara alerta
  suspiciousActivityThreshold: number; // # de transacciones en corto tiempo
  notifyParent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class AlertingService {
  /**
   * Crea una alerta
   */
  async createAlert(alert: Alert): Promise<bigint | null> {
    try {
      const { data, error } = await supabaseClient
        .from('alerts')
        .insert({
          parent_user_id: alert.parentUserId,
          student_id: alert.studentId,
          school_id: alert.schoolId,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          is_read: false,
          metadata: alert.metadata || {},
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating alert:', error);
        return null;
      }

      return data.id;
    } catch (err) {
      console.error('Error in createAlert:', err);
      return null;
    }
  }

  /**
   * Obtiene alertas no leídas de un padre
   */
  async getUnreadAlerts(parentUserId: string, schoolId: bigint): Promise<Alert[]> {
    try {
      const { data, error } = await supabaseClient
        .from('alerts')
        .select('*')
        .eq('parent_user_id', parentUserId)
        .eq('school_id', schoolId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching unread alerts:', error);
        return [];
      }

      return (data || []).map((a) => ({
        id: a.id,
        parentUserId: a.parent_user_id,
        studentId: a.student_id,
        schoolId: a.school_id,
        type: a.type,
        title: a.title,
        message: a.message,
        severity: a.severity,
        isRead: a.is_read,
        createdAt: a.created_at,
        metadata: a.metadata,
      }));
    } catch (err) {
      console.error('Error in getUnreadAlerts:', err);
      return [];
    }
  }

  /**
   * Marca una alerta como leída
   */
  async markAlertAsRead(alertId: bigint): Promise<boolean> {
    try {
      const { error } = await supabaseClient.from('alerts').update({ is_read: true }).eq('id', alertId);

      if (error) {
        console.error('Error marking alert as read:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in markAlertAsRead:', err);
      return false;
    }
  }

  /**
   * Obtiene configuración de alertas para un estudiante
   */
  async getAlertConfig(studentId: bigint, schoolId: bigint): Promise<AlertConfig | null> {
    try {
      const { data, error } = await supabaseClient
        .from('alert_configs')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (!error && data) {
        return data;
      }

      // Si no existe, crear con defaults
      const { data: config } = await supabaseClient
        .from('alert_configs')
        .insert({
          student_id: studentId,
          school_id: schoolId,
          daily_alert_threshold: 50,
          monthly_alert_threshold: 500,
          low_balance_threshold: 10,
          suspicious_activity_threshold: 5,
          notify_parent: true,
        })
        .select()
        .single();

      return config || null;
    } catch (err) {
      console.error('Error in getAlertConfig:', err);
      return null;
    }
  }

  /**
   * Evalúa si debe crear alertas basado en transacción reciente
   */
  async evaluateAlertsForTransaction(studentId: bigint, schoolId: bigint, amount: number) {
    try {
      // Obtener padre del estudiante
      const { data: link } = await supabaseClient
        .from('parent_student_links')
        .select('parent_user_id')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (!link) {
        return;
      }

      const parentUserId = link.parent_user_id;

      // Obtener configuración de alertas
      const config = await this.getAlertConfig(studentId, schoolId);
      if (!config) {
        return;
      }

      // 1. Evaluar gasto del día
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayTxns } = await supabaseClient
        .from('transactions')
        .select('amount')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .eq('type', 'purchase')
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      const dailyTotal = (todayTxns || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);

      if (dailyTotal > config.daily_alert_threshold) {
        await this.createAlert({
          parentUserId,
          studentId,
          schoolId,
          type: 'high_spending',
          title: 'Gasto elevado hoy',
          message: `Tu hijo ha gastado $${dailyTotal.toFixed(2)} hoy (límite: $${config.daily_alert_threshold})`,
          severity: dailyTotal > config.daily_alert_threshold * 1.5 ? 'high' : 'medium',
          isRead: false,
          metadata: { dailyTotal, threshold: config.daily_alert_threshold },
        });
      }

      // 2. Evaluar balance bajo
      const { data: profile } = await supabaseClient
        .from('financial_profiles')
        .select('balance')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (profile && parseFloat(profile.balance) < config.low_balance_threshold) {
        await this.createAlert({
          parentUserId,
          studentId,
          schoolId,
          type: 'balance_low',
          title: 'Balance bajo',
          message: `El balance de tu hijo es bajo: $${parseFloat(profile.balance).toFixed(2)}`,
          severity: 'medium',
          isRead: false,
        });
      }

      // 3. Evaluar actividad sospechosa (múltiples transacciones)
      const lastHour = new Date(Date.now() - 60 * 60 * 1000);

      const { data: recentTxns } = await supabaseClient
        .from('transactions')
        .select('id')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .gte('created_at', lastHour.toISOString());

      if ((recentTxns || []).length > config.suspicious_activity_threshold) {
        await this.createAlert({
          parentUserId,
          studentId,
          schoolId,
          type: 'suspicious_activity',
          title: 'Actividad inusual detectada',
          message: `Se detectaron ${recentTxns?.length} transacciones en la última hora`,
          severity: 'high',
          isRead: false,
        });
      }
    } catch (err) {
      console.error('Error in evaluateAlertsForTransaction:', err);
    }
  }
}

export const alertingService = new AlertingService();
