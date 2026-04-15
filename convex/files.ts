import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  getViewerIdentity,
  isOwnedByViewer,
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
      .query("files")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const files = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("files")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(files);
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
    const viewer = await requireViewerIdentity(ctx);
    const { name, type, url, sizeBytes, folder } = args;
    return await ctx.db.insert("files", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      name,
      type: type ?? null,
      url: url ?? null,
      sizeBytes: sizeBytes ?? null,
      folder: folder ?? null,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("files") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
