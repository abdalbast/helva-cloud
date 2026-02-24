import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Documentation",
  description: "Helva Cloud documentation overview, recommended stacks, and operations pages.",
  path: "/documentation",
});

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <SiteHeader />

        <section className="mt-12 rounded-2xl border border-foreground/10 bg-gradient-to-b from-sky-500/8 via-blue-500/3 to-transparent p-6">
          <div className="inline-flex items-center rounded-full border border-foreground/10 bg-background/90 px-3 py-1 text-xs font-medium text-foreground/70">
            Resources
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Documentation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/70 sm:text-base">
            Find the fastest route into Helva Cloud docs, platform guidance, and operational
            reference pages.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Link
              href="/docs"
              className="rounded-md bg-foreground px-4 py-2 font-medium text-background hover:opacity-90"
            >
              Open Docs Hub
            </Link>
            <Link
              href="/docs/getting-started"
              className="rounded-md border px-4 py-2 font-medium hover:bg-foreground/[0.04]"
            >
              Getting Started
            </Link>
            <Link
              href="/docs/api"
              className="rounded-md border px-4 py-2 font-medium hover:bg-foreground/[0.04]"
            >
              API Reference
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-xl border bg-foreground/[0.02] p-5">
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
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
              <li>
                <Link href="/pricing" className="underline underline-offset-2">
                  Pricing
                </Link>{" "}
                (placeholder structure published)
              </li>
              <li>
                <Link href="/performance" className="underline underline-offset-2">
                  Performance
                </Link>{" "}
                (placeholder structure published)
              </li>
              <li>
                <Link href="/rate-limits" className="underline underline-offset-2">
                  Rate limits
                </Link>{" "}
                (placeholder structure published)
              </li>
              <li>
                <Link href="/errors" className="underline underline-offset-2">
                  Errors
                </Link>{" "}
                (placeholder structure published)
              </li>
            </ul>
          </div>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/60">
          <span>© {new Date().getFullYear()} Helva</span>
          <span>Docs last updated: {DOCS_LAST_UPDATED}</span>
        </footer>
      </div>
    </main>
  );
}
