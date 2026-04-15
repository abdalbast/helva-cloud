import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

const partnerType = v.union(
  v.literal("affiliate"),
  v.literal("referral"),
  v.literal("partner"),
  v.literal("sponsor"),
);

const partnerStatus = v.union(
  v.literal("active"),
  v.literal("prospective"),
  v.literal("inactive"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    const partners = await ctx.db.query("partners").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
    const deals = await ctx.db.query("deals").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
    const dealCountMap = new Map<string, number>();
    const dealValueMap = new Map<string, number>();
    for (const d of deals) {
      if (d.referredByPartnerId) {
        const key = d.referredByPartnerId;
        dealCountMap.set(key, (dealCountMap.get(key) ?? 0) + 1);
        dealValueMap.set(key, (dealValueMap.get(key) ?? 0) + d.value);
      }
    }
    const enriched = partners.map((p) => ({
      ...p,
      referredDealCount: dealCountMap.get(p._id) ?? 0,
      referredDealValue: dealValueMap.get(p._id) ?? 0,
    }));
    return enriched;
  },
});

export const listByType = query({
  args: { type: partnerType },
  handler: async (ctx, { type }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("partners").withIndex("by_user_and_type", (q) => q.eq("userEmail", userEmail).eq("type", type)).take(200);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return 0;
    let n = 0;
    for await (const __ of ctx.db.query("partners").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      n++;
    }
    return n;
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return { total: 0, active: 0, byType: {}, referredRevenue: 0 };
    let total = 0;
    let active = 0;
    const byType: Record<string, number> = { affiliate: 0, referral: 0, partner: 0, sponsor: 0 };
    for await (const p of ctx.db.query("partners").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      total++;
      if (p.status === "active") active++;
      byType[p.type]++;
    }
    let referredRevenue = 0;
    for await (const d of ctx.db.query("deals").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      if (d.referredByPartnerId) referredRevenue += d.value;
    }
    return { total, active, byType, referredRevenue };
  },
});

export const get = query({
  args: { id: v.id("partners") },
  handler: async (ctx, { id }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return null;
    const partner = await ctx.db.get(id);
    if (!partner || partner.userEmail !== userEmail) return null;
    return partner;
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    type: partnerType,
    status: v.optional(partnerStatus),
    commissionRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { firstName, lastName, email, phone, company, type, status, commissionRate, notes } = args;
    return await ctx.db.insert("partners", {
      userEmail,
      firstName,
      lastName,
      email: email ?? null,
      phone: phone ?? null,
      company: company ?? null,
      type,
      status: status ?? "prospective",
      commissionRate: commissionRate ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("partners"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    type: v.optional(partnerType),
    status: v.optional(partnerStatus),
    commissionRate: v.optional(v.union(v.number(), v.null())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, firstName, lastName, email, phone, company, type, status, commissionRate, notes }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;
    if (commissionRate !== undefined) updates.commissionRate = commissionRate;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
