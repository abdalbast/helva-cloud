"use client";

import Link from "next/link";
import { api } from "convex/_generated/api";
import { useAppQuery, useAppCount } from "@/lib/app-data";
import { localGetAll } from "@/lib/local-store";
import { Users, Calendar, Send, FolderKanban, CheckSquare, PenLine, Sparkles, File, Zap, BarChart3 } from "lucide-react";
import { HomeSearchTrigger } from "./home-search-trigger";
export default function AppHome() {
  const contactCount = useAppCount(api.contacts.count, "contacts") ?? 0;
  const companyCount = useAppCount(api.companies.count, "companies") ?? 0;
  const openDeals = useAppQuery(api.deals.openCount, {
    table: "deals",
    fn: () => localGetAll("deals").filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost").length,
  }) ?? 0;
  const openTasks = useAppQuery(api.tasks.openCount, {
    table: "tasks",
    fn: () => localGetAll("tasks").filter((t) => t.status !== "done").length,
  }) ?? 0;

  const primaryTools = [
    { href: "/app/crm", icon: <Users className="h-5 w-5" />, label: "CRM", desc: "Contacts, companies, deals pipeline", color: "from-sunshine-700/10 to-block-orange/5" },
    { href: "/app/projects", icon: <FolderKanban className="h-5 w-5" />, label: "Projects", desc: "Manage projects and timelines", color: "from-sunshine-700/10 to-block-gold/5" },
    { href: "/app/board", icon: <CheckSquare className="h-5 w-5" />, label: "Board", desc: "Kanban task board", color: "from-sunshine-700/10 to-block-gold/5" },
    { href: "/app/meetings", icon: <Calendar className="h-5 w-5" />, label: "Meetings", desc: "Minutes, decisions, follow-ups", color: "from-sunshine-700/10 to-block-gold/5" },
  ];

  const secondaryTools = [
    { href: "/app/social", icon: <Send className="h-5 w-5" />, label: "Social", desc: "Schedule & publish posts" },
    { href: "/app/content", icon: <PenLine className="h-5 w-5" />, label: "Content", desc: "Campaigns & content planner" },
    { href: "/app/ai", icon: <Sparkles className="h-5 w-5" />, label: "AI", desc: "Prompt history & assistant" },
    { href: "/app/files", icon: <File className="h-5 w-5" />, label: "Files", desc: "File hub & folders" },
    { href: "/app/automations", icon: <Zap className="h-5 w-5" />, label: "Automations", desc: "Triggers & actions" },
    { href: "/app/tracking", icon: <BarChart3 className="h-5 w-5" />, label: "Tracking", desc: "Milestones & progress" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <HomeSearchTrigger />
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatPill label="Contacts" value={contactCount} href="/app/crm/contacts" icon={<Users className="h-5 w-5" />} />
        <StatPill label="Companies" value={companyCount} href="/app/crm/companies" icon={<FolderKanban className="h-5 w-5" />} />
        <StatPill label="Open Deals" value={openDeals} href="/app/crm/deals" icon={<Zap className="h-5 w-5" />} />
        <StatPill label="Open Tasks" value={openTasks} href="/app/board" icon={<CheckSquare className="h-5 w-5" />} />
      </div>

      {/* Primary Tools */}
      <section className="mt-8">
        <h2 className="text-feature">Tools</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {primaryTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:-translate-y-0.5 hover:border-sunshine-700/30 hover:bg-surface-cream active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/25"
            >
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-bright-yellow/0 via-sunshine-700/40 to-mistral-orange/0 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br ${tool.color}`}>
                  {tool.icon}
                </div>
                <div className="font-normal">{tool.label}</div>
              </div>
              <div className="text-body mt-2 text-foreground/70">{tool.desc}</div>
              <div className="text-body mt-2 text-mistral-orange transition group-hover:underline">VIEW →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Secondary Tools */}
      <section className="mt-8">
        <h2 className="text-feature">More</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {secondaryTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative rounded-[2px] border border-foreground/10 bg-surface-pure p-3 transition hover:border-sunshine-700/30 hover:bg-surface-cream active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/25"
            >
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-bright-yellow/0 via-sunshine-700/40 to-mistral-orange/0 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-center gap-2">
                <div className="text-foreground/50">{tool.icon}</div>
                <span className="text-sm">{tool.label}</span>
              </div>
              <div className="text-caption mt-1 text-foreground/50">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatPill({ label, value, href, icon }: { label: string; value: number; href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:-translate-y-0.5 hover:border-sunshine-700/30 hover:bg-surface-cream active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/25"
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-bright-yellow/0 via-sunshine-700/40 to-mistral-orange/0 opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-center gap-2 text-foreground/50">
        {icon}
        <span className="text-caption uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-feature mt-2">{value.toLocaleString()}</div>
    </Link>
  );
}
