import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { fetchAction } from "convex/nextjs";
import { z } from "zod";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { timingSafeEqualString } from "@/lib/timing-safe";

const ContactInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const BodySchema = z.object({
  contacts: z.array(ContactInputSchema),
});

type ContactInput = z.infer<typeof ContactInputSchema>;

function getBearerToken(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }
  const token = authorization.slice("Bearer ".length).trim();
  return token || undefined;
}

function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isImportAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Unauthenticated") ||
    message.includes("Authenticated identity is missing an email")
  );
}

export async function POST(req: Request) {
  const headerEmail = req.headers.get("X-Import-Email");
  const headerSecret = req.headers.get("X-Import-Secret");
  const adminSecret = process.env.ADMIN_IMPORT_SECRET;
  const hasAdminHeaders = headerEmail !== null || headerSecret !== null;

  if (hasAdminHeaders) {
    if (!headerEmail || !headerSecret) {
      return Response.json(
        { error: "Admin import requires both X-Import-Email and X-Import-Secret" },
        { status: 400 },
      );
    }
    if (!adminSecret) {
      return Response.json(
        { error: "Server admin import is not configured" },
        { status: 500 },
      );
    }
  }

  const isAdminRequest =
    !!headerEmail &&
    !!headerSecret &&
    !!adminSecret &&
    timingSafeEqualString(headerSecret, adminSecret);

  let token: string | undefined;

  if (!isAdminRequest) {
    if (hasAdminHeaders) {
      return unauthorizedResponse();
    }
    // The client can remain authenticated via Convex local storage even when the
    // server-side auth cookie is missing or stale, so accept the same-origin
    // bearer token as a fallback for import requests.
    token = getBearerToken(req) ?? (await convexAuthNextjsToken());
    if (!token) return unauthorizedResponse();
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const contactsInput: ContactInput[] = parsed.data.contacts;

  if (contactsInput.length === 0) {
    return Response.json({ created: 0, skipped: 0, failed: 0 });
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  if (isAdminRequest) {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const adminArgs = { adminSecret: headerSecret!, userEmail: headerEmail! };

    const [existingCompanies, existingContacts] = await Promise.all([
      convex.action(api.adminImport.listCompanies, adminArgs),
      convex.action(api.adminImport.listContacts, adminArgs),
    ]);

    const existingEmailSet = new Set(
      existingContacts.map((c) => c.email?.toLowerCase()).filter(Boolean),
    );
    const companyCache = new Map<string, Id<"companies">>(
      existingCompanies.map((c) => [c.name.toLowerCase(), c._id]),
    );

    for (const contact of contactsInput) {
      try {
        let companyId: Id<"companies"> | undefined;
        if (contact.company) {
          const key = contact.company.toLowerCase();
          if (!companyCache.has(key)) {
            const id = await convex.action(api.adminImport.createCompany, {
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
        await convex.action(api.adminImport.createContact, {
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
    try {
      const result = await fetchAction(
        api.importContacts.importMany,
        { contacts: contactsInput },
        { token },
      );
      return Response.json(result);
    } catch (error) {
      if (isImportAuthError(error)) {
        return unauthorizedResponse();
      }
      return Response.json({ error: "Import failed" }, { status: 500 });
    }
  }

  return Response.json({ created, skipped, failed });
}
