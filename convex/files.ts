import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("files").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.optional(v.string()),
    url: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { name, type, url, sizeBytes, folder } = args;
    return await ctx.db.insert("files", {
      userEmail, name, type: type ?? null, url: url ?? null,
      sizeBytes: sizeBytes ?? null, folder: folder ?? null,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
