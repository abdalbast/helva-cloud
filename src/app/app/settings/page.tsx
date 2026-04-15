"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { api } from "convex/_generated/api";
import { Sun, Moon, Monitor, LogOut, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { localClearAll } from "@/lib/local-store";

function ThemeOption({
  value: _value,
  label,
  icon,
  active,
  onSelect,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-2 rounded-[2px] border px-6 py-4 transition ${
        active
          ? "border-mistral-orange/40 bg-surface-cream shadow-sm"
          : "border-foreground/10 bg-surface-pure hover:border-sunshine-700/25 hover:bg-surface-cream/50"
      }`}
    >
      <span className={active ? "text-mistral-orange" : "text-foreground/50"}>
        {icon}
      </span>
      <span className="text-sm text-foreground/80">{label}</span>
    </button>
  );
}

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isGuest = !isAuthenticated && !isLoading;
  const user = useQuery(api.users.me, isGuest ? "skip" : undefined);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  };

  const handleClearLocalData = () => {
    if (!confirm("This will delete all locally stored data. Are you sure?")) return;
    localClearAll();
    router.push("/app");
  };

  const displayName = isGuest ? "Guest" : user?.name || user?.email?.split("@")[0] || "—";
  const displayEmail = isGuest ? "Local mode — data saved in this browser" : user?.email || "—";

  return (
    <div className="max-w-2xl">
      <h1 className="text-feature text-foreground">Settings</h1>

      {/* Account Section */}
      <section className="mt-8">
        <h2 className="text-caption uppercase tracking-wider text-foreground/60">
          Account
        </h2>
        <div className="mt-3 rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
          <div className="flex items-center gap-4">
            {!isGuest && user?.pictureUrl ? (
              <Image
                src={user.pictureUrl}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-[2px] border border-sunshine-700/20 object-cover"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br from-sunshine-700/15 to-block-orange/10 text-base font-normal text-foreground/80 select-none">
                {isGuest ? "G" : (user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-foreground">
                {displayName}
              </div>
              <div className="truncate text-caption text-foreground/50">
                {displayEmail}
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-foreground/8 pt-4 flex flex-wrap gap-2">
            {isGuest ? (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-white transition hover:opacity-90 active:scale-[0.98]"
                >
                  Sign in to sync your data
                </Link>
                <button
                  type="button"
                  onClick={handleClearLocalData}
                  className="inline-flex items-center gap-2 rounded-[2px] border border-foreground/10 bg-surface-cream px-4 py-2 text-sm text-foreground/75 transition hover:border-red-400/30 hover:text-red-500 active:scale-[0.98]"
                >
                  <Trash2 size={15} />
                  Clear local data
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center gap-2 rounded-[2px] border border-foreground/10 bg-surface-cream px-4 py-2 text-sm text-foreground/75 transition hover:border-mistral-orange/30 hover:text-mistral-orange active:scale-[0.98] disabled:opacity-50"
              >
                <LogOut size={15} />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="mt-8">
        <h2 className="text-caption uppercase tracking-wider text-foreground/60">
          Appearance
        </h2>
        <div className="mt-3 rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
          <p className="text-sm text-foreground/70">
            Choose how Helva Cloud looks for you. Changes apply immediately.
          </p>
          {mounted && (
            <div className="mt-4 flex gap-3">
              <ThemeOption
                value="light"
                label="Light"
                icon={<Sun size={20} />}
                active={theme === "light"}
                onSelect={() => setTheme("light")}
              />
              <ThemeOption
                value="dark"
                label="Dark"
                icon={<Moon size={20} />}
                active={theme === "dark"}
                onSelect={() => setTheme("dark")}
              />
              <ThemeOption
                value="system"
                label="System"
                icon={<Monitor size={20} />}
                active={theme === "system"}
                onSelect={() => setTheme("system")}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
