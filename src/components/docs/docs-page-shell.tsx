import Link from "next/link";
import type { ReactNode } from "react";
import { DOCS_LAST_UPDATED } from "@/lib/site";

type DocsPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function DocsPageShell({ title, description, children }: DocsPageShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium tracking-wide hover:underline">
              helva.cloud
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-foreground/70 sm:text-base">{description}</p>
          </div>

          <nav aria-label="Docs navigation" className="flex flex-wrap gap-2 text-sm">
            <Link href="/docs" className="rounded border px-3 py-1.5 hover:bg-foreground/5">
              Docs
            </Link>
            <Link href="/docs/workflows" className="rounded border px-3 py-1.5 hover:bg-foreground/5">
              Workflows
            </Link>
            <Link href="/docs/api" className="rounded border px-3 py-1.5 hover:bg-foreground/5">
              API
            </Link>
            <Link
              href="/docs/llm-usage-guide"
              className="rounded border px-3 py-1.5 hover:bg-foreground/5"
            >
              LLM Guide
            </Link>
          </nav>
        </header>

        <div className="mt-6 text-xs text-foreground/60">Docs status: active draft • Last docs sync: {DOCS_LAST_UPDATED}</div>

        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}

