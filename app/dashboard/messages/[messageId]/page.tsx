import { notFound } from 'next/navigation';
import MessageDetailWorkspace from '@/components/messages/MessageDetailWorkspace';
import { getClientApiBase, getMessageDetail } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function MessageDetailPage({ params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const message = await getMessageDetail(messageId);

  if (!message) {
    notFound();
  }

  return <MessageDetailWorkspace message={message} apiBase={getClientApiBase()} />;
}
