import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  getViewerIdentity,
  mergeTenantResults,
  requireViewerIdentity,
  sortByCreationTime,
} from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("activities")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const activities = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("activities")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(activities, "desc");
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("activities")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(5);

    const activities = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("activities")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(5),
        )
      : byAuthSubject;

    return sortByCreationTime(activities, "desc").slice(0, 5);
  },
});

export const create = mutation({
  args: {
    type: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("note"),
    ),
    subject: v.string(),
    body: v.optional(v.string()),
    dealId: v.optional(v.id("deals")),
    contactId: v.optional(v.id("contacts")),
    companyId: v.optional(v.id("companies")),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { type, subject, body, dealId, contactId, companyId } = args;
    return await ctx.db.insert("activities", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      type,
      subject,
      body: body ?? null,
      dealId: dealId ?? null,
      contactId: contactId ?? null,
      companyId: companyId ?? null,
    });
  },
});
