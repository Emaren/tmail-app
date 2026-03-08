import CampaignWorkspace from '@/components/campaigns/CampaignWorkspace';
import { getCampaignSchedulerStatus, getCampaigns, getClientApiBase, getIdentities, getSegments, getTemplates } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const [campaigns, identities, templates, segments, scheduler] = await Promise.all([
    getCampaigns(),
    getIdentities(),
    getTemplates(),
    getSegments(),
    getCampaignSchedulerStatus(),
  ]);

  return (
    <CampaignWorkspace
      campaigns={campaigns}
      identities={identities}
      templates={templates}
      segments={segments}
      scheduler={scheduler}
      apiBase={getClientApiBase()}
    />
  );
}
