"use client";

import { Search } from "lucide-react";

export function HomeSearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
      }}
      aria-label="Search tools, projects, clients and notes"
      className="group flex w-full items-center gap-3 rounded-[2px] border border-sunshine-700/20 bg-surface-pure px-4 py-3 text-left shadow-golden backdrop-blur transition hover:border-mistral-orange/30 hover:bg-surface-cream active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mistral-orange/30"
    >
      <span className="text-foreground/50">
        <Search className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm text-foreground/60">Search tools, projects, clients, notes…</span>
      <span className="rounded-[2px] border border-foreground/10 bg-surface-cream px-2 py-0.5 text-[11px] text-foreground/55">⌘K</span>
    </button>
  );
}
