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

const campaignStatus = v.union(
  v.literal("draft"),
  v.literal("in_progress"),
  v.literal("published"),
  v.literal("completed"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("contentCampaigns")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const campaigns = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("contentCampaigns")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(campaigns);
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
    const viewer = await requireViewerIdentity(ctx);
    const { name, channel, brief, status, startDate, endDate } = args;
    return await ctx.db.insert("contentCampaigns", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      name,
      channel: channel ?? null,
      brief: brief ?? null,
      status: status ?? "draft",
      startDate: startDate ?? null,
      endDate: endDate ?? null,
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
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (channel !== undefined) updates.channel = channel;
    if (brief !== undefined) updates.brief = brief;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("contentCampaigns") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
