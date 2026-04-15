import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Webhooks",
  description: "Webhook events, payloads, signature verification, retry behaviour, and debugging for HELVA CLOUD.",
  path: "/docs/webhooks",
});

export default function WebhooksPage() {
  return (
    <PlaceholderPage
      title="HELVA CLOUD Webhooks"
      description="Webhook event delivery, payload examples, signature verification, and retry guidance."
      quickAnswer="This page will document webhook event types, delivery format, signature verification, and retry behaviour for event-driven workflows."
      audience={["Developers", "Automation teams", "Backend integrators"]}
      actions={["Subscribe to events", "Verify signatures", "Handle retries and idempotency"]}
      relatedDocs={[
        { href: "/docs/integrations", label: "Integrations", reason: "Use webhooks in provider workflows" },
        { href: "/rate-limits", label: "Rate Limits", reason: "Understand delivery and retry constraints" },
        { href: "/errors", label: "Errors", reason: "Debug webhook delivery and signature issues" },
      ]}
      statusNote="Planned page. Publish event names, headers, and signature verification examples before declaring webhooks live."
    />
  );
}

