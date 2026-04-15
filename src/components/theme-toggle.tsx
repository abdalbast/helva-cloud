"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = theme === "dark";

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-none border-none bg-surface-cream px-3 py-2 text-caption font-normal uppercase text-foreground transition hover:bg-surface-warm hover:text-mistral-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30"
        aria-label="Toggle theme"
      >
        <span className="h-4 w-4" />
        <span className="hidden sm:inline">THEME</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-none border-none bg-surface-cream px-3 py-2 text-caption font-normal uppercase text-foreground transition hover:bg-surface-warm hover:text-mistral-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? "LIGHT" : "DARK"}</span>
    </button>
  );
}
