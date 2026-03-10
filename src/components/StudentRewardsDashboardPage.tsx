import { useAuth } from '../hooks/useAuth';
import { StudentRewardsDashboard } from '../_phase2/StudentRewardsDashboard';

export default function StudentRewardsDashboardPage() {
  const { user } = useAuth();
  const studentId = (user as any)?.studentId || user?.id || '';
  const schoolId = (user as any)?.schoolId || 'mx_01';

  return <StudentRewardsDashboard studentId={studentId} schoolId={schoolId} />;
}
