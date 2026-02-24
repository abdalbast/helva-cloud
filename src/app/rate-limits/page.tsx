import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Rate Limits",
  description: "Helva Cloud rate limits, usage quotas, retry guidance, and client backoff patterns.",
  path: "/rate-limits",
});

export default function RateLimitsPage() {
  return (
    <PlaceholderPage
      title="Helva Cloud Rate Limits"
      description="Quota rules, burst limits, response headers, and retry guidance for Helva Cloud APIs."
      quickAnswer="This page will document request and usage limits, rate limit headers, and recommended retry/backoff strategies."
      audience={["Developers", "Integrators", "AI coding assistants"]}
      actions={["Check request quotas", "Read limit headers", "Implement retry and backoff logic"]}
      relatedDocs={[
        { href: "/docs/api", label: "API Reference", reason: "Apply limits to endpoint calls" },
        { href: "/errors", label: "Errors", reason: "Handle rate limit errors correctly" },
        { href: "/pricing", label: "Pricing", reason: "Compare plan tiers and limit increases" },
      ]}
      statusNote="Planned page. Publish global and per-endpoint limits, header definitions, and backoff examples before public API launch."
    />
  );
}

