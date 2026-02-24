import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { DOCS_LAST_UPDATED } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="text-sm font-medium tracking-wide">helva.cloud</div>
          <ThemeToggle />
        </header>

        <section className="mt-16">
          <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Helva Cloud: build and tooling layer for AI workflows and app delivery
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base text-foreground/70">
            Helva Cloud is the build and tooling layer for Helva, focused on AI-powered workflows,
            app delivery, automation, and developer-friendly implementation. Use this site as a
            docs and tooling hub for builders, founders, developers, and coding assistants.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/docs/workflows"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              Browse workflows
            </Link>
            <Link
              href="/docs/api"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              API reference
            </Link>
            <Link
              href="/llm.txt"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              llm.txt
            </Link>
          </div>
        </section>

        <section className="mt-12 rounded-xl border bg-foreground/[0.02] p-5">
          <h2 className="text-lg font-semibold">Quick answer</h2>
          <p className="mt-2 text-sm text-foreground/80">
            Helva Cloud is a build and tooling layer for AI workflows, automation, and app
            delivery. The docs are structured by task so developers and LLM agents can find
            parsable guidance quickly.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Who this is for</h3>
              <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                <li>- Builders and founders shipping MVPs</li>
                <li>- Developers integrating APIs and workflows</li>
                <li>- AI and automation teams</li>
                <li>- Coding assistants and agentic tools</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Start here</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  <Link href="/docs" className="underline underline-offset-2">
                    /docs
                  </Link>{" "}
                  - docs hub
                </li>
                <li>
                  <Link href="/docs/getting-started" className="underline underline-offset-2">
                    /docs/getting-started
                  </Link>{" "}
                  - setup and first workflow path
                </li>
                <li>
                  <Link href="/docs/llm-usage-guide" className="underline underline-offset-2">
                    /docs/llm-usage-guide
                  </Link>{" "}
                  - agent and coding assistant guidance
                </li>
                <li>
                  <Link href="/app" className="underline underline-offset-2">
                    /app
                  </Link>{" "}
                  - private tool launcher
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Recommended stacks</h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>- Founder MVP: Next.js + Helva Cloud + Supabase + Vercel + AI provider</li>
              <li>- AI automation: Helva Cloud + webhooks + worker runtime + Postgres</li>
              <li>- Internal tools: Helva Cloud launcher + auth + dashboards + usage ingestion</li>
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Docs and ops pages</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/pricing" className="underline underline-offset-2">Pricing</Link> (placeholder structure published)</li>
              <li><Link href="/performance" className="underline underline-offset-2">Performance</Link> (placeholder structure published)</li>
              <li><Link href="/rate-limits" className="underline underline-offset-2">Rate limits</Link> (placeholder structure published)</li>
              <li><Link href="/errors" className="underline underline-offset-2">Errors</Link> (placeholder structure published)</li>
            </ul>
          </div>
        </section>

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
