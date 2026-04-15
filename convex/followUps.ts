import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("followUps").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const overdueCount = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return 0;
    let n = 0;
    const now = new Date().toISOString();
    for await (const f of ctx.db.query("followUps").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      if (f.status === "pending" && f.dueAt <= now) n++;
    }
    return n;
  },
});

export const create = mutation({
  args: {
    description: v.string(),
    dueAt: v.string(),
    contactId: v.optional(v.id("contacts")),
    dealId: v.optional(v.id("deals")),
    status: v.optional(v.union(v.literal("pending"), v.literal("done"), v.literal("snoozed"))),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { description, dueAt, contactId, dealId, status } = args;
    return await ctx.db.insert("followUps", {
      userEmail, description, dueAt,
      contactId: contactId ?? null, dealId: dealId ?? null, status: status ?? "pending",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("followUps"),
    status: v.optional(v.union(v.literal("pending"), v.literal("done"), v.literal("snoozed"))),
    description: v.optional(v.string()),
    dueAt: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, description, dueAt }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (description !== undefined) updates.description = description;
    if (dueAt !== undefined) updates.dueAt = dueAt;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});
