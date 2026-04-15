"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserInfo } from "@/components/user-info";
import { SignOutButton } from "@/components/signout-button";

export interface NavLinkItem {
  label: string;
  href: string;
}

export function SiteHeader({
  links,
  showAuth = false,
  className = "",
}: {
  links?: NavLinkItem[];
  showAuth?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

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
        {showAuth && <UserInfo />}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
        {showAuth && <SignOutButton />}
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
          <div className="mt-2 flex items-center justify-between border-t border-foreground/10 pt-4">
            <span className="text-caption text-foreground/60 uppercase tracking-wider">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
