
import Papa from 'papaparse';
import { CLABEService } from './clabeService';
import { StudentProfile } from '../types';

export interface StudentImportRow {
  nombre_completo: string;
  curp: string;
  grado: string;
  seccion?: string;
  tutor_nombre: string;
  tutor_email: string;
  tutor_telefono: string;
  limite_diario?: string;
  alergias?: string;
  fecha_nacimiento?: string;
  numero_matricula?: string;
}

export interface ValidationResult {
  row: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: StudentImportRow;
}

export interface ImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  studentsCreated: number;
  parentsCreated: number;
  parentsLinked: number;
  newStudents: StudentProfile[];
  errors: ValidationResult[];
}

export class StudentImportService {
  
  /**
   * Valida formato de CURP mexicano (Regex oficial)
   */
  private static validateCURP(curp: string): boolean {
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
    return curpRegex.test(curp.toUpperCase());
  }
  
  /**
   * Valida formato de email
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Valida formato de teléfono mexicano (10 dígitos)
   */
  private static validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  }
  
  /**
   * Parsea archivo CSV
   */
  static async parseCSV(file: File): Promise<StudentImportRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_'),
        complete: (results) => {
          resolve(results.data as StudentImportRow[]);
        },
        error: (error: any) => {
          reject(new Error(`Error al leer CSV: ${error.message}`));
        }
      });
    });
  }
  
  /**
   * Valida todas las filas del CSV
   */
  static async validateRows(
    rows: StudentImportRow[],
    existingStudents: StudentProfile[]
  ): Promise<ValidationResult[]> {
    
    const results: ValidationResult[] = [];
    const existingCURPs = new Set(existingStudents.map(s => s.curp?.toUpperCase() || ''));
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Validación: Nombre completo
      if (!row.nombre_completo || row.nombre_completo.trim().length < 3) {
        errors.push('Nombre completo es obligatorio (mínimo 3 caracteres)');
      }
      
      // Validación: CURP
      if (!row.curp) {
        errors.push('CURP es obligatorio');
      } else if (!this.validateCURP(row.curp)) {
        errors.push('CURP tiene formato inválido (ej: MELR930101HDFLPN09)');
      } else if (existingCURPs.has(row.curp.toUpperCase())) {
        errors.push('CURP ya existe en el sistema');
      }
      
      // Validación: Grado
      if (!row.grado || row.grado.trim().length === 0) {
        errors.push('Grado es obligatorio');
      }
      
      // Validación: Tutor email
      if (!row.tutor_email) {
        errors.push('Email del tutor es obligatorio');
      } else if (!this.validateEmail(row.tutor_email)) {
        errors.push('Email del tutor tiene formato inválido');
      }
      
      // Validación: Tutor teléfono
      if (!row.tutor_telefono) {
        errors.push('Teléfono del tutor es obligatorio');
      } else if (!this.validatePhone(row.tutor_telefono)) {
        errors.push('Teléfono debe tener exactamente 10 dígitos');
      }
      
      results.push({
        row: i + 1,
        valid: errors.length === 0,
        errors,
        warnings,
        data: row
      });
    }
    
    return results;
  }
  
  /**
   * Simula importación masiva generando perfiles de estudiante
   */
  static async importStudents(
    validResults: ValidationResult[],
    schoolId: string,
    stpCostCenter: string
  ): Promise<ImportResult> {
    
    const newStudents: StudentProfile[] = [];
    let studentsCreated = 0;
    
    for (const result of validResults) {
      if (!result.valid || !result.data) continue;
      
      const row = result.data;
      const studentId = row.numero_matricula || `S${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
      
      const student: StudentProfile = {
        id: studentId,
        name: row.nombre_completo,
        grade: `${row.grado} ${row.seccion || ''}`.trim(),
        photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
        schoolId,
        balance: 0,
        dailyLimit: row.limite_diario ? parseFloat(row.limite_diario) : 100,
        spentToday: 0,
        restrictedCategories: [],
        restrictedProducts: [],
        allergies: row.alergias ? row.alergias.split(',').map(a => a.trim()).filter(Boolean) : [],
        parentName: row.tutor_nombre,
        status: 'Active',
        enrollmentDate: new Date().toISOString(),
        clabePersonal: CLABEService.generateStudentCLABE(stpCostCenter, studentId),
        curp: row.curp.toUpperCase()
      };
      
      newStudents.push(student);
      studentsCreated++;
    }
    
    return {
      totalRows: validResults.length,
      validRows: studentsCreated,
      invalidRows: 0,
      studentsCreated,
      parentsCreated: studentsCreated, 
      parentsLinked: studentsCreated,
      newStudents,
      errors: []
    };
  }
  
  static generateTemplate(): string {
    const headers = [
      'nombre_completo', 'curp', 'grado', 'seccion', 
      'numero_matricula', 'fecha_nacimiento', 'tutor_nombre', 
      'tutor_email', 'tutor_telefono', 'limite_diario', 'alergias'
    ];
    const example = [
      'Juan Perez Lopez', 'PELJ050815HDFRNN09', '5', 'A', 
      'A2024001', '2015-08-15', 'Maria Lopez Garcia', 
      'maria@email.com', '5512345678', '150', 'Nueces, Lactosa'
    ];
    return [headers.join(','), example.join(',')].join('\n');
  }
}
