import SeedLabWorkspace from '@/components/seed/SeedLabWorkspace';
import { getClientApiBase, getIdentities, getSeedInboxes, getSeedRuns, getTemplates } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SeedTestsPage() {
  const [identities, templates, seedInboxes, seedRuns] = await Promise.all([
    getIdentities(),
    getTemplates(),
    getSeedInboxes(),
    getSeedRuns(),
  ]);

  return (
    <SeedLabWorkspace
      identities={identities}
      templates={templates}
      seedInboxes={seedInboxes}
      seedRuns={seedRuns}
      apiBase={getClientApiBase()}
    />
  );
}
