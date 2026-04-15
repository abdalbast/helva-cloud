/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("companies.get", () => {
  test("returns null for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.companies.create, { name: "Acme" });
    const result = await t.query(api.companies.get, { id });
    expect(result).toBeNull();
  });

  test("returns null for a different owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.companies.create, { name: "Acme" });
    const result = await t.withIdentity(USER2).query(api.companies.get, { id });
    expect(result).toBeNull();
  });

  test("returns the company for the correct owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.companies.create, {
      name: "Acme Corp",
      industry: "Tech",
    });
    const result = await t.withIdentity(USER1).query(api.companies.get, { id });
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Acme Corp");
    expect(result!.industry).toBe("Tech");
  });
});

describe("companies.list", () => {
  test("returns empty for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.companies.create, { name: "Acme" });
    const result = await t.query(api.companies.list, {});
    expect(result).toEqual([]);
  });

  test("does not include another user's companies", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.companies.create, { name: "User1 Corp" });
    const result = await t.withIdentity(USER2).query(api.companies.list, {});
    expect(result).toHaveLength(0);
  });

  test("returns only the requesting user's companies", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.companies.create, { name: "User1 Corp" });
    await t.withIdentity(USER2).mutation(api.companies.create, { name: "User2 Corp" });
    const result = await t.withIdentity(USER1).query(api.companies.list, {});
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("User1 Corp");
  });
});
