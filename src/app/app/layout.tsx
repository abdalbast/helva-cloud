import { CommandPalette } from "@/components/command-palette";
import { SiteHeader } from "@/components/site-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/app/crm", label: "CRM" },
    { href: "/app/projects", label: "Projects" },
    { href: "/app/board", label: "Board" },
    { href: "/app/meetings", label: "Meetings" },
    { href: "/app/social", label: "Social" },
    { href: "/app/content", label: "Content" },
    { href: "/app/ai", label: "AI" },
    { href: "/app/files", label: "Files" },
    { href: "/app/automations", label: "Automations" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <CommandPalette />
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <SiteHeader showAuth links={links} />
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
