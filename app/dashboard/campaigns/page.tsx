import CampaignWorkspace from '@/components/campaigns/CampaignWorkspace';
import { getCampaigns, getClientApiBase, getIdentities, getTemplates } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const [campaigns, identities, templates] = await Promise.all([getCampaigns(), getIdentities(), getTemplates()]);

  return <CampaignWorkspace campaigns={campaigns} identities={identities} templates={templates} apiBase={getClientApiBase()} />;
}
