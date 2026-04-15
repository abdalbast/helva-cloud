import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Documentation",
  description: "HELVA CLOUD documentation overview, recommended stacks, and operations pages.",
  path: "/documentation",
});

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <SiteHeader />

        <section className="mt-12 rounded-[2px] border border-foreground/10 bg-gradient-to-b from-sunshine-700/8 via-block-gold/3 to-transparent p-6 shadow-golden">
          <div className="inline-flex items-center rounded-[2px] border border-sunshine-700/30 bg-surface-cream/80 px-3 py-1 text-caption font-normal text-foreground/70">
            RESOURCES
          </div>
          <h1 className="text-subheading mt-4 sm:text-section">Documentation</h1>
          <p className="text-body mt-3 max-w-2xl text-foreground/70">
            Find the fastest route into HELVA CLOUD docs, platform guidance, and operational
            reference pages.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Link
              href="/docs"
              className="rounded-[2px] bg-foreground px-4 py-2 font-normal uppercase tracking-wide text-background transition hover:opacity-90"
            >
              Open Docs Hub
            </Link>
            <Link
              href="/docs/getting-started"
              className="rounded-[2px] border border-foreground/10 bg-surface-cream px-4 py-2 font-normal transition hover:border-sunshine-700/30 hover:bg-surface-warm"
            >
              Getting Started
            </Link>
            <Link
              href="/docs/api"
              className="rounded-[2px] border border-foreground/10 bg-surface-cream px-4 py-2 font-normal transition hover:border-sunshine-700/30 hover:bg-surface-warm"
            >
              API Reference
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[2px] border border-foreground/10 bg-surface-cream/50 p-5 shadow-golden">
          <h2 className="text-feature">Quick answer</h2>
          <p className="text-body mt-2 text-foreground/80">
            HELVA CLOUD is a build and tooling layer for AI workflows, automation, and app
            delivery. The docs are structured by task so developers and LLM agents can find
            parsable guidance quickly.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-caption uppercase tracking-wide text-foreground/80">Who this is for</h3>
              <ul className="text-body mt-2 space-y-1 text-foreground/80">
                <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Builders and founders shipping MVPs</li>
                <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Developers integrating APIs and workflows</li>
                <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> AI and automation teams</li>
                <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Coding assistants and agentic tools</li>
              </ul>
            </div>
            <div>
              <h3 className="text-caption uppercase tracking-wide text-foreground/80">Start here</h3>
              <ul className="text-body mt-2 space-y-1">
                <li>
                  <Link href="/docs" className="text-mistral-orange hover:underline underline-offset-2">
                    /docs
                  </Link>{" "}
                  - docs hub
                </li>
                <li>
                  <Link href="/docs/getting-started" className="text-mistral-orange hover:underline underline-offset-2">
                    /docs/getting-started
                  </Link>{" "}
                  - setup and first workflow path
                </li>
                <li>
                  <Link href="/docs/llm-usage-guide" className="text-mistral-orange hover:underline underline-offset-2">
                    /docs/llm-usage-guide
                  </Link>{" "}
                  - agent and coding assistant guidance
                </li>
                <li>
                  <Link href="/app" className="text-mistral-orange hover:underline underline-offset-2">
                    /app
                  </Link>{" "}
                  - private tool launcher
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <h2 className="text-feature">Recommended stacks</h2>
            <ul className="text-body mt-3 space-y-2 text-foreground/80">
              <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Founder MVP: Next.js + HELVA CLOUD + Supabase + Vercel + AI provider</li>
              <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> AI automation: HELVA CLOUD + webhooks + worker runtime + Postgres</li>
              <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Internal tools: HELVA CLOUD launcher + auth + dashboards + usage ingestion</li>
            </ul>
          </div>

          <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
            <h2 className="text-feature">Docs and ops pages</h2>
            <ul className="text-body mt-3 space-y-2">
              <li>
                <Link href="/pricing" className="text-mistral-orange hover:underline underline-offset-2">
                  Pricing
                </Link>{" "}
                (placeholder structure published)
              </li>
              <li>
                <Link href="/performance" className="text-mistral-orange hover:underline underline-offset-2">
                  Performance
                </Link>{" "}
                (placeholder structure published)
              </li>
              <li>
                <Link href="/rate-limits" className="text-mistral-orange hover:underline underline-offset-2">
                  Rate limits
                </Link>{" "}
                (placeholder structure published)
              </li>
              <li>
                <Link href="/errors" className="text-mistral-orange hover:underline underline-offset-2">
                  Errors
                </Link>{" "}
                (placeholder structure published)
              </li>
            </ul>
          </div>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 pt-6 text-caption text-foreground/60">
          <span>© {new Date().getFullYear()} Helva</span>
          <span>Docs last updated: <span className="text-sunshine-700">{DOCS_LAST_UPDATED}</span></span>
        </footer>
      </div>
    </main>
  );
}
