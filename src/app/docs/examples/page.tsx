import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Examples",
  description: "Copyable HELVA CLOUD examples for MVPs, AI workflows, integrations, and deployment patterns.",
  path: "/docs/examples",
});

export default function ExamplesPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD Examples"
      description="Copyable examples for common goals such as founder MVPs, AI features, and automation workflows."
      quickAnswer="This page will collect runnable examples and starter templates for common HELVA CLOUD tasks."
      audience={["Developers", "Founders", "Builders", "Coding assistants"]}
      actions={["Choose an example by goal", "Copy starter code", "Adapt examples for production use"]}
      relatedDocs={[
        { href: "/docs/workflows", label: "Workflows", reason: "Choose the correct task path first" },
        { href: "/docs/api", label: "API Reference", reason: "Map examples to API details" },
        { href: "/docs/integrations", label: "Integrations", reason: "Connect provider-specific services" },
      ]}
      statusNote="Planned page. Initial examples should include hello world, founder MVP, AI feature integration, and webhook consumer patterns."
    />
  );
}

