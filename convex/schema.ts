import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  companies: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    name: v.string(),
    website: v.union(v.string(), v.null()),
    industry: v.union(v.string(), v.null()),
    size: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["userEmail"] })
    .searchIndex("search_name_by_auth_subject", {
      searchField: "name",
      filterFields: ["authSubject"],
    }),

  contacts: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    companyId: v.union(v.id("companies"), v.null()),
    firstName: v.string(),
    lastName: v.string(),
    email: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    role: v.union(v.string(), v.null()),
    country: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_firstName", { searchField: "firstName", filterFields: ["userEmail"] })
    .searchIndex("search_lastName", { searchField: "lastName", filterFields: ["userEmail"] })
    .searchIndex("search_firstName_by_auth_subject", {
      searchField: "firstName",
      filterFields: ["authSubject"],
    })
    .searchIndex("search_lastName_by_auth_subject", {
      searchField: "lastName",
      filterFields: ["authSubject"],
    }),

  deals: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    companyId: v.union(v.id("companies"), v.null()),
    contactId: v.union(v.id("contacts"), v.null()),
    title: v.string(),
    value: v.number(),
    stage: v.union(
      v.literal("lead"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost"),
    ),
    probability: v.number(),
    closeDate: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
    referredByPartnerId: v.union(v.id("partners"), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["userEmail"] })
    .searchIndex("search_title_by_auth_subject", {
      searchField: "title",
      filterFields: ["authSubject"],
    }),

  partners: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    company: v.union(v.string(), v.null()),
    type: v.union(
      v.literal("affiliate"),
      v.literal("referral"),
      v.literal("partner"),
      v.literal("sponsor"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("prospective"),
      v.literal("inactive"),
    ),
    commissionRate: v.union(v.number(), v.null()),
    notes: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .index("by_user_and_type", ["userEmail", "type"])
    .index("by_auth_subject_and_type", ["authSubject", "type"])
    .searchIndex("search_firstName", { searchField: "firstName", filterFields: ["userEmail"] })
    .searchIndex("search_lastName", { searchField: "lastName", filterFields: ["userEmail"] })
    .searchIndex("search_firstName_by_auth_subject", {
      searchField: "firstName",
      filterFields: ["authSubject"],
    })
    .searchIndex("search_lastName_by_auth_subject", {
      searchField: "lastName",
      filterFields: ["authSubject"],
    }),

  activities: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    dealId: v.union(v.id("deals"), v.null()),
    contactId: v.union(v.id("contacts"), v.null()),
    companyId: v.union(v.id("companies"), v.null()),
    type: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("note"),
    ),
    subject: v.string(),
    body: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_subject", { searchField: "subject", filterFields: ["userEmail"] })
    .searchIndex("search_subject_by_auth_subject", {
      searchField: "subject",
      filterFields: ["authSubject"],
    }),

  followUps: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    contactId: v.union(v.id("contacts"), v.null()),
    dealId: v.union(v.id("deals"), v.null()),
    dueAt: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("done"),
      v.literal("snoozed"),
    ),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_description", { searchField: "description", filterFields: ["userEmail"] })
    .searchIndex("search_description_by_auth_subject", {
      searchField: "description",
      filterFields: ["authSubject"],
    }),

  projects: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    startDate: v.union(v.string(), v.null()),
    endDate: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["userEmail"] })
    .searchIndex("search_name_by_auth_subject", {
      searchField: "name",
      filterFields: ["authSubject"],
    }),

  tasks: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    projectId: v.id("projects"),
    assignee: v.union(v.string(), v.null()),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    dueDate: v.union(v.string(), v.null()),
    position: v.number(),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .index("by_user_and_project", ["userEmail", "projectId"])
    .index("by_auth_subject_and_project", ["authSubject", "projectId"])
    .index("by_project", ["projectId"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["userEmail"] })
    .searchIndex("search_title_by_auth_subject", {
      searchField: "title",
      filterFields: ["authSubject"],
    }),

  // attendees is bounded by practical meeting size (typically < 50)
  meetings: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    title: v.string(),
    date: v.string(),
    attendees: v.array(v.string()),
    notes: v.union(v.string(), v.null()),
    decisions: v.union(v.string(), v.null()),
    followUps: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["userEmail"] })
    .searchIndex("search_title_by_auth_subject", {
      searchField: "title",
      filterFields: ["authSubject"],
    }),

  socialPosts: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    platform: v.string(),
    content: v.string(),
    scheduledAt: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
    ),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_content", { searchField: "content", filterFields: ["userEmail"] })
    .searchIndex("search_content_by_auth_subject", {
      searchField: "content",
      filterFields: ["authSubject"],
    }),

  contentCampaigns: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    name: v.string(),
    channel: v.union(v.string(), v.null()),
    brief: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("published"),
      v.literal("completed"),
    ),
    startDate: v.union(v.string(), v.null()),
    endDate: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["userEmail"] })
    .searchIndex("search_name_by_auth_subject", {
      searchField: "name",
      filterFields: ["authSubject"],
    }),

  files: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    name: v.string(),
    type: v.union(v.string(), v.null()),
    url: v.union(v.string(), v.null()),
    sizeBytes: v.union(v.number(), v.null()),
    folder: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["userEmail"] })
    .searchIndex("search_name_by_auth_subject", {
      searchField: "name",
      filterFields: ["authSubject"],
    }),

  automations: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    name: v.string(),
    trigger: v.string(),
    action: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("error"),
    ),
    lastRunAt: v.union(v.string(), v.null()),
    runCount: v.number(),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_name", { searchField: "name", filterFields: ["userEmail"] })
    .searchIndex("search_name_by_auth_subject", {
      searchField: "name",
      filterFields: ["authSubject"],
    }),

  aiPrompts: defineTable({
    authSubject: v.optional(v.string()),
    userEmail: v.string(),
    title: v.string(),
    prompt: v.string(),
    output: v.union(v.string(), v.null()),
  })
    .index("by_user", ["userEmail"])
    .index("by_auth_subject", ["authSubject"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["userEmail"] })
    .searchIndex("search_title_by_auth_subject", {
      searchField: "title",
      filterFields: ["authSubject"],
    }),
});
