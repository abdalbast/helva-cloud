import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail, requireUserEmail } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    const contacts = await ctx.db.query("contacts").withIndex("by_user", (q) => q.eq("userEmail", userEmail)).take(200);
    const enriched = await Promise.all(
      contacts.map(async (c) => {
        let companyName: string | null = null;
        if (c.companyId) {
          const company = await ctx.db.get(c.companyId);
          companyName = company?.name ?? null;
        }
        return { ...c, companyName };
      }),
    );
    return enriched;
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return 0;
    let n = 0;
    for await (const __ of ctx.db.query("contacts").withIndex("by_user", (q) => q.eq("userEmail", userEmail))) {
      n++;
    }
    return n;
  },
});

export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, { id }) => {
    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return null;
    const contact = await ctx.db.get(id);
    if (!contact || contact.userEmail !== userEmail) return null;
    let companyName: string | null = null;
    if (contact.companyId) {
      const company = await ctx.db.get(contact.companyId);
      companyName = company?.userEmail === userEmail ? company.name : null;
    }
    return { ...contact, companyName };
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx);
    const { firstName, lastName, email, phone, role, companyId, country, notes } = args;
    return await ctx.db.insert("contacts", {
      userEmail,
      firstName,
      lastName,
      email: email ?? null,
      phone: phone ?? null,
      role: role ?? null,
      companyId: companyId ?? null,
      country: country ?? null,
      notes: notes ?? null,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    companyId: v.optional(v.union(v.id("companies"), v.null())),
    country: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, firstName, lastName, email, phone, role, companyId, country, notes }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    const updates: Record<string, unknown> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (companyId !== undefined) updates.companyId = companyId;
    if (country !== undefined) updates.country = country;
    if (notes !== undefined) updates.notes = notes;
    if (Object.keys(updates).length === 0) return null;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, { id }) => {
    const userEmail = await requireUserEmail(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.userEmail !== userEmail) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
