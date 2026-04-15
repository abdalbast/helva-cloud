import { query } from "./_generated/server";
import { v } from "convex/values";
import { getUserEmail } from "./lib/auth";

export const global = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchTerm }) => {
    if (!searchTerm.trim()) return [];

    const userEmail = await getUserEmail(ctx);
    if (!userEmail) return [];
    const results: Array<{ type: string; id: string; title: string; subtitle?: string }> = [];

    const [
      contactsByFirst, contactsByLast, companies, deals, activities,
      followUps, projects, tasks, meetings, socialPosts,
      contentCampaigns, files, automations, aiPrompts, partnersByFirst, partnersByLast,
    ] = await Promise.all([
      ctx.db.query("contacts").withSearchIndex("search_firstName", (q) => q.search("firstName", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("contacts").withSearchIndex("search_lastName", (q) => q.search("lastName", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("companies").withSearchIndex("search_name", (q) => q.search("name", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("deals").withSearchIndex("search_title", (q) => q.search("title", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("activities").withSearchIndex("search_subject", (q) => q.search("subject", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("followUps").withSearchIndex("search_description", (q) => q.search("description", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("projects").withSearchIndex("search_name", (q) => q.search("name", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("tasks").withSearchIndex("search_title", (q) => q.search("title", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("meetings").withSearchIndex("search_title", (q) => q.search("title", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("socialPosts").withSearchIndex("search_content", (q) => q.search("content", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("contentCampaigns").withSearchIndex("search_name", (q) => q.search("name", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("files").withSearchIndex("search_name", (q) => q.search("name", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("automations").withSearchIndex("search_name", (q) => q.search("name", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("aiPrompts").withSearchIndex("search_title", (q) => q.search("title", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("partners").withSearchIndex("search_firstName", (q) => q.search("firstName", searchTerm).eq("userEmail", userEmail)).take(5),
      ctx.db.query("partners").withSearchIndex("search_lastName", (q) => q.search("lastName", searchTerm).eq("userEmail", userEmail)).take(5),
    ]);

    // Deduplicate contacts (may appear in both firstName and lastName results)
    const seenContactIds = new Set<string>();
    for (const c of [...contactsByFirst, ...contactsByLast]) {
      if (seenContactIds.has(c._id)) continue;
      seenContactIds.add(c._id);
      results.push({ type: "contact", id: c._id, title: `${c.firstName} ${c.lastName}`, subtitle: c.email ?? undefined });
    }
    for (const c of companies) {
      results.push({ type: "company", id: c._id, title: c.name, subtitle: c.industry ?? undefined });
    }
    for (const d of deals) {
      results.push({ type: "deal", id: d._id, title: d.title, subtitle: d.stage.replace("_", " ") });
    }
    for (const a of activities) {
      results.push({ type: "activity", id: a._id, title: a.subject, subtitle: a.type });
    }
    for (const f of followUps) {
      results.push({ type: "follow_up", id: f._id, title: f.description, subtitle: f.status.replace("_", " ") });
    }
    for (const p of projects) {
      results.push({ type: "project", id: p._id, title: p.name, subtitle: p.status.replace("_", " ") });
    }
    for (const t of tasks) {
      results.push({ type: "task", id: t._id, title: t.title, subtitle: t.status.replace("_", " ") });
    }
    for (const m of meetings) {
      results.push({ type: "meeting", id: m._id, title: m.title, subtitle: m.date });
    }
    for (const s of socialPosts) {
      results.push({ type: "social_post", id: s._id, title: s.content.slice(0, 60) + (s.content.length > 60 ? "…" : ""), subtitle: s.platform });
    }
    for (const c of contentCampaigns) {
      results.push({ type: "campaign", id: c._id, title: c.name, subtitle: c.status.replace("_", " ") });
    }
    for (const f of files) {
      results.push({ type: "file", id: f._id, title: f.name, subtitle: f.type ?? undefined });
    }
    for (const a of automations) {
      results.push({ type: "automation", id: a._id, title: a.name, subtitle: a.status });
    }
    for (const p of aiPrompts) {
      results.push({ type: "ai_prompt", id: p._id, title: p.title, subtitle: undefined });
    }
    const seenPartnerIds = new Set<string>();
    for (const p of [...partnersByFirst, ...partnersByLast]) {
      if (seenPartnerIds.has(p._id)) continue;
      seenPartnerIds.add(p._id);
      results.push({ type: "partner", id: p._id, title: `${p.firstName} ${p.lastName}`, subtitle: p.type });
    }

    return results;
  },
});
