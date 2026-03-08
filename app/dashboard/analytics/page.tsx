import AnalyticsWorkspace from '@/components/analytics/AnalyticsWorkspace';
import { getAnalyticsSummary } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const data = await getAnalyticsSummary();
  return <AnalyticsWorkspace data={data} />;
}
