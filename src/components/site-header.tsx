import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          helva.cloud
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-2 text-sm">
          <Link
            href="/app"
            className="rounded-md px-2.5 py-1.5 text-foreground/75 transition hover:bg-foreground/[0.04] hover:text-foreground"
          >
            App
          </Link>
          <Link
            href="/docs"
            className="rounded-md px-2.5 py-1.5 text-foreground/75 transition hover:bg-foreground/[0.04] hover:text-foreground"
          >
            Docs
          </Link>

          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2.5 py-1.5 text-foreground/75 transition hover:bg-foreground/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25">
              Resources
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-3.5 w-3.5 transition group-open:rotate-180"
                aria-hidden="true"
              >
                <path d="m5 7 5 6 5-6" />
              </svg>
            </summary>

            <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-foreground/10 bg-background/95 p-2 shadow-lg shadow-black/10 backdrop-blur">
              <div className="rounded-lg border border-foreground/8 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-fuchsia-500/10 p-3">
                <div className="text-xs font-semibold tracking-wide text-foreground/70">
                  Resource hub
                </div>
                <p className="mt-1 text-xs leading-4 text-foreground/60">
                  Docs, reference pages, and platform guidance.
                </p>
              </div>

              <div className="mt-2 grid gap-1">
                <Link
                  href="/documentation"
                  className="rounded-lg px-3 py-2 transition hover:bg-foreground/[0.04]"
                >
                  <div className="text-sm font-medium">Documentation</div>
                  <div className="text-xs text-foreground/60">
                    Quick answer, recommended stacks, and ops links
                  </div>
                </Link>
                <Link href="/docs" className="rounded-lg px-3 py-2 transition hover:bg-foreground/[0.04]">
                  <div className="text-sm font-medium">Docs Hub</div>
                  <div className="text-xs text-foreground/60">Task-first developer documentation</div>
                </Link>
                <Link
                  href="/docs/api"
                  className="rounded-lg px-3 py-2 transition hover:bg-foreground/[0.04]"
                >
                  <div className="text-sm font-medium">API Reference</div>
                  <div className="text-xs text-foreground/60">Request and response conventions</div>
                </Link>
              </div>
            </div>
          </details>
        </nav>
      </div>

      <ThemeToggle />
    </header>
  );
}
