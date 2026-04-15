import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  backfillAuthSubjectIfNeeded,
  getViewerIdentity,
  isOwnedByViewer,
  mergeTenantResults,
  requireViewerIdentity,
  sortByCreationTime,
} from "./lib/auth";

const statusType = v.union(
  v.literal("planning"),
  v.literal("active"),
  v.literal("on_hold"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("projects")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const projects = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(projects);
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return null;
    const project = await ctx.db.get(id);
    if (!isOwnedByViewer(project, viewer)) return null;
    return project;
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
    const viewer = await requireViewerIdentity(ctx);
    const { name, description, status, startDate, endDate } = args;
    return await ctx.db.insert("projects", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      name,
      description: description ?? null,
      status: status ?? "planning",
      startDate: startDate ?? null,
      endDate: endDate ?? null,
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
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
