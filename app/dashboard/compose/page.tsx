import ComposeWorkbench from '@/components/compose/ComposeWorkbench';
import { getClientApiBase, getIdentities, getTemplates } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ComposePage() {
  const [identities, templates] = await Promise.all([getIdentities(), getTemplates()]);

  return <ComposeWorkbench identities={identities} templates={templates} apiBase={getClientApiBase()} />;
}
