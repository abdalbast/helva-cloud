"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "convex/_generated/api";
import { useAppQuery } from "@/lib/app-data";
import {
  Search, User, Building2, Handshake, CheckSquare, FolderKanban,
  Calendar, Send, PenLine, File, Zap, Sparkles, Phone, Clock, Users as UsersIcon,
} from "lucide-react";

type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
};

type QuickAction = {
  label: string;
  icon: React.ReactNode;
  href: string;
  group: string;
};

const quickActions: QuickAction[] = [
  { label: "New Contact", icon: <User className="h-4 w-4" />, href: "/app/crm/contacts?action=new", group: "CRM" },
  { label: "New Company", icon: <Building2 className="h-4 w-4" />, href: "/app/crm/companies?action=new", group: "CRM" },
  { label: "New Deal", icon: <Handshake className="h-4 w-4" />, href: "/app/crm/deals?action=new", group: "CRM" },
  { label: "New Activity", icon: <Phone className="h-4 w-4" />, href: "/app/crm/activities?action=new", group: "CRM" },
  { label: "New Follow-up", icon: <Clock className="h-4 w-4" />, href: "/app/crm/follow-ups?action=new", group: "CRM" },
  { label: "New Partner", icon: <UsersIcon className="h-4 w-4" />, href: "/app/crm/partners?action=new", group: "CRM" },
  { label: "New Task", icon: <CheckSquare className="h-4 w-4" />, href: "/app/board?action=new", group: "Work" },
  { label: "New Project", icon: <FolderKanban className="h-4 w-4" />, href: "/app/projects?action=new", group: "Work" },
  { label: "New Meeting", icon: <Calendar className="h-4 w-4" />, href: "/app/meetings?action=new", group: "Work" },
  { label: "New Social Post", icon: <Send className="h-4 w-4" />, href: "/app/social?action=new", group: "Content" },
  { label: "New Campaign", icon: <PenLine className="h-4 w-4" />, href: "/app/content?action=new", group: "Content" },
  { label: "New AI Prompt", icon: <Sparkles className="h-4 w-4" />, href: "/app/ai?action=new", group: "Content" },
  { label: "New Automation", icon: <Zap className="h-4 w-4" />, href: "/app/automations?action=new", group: "Content" },
];

const typeIcons: Record<string, React.ReactNode> = {
  contact: <User className="h-4 w-4" />,
  company: <Building2 className="h-4 w-4" />,
  deal: <Handshake className="h-4 w-4" />,
  activity: <Phone className="h-4 w-4" />,
  follow_up: <Clock className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  project: <FolderKanban className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  social_post: <Send className="h-4 w-4" />,
  campaign: <PenLine className="h-4 w-4" />,
  file: <File className="h-4 w-4" />,
  automation: <Zap className="h-4 w-4" />,
  ai_prompt: <Sparkles className="h-4 w-4" />,
  partner: <UsersIcon className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  contact: "Contact",
  company: "Company",
  deal: "Deal",
  activity: "Activity",
  follow_up: "Follow-up",
  task: "Task",
  project: "Project",
  meeting: "Meeting",
  social_post: "Social",
  campaign: "Campaign",
  file: "File",
  automation: "Automation",
  ai_prompt: "AI Prompt",
  partner: "Partner",
};

const typeGroupOrder = [
  "contact", "company", "deal", "activity", "follow_up",
  "task", "project", "meeting",
  "social_post", "campaign", "file", "automation", "ai_prompt",
  "partner",
];

const typeHrefs: Record<string, (id: string) => string> = {
  contact: (id) => `/app/crm/contacts?id=${id}`,
  company: (id) => `/app/crm/companies?id=${id}`,
  deal: (id) => `/app/crm/deals?id=${id}`,
  activity: (id) => `/app/crm/activities?id=${id}`,
  follow_up: (id) => `/app/crm/follow-ups?id=${id}`,
  task: (id) => `/app/board?id=${id}`,
  project: (id) => `/app/projects?id=${id}`,
  meeting: (id) => `/app/meetings?id=${id}`,
  social_post: (id) => `/app/social?id=${id}`,
  campaign: (id) => `/app/content?id=${id}`,
  file: (id) => `/app/files?id=${id}`,
  automation: (id) => `/app/automations?id=${id}`,
  ai_prompt: (id) => `/app/ai?id=${id}`,
  partner: (id) => `/app/crm/partners?id=${id}`,
};

type ListItem =
  | { kind: "result"; type: string; id: string; title: string; subtitle?: string; href: string }
  | { kind: "action"; label: string; icon: React.ReactNode; href: string }
  | { kind: "heading"; label: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchResults = useAppQuery(api.search.global, { table: "*", fn: () => [] as { type: string; id: string; title: string; subtitle?: string }[] }, query.trim() ? { query: query.trim() } : "skip") ?? [];

  const results: SearchResult[] = searchResults.map((r: { type: string; id: string; title: string; subtitle?: string }) => ({
    type: r.type,
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
  }));

  // ⌘K handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
          return !prev;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Build the flat list of selectable items (excludes headings)
  const allItems: ListItem[] = query.trim()
    ? (() => {
        // Group results by type, ordered by typeGroupOrder
        const grouped = new Map<string, SearchResult[]>();
        for (const r of results) {
          const list = grouped.get(r.type) ?? [];
          list.push(r);
          grouped.set(r.type, list);
        }
        const items: ListItem[] = [];
        for (const type of typeGroupOrder) {
          const group = grouped.get(type);
          if (!group || group.length === 0) continue;
          items.push({ kind: "heading", label: typeLabels[type] ?? type });
          for (const r of group) {
            items.push({
              kind: "result",
              type: r.type,
              id: r.id,
              title: r.title,
              subtitle: r.subtitle,
              href: typeHrefs[r.type]?.(r.id) ?? "/app",
            });
          }
        }
        return items;
      })()
    : (() => {
        const items: ListItem[] = [];
        let lastGroup = "";
        for (const a of quickActions) {
          if (a.group !== lastGroup) {
            items.push({ kind: "heading", label: a.group });
            lastGroup = a.group;
          }
          items.push({ kind: "action", label: a.label, icon: a.icon, href: a.href });
        }
        return items;
      })();

  // Only selectable items for keyboard navigation
  const selectableIndices = allItems
    .map((item, i) => (item.kind !== "heading" ? i : -1))
    .filter((i) => i !== -1);

  const navigate = useCallback((item: ListItem) => {
    if (item.kind === "heading") return;
    setOpen(false);
    router.push(item.href);
  }, [router]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg rounded-[2px] border border-foreground/10 bg-surface-pure shadow-golden animate-scale-in">
        <div className="flex items-center gap-3 border-b border-foreground/10 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-foreground/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search tools, projects, clients, notes…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => {
                  const idx = selectableIndices.indexOf(s);
                  return selectableIndices[Math.min(idx + 1, selectableIndices.length - 1)] ?? s;
                });
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) => {
                  const idx = selectableIndices.indexOf(s);
                  return selectableIndices[Math.max(idx - 1, 0)] ?? s;
                });
              }
              if (e.key === "Enter" && allItems[selected] && allItems[selected].kind !== "heading") {
                navigate(allItems[selected]);
              }
            }}
          />
          <kbd className="hidden rounded-[2px] border border-foreground/20 bg-surface-cream px-1.5 py-0.5 text-caption text-foreground/50 sm:inline">ESC</kbd>
        </div>

        {selectableIndices.length > 0 && (
          <div className="max-h-96 overflow-y-auto p-2">
            {allItems.map((item, i) => {
              if (item.kind === "heading") {
                return (
                  <div key={`h-${i}`} className="px-3 pt-3 pb-1 text-caption uppercase tracking-wider text-foreground/40">
                    {item.label}
                  </div>
                );
              }
              const isSelected = i === selected;
              return (
                <button
                  key={`${item.kind}-${item.kind === "result" ? item.id : item.label}-${i}`}
                  onClick={() => navigate(item)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full items-center gap-3 rounded-[2px] px-3 py-2 text-left text-sm transition ${
                    isSelected ? "bg-surface-cream text-foreground" : "text-foreground/70 hover:bg-surface-cream/50"
                  }`}
                >
                  <span className="shrink-0 text-foreground/50">
                    {item.kind === "action"
                      ? item.icon
                      : typeIcons[item.type] ?? <Search className="h-4 w-4" />}
                  </span>
                  <span className="flex-1 truncate">{item.kind === "result" ? item.title : item.label}</span>
                  {item.kind === "result" && item.subtitle && (
                    <span className="text-caption text-foreground/40">{item.subtitle}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {query.trim() && selectableIndices.length === 0 && (
          <div className="p-6 text-center text-sm text-foreground/40">No results found</div>
        )}

        {!query.trim() && (
          <div className="border-t border-foreground/10 px-4 py-2">
            <div className="text-caption text-foreground/40">
              Type to search · <kbd className="rounded-[2px] border border-foreground/20 bg-surface-cream px-1 text-[11px]">↑↓</kbd> navigate · <kbd className="rounded-[2px] border border-foreground/20 bg-surface-cream px-1 text-[11px]">↵</kbd> open
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
