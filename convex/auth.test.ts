/// <reference types="vite/client" />
import { expect, test, describe } from "vitest";
import { isOwnedByViewer, mergeTenantResults } from "./lib/auth";

// ── isOwnedByViewer ────────────────────────────────────────────────────────────

describe("isOwnedByViewer", () => {
  const makeDoc = (overrides: Partial<{ authSubject: string; userEmail: string }>) => ({
    _id: "doc123" as unknown as never,
    _creationTime: 0,
    userEmail: "owner@test.com",
    ...overrides,
  });

  test("returns true when authSubject matches", () => {
    const doc = makeDoc({ authSubject: "provider:user1" });
    const viewer = { authSubject: "provider:user1", email: "owner@test.com" };
    expect(isOwnedByViewer(doc, viewer)).toBe(true);
  });

  test("returns false when authSubject does not match", () => {
    const doc = makeDoc({ authSubject: "provider:OTHER" });
    const viewer = { authSubject: "provider:user1", email: "owner@test.com" };
    expect(isOwnedByViewer(doc, viewer)).toBe(false);
  });

  test("falls back to userEmail when doc has no authSubject", () => {
    const doc = makeDoc({ userEmail: "owner@test.com" });
    const viewer = { authSubject: "provider:user1", email: "owner@test.com" };
    expect(isOwnedByViewer(doc, viewer)).toBe(true);
  });

  test("email fallback returns false when email differs", () => {
    const doc = makeDoc({ userEmail: "other@test.com" });
    const viewer = { authSubject: "provider:user1", email: "owner@test.com" };
    expect(isOwnedByViewer(doc, viewer)).toBe(false);
  });

  test("email fallback returns false when viewer email is null", () => {
    const doc = makeDoc({ userEmail: "owner@test.com" });
    const viewer = { authSubject: "provider:user1", email: null };
    expect(isOwnedByViewer(doc, viewer)).toBe(false);
  });

  test("returns false for null doc", () => {
    const viewer = { authSubject: "provider:user1", email: "owner@test.com" };
    expect(isOwnedByViewer(null, viewer)).toBe(false);
  });

  test("returns false for null viewer", () => {
    const doc = makeDoc({ authSubject: "provider:user1" });
    expect(isOwnedByViewer(doc, null)).toBe(false);
  });

  test("authSubject match takes precedence over mismatched email", () => {
    const doc = makeDoc({ authSubject: "provider:user1", userEmail: "old@test.com" });
    const viewer = { authSubject: "provider:user1", email: "new@test.com" };
    expect(isOwnedByViewer(doc, viewer)).toBe(true);
  });
});

// ── mergeTenantResults ─────────────────────────────────────────────────────────

describe("mergeTenantResults", () => {
  test("deduplicates by _id (last group wins, same doc via two indexes)", () => {
    const a = [
      { _id: "1", name: "first" },
      { _id: "2", name: "second" },
    ];
    const b = [
      { _id: "2", name: "second-dup" },
      { _id: "3", name: "third" },
    ];
    const result = mergeTenantResults(a, b);
    expect(result).toHaveLength(3);
    const ids = result.map((r) => r._id).sort();
    expect(ids).toEqual(["1", "2", "3"]);
  });

  test("returns all items when no duplicates", () => {
    const a = [{ _id: "1", x: 1 }];
    const b = [{ _id: "2", x: 2 }];
    const c = [{ _id: "3", x: 3 }];
    expect(mergeTenantResults(a, b, c)).toHaveLength(3);
  });

  test("returns empty array when all groups are empty", () => {
    expect(mergeTenantResults([], [])).toHaveLength(0);
  });

  test("handles single group with no duplicates", () => {
    const a = [{ _id: "1", x: 1 }, { _id: "2", x: 2 }];
    expect(mergeTenantResults(a)).toHaveLength(2);
  });

  test("handles fully overlapping groups, keeping one entry per id", () => {
    const a = [{ _id: "1", x: 1 }];
    const b = [{ _id: "1", x: 99 }];
    const result = mergeTenantResults(a, b);
    expect(result).toHaveLength(1);
  });
});
