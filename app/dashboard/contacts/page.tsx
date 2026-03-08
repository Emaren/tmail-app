import ContactsWorkspace from '@/components/contacts/ContactsWorkspace';
import { getClientApiBase, getContacts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const contacts = await getContacts();
  return <ContactsWorkspace contacts={contacts} apiBase={getClientApiBase()} />;
}
