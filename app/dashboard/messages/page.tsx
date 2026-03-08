import MessageSnapshotCard from '@/components/messages/MessageSnapshotCard';
import Panel from '@/components/shell/Panel';
import { getMessages } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const messages = await getMessages();

  return (
    <Panel title="Messages" kicker="Forensics and send history" className="pb-2">
      <div className="space-y-4">
        {messages.map((message) => <MessageSnapshotCard key={message.id} message={message} />)}
      </div>
    </Panel>
  );
}
