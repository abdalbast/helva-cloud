/**
 * Admin import action — bypasses user JWT auth by validating a server-side secret.
 * Used only by server-side scripts (e.g. scripts/test-import.mjs).
 * NOT exposed in the public API surface; remove or restrict after use.
 */
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createCompany = mutation({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_IMPORT_SECRET) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.insert("companies", {
      userEmail: args.userEmail,
      name: args.name,
      website: null,
      industry: null,
      size: null,
      notes: null,
    });
  },
});

export const createContact = mutation({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.union(v.string(), v.null()),
    companyId: v.union(v.id("companies"), v.null()),
    country: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_IMPORT_SECRET) {
      throw new Error("Unauthorized");
    }
    return await ctx.db.insert("contacts", {
      userEmail: args.userEmail,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      companyId: args.companyId,
      phone: null,
      role: null,
      country: args.country,
      notes: null,
    });
  },
});

export const listCompanies = mutation({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_IMPORT_SECRET) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userEmail", args.userEmail))
      .take(500);
  },
});

export const listContacts = mutation({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminSecret !== process.env.ADMIN_IMPORT_SECRET) {
      throw new Error("Unauthorized");
    }
    return await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userEmail", args.userEmail))
      .take(500);
  },
});
