import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const createCompany = internalMutation({
  args: {
    userEmail: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
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

export const createContact = internalMutation({
  args: {
    userEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.union(v.string(), v.null()),
    companyId: v.union(v.id("companies"), v.null()),
    country: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
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

export const listCompanies = internalQuery({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_user", (q) => q.eq("userEmail", args.userEmail))
      .collect();
  },
});

export const listContacts = internalQuery({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contacts")
      .withIndex("by_user", (q) => q.eq("userEmail", args.userEmail))
      .collect();
  },
});
