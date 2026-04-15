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

describe("partners.create", () => {
  test("defaults status to prospective when not provided", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Alice",
      lastName: "Smith",
      type: "affiliate",
    });
    const partner = await t.withIdentity(USER1).query(api.partners.get, { id });
    expect(partner).not.toBeNull();
    expect(partner!.status).toBe("prospective");
  });

  test("accepts explicit status", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Bob",
      lastName: "Jones",
      type: "referral",
      status: "active",
    });
    const partner = await t.withIdentity(USER1).query(api.partners.get, { id });
    expect(partner!.status).toBe("active");
  });

  test("stores all optional fields as null when omitted", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Min",
      lastName: "Fields",
      type: "sponsor",
    });
    const partner = await t.withIdentity(USER1).query(api.partners.get, { id });
    expect(partner!.email).toBeNull();
    expect(partner!.phone).toBeNull();
    expect(partner!.company).toBeNull();
    expect(partner!.commissionRate).toBeNull();
    expect(partner!.notes).toBeNull();
  });

  test("throws for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    await expect(
      t.mutation(api.partners.create, {
        firstName: "No",
        lastName: "Auth",
        type: "partner",
      }),
    ).rejects.toThrow("Unauthenticated");
  });
});

describe("partners.update", () => {
  test("updates specific fields without changing others", async () => {
    const t = convexTest(schema, modules);
    const u1 = t.withIdentity(USER1);
    const id = await u1.mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
      commissionRate: 5,
    });
    await u1.mutation(api.partners.update, {
      id,
      status: "active",
    });
    const updated = await u1.query(api.partners.get, { id });
    expect(updated!.status).toBe("active");
    expect(updated!.firstName).toBe("Carol");
    expect(updated!.commissionRate).toBe(5);
  });

  test("rejects update by different user", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
    });
    await expect(
      t.withIdentity(USER2).mutation(api.partners.update, {
        id,
        status: "inactive",
      }),
    ).rejects.toThrow("Not found");
  });
});

describe("partners.remove", () => {
  test("deletes partner owned by viewer", async () => {
    const t = convexTest(schema, modules);
    const u1 = t.withIdentity(USER1);
    const id = await u1.mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
    });
    await u1.mutation(api.partners.remove, { id });
    const result = await u1.query(api.partners.get, { id });
    expect(result).toBeNull();
  });

  test("rejects delete by different user", async () => {
    const t = convexTest(schema, modules);
    const id = await t.withIdentity(USER1).mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Jones",
      type: "referral",
    });
    await expect(
      t.withIdentity(USER2).mutation(api.partners.remove, { id }),
    ).rejects.toThrow("Not found");
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

  test("includes referredDealCount and referredDealValue from deals", async () => {
    const t = convexTest(schema, modules);
    const u1 = t.withIdentity(USER1);
    const partnerId = await u1.mutation(api.partners.create, {
      firstName: "Carol",
      lastName: "Ref",
      type: "referral",
    });
    await u1.mutation(api.deals.create, {
      title: "Deal 1",
      value: 1000,
      referredByPartnerId: partnerId,
    });
    await u1.mutation(api.deals.create, {
      title: "Deal 2",
      value: 2500,
      referredByPartnerId: partnerId,
    });
    const list = await u1.query(api.partners.list, {});
    expect(list).toHaveLength(1);
    expect(list[0].referredDealCount).toBe(2);
    expect(list[0].referredDealValue).toBe(3500);
  });
});

describe("partners.stats", () => {
  test("returns zero stats for unauthenticated request", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.partners.stats, {});
    expect(result).toEqual({ total: 0, active: 0, byType: {}, referredRevenue: 0 });
  });

  test("computes correct aggregates", async () => {
    const t = convexTest(schema, modules);
    const u1 = t.withIdentity(USER1);
    const pid = await u1.mutation(api.partners.create, { firstName: "A", lastName: "B", type: "affiliate", status: "active" });
    await u1.mutation(api.partners.create, { firstName: "C", lastName: "D", type: "referral" });
    await u1.mutation(api.deals.create, { title: "D1", value: 500, referredByPartnerId: pid });
    const stats = await u1.query(api.partners.stats, {});
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.byType.affiliate).toBe(1);
    expect(stats.byType.referral).toBe(1);
    expect(stats.referredRevenue).toBe(500);
  });
});
