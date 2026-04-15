import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

const statusType = v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published"));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("socialPosts").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const create = mutation({
  args: {
    platform: v.string(),
    content: v.string(),
    scheduledAt: v.optional(v.string()),
    status: v.optional(statusType),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { platform, content, scheduledAt, status } = args;
    return await ctx.db.insert("socialPosts", {
      userEmail, platform, content,
      scheduledAt: scheduledAt ?? null, status: status ?? "draft",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("socialPosts"),
    platform: v.optional(v.string()),
    content: v.optional(v.string()),
    scheduledAt: v.optional(v.string()),
    status: v.optional(statusType),
  },
  handler: async (ctx, { id, platform, content, scheduledAt, status }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (platform !== undefined) updates.platform = platform;
    if (content !== undefined) updates.content = content;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt;
    if (status !== undefined) updates.status = status;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("socialPosts") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
