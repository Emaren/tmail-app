import CampaignWorkspace from '@/components/campaigns/CampaignWorkspace';
import { getCampaignSchedulerStatus, getCampaigns, getClientApiBase, getIdentities, getTemplates } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const [campaigns, identities, templates, scheduler] = await Promise.all([
    getCampaigns(),
    getIdentities(),
    getTemplates(),
    getCampaignSchedulerStatus(),
  ]);

  return (
    <CampaignWorkspace
      campaigns={campaigns}
      identities={identities}
      templates={templates}
      scheduler={scheduler}
      apiBase={getClientApiBase()}
    />
  );
}
