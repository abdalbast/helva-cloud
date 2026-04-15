import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

const stageType = v.union(
  v.literal("lead"), v.literal("qualified"), v.literal("proposal"),
  v.literal("negotiation"), v.literal("closed_won"), v.literal("closed_lost"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    const deals = await ctx.db.query("deals").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
    const enriched = await Promise.all(
      deals.map(async (d) => {
        let companyName: string | null = null;
        let contactName: string | null = null;
        if (d.companyId) {
          const co = await ctx.db.get(d.companyId);
          companyName = co?.name ?? null;
        }
        if (d.contactId) {
          const ct = await ctx.db.get(d.contactId);
          contactName = ct ? `${ct.firstName} ${ct.lastName}` : null;
        }
        return { ...d, companyName, contactName };
      }),
    );
    return enriched;
  },
});

export const openCount = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return 0;
    let n = 0;
    for await (const d of ctx.db.query("deals").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      if (d.stage !== "closed_won" && d.stage !== "closed_lost") n++;
    }
    return n;
  },
});

export const get = query({
  args: { id: v.id("deals") },
  handler: async (ctx, { id }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return null;
    const deal = await ctx.db.get(id);
    if (!deal || deal.userEmail !== userEmail) return null;
    let companyName: string | null = null;
    let contactName: string | null = null;
    if (deal.companyId) {
      const co = await ctx.db.get(deal.companyId);
      companyName = co?.userEmail === userEmail ? co.name : null;
    }
    if (deal.contactId) {
      const ct = await ctx.db.get(deal.contactId);
      contactName =
        ct?.userEmail === userEmail ? `${ct.firstName} ${ct.lastName}` : null;
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
    const userEmail = await requireUserEmail(ctx);
    const { title, value, stage, probability, closeDate, companyId, contactId, referredByPartnerId, notes } = args;
    return await ctx.db.insert("deals", {
      userEmail,
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
  handler: async (ctx, { id, title, value, stage, probability, closeDate, companyId, contactId, referredByPartnerId, notes }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (value !== undefined) updates.value = value;
    if (stage !== undefined) updates.stage = stage;
    if (probability !== undefined) updates.probability = probability;
    if (closeDate !== undefined) updates.closeDate = closeDate;
    if (companyId !== undefined) updates.companyId = companyId;
    if (contactId !== undefined) updates.contactId = contactId;
    if (referredByPartnerId !== undefined) updates.referredByPartnerId = referredByPartnerId;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("deals") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
