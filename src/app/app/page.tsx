import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppHome() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Apps</div>
            <div className="mt-1 text-xs text-foreground/70">Signed in as {session?.user?.email}</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/api/auth/signout"
              className="rounded-md border px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Sign out
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/app/openclaw-usage" className="rounded-lg border p-4 hover:bg-foreground/5">
            <div className="font-medium">OpenClaw Usage</div>
            <div className="mt-1 text-sm text-foreground/70">Tokens/cost charts and breakdown.</div>
          </Link>

          <div className="rounded-lg border p-4 opacity-70">
            <div className="font-medium">Social Scheduler</div>
            <div className="mt-1 text-sm text-foreground/70">Coming from the main app.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
