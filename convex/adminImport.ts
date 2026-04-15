import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const contactImportValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  role: v.optional(v.string()),
  company: v.optional(v.string()),
  country: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const importBatch = internalAction({
  args: {
    userEmail: v.string(),
    contacts: v.array(contactImportValidator),
  },
  handler: async (
    ctx,
    { userEmail, contacts },
  ): Promise<{ created: number; skipped: number; failed: number }> => {
    if (contacts.length === 0) {
      return { created: 0, skipped: 0, failed: 0 };
    }

    const [existingCompanies, existingContacts] = await Promise.all([
      ctx.runQuery(internal.adminImportInternal.listCompanies, { userEmail }),
      ctx.runQuery(internal.adminImportInternal.listContacts, { userEmail }),
    ]);

    const existingEmailSet = new Set(
      existingContacts
        .map((c) => c.email?.toLowerCase())
        .filter(Boolean),
    );
    const companyCache = new Map<string, Id<"companies">>(
      existingCompanies.map((c) => [c.name.toLowerCase(), c._id]),
    );

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        let companyId: Id<"companies"> | undefined;
        if (contact.company) {
          const key = contact.company.toLowerCase();
          if (!companyCache.has(key)) {
            const id = await ctx.runMutation(
              internal.adminImportInternal.createCompany,
              { userEmail, name: contact.company },
            );
            companyCache.set(key, id);
          }
          companyId = companyCache.get(key);
        }
        if (
          contact.email &&
          existingEmailSet.has(contact.email.toLowerCase())
        ) {
          skipped++;
          continue;
        }
        await ctx.runMutation(internal.adminImportInternal.createContact, {
          userEmail,
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

    return { created, skipped, failed };
  },
});
