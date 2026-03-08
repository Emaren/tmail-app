import SettingsWorkspace from '@/components/settings/SettingsWorkspace';
import { getClientApiBase, getOperators } from '@/lib/api';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireSession();
  const operators = await getOperators();

  return <SettingsWorkspace session={session} operators={operators} apiBase={getClientApiBase()} />;
}
