import { useAuth } from '../hooks/useAuth';
import { StudentRewardsDashboard } from '../_phase2/StudentRewardsDashboard';

export default function StudentRewardsDashboardPage() {
  const { user } = useAuth();
  const studentId = (user as any)?.studentId || user?.id || '';
  const schoolId = user?.schoolId || '';

  return <StudentRewardsDashboard studentId={studentId} schoolId={schoolId} />;
}
