
import { Transaction, School, OperatingUnit, Settlement, SettlementStatus, Disbursement } from '../types';

export class SettlementService {
  /**
   * Calcula la liquidación neta para un período dado
   */
  static calculate(
    school: School,
    units: OperatingUnit[],
    transactions: Transaction[],
    periodStart: Date,
    periodEnd: Date
  ): Settlement {
    const periodTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'purchase' && txDate >= periodStart && txDate <= periodEnd;
    });

    const grossRevenue = periodTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const platformCommission = grossRevenue * 0.045; // 4.5% Fee MeCard Fixed

    let totalSchoolShare = 0;
    let totalVendorShare = 0;
    const disbursements: Disbursement[] = [];

    // Agrupar por unidad
    units.forEach(unit => {
      const unitTxs = periodTransactions.filter(tx => tx.unitId === unit.id);
      const unitRevenue = unitTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      if (unitRevenue <= 0) return;

      if (unit.ownerType === 'SCHOOL') {
        const netForSchool = unitRevenue - (unitRevenue * 0.045);
        totalSchoolShare += netForSchool;
      } else {
        const schoolCommission = unitRevenue * ((unit.commissionPercent || 0) / 100);
        const vendorNet = unitRevenue - schoolCommission - (unitRevenue * 0.045);
        
        totalSchoolShare += schoolCommission;
        totalVendorShare += vendorNet;

        disbursements.push({
          id: `disb_${Date.now()}_${unit.id}`,
          recipientType: 'VENDOR',
          recipientName: unit.vendorName || unit.name,
          amount: vendorNet,
          clabe: unit.vendorCLABE || '000000000000000000',
          status: 'PENDING'
        });
      }
    });

    // Agregar el disbursement principal del colegio
    if (totalSchoolShare > 0) {
      disbursements.push({
        id: `disb_school_${Date.now()}`,
        recipientType: 'SCHOOL',
        recipientName: school.name,
        amount: totalSchoolShare,
        clabe: school.settlementCLABE || '000000000000000000',
        status: 'PENDING'
      });
    }

    return {
      id: `set_${Date.now()}`,
      schoolId: school.id,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      grossRevenue,
      platformCommission,
      schoolShare: totalSchoolShare,
      vendorShare: totalVendorShare,
      status: SettlementStatus.PENDING,
      disbursements,
      createdAt: new Date().toISOString()
    };
  }
}
