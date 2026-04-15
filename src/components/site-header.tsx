"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useConvexAuth } from "convex/react";
import { UserMenu } from "@/components/user-menu";

export interface NavLinkItem {
  label: string;
  href: string;
}

function AuthSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="h-8 w-8 rounded-[2px] bg-surface-cream" />
      <div className="hidden lg:block h-4 w-20 rounded-[1px] bg-surface-cream" />
    </div>
  );
}

export function SiteHeader({
  links,
  className = "",
}: {
  links?: NavLinkItem[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();

  const defaultLinks: NavLinkItem[] = [
    { label: "App", href: "/app" },
    { label: "Docs", href: "/docs" },
  ];

  const navigationLinks = links || defaultLinks;

  return (
    <header className={`relative flex items-center justify-between border-b border-foreground/10 pb-4 ${className}`}>
      <div className="flex items-center">
        <Link
          href="/"
          className="brand-logo text-caption uppercase tracking-wider text-foreground transition hover:text-mistral-orange"
        >
          H<span className="brand-collapse">ELVA</span><span className="brand-gap" /><span>C</span><span className="brand-collapse brand-collapse-b">LOUD</span>
        </Link>

        <div className="hidden lg:ml-6 lg:block">
          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-none px-2.5 py-1.5 text-foreground/75 transition hover:bg-surface-cream hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isLoading ? (
          <AuthSkeleton />
        ) : isAuthenticated ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-foreground/35">
              Local mode
            </span>
            <Link
              href="/sign-in"
              className="rounded-[2px] bg-mistral-orange px-3.5 py-1.5 text-sm text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              Sign in
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-none border-none bg-surface-cream p-2 text-foreground/60 hover:text-mistral-orange hover:bg-surface-warm transition lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 flex flex-col gap-2 rounded-none border border-foreground/10 bg-surface-pure p-4 shadow-golden backdrop-blur lg:hidden">
          <div className="flex flex-col gap-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-none px-3 py-2 text-sm text-foreground/75 transition hover:bg-surface-cream hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {isLoading ? null : isAuthenticated ? null : (
            <div className="mt-3 border-t border-foreground/10 pt-3">
              <Link
                href="/sign-in"
                onClick={() => setIsOpen(false)}
                className="block rounded-[2px] bg-mistral-orange px-3 py-2.5 text-center text-sm text-white transition hover:opacity-90"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
