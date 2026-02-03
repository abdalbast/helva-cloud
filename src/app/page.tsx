import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

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
            Your private toolbox — one login, many tools.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base text-foreground/70">
            Helva Cloud is an app launcher for internal utilities (dashboards, schedulers,
            ops tools). Public landing page, private apps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Open apps
            </Link>
            <a
              href="#tools"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              See tools
            </a>
          </div>
        </section>

        <section id="tools" className="mt-20">
          <h2 className="text-xl font-semibold">Tools</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="font-medium">OpenClaw Usage</div>
              <div className="mt-1 text-sm text-foreground/70">
                Cursor-style usage breakdown (tokens/cost over time).
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="font-medium">Social Scheduler</div>
              <div className="mt-1 text-sm text-foreground/70">
                Buffer-like publish queue & calendar.
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 text-xs text-foreground/60">
          © {new Date().getFullYear()} Helva
        </footer>
      </div>
    </main>
  );
}
