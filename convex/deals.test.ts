/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("deals.get", () => {
  test("returns null for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.deals.create, {
      title: "Big Deal",
      value: 50000,
    });
    const result = await t.query(api.deals.get, { id });
    expect(result).toBeNull();
  });

  test("returns null for a different owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.deals.create, {
      title: "Big Deal",
      value: 50000,
    });
    const result = await t.withIdentity(USER2).query(api.deals.get, { id });
    expect(result).toBeNull();
  });

  test("returns the deal for the correct owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.deals.create, {
      title: "Enterprise License",
      value: 120000,
      stage: "proposal",
    });
    const result = await t.withIdentity(USER1).query(api.deals.get, { id });
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Enterprise License");
    expect(result!.value).toBe(120000);
    expect(result!.stage).toBe("proposal");
  });
});

describe("deals.list", () => {
  test("returns empty for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.deals.create, { title: "Deal A" });
    const result = await t.query(api.deals.list, {});
    expect(result).toEqual([]);
  });

  test("does not include another user's deals", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.deals.create, { title: "User1 Deal" });
    const result = await t.withIdentity(USER2).query(api.deals.list, {});
    expect(result).toHaveLength(0);
  });

  test("returns only the requesting user's deals", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.deals.create, { title: "User1 Deal" });
    await t.withIdentity(USER2).mutation(api.deals.create, { title: "User2 Deal" });
    const result = await t.withIdentity(USER1).query(api.deals.list, {});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("User1 Deal");
  });
});
