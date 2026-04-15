/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as adminImport from "../adminImport.js";
import type * as adminImportInternal from "../adminImportInternal.js";
import type * as aiPrompts from "../aiPrompts.js";
import type * as auth from "../auth.js";
import type * as automations from "../automations.js";
import type * as companies from "../companies.js";
import type * as contacts from "../contacts.js";
import type * as contentCampaigns from "../contentCampaigns.js";
import type * as deals from "../deals.js";
import type * as files from "../files.js";
import type * as followUps from "../followUps.js";
import type * as http from "../http.js";
import type * as importContacts from "../importContacts.js";
import type * as lib_auth from "../lib/auth.js";
import type * as meetings from "../meetings.js";
import type * as partners from "../partners.js";
import type * as projects from "../projects.js";
import type * as search from "../search.js";
import type * as socialPosts from "../socialPosts.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  adminImport: typeof adminImport;
  adminImportInternal: typeof adminImportInternal;
  aiPrompts: typeof aiPrompts;
  auth: typeof auth;
  automations: typeof automations;
  companies: typeof companies;
  contacts: typeof contacts;
  contentCampaigns: typeof contentCampaigns;
  deals: typeof deals;
  files: typeof files;
  followUps: typeof followUps;
  http: typeof http;
  importContacts: typeof importContacts;
  "lib/auth": typeof lib_auth;
  meetings: typeof meetings;
  partners: typeof partners;
  projects: typeof projects;
  search: typeof search;
  socialPosts: typeof socialPosts;
  tasks: typeof tasks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
