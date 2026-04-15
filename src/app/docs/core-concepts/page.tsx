import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Core Concepts",
  description: "HELVA CLOUD concepts and terminology for projects, workflows, integrations, and delivery patterns.",
  path: "/docs/core-concepts",
});

export default function CoreConceptsPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD Core Concepts"
      description="Platform terminology and architecture concepts used across HELVA CLOUD docs and workflows."
      quickAnswer="This page will define the key HELVA CLOUD concepts and terms so builders and agents use consistent language across docs and integrations."
      audience={["Developers", "Founders", "Agents summarising HELVA CLOUD"]}
      actions={["Learn platform terminology", "Understand workflow model", "Map concepts to docs pages"]}
      relatedDocs={[
        { href: "/docs/getting-started", label: "Getting Started", reason: "Apply concepts to a first setup path" },
        { href: "/docs/workflows", label: "Workflows", reason: "See concept usage in task guides" },
        { href: "/docs/integrations", label: "Integrations", reason: "Understand connection model and provider roles" },
      ]}
      statusNote="Planned page. Publish stable definitions for project, workflow, app, integration, and environment before expanding API docs."
    />
  );
}

