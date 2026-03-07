import IdentityManager from '@/components/identities/IdentityManager';
import { getClientApiBase, getIdentities } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function IdentitiesPage() {
  const identities = await getIdentities();

  return <IdentityManager identities={identities} apiBase={getClientApiBase()} />;
}
