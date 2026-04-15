/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("tasks.listByProject", () => {
  test("returns empty array for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "My Project",
      status: "active",
    });
    const result = await t.query(api.tasks.listByProject, { projectId });
    expect(result).toEqual([]);
  });

  test("returns empty array when project belongs to a different user", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "User1 Project",
      status: "active",
    });
    await t.withIdentity(USER1).mutation(api.tasks.create, {
      projectId,
      title: "Task A",
      status: "todo",
      priority: "medium",
    });
    const result = await t.withIdentity(USER2).query(api.tasks.listByProject, { projectId });
    expect(result).toEqual([]);
  });

  test("returns tasks for the project owner", async () => {
    const t = convexTest(schema, modules);
    const projectId = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "My Project",
      status: "active",
    });
    await t.withIdentity(USER1).mutation(api.tasks.create, {
      projectId,
      title: "Task Alpha",
      status: "todo",
      priority: "high",
    });
    await t.withIdentity(USER1).mutation(api.tasks.create, {
      projectId,
      title: "Task Beta",
      status: "in_progress",
      priority: "medium",
    });
    const result = await t.withIdentity(USER1).query(api.tasks.listByProject, { projectId });
    expect(result).toHaveLength(2);
    const titles = result.map((task) => task.title).sort();
    expect(titles).toEqual(["Task Alpha", "Task Beta"]);
  });

  test("does not leak tasks from a different project owned by same user", async () => {
    const t = convexTest(schema, modules);
    const p1 = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "Project One",
      status: "active",
    });
    const p2 = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "Project Two",
      status: "active",
    });
    await t.withIdentity(USER1).mutation(api.tasks.create, {
      projectId: p1,
      title: "P1 Task",
      status: "todo",
      priority: "low",
    });
    const result = await t.withIdentity(USER1).query(api.tasks.listByProject, { projectId: p2 });
    expect(result).toHaveLength(0);
  });
});
