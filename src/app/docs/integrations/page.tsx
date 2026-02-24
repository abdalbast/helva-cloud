import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Integrations",
  description: "Helva Cloud integration guides for databases, auth providers, AI providers, hosting, and automation tools.",
  path: "/docs/integrations",
});

export default function IntegrationsPage() {
  return (
    <PlaceholderPage
      title="Helva Cloud Integrations"
      description="Integration index and setup guides for databases, auth, hosting, AI providers, and automation tools."
      quickAnswer="This page will document supported integrations and provide step-by-step setup guidance with status labels for each integration."
      audience={["Developers", "Technical founders", "Automation teams"]}
      actions={["Find supported integrations", "See live/beta/planned status", "Follow setup and troubleshooting guides"]}
      relatedDocs={[
        { href: "/docs/workflows", label: "Workflows", reason: "See integration use cases by goal" },
        { href: "/docs/webhooks", label: "Webhooks", reason: "Connect event-driven automation" },
        { href: "/errors", label: "Errors", reason: "Troubleshoot provider integration failures" },
      ]}
      statusNote="Planned page. Start with Supabase, Vercel, auth providers, and AI provider integrations using explicit live/beta/planned labels."
    />
  );
}

