import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("companies").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return 0;
    let n = 0;
    for await (const __ of ctx.db.query("companies").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      n++;
    }
    return n;
  },
});

export const get = query({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return null;
    const company = await ctx.db.get(id);
    if (!company || company.userEmail !== userEmail) return null;
    return company;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { name, website, industry, size, notes } = args;
    return await ctx.db.insert("companies", {
      userEmail,
      name,
      website: website ?? null,
      industry: industry ?? null,
      size: size ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, website, industry, size, notes }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (website !== undefined) updates.website = website;
    if (industry !== undefined) updates.industry = industry;
    if (size !== undefined) updates.size = size;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
