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

const taskStatus = v.union(
  v.literal("backlog"),
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("review"),
  v.literal("done"),
);
const taskPriority = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("tasks")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .take(200);

    const tasks = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(tasks);
  },
});

export const openCount = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return 0;

    const byAuthSubject = await ctx.db
      .query("tasks")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .collect();

    const tasks = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .collect(),
        )
      : byAuthSubject;

    return tasks.filter((task) => task.status !== "done").length;
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const project = await ctx.db.get(projectId);
    if (!isOwnedByViewer(project, viewer)) return [];

    const byAuthSubject = await ctx.db
      .query("tasks")
      .withIndex("by_auth_subject_and_project", (q) =>
        q.eq("authSubject", viewer.authSubject).eq("projectId", projectId),
      )
      .take(200);

    const tasks = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("tasks")
            .withIndex("by_user_and_project", (q) =>
              q.eq("userEmail", viewer.email!).eq("projectId", projectId),
            )
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(tasks);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(taskStatus),
    priority: v.optional(taskPriority),
    assignee: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const { projectId, title, description, status, priority, assignee, dueDate, position } = args;
    return await ctx.db.insert("tasks", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      projectId,
      title,
      description: description ?? null,
      status: status ?? "backlog",
      priority: priority ?? "medium",
      assignee: assignee ?? null,
      dueDate: dueDate ?? null,
      position: position ?? 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(taskStatus),
    priority: v.optional(taskPriority),
    assignee: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    position: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, { id, title, description, status, priority, assignee, dueDate, position, projectId }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) updates.assignee = assignee;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (position !== undefined) updates.position = position;
    if (projectId !== undefined) updates.projectId = projectId;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
