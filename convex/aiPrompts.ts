import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("aiPrompts").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    output: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { title, prompt, output } = args;
    return await ctx.db.insert("aiPrompts", {
      userEmail, title, prompt, output: output ?? null,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("aiPrompts") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
