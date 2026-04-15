/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("partners.get", () => {
  test("returns null for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
    });
    const result = await t.query(api.partners.get, { id });
    expect(result).toBeNull();
  });

  test("returns null for a different owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
    });
    const result = await t.withIdentity(USER2).query(api.partners.get, { id });
    expect(result).toBeNull();
  });

  test("returns the partner for the correct owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      email: "carol@agency.com",
      type: "affiliate",
      commissionRate: 10,
    });
    const result = await t.withIdentity(USER1).query(api.partners.get, { id });
    expect(result).not.toBeNull();
    expect(result!.firstName).toBe("Carol");
    expect(result!.lastName).toBe("Jones");
    expect(result!.type).toBe("affiliate");
    expect(result!.commissionRate).toBe(10);
  });
});

describe("partners.list", () => {
  test("returns empty for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
    });
    const result = await t.query(api.partners.list, {});
    expect(result).toEqual([]);
  });

  test("does not include another user's partners", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "User1",
      type: "referral",
    });
    const result = await t.withIdentity(USER2).query(api.partners.list, {});
    expect(result).toHaveLength(0);
  });

  test("returns only the requesting user's partners", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "User1",
      type: "referral",
    });
    await t.withIdentity(USER2).mutation(api.partners.create, {
      firstName: "Dave",
      lastName: "User2",
      type: "affiliate",
    });
    const result = await t.withIdentity(USER1).query(api.partners.list, {});
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Carol");
  });
});
