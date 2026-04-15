import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("activities").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).order("desc").take(200);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("activities").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).order("desc").take(5);
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("call"), v.literal("email"), v.literal("meeting"), v.literal("note")),
    subject: v.string(),
    body: v.optional(v.string()),
    dealId: v.optional(v.id("deals")),
    contactId: v.optional(v.id("contacts")),
    companyId: v.optional(v.id("companies")),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { type, subject, body, dealId, contactId, companyId } = args;
    return await ctx.db.insert("activities", {
      userEmail, type, subject, body: body ?? null,
      dealId: dealId ?? null, contactId: contactId ?? null, companyId: companyId ?? null,
    });
  },
});
