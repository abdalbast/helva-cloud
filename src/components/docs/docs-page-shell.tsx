import Link from "next/link";
import type { ReactNode } from "react";
import { DOCS_LAST_UPDATED } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";

type DocsPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function DocsPageShell({ title, description, children }: DocsPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <SiteHeader />
        
        <header className="mt-8 flex flex-col gap-4 border-b border-foreground/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
                ← Home
              </Link>
              <span className="text-caption text-foreground/20">/</span>
              <Link href="/" className="brand-logo text-caption uppercase tracking-wider text-foreground hover:text-mistral-orange hover:underline">
                H<span className="brand-collapse">ELVA</span><span className="brand-gap" /><span>C</span><span className="brand-collapse brand-collapse-b">LOUD</span>
              </Link>
            </div>
            <h1 className="text-subheading mt-3 text-foreground sm:text-section">{title}</h1>
            <p className="text-body mt-2 max-w-3xl text-foreground/70">{description}</p>
          </div>

          <nav aria-label="Docs navigation" className="flex flex-wrap gap-2 text-sm">
            <Link href="/docs" className="rounded-[2px] border border-foreground/10 bg-surface-cream px-3 py-1.5 transition hover:border-sunshine-700/30 hover:bg-surface-warm">
              Docs
            </Link>
            <Link href="/docs/workflows" className="rounded-[2px] border border-foreground/10 bg-surface-cream px-3 py-1.5 transition hover:border-sunshine-700/30 hover:bg-surface-warm">
              Workflows
            </Link>
            <Link href="/docs/api" className="rounded-[2px] border border-foreground/10 bg-surface-cream px-3 py-1.5 transition hover:border-sunshine-700/30 hover:bg-surface-warm">
              API
            </Link>
            <Link
              href="/docs/llm-usage-guide"
              className="rounded-[2px] border border-foreground/10 bg-surface-cream px-3 py-1.5 transition hover:border-sunshine-700/30 hover:bg-surface-warm"
            >
              LLM Guide
            </Link>
          </nav>
        </header>

        <div className="text-caption mt-6 text-foreground/60">Docs status: <span className="text-sunshine-700">active draft</span> • Last docs sync: <span className="text-sunshine-700">{DOCS_LAST_UPDATED}</span></div>

        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}

