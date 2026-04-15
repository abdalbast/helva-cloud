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
      .query("companies")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const companies = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(companies);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return 0;

    const byAuthSubject = await ctx.db
      .query("companies")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .collect();

    const companies = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .collect(),
        )
      : byAuthSubject;

    return companies.length;
  },
});

export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return null;
    const company = await ctx.db.get(id);
    if (!isOwnedByViewer(company, viewer)) return null;
    return company;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { name, website, industry, size, notes } = args;
    return await ctx.db.insert("companies", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      name,
      website: website ?? null,
      industry: industry ?? null,
      size: size ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, website, industry, size, notes }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (website !== undefined) updates.website = website;
    if (industry !== undefined) updates.industry = industry;
    if (size !== undefined) updates.size = size;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
