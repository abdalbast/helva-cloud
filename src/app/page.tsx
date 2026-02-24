import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { DOCS_LAST_UPDATED } from "@/lib/site";

type QuickTool = {
  name: string;
  description: string;
  cta: string;
  status: string;
  href: string;
  icon: "minutes" | "social" | "crm" | "projects" | "tracking" | "board" | "content" | "ai" | "files" | "automations";
};

type SnapshotStat = {
  label: string;
  value: string;
  hint: string;
};

type RecentItem = {
  title: string;
  meta: string;
  cta: string;
  href: string;
};

const primaryTools: QuickTool[] = [
  {
    icon: "minutes",
    name: "Meeting Minutes",
    description: "Capture notes, decisions, and follow-ups from recent calls.",
    cta: "Open Meeting Minutes",
    status: "3 meetings this week",
    href: "https://meeting.helva.cloud",
  },
  {
    icon: "social",
    name: "Social Media Scheduler",
    description: "Plan, review, and schedule posts across active channels.",
    cta: "Schedule Post",
    status: "2 drafts pending",
    href: "https://social.helva.cloud",
  },
  {
    icon: "crm",
    name: "CRM",
    description: "Review pipeline activity, follow-ups, and client notes.",
    cta: "View CRM Pipeline",
    status: "5 follow-ups due",
    href: "/app",
  },
  {
    icon: "projects",
    name: "Projects",
    description: "Jump into active client and internal project spaces.",
    cta: "Continue Project",
    status: "8 active projects",
    href: "/app",
  },
  {
    icon: "tracking",
    name: "Project Tracking",
    description: "Track milestones, blockers, and delivery progress.",
    cta: "Track Progress",
    status: "2 milestones due",
    href: "/app",
  },
  {
    icon: "board",
    name: "Project Management Board",
    description: "Manage tasks, handovers, and team priorities in one board.",
    cta: "Open Board",
    status: "14 tasks due today",
    href: "/app",
  },
];

const secondaryTools: QuickTool[] = [
  {
    icon: "content",
    name: "Content Planner",
    description: "Plan campaigns and assign content tasks by channel.",
    cta: "Open Planner",
    status: "Next campaign starts Thu",
    href: "/app",
  },
  {
    icon: "ai",
    name: "AI Assistant",
    description: "Draft updates, summaries, and internal handover notes.",
    cta: "New Prompt",
    status: "Ready",
    href: "/app",
  },
  {
    icon: "files",
    name: "File Hub",
    description: "Open briefs, meeting recordings, and shared assets.",
    cta: "Open Files",
    status: "12 recent uploads",
    href: "/app",
  },
  {
    icon: "automations",
    name: "Automations",
    description: "Review runs, failures, and workflow triggers.",
    cta: "Resume Flows",
    status: "1 action needed",
    href: "/app",
  },
];

const snapshotStats: SnapshotStat[] = [
  { label: "Today’s meetings", value: "3", hint: "Next at 14:30" },
  { label: "Upcoming tasks", value: "14", hint: "4 high priority" },
  { label: "Active projects", value: "8", hint: "2 awaiting review" },
  { label: "Scheduled posts", value: "19", hint: "This week" },
  { label: "CRM follow-ups", value: "5", hint: "Due today" },
];

const recentWork: RecentItem[] = [
  {
    title: "Meeting notes for Client A",
    meta: "Updated 45 min ago",
    cta: "Resume",
    href: "/app",
  },
  {
    title: "Q1 Content Calendar",
    meta: "Edited by Marketing",
    cta: "Open",
    href: "/app",
  },
  {
    title: "Helva CRM pipeline review",
    meta: "Saved yesterday",
    cta: "Continue",
    href: "/app",
  },
  {
    title: "Website redesign project board",
    meta: "7 tasks updated",
    cta: "Open Board",
    href: "/app",
  },
];

function ToolIcon({ kind }: { kind: QuickTool["icon"] }) {
  const common = "h-5 w-5";
  switch (kind) {
    case "minutes":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M8.5 9h7M8.5 12h7M8.5 15h4.5" />
        </svg>
      );
    case "social":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M5 7h14M5 12h9M5 17h12" />
          <path d="M18 10l2 2-2 2" />
        </svg>
      );
    case "crm":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M12 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
          <path d="M5 19a7 7 0 0 1 14 0" />
          <path d="M18.5 7.5h.01" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M3 7h18M6 4h3m6 0h3" />
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M8 11h3v4H8zm5 0h3v7h-3z" />
        </svg>
      );
    case "tracking":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M4 19h16" />
          <path d="M7 16l3-3 2 2 5-6" />
          <path d="M17 9h2v2" />
        </svg>
      );
    case "board":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <rect x="3" y="5" width="5" height="14" rx="1.5" />
          <rect x="10" y="5" width="5" height="9" rx="1.5" />
          <rect x="17" y="5" width="4" height="12" rx="1.5" />
        </svg>
      );
    case "content":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M7 4h10M7 8h10M7 12h6" />
          <rect x="4" y="3" width="16" height="18" rx="2" />
        </svg>
      );
    case "ai":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M12 3v4M12 17v4M4.9 6.9l2.8 2.8M16.3 14.3l2.8 2.8M3 12h4M17 12h4M4.9 17.1l2.8-2.8M16.3 9.7l2.8-2.8" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      );
    case "files":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5M8 13h8M8 17h5" />
        </svg>
      );
    case "automations":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common} aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8" />
          <path d="M20 4v4h-4" />
          <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16" />
          <path d="M4 20v-4h4" />
        </svg>
      );
  }
}

function DashboardHero() {
  return (
    <section className="mt-12 overflow-hidden rounded-3xl border border-foreground/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_40%),radial-gradient(circle_at_70%_100%,rgba(14,165,233,0.1),transparent_40%)] p-4 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="pointer-events-none absolute" />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-background/85 px-3 py-1 text-xs font-medium text-foreground/75 shadow-sm shadow-sky-500/10 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500" />
            Workspace command centre
          </div>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.55rem]">
            Start where the work happens
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/70 sm:text-base">
            Access your core workflows, projects, and client activity in one place. Open the tools
            you use most and continue work without digging through menus.
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-2xl border border-sky-500/15 bg-background/90 px-4 py-3 text-left shadow-[0_8px_24px_-16px_rgba(37,99,235,0.45)] backdrop-blur transition hover:border-sky-500/30 hover:bg-white/95 dark:hover:bg-white/5 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
            aria-label="Search tools, projects, clients and notes"
          >
            <span className="text-foreground/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                <circle cx="11" cy="11" r="6" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <span className="flex-1 text-sm text-foreground/60">
              Search tools, projects, clients, notes...
            </span>
            <span className="rounded-md border border-foreground/10 bg-foreground/[0.03] px-2 py-0.5 text-[11px] text-foreground/55">
              ⌘K
            </span>
          </button>

          <div className="rounded-2xl border border-foreground/10 bg-background/95 p-4 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Personal snapshot</h2>
              <span className="text-xs text-foreground/55">Today</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {snapshotStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-foreground/8 bg-gradient-to-b from-foreground/[0.03] to-transparent p-3"
                >
                  <div className="text-xs text-foreground/60">{stat.label}</div>
                  <div className="mt-1 text-lg font-semibold tracking-tight">{stat.value}</div>
                  <div className="mt-0.5 text-[11px] text-foreground/55">{stat.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground/80">Quick access</h2>
          <span className="text-xs text-foreground/55">Pinned tools first</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {primaryTools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              className="group relative rounded-2xl border border-foreground/10 bg-background/95 p-4 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:border-sky-500/20 hover:bg-gradient-to-b hover:from-sky-500/[0.035] hover:to-fuchsia-500/[0.025] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/25"
            >
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-sky-500/0 via-sky-500/35 to-fuchsia-500/0 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/15 bg-gradient-to-br from-sky-500/[0.08] to-fuchsia-500/[0.06] text-foreground/85">
                  <ToolIcon kind={tool.icon} />
                </div>
                <span className="rounded-full border border-foreground/10 bg-background/80 px-2 py-0.5 text-[11px] text-foreground/60">
                  {tool.status}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{tool.name}</h3>
              <p className="mt-1 text-sm leading-5 text-foreground/65">{tool.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-lg border border-foreground/10 bg-foreground/[0.02] px-2.5 py-1.5 text-sm font-medium text-foreground">
                {tool.cta}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-foreground/10 bg-background/95 p-4 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Continue where you left off</h2>
            <Link href="/app" className="text-xs text-foreground/60 hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {recentWork.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-foreground/8 bg-gradient-to-r from-foreground/[0.02] to-transparent px-3 py-2.5 transition hover:border-sky-500/15 hover:bg-gradient-to-r hover:from-sky-500/[0.04] hover:to-fuchsia-500/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.title}</div>
                  <div className="truncate text-xs text-foreground/60">{item.meta}</div>
                </div>
                <span className="shrink-0 text-xs font-medium text-foreground/75">{item.cta}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background/95 p-4 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">More tools</h2>
            <span className="text-xs text-foreground/55">Optional</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {secondaryTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.href}
                className="rounded-xl border border-foreground/8 bg-foreground/[0.02] p-3 transition hover:border-sky-500/15 hover:bg-gradient-to-r hover:from-sky-500/[0.035] hover:to-fuchsia-500/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/15 bg-gradient-to-br from-sky-500/[0.06] to-fuchsia-500/[0.05]">
                    <ToolIcon kind={tool.icon} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{tool.name}</div>
                    <div className="truncate text-[11px] text-foreground/55">{tool.status}</div>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-4 text-foreground/65">
                  {tool.description}
                </p>
                <div className="mt-2 text-xs font-medium">{tool.cta}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <SiteHeader />

        <DashboardHero />

        <section id="tools" className="mt-20">
          <h2 className="text-xl font-semibold">Helva business tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <a
              href="https://social.helva.cloud"
              className="rounded-lg border p-4 hover:bg-foreground/5"
            >
              <div className="font-medium">Social Scheduler</div>
              <div className="mt-1 text-sm text-foreground/70">
                Publish queue, calendar, and campaign scheduling.
              </div>
              <div className="mt-2 text-sm underline">Open</div>
            </a>

            <a
              href="https://meeting.helva.cloud"
              className="rounded-lg border p-4 hover:bg-foreground/5"
            >
              <div className="font-medium">MeetingMind</div>
              <div className="mt-1 text-sm text-foreground/70">
                Meeting capture + summaries (landing page for now).
              </div>
              <div className="mt-2 text-sm underline">Open</div>
            </a>

            <div className="rounded-lg border p-4">
              <div className="font-medium">More tools coming</div>
              <div className="mt-1 text-sm text-foreground/70">
                This page is the launchpad for everything we ship under helva.cloud.
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/60">
          <span>© {new Date().getFullYear()} Helva</span>
          <span>Docs last updated: {DOCS_LAST_UPDATED}</span>
        </footer>
      </div>
    </main>
  );
}
