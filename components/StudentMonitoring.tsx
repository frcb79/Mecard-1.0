import React, { useState, useEffect } from 'react';
import { spendingLimitsService, SpendingStatus } from '../services/spendingLimitsService';
import { alertingService } from '../services/alertingService';
import { financialService } from '../services/financialService';

interface StudentMonitoringProps {
  schoolId: bigint;
}

interface StudentMonitor {
  studentId: bigint;
  studentName: string;
  spendingStatus: SpendingStatus | null;
  unreadAlerts: number;
  balance: number;
}

export const StudentMonitoring: React.FC<StudentMonitoringProps> = ({ schoolId }) => {
  const [students, setStudents] = useState<StudentMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitor | null>(null);

  useEffect(() => {
    loadStudents();
  }, [schoolId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      // Esta es una versión simplificada. En producción, necesitarías una query para obtener todos los estudiantes
      setLoading(false);
    } catch (err) {
      console.error('Error loading students:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando estudiantes...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Monitoreo de Estudiantes</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No hay estudiantes para monitorear
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.studentId}
                    onClick={() => setSelectedStudent(student)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{student.studentName}</h4>
                      {student.unreadAlerts > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {student.unreadAlerts} alertas
                        </span>
                      )}
                    </div>

                    {student.spendingStatus && (
                      <div className="space-y-2">
                        {/* Daily Spending */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Gasto Diario</span>
                            <span className="text-gray-800 font-medium">
                              ${student.spendingStatus.dailySpent.toFixed(2)} / $
                              {student.spendingStatus.dailyLimit.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                student.spendingStatus.dailyPercentage > 80
                                  ? 'bg-red-500'
                                  : student.spendingStatus.dailyPercentage > 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  student.spendingStatus.dailyPercentage,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Monthly Spending */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Gasto Mensual</span>
                            <span className="text-gray-800 font-medium">
                              ${student.spendingStatus.monthlySpent.toFixed(2)} / $
                              {student.spendingStatus.monthlyLimit.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                student.spendingStatus.monthlyPercentage > 80
                                  ? 'bg-red-500'
                                  : student.spendingStatus.monthlyPercentage > 50
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{
                                width: `${Math.min(
                                  student.spendingStatus.monthlyPercentage,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Balance */}
                        <div className="text-sm text-gray-600 mt-2">
                          Balance: <span className="font-medium text-gray-800">${student.balance.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Student Details */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">{selectedStudent.studentName}</h4>

            {selectedStudent.spendingStatus && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Saldo Disponible</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${selectedStudent.balance.toFixed(2)}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Saldo Restante (Hoy)</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedStudent.spendingStatus.remainingDaily.toFixed(2)}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Saldo Restante (Mes)</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ${selectedStudent.spendingStatus.remainingMonthly.toFixed(2)}
                  </div>
                </div>

                <button
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                  onClick={() => setSelectedStudent(null)}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
