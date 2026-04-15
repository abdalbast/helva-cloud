import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Errors",
  description: "HELVA CLOUD error catalogue, HTTP status mapping, and troubleshooting guidance.",
  path: "/errors",
});

export default function ErrorsPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD Errors and Troubleshooting"
      description="Error response format, common error codes, and debugging guidance for HELVA CLOUD APIs and integrations."
      quickAnswer="This page will map HELVA CLOUD error codes and HTTP statuses to clear fixes, including retry guidance and integration troubleshooting steps."
      audience={["Developers", "Integrators", "Support teams", "Coding assistants"]}
      actions={["Identify error meaning", "Apply recommended fix", "Determine whether to retry"]}
      relatedDocs={[
        { href: "/docs/api", label: "API Reference", reason: "See endpoint request and response conventions" },
        { href: "/docs/authentication", label: "Authentication", reason: "Resolve auth and permission failures" },
        { href: "/rate-limits", label: "Rate Limits", reason: "Handle quota-related errors and retries" },
      ]}
      statusNote="Planned page. Start with a stable error envelope and category list, then add a full code catalogue as endpoints go live."
    />
  );
}

