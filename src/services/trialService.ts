
/**
 * Trial Service - MeCard Global Control
 */

export interface TrialStatus {
  isExpired: boolean;
  shouldNotify: boolean;
  daysRemaining: number;
  expiryDate: Date;
}

export const checkTrialExpiry = (createdAt: string | Date, durationMonths: number): TrialStatus => {
  const createdDate = new Date(createdAt);
  const expiryDate = new Date(createdDate);
  
  // Sumar meses de prueba
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    isExpired: diffDays <= 0,
    shouldNotify: diffDays <= 5 && diffDays > 0, // Notificar 5 días antes
    daysRemaining: diffDays,
    expiryDate
  };
};

export const getTrialWarningMessage = (status: TrialStatus, schoolName: string): string => {
  if (status.isExpired) {
    return `⚠️ El periodo de prueba de ${schoolName} ha expirado. Por favor, actualiza el contrato a Estándar.`;
  }
  if (status.shouldNotify) {
    return `🔔 El periodo de prueba de ${schoolName} vence en ${status.daysRemaining} días (${status.expiryDate.toLocaleDateString()}).`;
  }
  return '';
};
