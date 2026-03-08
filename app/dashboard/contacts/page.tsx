import ContactsWorkspace from '@/components/contacts/ContactsWorkspace';
import { getClientApiBase, getContacts, getSegments } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const [contacts, segments] = await Promise.all([getContacts(), getSegments()]);
  return <ContactsWorkspace contacts={contacts} segments={segments} apiBase={getClientApiBase()} />;
}
