"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { timingSafeEqualString } from "../src/lib/timing-safe";

function requireAdminImportSecret(adminSecret: string) {
  const configuredSecret = process.env.ADMIN_IMPORT_SECRET;
  if (!configuredSecret) {
    throw new Error("ADMIN_IMPORT_SECRET is not configured");
  }
  if (!timingSafeEqualString(adminSecret, configuredSecret)) {
    throw new Error("Unauthorized");
  }
}

export const createCompany = action({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"companies">> => {
    requireAdminImportSecret(args.adminSecret);
    return await ctx.runMutation(internal.adminImportInternal.createCompany, {
      userEmail: args.userEmail,
      name: args.name,
    });
  },
});

export const createContact = action({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.union(v.string(), v.null()),
    companyId: v.union(v.id("companies"), v.null()),
    country: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args): Promise<Id<"contacts">> => {
    requireAdminImportSecret(args.adminSecret);
    return await ctx.runMutation(internal.adminImportInternal.createContact, {
      userEmail: args.userEmail,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      companyId: args.companyId,
      country: args.country,
    });
  },
});

export const listCompanies = action({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"companies">[]> => {
    requireAdminImportSecret(args.adminSecret);
    return await ctx.runQuery(internal.adminImportInternal.listCompanies, {
      userEmail: args.userEmail,
    });
  },
});

export const listContacts = action({
  args: {
    adminSecret: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"contacts">[]> => {
    requireAdminImportSecret(args.adminSecret);
    return await ctx.runQuery(internal.adminImportInternal.listContacts, {
      userEmail: args.userEmail,
    });
  },
});
