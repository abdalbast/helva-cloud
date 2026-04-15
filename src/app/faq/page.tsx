import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "FAQ",
  description: "Frequently asked questions about HELVA CLOUD, APIs, integrations, pricing, and support.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD FAQ"
      description="Short, direct answers to common questions about HELVA CLOUD product scope, docs, APIs, pricing, and support."
      quickAnswer="This page will provide concise answers to common HELVA CLOUD questions with links to the canonical docs pages for detail."
      audience={["Founders", "Developers", "Builders", "LLM agents"]}
      actions={["Get quick product and API answers", "Find canonical docs links", "Resolve common pre-sales and technical questions"]}
      relatedDocs={[
        { href: "/docs", label: "Docs Home", reason: "Browse all documentation by task" },
        { href: "/pricing", label: "Pricing", reason: "Review plan and billing details" },
        { href: "/support", label: "Support", reason: "Escalate unresolved issues" },
      ]}
      statusNote="Planned page. Publish direct Q&A entries and add FAQ schema markup to improve retrieval and search results."
    />
  );
}

