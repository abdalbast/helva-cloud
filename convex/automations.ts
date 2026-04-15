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
  v.literal("active"),
  v.literal("paused"),
  v.literal("error"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("automations")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const automations = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("automations")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(automations);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    trigger: v.string(),
    action: v.string(),
    status: v.optional(statusType),
    lastRunAt: v.optional(v.string()),
    runCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { name, trigger, action, status, lastRunAt, runCount } = args;
    return await ctx.db.insert("automations", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      name,
      trigger,
      action,
      status: status ?? "active",
      lastRunAt: lastRunAt ?? null,
      runCount: runCount ?? 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("automations"),
    name: v.optional(v.string()),
    trigger: v.optional(v.string()),
    action: v.optional(v.string()),
    status: v.optional(statusType),
    lastRunAt: v.optional(v.string()),
    runCount: v.optional(v.number()),
  },
  handler: async (ctx, { id, name, trigger, action, status, lastRunAt, runCount }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (trigger !== undefined) updates.trigger = trigger;
    if (action !== undefined) updates.action = action;
    if (status !== undefined) updates.status = status;
    if (lastRunAt !== undefined) updates.lastRunAt = lastRunAt;
    if (runCount !== undefined) updates.runCount = runCount;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("automations") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
