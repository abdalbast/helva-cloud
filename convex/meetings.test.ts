/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

describe("meetings.get", () => {
  test("returns null for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.meetings.create, {
      title: "Kickoff",
      date: "2025-01-15",
    });
    const result = await t.query(api.meetings.get, { id });
    expect(result).toBeNull();
  });

  test("returns null for a different owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.meetings.create, {
      title: "Kickoff",
      date: "2025-01-15",
    });
    const result = await t.withIdentity(USER2).query(api.meetings.get, { id });
    expect(result).toBeNull();
  });

  test("returns the meeting for the correct owner", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.meetings.create, {
      title: "Q1 Review",
      date: "2025-03-31",
      attendees: ["alice@example.com", "bob@example.com"],
      notes: "Quarterly check-in",
    });
    const result = await t.withIdentity(USER1).query(api.meetings.get, { id });
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Q1 Review");
    expect(result!.date).toBe("2025-03-31");
    expect(result!.attendees).toEqual(["alice@example.com", "bob@example.com"]);
    expect(result!.notes).toBe("Quarterly check-in");
  });
});

describe("meetings.list", () => {
  test("returns empty for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.meetings.create, {
      title: "Kickoff",
      date: "2025-01-15",
    });
    const result = await t.query(api.meetings.list, {});
    expect(result).toEqual([]);
  });

  test("does not include another user's meetings", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.meetings.create, {
      title: "User1 Meeting",
      date: "2025-01-15",
    });
    const result = await t.withIdentity(USER2).query(api.meetings.list, {});
    expect(result).toHaveLength(0);
  });

  test("returns only the requesting user's meetings", async () => {
    const t = convexTest(schema, modules);
    await t.withIdentity(USER1).mutation(api.meetings.create, {
      title: "User1 Meeting",
      date: "2025-01-15",
    });
    await t.withIdentity(USER2).mutation(api.meetings.create, {
      title: "User2 Meeting",
      date: "2025-02-20",
    });
    const result = await t.withIdentity(USER1).query(api.meetings.list, {});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("User1 Meeting");
  });
});
