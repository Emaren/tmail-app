import ComposeWorkbench from '@/components/compose/ComposeWorkbench';
import { getClientApiBase, getIdentities } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ComposePage() {
  const identities = await getIdentities();

  return <ComposeWorkbench identities={identities} apiBase={getClientApiBase()} />;
}
