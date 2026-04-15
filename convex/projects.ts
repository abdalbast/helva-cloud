import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

const statusType = v.union(
  v.literal("planning"), v.literal("active"), v.literal("on_hold"),
  v.literal("completed"), v.literal("cancelled"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("projects").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(statusType),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { name, description, status, startDate, endDate } = args;
    return await ctx.db.insert("projects", {
      userEmail, name, description: description ?? null,
      status: status ?? "planning", startDate: startDate ?? null, endDate: endDate ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(statusType),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, description, status, startDate, endDate }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
