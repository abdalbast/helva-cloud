import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Support",
  description: "Helva Cloud support channels, response expectations, and escalation paths.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <PlaceholderPage
      title="Helva Cloud Support"
      description="Support channels, response expectations, escalation paths, and self-service troubleshooting links."
      quickAnswer="This page will tell users and agents how to get help, what to include in a request, and how support and escalation paths work."
      audience={["All Helva Cloud users", "Developers", "Support teams", "Agents preparing support context"]}
      actions={["Find support channels", "Prepare a useful support request", "Follow escalation paths"]}
      relatedDocs={[
        { href: "/errors", label: "Errors", reason: "Self-service error troubleshooting first" },
        { href: "/faq", label: "FAQ", reason: "Resolve common questions quickly" },
        { href: "/changelog", label: "Changelog", reason: "Check if behaviour changed recently" },
      ]}
      statusNote="Planned page. Publish support channels, response time expectations, and incident/status links when operational support process is finalised."
    />
  );
}

