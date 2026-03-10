import { useAuth } from '../hooks/useAuth';
import { RewardsMarketplace } from '../_phase2/RewardsMarketplace';

export default function RewardsMarketplacePage() {
  const { user } = useAuth();
  const studentId = (user as any)?.studentId || user?.id || '';
  const schoolId = (user as any)?.schoolId || 'mx_01';

  return <RewardsMarketplace studentId={studentId} schoolId={schoolId} />;
}
