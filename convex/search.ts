import { query } from "./_generated/server";
import { v } from "convex/values";
import { getViewerIdentity, mergeTenantResults } from "./lib/auth";

export const global = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchTerm }) => {
    if (!searchTerm.trim()) return [];

    const viewer = await getViewerIdentity(ctx);
    if (!viewer) return [];

    const results: Array<{
      type: string;
      id: string;
      title: string;
      subtitle?: string;
    }> = [];

    const [
      contactsByFirstAuth,
      contactsByLastAuth,
      contactsByFirstEmail,
      contactsByLastEmail,
      companiesByAuth,
      companiesByEmail,
      dealsByAuth,
      dealsByEmail,
      activitiesByAuth,
      activitiesByEmail,
      followUpsByAuth,
      followUpsByEmail,
      projectsByAuth,
      projectsByEmail,
      tasksByAuth,
      tasksByEmail,
      meetingsByAuth,
      meetingsByEmail,
      socialPostsByAuth,
      socialPostsByEmail,
      contentCampaignsByAuth,
      contentCampaignsByEmail,
      filesByAuth,
      filesByEmail,
      automationsByAuth,
      automationsByEmail,
      aiPromptsByAuth,
      aiPromptsByEmail,
      partnersByFirstAuth,
      partnersByLastAuth,
      partnersByFirstEmail,
      partnersByLastEmail,
    ] = await Promise.all([
      ctx.db
        .query("contacts")
        .withSearchIndex("search_firstName_by_auth_subject", (q) =>
          q.search("firstName", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      ctx.db
        .query("contacts")
        .withSearchIndex("search_lastName_by_auth_subject", (q) =>
          q.search("lastName", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("contacts")
            .withSearchIndex("search_firstName", (q) =>
              q.search("firstName", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      viewer.email
        ? ctx.db
            .query("contacts")
            .withSearchIndex("search_lastName", (q) =>
              q.search("lastName", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("companies")
        .withSearchIndex("search_name_by_auth_subject", (q) =>
          q.search("name", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("companies")
            .withSearchIndex("search_name", (q) =>
              q.search("name", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("deals")
        .withSearchIndex("search_title_by_auth_subject", (q) =>
          q.search("title", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("deals")
            .withSearchIndex("search_title", (q) =>
              q.search("title", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("activities")
        .withSearchIndex("search_subject_by_auth_subject", (q) =>
          q.search("subject", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("activities")
            .withSearchIndex("search_subject", (q) =>
              q.search("subject", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("followUps")
        .withSearchIndex("search_description_by_auth_subject", (q) =>
          q.search("description", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("followUps")
            .withSearchIndex("search_description", (q) =>
              q.search("description", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("projects")
        .withSearchIndex("search_name_by_auth_subject", (q) =>
          q.search("name", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("projects")
            .withSearchIndex("search_name", (q) =>
              q.search("name", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("tasks")
        .withSearchIndex("search_title_by_auth_subject", (q) =>
          q.search("title", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("tasks")
            .withSearchIndex("search_title", (q) =>
              q.search("title", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("meetings")
        .withSearchIndex("search_title_by_auth_subject", (q) =>
          q.search("title", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("meetings")
            .withSearchIndex("search_title", (q) =>
              q.search("title", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("socialPosts")
        .withSearchIndex("search_content_by_auth_subject", (q) =>
          q.search("content", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("socialPosts")
            .withSearchIndex("search_content", (q) =>
              q.search("content", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("contentCampaigns")
        .withSearchIndex("search_name_by_auth_subject", (q) =>
          q.search("name", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("contentCampaigns")
            .withSearchIndex("search_name", (q) =>
              q.search("name", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("files")
        .withSearchIndex("search_name_by_auth_subject", (q) =>
          q.search("name", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("files")
            .withSearchIndex("search_name", (q) =>
              q.search("name", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("automations")
        .withSearchIndex("search_name_by_auth_subject", (q) =>
          q.search("name", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("automations")
            .withSearchIndex("search_name", (q) =>
              q.search("name", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("aiPrompts")
        .withSearchIndex("search_title_by_auth_subject", (q) =>
          q.search("title", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("aiPrompts")
            .withSearchIndex("search_title", (q) =>
              q.search("title", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      ctx.db
        .query("partners")
        .withSearchIndex("search_firstName_by_auth_subject", (q) =>
          q.search("firstName", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      ctx.db
        .query("partners")
        .withSearchIndex("search_lastName_by_auth_subject", (q) =>
          q.search("lastName", searchTerm).eq("authSubject", viewer.authSubject),
        )
        .take(5),
      viewer.email
        ? ctx.db
            .query("partners")
            .withSearchIndex("search_firstName", (q) =>
              q.search("firstName", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
      viewer.email
        ? ctx.db
            .query("partners")
            .withSearchIndex("search_lastName", (q) =>
              q.search("lastName", searchTerm).eq("userEmail", viewer.email!),
            )
            .take(5)
        : Promise.resolve([]),
    ]);

    const contacts = mergeTenantResults(
      contactsByFirstAuth,
      contactsByLastAuth,
      contactsByFirstEmail,
      contactsByLastEmail,
    );
    const companies = mergeTenantResults(companiesByAuth, companiesByEmail);
    const deals = mergeTenantResults(dealsByAuth, dealsByEmail);
    const activities = mergeTenantResults(activitiesByAuth, activitiesByEmail);
    const followUps = mergeTenantResults(followUpsByAuth, followUpsByEmail);
    const projects = mergeTenantResults(projectsByAuth, projectsByEmail);
    const tasks = mergeTenantResults(tasksByAuth, tasksByEmail);
    const meetings = mergeTenantResults(meetingsByAuth, meetingsByEmail);
    const socialPosts = mergeTenantResults(
      socialPostsByAuth,
      socialPostsByEmail,
    );
    const contentCampaigns = mergeTenantResults(
      contentCampaignsByAuth,
      contentCampaignsByEmail,
    );
    const files = mergeTenantResults(filesByAuth, filesByEmail);
    const automations = mergeTenantResults(
      automationsByAuth,
      automationsByEmail,
    );
    const aiPrompts = mergeTenantResults(aiPromptsByAuth, aiPromptsByEmail);
    const partners = mergeTenantResults(
      partnersByFirstAuth,
      partnersByLastAuth,
      partnersByFirstEmail,
      partnersByLastEmail,
    );

    for (const contact of contacts) {
      results.push({
        type: "contact",
        id: contact._id,
        title: `${contact.firstName} ${contact.lastName}`,
        subtitle: contact.email ?? undefined,
      });
    }
    for (const company of companies) {
      results.push({
        type: "company",
        id: company._id,
        title: company.name,
        subtitle: company.industry ?? undefined,
      });
    }
    for (const deal of deals) {
      results.push({
        type: "deal",
        id: deal._id,
        title: deal.title,
        subtitle: deal.stage.replace("_", " "),
      });
    }
    for (const activity of activities) {
      results.push({
        type: "activity",
        id: activity._id,
        title: activity.subject,
        subtitle: activity.type,
      });
    }
    for (const followUp of followUps) {
      results.push({
        type: "follow_up",
        id: followUp._id,
        title: followUp.description,
        subtitle: followUp.status.replace("_", " "),
      });
    }
    for (const project of projects) {
      results.push({
        type: "project",
        id: project._id,
        title: project.name,
        subtitle: project.status.replace("_", " "),
      });
    }
    for (const task of tasks) {
      results.push({
        type: "task",
        id: task._id,
        title: task.title,
        subtitle: task.status.replace("_", " "),
      });
    }
    for (const meeting of meetings) {
      results.push({
        type: "meeting",
        id: meeting._id,
        title: meeting.title,
        subtitle: meeting.date,
      });
    }
    for (const socialPost of socialPosts) {
      results.push({
        type: "social_post",
        id: socialPost._id,
        title:
          socialPost.content.slice(0, 60) +
          (socialPost.content.length > 60 ? "…" : ""),
        subtitle: socialPost.platform,
      });
    }
    for (const contentCampaign of contentCampaigns) {
      results.push({
        type: "campaign",
        id: contentCampaign._id,
        title: contentCampaign.name,
        subtitle: contentCampaign.status.replace("_", " "),
      });
    }
    for (const file of files) {
      results.push({
        type: "file",
        id: file._id,
        title: file.name,
        subtitle: file.type ?? undefined,
      });
    }
    for (const automation of automations) {
      results.push({
        type: "automation",
        id: automation._id,
        title: automation.name,
        subtitle: automation.status,
      });
    }
    for (const prompt of aiPrompts) {
      results.push({
        type: "ai_prompt",
        id: prompt._id,
        title: prompt.title,
      });
    }
    for (const partner of partners) {
      results.push({
        type: "partner",
        id: partner._id,
        title: `${partner.firstName} ${partner.lastName}`,
        subtitle: partner.type,
      });
    }

    return results;
  },
});
