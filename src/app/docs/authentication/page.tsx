import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Authentication",
  description: "Authentication methods, credential handling, and request authorisation for Helva Cloud APIs.",
  path: "/docs/authentication",
});

export default function AuthenticationPage() {
  return (
    <PlaceholderPage
      title="Helva Cloud Authentication"
      description="Authentication methods, credential setup, token handling, and secure request patterns."
      quickAnswer="This page will document how to authenticate Helva Cloud API requests and manage credentials safely."
      audience={["Developers", "Integrators", "AI coding assistants"]}
      actions={["Understand supported auth methods", "Configure credentials", "Send authenticated requests"]}
      relatedDocs={[
        { href: "/docs/api", label: "API Reference", reason: "Request headers and endpoint conventions" },
        { href: "/errors", label: "Errors", reason: "Authentication error codes and fixes" },
        { href: "/docs/getting-started", label: "Getting Started", reason: "Start-path setup sequence" },
      ]}
      statusNote="Planned page. Publish final auth header format, token lifecycle, and examples when the public API auth model is final."
    />
  );
}

