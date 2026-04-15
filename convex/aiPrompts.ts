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
      .query("aiPrompts")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const prompts = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("aiPrompts")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(prompts);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    output: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { title, prompt, output } = args;
    return await ctx.db.insert("aiPrompts", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      title,
      prompt,
      output: output ?? null,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("aiPrompts") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
