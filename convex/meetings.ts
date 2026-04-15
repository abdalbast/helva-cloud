import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("meetings").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const get = query({
  args: { id: v.id("meetings") },
  handler: async (ctx, { id }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return null;
    const meeting = await ctx.db.get(id);
    if (!meeting || meeting.userEmail !== userEmail) return null;
    return meeting;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    attendees: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    decisions: v.optional(v.string()),
    followUps: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { title, date, attendees, notes, decisions, followUps } = args;
    return await ctx.db.insert("meetings", {
      userEmail, title, date, attendees: attendees ?? [],
      notes: notes ?? null, decisions: decisions ?? null, followUps: followUps ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("meetings"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    attendees: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    decisions: v.optional(v.string()),
    followUps: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, date, attendees, notes, decisions, followUps }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (date !== undefined) updates.date = date;
    if (attendees !== undefined) updates.attendees = attendees;
    if (notes !== undefined) updates.notes = notes;
    if (decisions !== undefined) updates.decisions = decisions;
    if (followUps !== undefined) updates.followUps = followUps;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("meetings") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
