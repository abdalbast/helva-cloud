import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { mergeTenantResults, requireViewerIdentity } from "./lib/auth";

type ContactImportInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  country?: string;
  notes?: string;
};

type ImportSummary = {
  created: number;
  skipped: number;
  failed: number;
};

type ViewerImportState = {
  contacts: Doc<"contacts">[];
  companies: Doc<"companies">[];
};

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

export const parseFromText = action({
  args: { text: v.string() },
  handler: async (ctx, { text }): Promise<ContactImportInput[]> => {
    // Simple extraction without LLM for now - pattern matching approach
    const contacts: ContactImportInput[] = [];
    
    // Split by common delimiters (newlines, double newlines)
    const blocks = text.split(/\n\n+|\r\n\r\n+/).filter(b => b.trim().length > 10);
    
    for (const block of blocks) {
      const contact = extractContactFromBlock(block);
      if (contact && contact.firstName && contact.lastName) {
        contacts.push(contact);
      }
    }
    
    // If no contacts found with block splitting, try whole text
    if (contacts.length === 0) {
      const contact = extractContactFromBlock(text);
      if (contact && contact.firstName && contact.lastName) {
        contacts.push(contact);
      }
    }
    
    return contacts;
  },
});

export const listViewerImportState = internalQuery({
  args: {},
  handler: async (ctx): Promise<ViewerImportState> => {
    const viewer = await requireViewerIdentity(ctx);

    const [contactsByAuthSubject, contactsByEmail, companiesByAuthSubject, companiesByEmail] =
      await Promise.all([
        ctx.db
          .query("contacts")
          .withIndex("by_auth_subject", (q) =>
            q.eq("authSubject", viewer.authSubject),
          )
          .collect(),
        ctx.db
          .query("contacts")
          .withIndex("by_user", (q) => q.eq("userEmail", viewer.email))
          .collect(),
        ctx.db
          .query("companies")
          .withIndex("by_auth_subject", (q) =>
            q.eq("authSubject", viewer.authSubject),
          )
          .collect(),
        ctx.db
          .query("companies")
          .withIndex("by_user", (q) => q.eq("userEmail", viewer.email))
          .collect(),
      ]);

    return {
      contacts: mergeTenantResults(contactsByAuthSubject, contactsByEmail),
      companies: mergeTenantResults(companiesByAuthSubject, companiesByEmail),
    };
  },
});

export const createCompanyForViewer = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, { name }): Promise<Id<"companies">> => {
    const viewer = await requireViewerIdentity(ctx);
    return await ctx.db.insert("companies", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      name,
      website: null,
      industry: null,
      size: null,
      notes: null,
    });
  },
});

export const createContactForViewer = internalMutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    role: v.union(v.string(), v.null()),
    companyId: v.union(v.id("companies"), v.null()),
    country: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args): Promise<Id<"contacts">> => {
    const viewer = await requireViewerIdentity(ctx);
    return await ctx.db.insert("contacts", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      role: args.role,
      companyId: args.companyId,
      country: args.country,
      notes: args.notes,
    });
  },
});

export const importMany = action({
  args: {
    contacts: v.array(contactImportValidator),
  },
  handler: async (ctx, { contacts }): Promise<ImportSummary> => {
    await requireViewerIdentity(ctx);

    if (contacts.length === 0) {
      return { created: 0, skipped: 0, failed: 0 };
    }

    const { contacts: existingContacts, companies: existingCompanies }: ViewerImportState =
      await ctx.runQuery(internal.importContacts.listViewerImportState, {});

    const existingEmailSet = new Set(
      existingContacts
        .map((contact) => normalizeEmailKey(contact.email))
        .filter((email): email is string => email !== null),
    );
    const batchEmailSet = new Set<string>();
    const companyCache = new Map<string, Id<"companies">>();

    for (const company of existingCompanies) {
      const companyKey = normalizeCompanyKey(company.name);
      if (companyKey && !companyCache.has(companyKey)) {
        companyCache.set(companyKey, company._id);
      }
    }

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const contact of contacts) {
      const emailKey = normalizeEmailKey(contact.email);
      if (emailKey) {
        if (existingEmailSet.has(emailKey) || batchEmailSet.has(emailKey)) {
          skipped++;
          continue;
        }
        batchEmailSet.add(emailKey);
      }

      const firstName = normalizeOptionalString(contact.firstName);
      const lastName = normalizeOptionalString(contact.lastName);
      if (!firstName || !lastName) {
        failed++;
        continue;
      }

      try {
        let companyId: Id<"companies"> | null = null;
        const companyName = normalizeOptionalString(contact.company);

        if (companyName) {
          const companyKey = normalizeCompanyKey(companyName);
          if (companyKey) {
            companyId = companyCache.get(companyKey) ?? null;
            if (!companyId) {
              companyId = await ctx.runMutation(
                internal.importContacts.createCompanyForViewer,
                { name: companyName },
              );
              companyCache.set(companyKey, companyId);
            }
          }
        }

        await ctx.runMutation(internal.importContacts.createContactForViewer, {
          firstName,
          lastName,
          email: toNullable(normalizeOptionalString(contact.email)),
          phone: toNullable(normalizeOptionalString(contact.phone)),
          role: toNullable(normalizeOptionalString(contact.role)),
          companyId,
          country: toNullable(normalizeOptionalString(contact.country)),
          notes: toNullable(normalizeOptionalString(contact.notes)),
        });

        if (emailKey) {
          existingEmailSet.add(emailKey);
        }
        created++;
      } catch {
        failed++;
      }
    }

    return { created, skipped, failed };
  },
});

function extractContactFromBlock(text: string): ContactImportInput | null {
  const lines = text.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
  
  let firstName = "";
  let lastName = "";
  let email = "";
  let phone = "";
  let role = "";
  let company = "";
  let notes = "";
  
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];
  
  // Extract phone (various formats)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];
  
  // Try to find name patterns
  // Pattern: "First Last" at start or after labels like "Name:"
  const namePatterns = [
    /(?:^|\n)Name[:\s]+([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
    /(?:^|\n)([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s*-|\s*\(|\s*at\s+|\s*,|\s*\n)/,
    /(?:^|\n)([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\r?\n|$)/,
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      firstName = match[1];
      lastName = match[2];
      break;
    }
  }
  
  // If no name found, try capitalized words at start
  if (!firstName && lines.length > 0) {
    const firstLine = lines[0];
    const nameMatch = firstLine.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/);
    if (nameMatch) {
      firstName = nameMatch[1];
      lastName = nameMatch[2];
    }
  }
  
  // Extract role/job title
  const rolePatterns = [
    /(?:^|\n)(?:Role|Title|Position|Job)[:\s]+([^\n]+)/i,
    /\b(VP\s+of\s+[^,\n]+|Senior\s+[^,\n]+|Head\s+of\s+[^,\n]+|Director\s+of\s+[^,\n]+|Manager\s+[^,\n]+|CEO|CTO|CFO|COO|Founder|Co-Founder)\b/i,
  ];
  
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match) {
      role = match[1].trim();
      break;
    }
  }
  
  // Extract company
  const companyPatterns = [
    /(?:^|\n)(?:Company|Organization|Org|at\s+the\s+)([:\s]+)?([^\n,]+)/i,
    /\bat\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s*$|\s*\n|\s*-)/,
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const potentialCompany = (match[2] || match[1])?.trim();
      if (potentialCompany && potentialCompany.length > 1 && potentialCompany.length < 50) {
        company = potentialCompany;
        break;
      }
    }
  }
  
  // Remaining lines as notes (excluding identified fields)
  const noteLines = lines.filter(l => 
    l !== `${firstName} ${lastName}` &&
    l !== email &&
    l !== phone &&
    l !== role &&
    l !== company &&
    !l.includes(email) &&
    !l.includes(phone) &&
    !l.toLowerCase().includes('name:') &&
    !l.toLowerCase().includes('email:') &&
    !l.toLowerCase().includes('phone:')
  );
  
  if (noteLines.length > 0) {
    notes = noteLines.join('\n').substring(0, 500);
  }
  
  if (!firstName || !lastName) return null;
  
  return {
    firstName,
    lastName,
    ...(email && { email }),
    ...(phone && { phone }),
    ...(role && { role }),
    ...(company && { company }),
    ...(notes && { notes }),
  };
}

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeEmailKey(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalString(value);
  return normalized ? normalized.toLowerCase() : null;
}

function normalizeCompanyKey(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalString(value);
  return normalized ? normalized.toLowerCase() : null;
}

function toNullable(value: string | undefined): string | null {
  return value ?? null;
}
