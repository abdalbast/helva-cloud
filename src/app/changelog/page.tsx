import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Changelog",
  description: "HELVA CLOUD changelog for product, API, SDK, and documentation updates.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD Changelog"
      description="Chronological record of product, API, SDK, and documentation changes with exact dates."
      quickAnswer="This page will publish dated HELVA CLOUD changes, including docs updates, API changes, and breaking changes."
      audience={["Developers", "Integrators", "Agents checking freshness"]}
      actions={["Check recent changes", "See breaking changes", "Track docs and API updates"]}
      relatedDocs={[
        { href: "/docs/api", label: "API Reference", reason: "See current API conventions after changes" },
        { href: "/docs/sdks", label: "SDKs", reason: "Track SDK compatibility and releases" },
        { href: "/docs", label: "Docs Home", reason: "Find updated documentation paths" },
      ]}
      statusNote="Planned page. Add entries immediately as docs pages ship to establish a freshness history before API release."
    />
  );
}

