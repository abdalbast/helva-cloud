/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("projects.get", () => {
  test("returns null for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "Website Redesign",
      status: "active",
    });
    const result = await t.query(api.projects.get, { id });
    expect(result).toBeNull();
  });

  test("returns null for a different owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "Website Redesign",
      status: "active",
    });
    const result = await t.withIdentity(USER2).query(api.projects.get, { id });
    expect(result).toBeNull();
  });

  test("returns the project for the correct owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "CRM Integration",
      description: "Connect Helva to Salesforce",
      status: "planning",
    });
    const result = await t.withIdentity(USER1).query(api.projects.get, { id });
    expect(result).not.toBeNull();
    expect(result!.name).toBe("CRM Integration");
    expect(result!.description).toBe("Connect Helva to Salesforce");
    expect(result!.status).toBe("planning");
  });
});

describe("projects.list", () => {
  test("returns empty for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "Website Redesign",
      status: "active",
    });
    const result = await t.query(api.projects.list, {});
    expect(result).toEqual([]);
  });

  test("does not include another user's projects", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "User1 Project",
      status: "active",
    });
    const result = await t.withIdentity(USER2).query(api.projects.list, {});
    expect(result).toHaveLength(0);
  });

  test("returns only the requesting user's projects", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.projects.create, {
      name: "User1 Project",
      status: "active",
    });
    await t.withIdentity(USER2).mutation(api.projects.create, {
      name: "User2 Project",
      status: "planning",
    });
    const result = await t.withIdentity(USER1).query(api.projects.list, {});
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("User1 Project");
  });
});
