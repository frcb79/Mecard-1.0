
/**
 * CLABE Service - MeCard FinTech Layer
 * Implementa el algoritmo oficial de Banxico (Pesos 3, 7, 1)
 */

export class CLABEService {
  private static readonly BANCO_CODE = '646'; // STP
  private static readonly PLAZA_CODE = '180'; // CDMX
  private static readonly MECARD_PREFIX = '0000';

  /**
   * Calcula el dígito verificador (Posición 18)
   */
  private static calculateVerifier(base17: string): string {
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    let sum = 0;
    
    for (let i = 0; i < 17; i++) {
      const digit = parseInt(base17[i]);
      const weight = weights[i];
      sum += (digit * weight) % 10;
    }
    
    const mod = sum % 10;
    return mod === 0 ? '0' : (10 - mod).toString();
  }

  /**
   * Genera una CLABE única para un alumno basado en su ID de escuela y secuencia
   */
  static generateStudentCLABE(stpCostCenter: string, studentId: string): string {
    const cc = stpCostCenter.padStart(3, '0');
    const studentSeq = studentId.slice(-4).padStart(4, '0');
    
    const base17 = `${this.BANCO_CODE}${this.PLAZA_CODE}${this.MECARD_PREFIX}${cc}${studentSeq}`;
    const verifier = this.calculateVerifier(base17);
    
    return base17 + verifier;
  }

  /**
   * Valida una CLABE completa
   */
  static validate(clabe: string): boolean {
    if (clabe.length !== 18) return false;
    const base17 = clabe.substring(0, 17);
    const providedVerifier = clabe[17];
    return this.calculateVerifier(base17) === providedVerifier;
  }
}
