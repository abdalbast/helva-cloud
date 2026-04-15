# CRM Contact Import Dead Ends

_Source note: I could not access a local chat transcript cache, so this summary is based on the repo history and the current import implementation._

## Symptom

On `/app/crm/contacts`, pasting email addresses and trying to import them still fails or appears to do nothing. The root cause has shifted across attempts.

## Tried And Failed

- Client-side email parsing in [`src/components/import-dialog.tsx`](/Users/abdalbastkhdhir/development/Helva-Cloud/src/components/import-dialog.tsx) via `parseEmails(...)`.
- Regex-based text extraction in [`convex/importContacts.ts`](/Users/abdalbastkhdhir/development/Helva-Cloud/convex/importContacts.ts) via `parseFromText(...)`.
- Convex import action flow in [`convex/importContacts.ts`](/Users/abdalbastkhdhir/development/Helva-Cloud/convex/importContacts.ts) with duplicate checks, company caching, and auth gating.
- Fallback import via [`src/app/api/import/route.ts`](/Users/abdalbastkhdhir/development/Helva-Cloud/src/app/api/import/route.ts) using bearer-token or admin-secret handling.
- E2E coverage added in [`scripts/e2e-import.spec.ts`](/Users/abdalbastkhdhir/development/Helva-Cloud/scripts/e2e-import.spec.ts) to verify the signed-in CRM import path.
- Extra import-related test coverage in [`convex/importContacts.test.ts`](/Users/abdalbastkhdhir/development/Helva-Cloud/convex/importContacts.test.ts).

## Not Worth Repeating For This Bug

- File upload import and URL extraction flows are still marked as coming soon in the UI.
- More auth-only fixes are unlikely to solve the paste-to-import failure on their own.
- More regex tweaks alone are unlikely to be enough if the UI event flow or action wiring is the real breakage.

## Current Working Assumptions

- The bug is not just "missing parser logic"; it has shown up under multiple different implementations.
- Any next attempt should focus on a new angle, not another small variation of the same parse/import path.
