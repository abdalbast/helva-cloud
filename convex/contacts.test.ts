/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("contacts.get", () => {
  test("returns null for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.contacts.create, {
      firstName: "Alice",
      lastName: "Smith",
    });
    const result = await t.query(api.contacts.get, { id });
    expect(result).toBeNull();
  });

  test("returns null for a different owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.contacts.create, {
      firstName: "Alice",
      lastName: "Smith",
    });
    const result = await t.withIdentity(USER2).query(api.contacts.get, { id });
    expect(result).toBeNull();
  });

  test("returns the contact for the correct owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.contacts.create, {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      role: "CEO",
    });
    const result = await t.withIdentity(USER1).query(api.contacts.get, { id });
    expect(result).not.toBeNull();
    expect(result!.firstName).toBe("Alice");
    expect(result!.lastName).toBe("Smith");
    expect(result!.email).toBe("alice@example.com");
    expect(result!.role).toBe("CEO");
  });
});

describe("contacts.list", () => {
  test("returns empty for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.contacts.create, {
      firstName: "Alice",
      lastName: "Smith",
    });
    const result = await t.query(api.contacts.list, {});
    expect(result).toEqual([]);
  });

  test("does not include another user's contacts", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.contacts.create, {
      firstName: "Alice",
      lastName: "Smith",
    });
    const result = await t.withIdentity(USER2).query(api.contacts.list, {});
    expect(result).toHaveLength(0);
  });

  test("returns only the requesting user's contacts", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.contacts.create, {
      firstName: "Alice",
      lastName: "User1",
    });
    await t.withIdentity(USER2).mutation(api.contacts.create, {
      firstName: "Bob",
      lastName: "User2",
    });
    const result = await t.withIdentity(USER1).query(api.contacts.list, {});
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe("Alice");
  });
});
