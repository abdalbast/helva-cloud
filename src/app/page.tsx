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
    <section className="mt-12 overflow-hidden rounded-[2px] border border-foreground/10 bg-surface-cream/50 p-4 shadow-golden sm:p-6">
      <div className="pointer-events-none absolute" />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
        <div>
          <h1 className="text-display text-balance text-foreground">
            Start where the work happens
          </h1>
          <p className="text-body mt-3 max-w-2xl text-foreground/70">
            Access your core workflows, projects, and client activity in one place. Open the tools
            you use most and continue work without digging through menus.
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-[2px] border border-sunshine-700/20 bg-surface-pure px-4 py-3 text-left shadow-golden backdrop-blur transition hover:border-mistral-orange/30 hover:bg-surface-cream active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30"
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
            <span className="rounded-[2px] border border-foreground/10 bg-surface-cream px-2 py-0.5 text-[11px] text-foreground/55">
              ⌘K
            </span>
          </button>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-caption uppercase tracking-wide text-foreground/80">Quick access</h2>
              <span className="text-caption text-foreground/55">Pinned tools</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {primaryTools.slice(0, 4).map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  className="group rounded-[2px] border border-foreground/10 bg-surface-pure p-3 transition hover:-translate-y-0.5 hover:border-sunshine-700/30 hover:bg-surface-cream active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/25"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br from-sunshine-700/10 to-block-orange/5 text-foreground/85">
                      <ToolIcon kind={tool.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-normal">{tool.name}</div>
                      <div className="truncate text-[11px] text-foreground/55">{tool.status}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-caption uppercase tracking-wider text-foreground/80">Primary tools</h2>
          <span className="text-caption text-foreground/55">Pinned first</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {primaryTools.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              className="group relative rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:-translate-y-0.5 hover:border-sunshine-700/30 hover:bg-surface-cream active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/25"
            >
              <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-bright-yellow/0 via-sunshine-700/40 to-mistral-orange/0 opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br from-sunshine-700/10 to-block-orange/5 text-foreground/85">
                  <ToolIcon kind={tool.icon} />
                </div>
                <span className="rounded-[2px] border border-foreground/10 bg-surface-cream/80 px-2 py-0.5 text-[11px] text-foreground/60">
                  {tool.status}
                </span>
              </div>
              <h3 className="text-body mt-3 font-normal">{tool.name}</h3>
              <p className="text-body mt-1 text-foreground/65">{tool.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-[2px] border border-foreground/10 bg-surface-cream px-2.5 py-1.5 text-sm font-normal text-foreground transition group-hover:border-sunshine-700/30">
                {tool.cta}
                <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-caption uppercase tracking-wide text-foreground/80">Continue where you left off</h2>
            <Link href="/app" className="text-caption text-foreground/60 hover:text-mistral-orange">
              View all
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {recentWork.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-[2px] border border-foreground/8 bg-surface-cream/40 px-3 py-2.5 transition hover:border-sunshine-700/20 hover:bg-surface-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/20"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-normal">{item.title}</div>
                  <div className="truncate text-caption text-foreground/60">{item.meta}</div>
                </div>
                <span className="shrink-0 text-caption font-normal text-foreground/75">{item.cta}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-caption uppercase tracking-wide text-foreground/80">More tools</h2>
            <span className="text-caption text-foreground/55">Optional</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {secondaryTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.href}
                className="rounded-[2px] border border-foreground/8 bg-surface-cream/30 p-3 transition hover:border-sunshine-700/20 hover:bg-surface-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/20"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-sunshine-700/15 bg-gradient-to-br from-sunshine-700/8 to-block-orange/5">
                    <ToolIcon kind={tool.icon} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-normal">{tool.name}</div>
                    <div className="truncate text-[11px] text-foreground/55">{tool.status}</div>
                  </div>
                </div>
                <p className="text-caption mt-2 line-clamp-2 leading-4 text-foreground/65">
                  {tool.description}
                </p>
                <div className="text-caption mt-2 font-normal">{tool.cta}</div>
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
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <SiteHeader />

        <DashboardHero />

        <section id="tools" className="mt-20">
          <h2 className="text-card-title">Helva business tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <a
              href="https://social.helva.cloud"
              className="group rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:-translate-y-0.5 hover:border-sunshine-700/30 hover:bg-surface-cream"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br from-sunshine-700/10 to-block-orange/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <path d="M5 7h14M5 12h9M5 17h12" />
                    <path d="M18 10l2 2-2 2" />
                  </svg>
                </div>
                <div className="font-normal">Social Scheduler</div>
              </div>
              <div className="text-body mt-2 text-foreground/70">
                Publish queue, calendar, and campaign scheduling.
              </div>
              <div className="text-body mt-2 text-mistral-orange transition group-hover:underline">OPEN →</div>
            </a>

            <a
              href="https://meeting.helva.cloud"
              className="group rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:-translate-y-0.5 hover:border-sunshine-700/30 hover:bg-surface-cream"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br from-sunshine-700/10 to-block-orange/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                    <path d="M8.5 9h7M8.5 12h7M8.5 15h4.5" />
                  </svg>
                </div>
                <div className="font-normal">MeetingMind</div>
              </div>
              <div className="text-body mt-2 text-foreground/70">
                Meeting capture + summaries (landing page for now).
              </div>
              <div className="text-body mt-2 text-mistral-orange transition group-hover:underline">OPEN →</div>
            </a>

            <div className="rounded-[2px] border border-foreground/10 bg-surface-cream/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-foreground/20 bg-foreground/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
                <div className="font-normal">More tools coming</div>
              </div>
              <div className="text-body mt-2 text-foreground/70">
                This page is the launchpad for everything we ship under HELVA CLOUD.
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 pt-6 text-caption text-foreground/60">
          <span>© {new Date().getFullYear()} Helva</span>
          <span>Docs last updated: <span className="text-sunshine-700">{DOCS_LAST_UPDATED}</span></span>
        </footer>
      </div>
    </main>
  );
}
