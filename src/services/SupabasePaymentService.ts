import { v4 as uuidv4 } from 'uuid';
import {
  PaymentServiceInterface,
  CartOrder,
  TransactionResult,
  DepositRequest,
  DepositResult,
  Disbursement,
} from './types';
import { supabase } from '../lib/supabaseClient';
import { posService } from './supabasePos';
import MockPaymentService from './MockPaymentService';
import { logger } from '../lib/logger';

interface ResolvedStudent {
  id: string;
  schoolId: string;
  balance: number;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export class SupabasePaymentService implements PaymentServiceInterface {
  private fallbackMock = new MockPaymentService(0);

  private async resolveStudent(
    studentIdentifier: string,
    fallbackSchoolId?: string
  ): Promise<ResolvedStudent> {
    if (!studentIdentifier) {
      throw new Error('studentId es requerido');
    }

    if (isUuid(studentIdentifier)) {
      const { data, error } = await supabase
        .from('students')
        .select('id, school_id, balance, user_id')
        .or(`id.eq.${studentIdentifier},user_id.eq.${studentIdentifier}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`No se pudo resolver alumno UUID: ${error.message}`);
      }

      if (data?.id && data.school_id) {
        return {
          id: data.id,
          schoolId: data.school_id,
          balance: Number(data.balance ?? 0),
        };
      }
    }

    const { data, error } = await supabase
      .from('students')
      .select('id, school_id, balance')
      .eq('student_id', studentIdentifier)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo resolver alumno por matrícula: ${error.message}`);
    }

    if (data?.id && data.school_id) {
      return {
        id: data.id,
        schoolId: data.school_id,
        balance: Number(data.balance ?? 0),
      };
    }

    if (fallbackSchoolId && isUuid(studentIdentifier)) {
      throw new Error(
        'Alumno no encontrado en tabla students. Verifica que exista vinculación students.user_id para el usuario autenticado.'
      );
    }

    throw new Error('Alumno no encontrado para operación POS');
  }

  private async resolveUnitId(
    schoolId: string,
    preferred?: string
  ): Promise<string> {
    if (preferred && isUuid(preferred)) {
      return preferred;
    }

    const { data, error } = await supabase
      .from('operating_units')
      .select('id')
      .eq('school_id', schoolId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo resolver unidad operativa: ${error.message}`);
    }

    if (!data?.id) {
      throw new Error('No hay operating_units disponibles para esta escuela');
    }

    return data.id;
  }

  async processTransaction(order: CartOrder): Promise<TransactionResult> {
    if (!order || !order.studentId || !order.total || order.total <= 0) {
      throw new Error('Orden POS inválida');
    }

    const resolved = await this.resolveStudent(order.studentId, order.schoolId);
    const metadata = (order.metadata ?? {}) as Record<string, unknown>;
    const unitIdRaw = typeof metadata.unitId === 'string' ? metadata.unitId : undefined;
    const unitId = await this.resolveUnitId(resolved.schoolId, unitIdRaw);

    const paymentMethodRaw = typeof metadata.paymentMethod === 'string'
      ? metadata.paymentMethod
      : 'qr';
    const paymentMethod =
      paymentMethodRaw === 'nfc' ||
      paymentMethodRaw === 'cash' ||
      paymentMethodRaw === 'card'
        ? paymentMethodRaw
        : 'qr';

    const idempotencyKey =
      typeof metadata.idempotencyKey === 'string'
        ? metadata.idempotencyKey
        : uuidv4();

    const sale = await posService.processSale({
      school_id: resolved.schoolId,
      unit_id: unitId,
      student_id: resolved.id,
      amount: order.total,
      items: order.items,
      payment_method: paymentMethod,
      idempotency_key: idempotencyKey,
    });

    return {
      transactionId: sale.id,
      status: 'completed',
      timestamp: new Date(),
      message: sale.is_duplicate
        ? 'Transacción ya procesada previamente (idempotencia)'
        : 'Transacción POS completada',
      previousBalance:
        typeof sale.balance_before === 'number'
          ? sale.balance_before
          : resolved.balance,
      newBalance:
        typeof sale.balance_after === 'number' ? sale.balance_after : undefined,
    };
  }

  async createDeposit(request: DepositRequest): Promise<DepositResult> {
    logger.warn('payments.supabase', 'createDeposit fallback to mock service');
    return this.fallbackMock.createDeposit(request);
  }

  async executeDisbursement(
    disbursement: Partial<Disbursement>
  ): Promise<Disbursement> {
    logger.warn('payments.supabase', 'executeDisbursement fallback to mock service');
    return this.fallbackMock.executeDisbursement(disbursement);
  }

  async refundTransaction(
    transactionId: string,
    reason: string
  ): Promise<TransactionResult> {
    logger.warn('payments.supabase', 'refundTransaction fallback to mock service');
    return this.fallbackMock.refundTransaction(transactionId, reason);
  }

  validateCLABE(clabe: string): boolean {
    return this.fallbackMock.validateCLABE(clabe);
  }

  async getTransactionHistory(
    studentId: string,
    limit: number = 50
  ): Promise<TransactionResult[]> {
    const resolved = await this.resolveStudent(studentId);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, status, created_at, amount')
      .eq('student_id', resolved.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`No se pudo cargar historial POS: ${error.message}`);
    }

    return (data || []).map((row) => ({
      transactionId: row.id,
      status:
        row.status === 'completed' || row.status === 'failed' || row.status === 'pending'
          ? row.status
          : 'pending',
      timestamp: new Date(row.created_at),
      message: `Monto: ${row.amount}`,
    }));
  }

  async getBalance(studentId: string): Promise<number> {
    const resolved = await this.resolveStudent(studentId);
    const { data, error } = await supabase
      .from('students')
      .select('balance')
      .eq('id', resolved.id)
      .single();

    if (error) {
      throw new Error(`No se pudo consultar balance: ${error.message}`);
    }

    return Number(data.balance ?? 0);
  }
}

export default SupabasePaymentService;