import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

type ContactInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  country?: string;
  notes?: string;
};

function getBearerToken(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }
  const token = authorization.slice("Bearer ".length).trim();
  return token || undefined;
}

export async function POST(req: Request) {
  const headerEmail = req.headers.get("X-Import-Email");
  const headerSecret = req.headers.get("X-Import-Secret");
  const adminSecret = process.env.ADMIN_IMPORT_SECRET;

  const isAdminRequest =
    !!headerEmail && !!headerSecret && !!adminSecret && headerSecret === adminSecret;

  let token: string | undefined;

  if (!isAdminRequest) {
    // The client can remain authenticated via Convex local storage even when the
    // server-side auth cookie is missing or stale, so accept the same-origin
    // bearer token as a fallback for import requests.
    token = getBearerToken(req) ?? (await convexAuthNextjsToken());
    if (!token) return new Response(null, { status: 401 });
  }

  const { contacts }: { contacts: ContactInput[] } = await req.json();

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return Response.json({ created: 0, skipped: 0, failed: 0 });
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  if (isAdminRequest) {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const adminArgs = { adminSecret: adminSecret!, userEmail: headerEmail! };

    const [existingCompanies, existingContacts] = await Promise.all([
      convex.mutation(api.adminImport.listCompanies, adminArgs),
      convex.mutation(api.adminImport.listContacts, adminArgs),
    ]);

    const existingEmailSet = new Set(
      existingContacts.map((c) => c.email?.toLowerCase()).filter(Boolean),
    );
    const companyCache = new Map<string, Id<"companies">>(
      existingCompanies.map((c) => [c.name.toLowerCase(), c._id]),
    );

    for (const contact of contacts) {
      try {
        let companyId: Id<"companies"> | undefined;
        if (contact.company) {
          const key = contact.company.toLowerCase();
          if (!companyCache.has(key)) {
            const id = await convex.mutation(api.adminImport.createCompany, {
              ...adminArgs,
              name: contact.company,
            });
            companyCache.set(key, id);
          }
          companyId = companyCache.get(key);
        }
        if (contact.email && existingEmailSet.has(contact.email.toLowerCase())) {
          skipped++;
          continue;
        }
        await convex.mutation(api.adminImport.createContact, {
          ...adminArgs,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email ?? null,
          companyId: companyId ?? null,
          country: contact.country ?? null,
        });
        if (contact.email) existingEmailSet.add(contact.email.toLowerCase());
        created++;
      } catch {
        failed++;
      }
    }
  } else {
    const opts = { token };
    const [existingContacts, existingCompanies] = await Promise.all([
      fetchQuery(api.contacts.list, {}, opts),
      fetchQuery(api.companies.list, {}, opts),
    ]);

    const existingEmailSet = new Set(
      existingContacts.map((c) => c.email?.toLowerCase()).filter(Boolean),
    );
    const companyCache = new Map<string, Id<"companies">>(
      existingCompanies.map((c) => [c.name.toLowerCase(), c._id]),
    );

    for (const contact of contacts) {
      try {
        let companyId: Id<"companies"> | undefined;
        if (contact.company) {
          const key = contact.company.toLowerCase();
          if (!companyCache.has(key)) {
            const id = await fetchMutation(
              api.companies.create,
              { name: contact.company },
              opts,
            );
            companyCache.set(key, id);
          }
          companyId = companyCache.get(key);
        }
        if (contact.email && existingEmailSet.has(contact.email.toLowerCase())) {
          skipped++;
          continue;
        }
        await fetchMutation(
          api.contacts.create,
          {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            companyId,
            country: contact.country,
          },
          opts,
        );
        if (contact.email) existingEmailSet.add(contact.email.toLowerCase());
        created++;
      } catch {
        failed++;
      }
    }
  }

  return Response.json({ created, skipped, failed });
}
