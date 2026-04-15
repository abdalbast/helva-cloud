import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  backfillAuthSubjectIfNeeded,
  getViewerIdentity,
  isOwnedByViewer,
  mergeTenantResults,
  requireViewerIdentity,
  sortByCreationTime,
} from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("contacts")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const contacts = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    const sortedContacts = sortByCreationTime(contacts);
    return await Promise.all(
      sortedContacts.map(async (contact) => {
        let companyName: string | null = null;
        if (contact.companyId) {
          const company = await ctx.db.get(contact.companyId);
          companyName = isOwnedByViewer(company, viewer) ? company.name : null;
        }
        return { ...contact, companyName };
      }),
    );
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return 0;

    const byAuthSubject = await ctx.db
      .query("contacts")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .collect();

    const contacts = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("contacts")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .collect(),
        )
      : byAuthSubject;

    return contacts.length;
  },
});

export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, { id }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return null;
    const contact = await ctx.db.get(id);
    if (!isOwnedByViewer(contact, viewer)) return null;

    let companyName: string | null = null;
    if (contact.companyId) {
      const company = await ctx.db.get(contact.companyId);
      companyName = isOwnedByViewer(company, viewer) ? company.name : null;
    }
    return { ...contact, companyName };
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      companyId,
      country,
      notes,
    } = args;
    return await ctx.db.insert("contacts", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      firstName,
      lastName,
      email: email ?? null,
      phone: phone ?? null,
      role: role ?? null,
      companyId: companyId ?? null,
      country: country ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    companyId: v.optional(v.union(v.id("companies"), v.null())),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, firstName, lastName, email, phone, role, companyId, country, notes }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (companyId !== undefined) updates.companyId = companyId;
    if (country !== undefined) updates.country = country;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
