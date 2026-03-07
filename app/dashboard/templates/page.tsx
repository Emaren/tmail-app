import TemplateManager from '@/components/templates/TemplateManager';
import { getClientApiBase, getTemplates } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return <TemplateManager templates={templates} apiBase={getClientApiBase()} />;
}
