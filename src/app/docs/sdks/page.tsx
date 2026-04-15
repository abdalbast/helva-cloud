import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "SDKs",
  description: "Language SDKs for HELVA CLOUD APIs, including install, auth, and common request examples.",
  path: "/docs/sdks",
});

export default function SdksPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD SDKs"
      description="SDK availability and usage for JavaScript/TypeScript, Python, and future language clients."
      quickAnswer="This page will list official HELVA CLOUD SDKs, install commands, version support, and common request examples."
      audience={["Developers", "AI coding assistants"]}
      actions={["Find available SDKs", "Install a client", "Call common APIs with retries and error handling"]}
      relatedDocs={[
        { href: "/docs/api", label: "API Reference", reason: "HTTP conventions behind SDK methods" },
        { href: "/docs/authentication", label: "Authentication", reason: "Credential setup for SDK clients" },
        { href: "/changelog", label: "Changelog", reason: "Track SDK and API compatibility changes" },
      ]}
      statusNote="Planned page. Until SDKs are published, document raw HTTP patterns and mark package names and versions as Planned."
    />
  );
}

