import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  backfillAuthSubjectIfNeeded,
  getViewerIdentity,
  isOwnedByViewer,
  mergeTenantResults,
  requireViewerIdentity,
  sortByCreationTime,
} from "./lib/auth";

const partnerType = v.union(
  v.literal("affiliate"),
  v.literal("referral"),
  v.literal("partner"),
  v.literal("sponsor"),
);

const partnerStatus = v.union(
  v.literal("active"),
  v.literal("prospective"),
  v.literal("inactive"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const [partnersByAuthSubject, dealsByAuthSubject, partnersByEmail, dealsByEmail] =
      await Promise.all([
        ctx.db
          .query("partners")
          .withIndex("by_auth_subject", (q) =>
            q.eq("authSubject", viewer.authSubject),
          )
          .take(200),
        ctx.db
          .query("deals")
          .withIndex("by_auth_subject", (q) =>
            q.eq("authSubject", viewer.authSubject),
          )
          .take(200),
        viewer.email
          ? ctx.db
              .query("partners")
              .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
              .take(200)
          : Promise.resolve([]),
        viewer.email
          ? ctx.db
              .query("deals")
              .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
              .take(200)
          : Promise.resolve([]),
      ]);

    const partners = sortByCreationTime(
      mergeTenantResults(partnersByAuthSubject, partnersByEmail),
    );
    const deals = mergeTenantResults(dealsByAuthSubject, dealsByEmail);

    const dealCountMap = new Map<string, number>();
    const dealValueMap = new Map<string, number>();
    for (const deal of deals) {
      if (deal.referredByPartnerId) {
        dealCountMap.set(
          deal.referredByPartnerId,
          (dealCountMap.get(deal.referredByPartnerId) ?? 0) + 1,
        );
        dealValueMap.set(
          deal.referredByPartnerId,
          (dealValueMap.get(deal.referredByPartnerId) ?? 0) + deal.value,
        );
      }
    }

    return partners.map((partner) => ({
      ...partner,
      referredDealCount: dealCountMap.get(partner._id) ?? 0,
      referredDealValue: dealValueMap.get(partner._id) ?? 0,
    }));
  },
});

export const listByType = query({
  args: { type: partnerType },
  handler: async (ctx, { type }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const byAuthSubject = await ctx.db
      .query("partners")
      .withIndex("by_auth_subject_and_type", (q) =>
        q.eq("authSubject", viewer.authSubject).eq("type", type),
      )
      .take(200);

    const partners = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("partners")
            .withIndex("by_user_and_type", (q) =>
              q.eq("userEmail", viewer.email!).eq("type", type),
            )
            .take(200),
        )
      : byAuthSubject;

    return sortByCreationTime(partners);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return 0;

    const byAuthSubject = await ctx.db
      .query("partners")
      .withIndex("by_auth_subject", (q) =>
        q.eq("authSubject", viewer.authSubject),
      )
      .collect();

    const partners = viewer.email
      ? mergeTenantResults(
          byAuthSubject,
          await ctx.db
            .query("partners")
            .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
            .collect(),
        )
      : byAuthSubject;

    return partners.length;
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) {
      return { total: 0, active: 0, byType: {}, referredRevenue: 0 };
    }

    const [partnersByAuthSubject, dealsByAuthSubject, partnersByEmail, dealsByEmail] =
      await Promise.all([
        ctx.db
          .query("partners")
          .withIndex("by_auth_subject", (q) =>
            q.eq("authSubject", viewer.authSubject),
          )
          .collect(),
        ctx.db
          .query("deals")
          .withIndex("by_auth_subject", (q) =>
            q.eq("authSubject", viewer.authSubject),
          )
          .collect(),
        viewer.email
          ? ctx.db
              .query("partners")
              .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
              .collect()
          : Promise.resolve([]),
        viewer.email
          ? ctx.db
              .query("deals")
              .withIndex("by_user", (q) => q.eq("userEmail", viewer.email!))
              .collect()
          : Promise.resolve([]),
      ]);

    const partners = mergeTenantResults(partnersByAuthSubject, partnersByEmail);
    const deals = mergeTenantResults(dealsByAuthSubject, dealsByEmail);

    const byType: Record<string, number> = {
      affiliate: 0,
      referral: 0,
      partner: 0,
      sponsor: 0,
    };
    let active = 0;
    for (const partner of partners) {
      if (partner.status === "active") active++;
      byType[partner.type]++;
    }

    let referredRevenue = 0;
    for (const deal of deals) {
      if (deal.referredByPartnerId) referredRevenue += deal.value;
    }

    return {
      total: partners.length,
      active,
      byType,
      referredRevenue,
    };
  },
});

export const get = query({
  args: { id: v.id("partners") },
  handler: async (ctx, { id }) => {
    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return null;
    const partner = await ctx.db.get(id);
    if (!isOwnedByViewer(partner, viewer)) return null;
    return partner;
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    type: partnerType,
    status: v.optional(partnerStatus),
    commissionRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewerIdentity(ctx);
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      type,
      status,
      commissionRate,
      notes,
    } = args;
    return await ctx.db.insert("partners", {
      authSubject: viewer.authSubject,
      userEmail: viewer.email,
      firstName,
      lastName,
      email: email ?? null,
      phone: phone ?? null,
      company: company ?? null,
      type,
      status: status ?? "prospective",
      commissionRate: commissionRate ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("partners"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    type: v.optional(partnerType),
    status: v.optional(partnerStatus),
    commissionRate: v.optional(v.union(v.number(), v.null())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, firstName, lastName, email, phone, company, type, status, commissionRate, notes }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await backfillAuthSubjectIfNeeded(ctx, existing, viewer);

    const updates: Record<string, unknown> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;
    if (commissionRate !== undefined) updates.commissionRate = commissionRate;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return await ctx.db.get(id);
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, { id }) => {
    const viewer = await requireViewerIdentity(ctx);
    const existing = await ctx.db.get(id);
    if (!isOwnedByViewer(existing, viewer)) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
