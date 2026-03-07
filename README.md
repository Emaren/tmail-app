# tmail-app

Premium Next.js admin frontend for TMail.

## Current Focus

Phase 1 turns the old single-page dashboard into the permanent operator shell:

- `/dashboard`
- `/dashboard/compose`
- `/dashboard/messages`
- `/dashboard/messages/[messageId]`
- `/dashboard/identities`
- `/dashboard/deliverability`
- `/dashboard/settings`

## Product Direction

TMail is not a mailbox provider. It is the intelligence layer where you:

- compose messages
- validate messages
- send through trusted rails
- inspect deliverability and engagement

Apple SMTP is the initial send rail.

## Development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` or `TMAIL_API_URL` to point at the API if you want live stats instead of mock fallback data.
