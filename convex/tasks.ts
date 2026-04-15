import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

const taskStatus = v.union(
  v.literal("backlog"), v.literal("todo"), v.literal("in_progress"),
  v.literal("review"), v.literal("done"),
);
const taskPriority = v.union(
  v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    return await ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
  },
});

export const openCount = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return 0;
    let n = 0;
    for await (const t of ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      if (t.status !== "done") n++;
    }
    return n;
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    const project = await ctx.db.get(projectId);
    if (!project || project.userEmail !== userEmail) return [];
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_and_project", (q) =>
        q.eq("userEmail", userEmail).eq("projectId", projectId),
      )
      .take(200);
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
    const userEmail = await requireUserEmail(ctx);
    const { projectId, title, description, status, priority, assignee, dueDate, position } = args;
    return await ctx.db.insert("tasks", {
      userEmail, projectId, title, description: description ?? null,
      status: status ?? "backlog", priority: priority ?? "medium",
      assignee: assignee ?? null, dueDate: dueDate ?? null, position: position ?? 0,
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
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (assignee !== undefined) updates.assignee = assignee;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (position !== undefined) updates.position = position;
    if (projectId !== undefined) updates.projectId = projectId;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
