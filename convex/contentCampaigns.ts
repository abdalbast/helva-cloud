import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

const campaignStatus = v.union(
  v.literal("draft"), v.literal("in_progress"), v.literal("published"), v.literal("completed"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("contentCampaigns").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    channel: v.optional(v.string()),
    brief: v.optional(v.string()),
    status: v.optional(campaignStatus),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { name, channel, brief, status, startDate, endDate } = args;
    return await ctx.db.insert("contentCampaigns", {
      userEmail, name, channel: channel ?? null, brief: brief ?? null,
      status: status ?? "draft", startDate: startDate ?? null, endDate: endDate ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contentCampaigns"),
    name: v.optional(v.string()),
    channel: v.optional(v.string()),
    brief: v.optional(v.string()),
    status: v.optional(campaignStatus),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, channel, brief, status, startDate, endDate }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (channel !== undefined) updates.channel = channel;
    if (brief !== undefined) updates.brief = brief;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("contentCampaigns") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
