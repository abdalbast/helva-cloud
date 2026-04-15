"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { api } from "convex/_generated/api";
import { LogOut, Settings, Sun, Moon, Monitor, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function UserAvatar({
  name,
  email,
  pictureUrl,
  size = "sm",
}: {
  name: string | null;
  email: string | null;
  pictureUrl: string | null;
  size?: "sm" | "lg";
}) {
  const initial = (name?.[0] || email?.[0] || "?").toUpperCase();
  const dim = size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";

  if (pictureUrl) {
    const px = size === "lg" ? 40 : 32;
    return (
      <Image
        src={pictureUrl}
        alt=""
        width={px}
        height={px}
        className={`${dim} rounded-[2px] border border-sunshine-700/20 object-cover`}
        referrerPolicy="no-referrer"
        unoptimized
      />
    );
  }

  return (
    <span
      className={`${dim} inline-flex items-center justify-center rounded-[2px] border border-sunshine-700/20 bg-gradient-to-br from-sunshine-700/15 to-block-orange/10 font-normal text-foreground/80 select-none`}
    >
      {initial}
    </span>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const options: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={14} /> },
    { value: "dark", label: "Dark", icon: <Moon size={14} /> },
    { value: "system", label: "System", icon: <Monitor size={14} /> },
  ];

  return (
    <div className="flex items-center gap-1 rounded-[2px] border border-foreground/8 bg-surface-cream/50 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          className={`flex items-center gap-1.5 rounded-[1px] px-2.5 py-1.5 text-[11px] uppercase tracking-wider transition ${
            theme === opt.value
              ? "bg-surface-pure text-foreground shadow-sm"
              : "text-foreground/50 hover:text-foreground/70"
          }`}
          aria-label={`${opt.label} theme`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.me);

  const isInApp = pathname.startsWith("/app");

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, close]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Account";
  const displayEmail = user?.email || "";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-[2px] border border-foreground/8 bg-surface-cream/60 px-2 py-1.5 transition hover:border-sunshine-700/25 hover:bg-surface-cream active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <UserAvatar
          name={user?.name ?? null}
          email={user?.email ?? null}
          pictureUrl={user?.pictureUrl ?? null}
          size="sm"
        />
        <span className="hidden text-sm text-foreground/70 lg:inline max-w-[120px] truncate">
          {displayName}
        </span>
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`h-3 w-3 text-foreground/40 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M3 5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-[menuIn_150ms_ease-out] rounded-[2px] border border-foreground/10 bg-surface-pure shadow-golden"
        >
          <div className="border-b border-foreground/8 px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={user?.name ?? null}
                email={user?.email ?? null}
                pictureUrl={user?.pictureUrl ?? null}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-normal text-foreground">
                  {displayName}
                </div>
                {displayEmail && (
                  <div className="truncate text-[11px] text-foreground/50">
                    {displayEmail}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="py-1.5">
            {!isInApp && (
              <Link
                href="/app"
                onClick={close}
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/75 transition hover:bg-surface-cream hover:text-foreground"
              >
                <ArrowRight size={15} className="text-foreground/40" />
                <span>Go to App</span>
              </Link>
            )}
            <Link
              href="/app/settings"
              onClick={close}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/75 transition hover:bg-surface-cream hover:text-foreground"
            >
              <Settings size={15} className="text-foreground/40" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="border-t border-foreground/8 px-4 py-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-foreground/40">
              Appearance
            </div>
            <ThemeSelector />
          </div>

          <div className="border-t border-foreground/8 py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground/75 transition hover:bg-surface-cream hover:text-mistral-orange disabled:opacity-50"
            >
              <LogOut size={15} className="text-foreground/40" />
              <span>{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
