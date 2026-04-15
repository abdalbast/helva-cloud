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

const stageType = v.union(
  v.literal("lead"),
  v.literal("qualified"),
  v.literal("proposal"),
  v.literal("negotiation"),
  v.literal("closed_won"),
  v.literal("closed_lost"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("deals")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const deals = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("deals")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    const sortedDeals = sortByCreationTime(deals);
    return await Promise.all(
      sortedDeals.map(async (deal) => {
        let companyName: string | null = null;
        let contactName: string | null = null;
        if (deal.companyId) {
          const company = await ctx.db.get(deal.companyId);
          companyName = isOwnedByViewer(company, viewer) ? company.name : null;
        }
        if (deal.contactId) {
          const contact = await ctx.db.get(deal.contactId);
          contactName = isOwnedByViewer(contact, viewer)
            ? `${contact.firstName} ${contact.lastName}`
            : null;
        }
        return { ...deal, companyName, contactName };
      }),
    );
  },
});

export const openCount = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return 0;

    const byAuthSubject = await ctx.db
      .query("deals")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .collect();

    const deals = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("deals")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .collect(),
        )
      : byAuthSubject;

    return deals.filter(
      (deal) => deal.stage !== "closed_won" && deal.stage !== "closed_lost",
    ).length;
  },
});

export const get = query({
  args: { id: v.id("deals") },
  handler: async (ctx, { id }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return null;
    const deal = await ctx.db.get(id);
    if (!isOwnedByViewer(deal, viewer)) return null;

    let companyName: string | null = null;
    let contactName: string | null = null;
    if (deal.companyId) {
      const company = await ctx.db.get(deal.companyId);
      companyName = isOwnedByViewer(company, viewer) ? company.name : null;
    }
    if (deal.contactId) {
      const contact = await ctx.db.get(deal.contactId);
      contactName = isOwnedByViewer(contact, viewer)
        ? `${contact.firstName} ${contact.lastName}`
        : null;
    }
    return { ...deal, companyName, contactName };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    value: v.optional(v.number()),
    stage: v.optional(stageType),
    probability: v.optional(v.number()),
    closeDate: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    contactId: v.optional(v.id("contacts")),
    referredByPartnerId: v.optional(v.id("partners")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const {
      title,
      value,
      stage,
      probability,
      closeDate,
      companyId,
      contactId,
      referredByPartnerId,
      notes,
    } = args;
    return await ctx.db.insert("deals", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      title,
      value: value ?? 0,
      stage: stage ?? "lead",
      probability: probability ?? 0,
      closeDate: closeDate ?? null,
      companyId: companyId ?? null,
      contactId: contactId ?? null,
      referredByPartnerId: referredByPartnerId ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("deals"),
    title: v.optional(v.string()),
    value: v.optional(v.number()),
    stage: v.optional(stageType),
    probability: v.optional(v.number()),
    closeDate: v.optional(v.string()),
    companyId: v.optional(v.union(v.id("companies"), v.null())),
    contactId: v.optional(v.union(v.id("contacts"), v.null())),
    referredByPartnerId: v.optional(v.union(v.id("partners"), v.null())),
    notes: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      id,
      title,
      value,
      stage,
      probability,
      closeDate,
      companyId,
      contactId,
      referredByPartnerId,
      notes,
    },
  ) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (value !== undefined) updates.value = value;
    if (stage !== undefined) updates.stage = stage;
    if (probability !== undefined) updates.probability = probability;
    if (closeDate !== undefined) updates.closeDate = closeDate;
    if (companyId !== undefined) updates.companyId = companyId;
    if (contactId !== undefined) updates.contactId = contactId;
    if (referredByPartnerId !== undefined) {
      updates.referredByPartnerId = referredByPartnerId;
    }
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
