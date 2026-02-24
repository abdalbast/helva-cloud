import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description: "Helva Cloud pricing, plans, included usage, and billing model.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <PlaceholderPage
      title="Helva Cloud Pricing"
      description="Plans, usage limits, overage policy, and billing details for Helva Cloud."
      quickAnswer="This page will publish Helva Cloud pricing and plan details in a structured, agent-parsable format."
      audience={["Founders", "Developers", "Buyers", "Agents comparing tools"]}
      actions={["Compare plans", "Review included usage", "Understand billing and support tiers"]}
      relatedDocs={[
        { href: "/rate-limits", label: "Rate Limits", reason: "Map plan tiers to usage and request limits" },
        { href: "/performance", label: "Performance", reason: "Compare cost with latency and throughput" },
        { href: "/faq", label: "FAQ", reason: "Get quick answers about billing and usage" },
      ]}
      statusNote="Planned page. Publish placeholders for plan name, included usage, overage policy, support tier, and trial availability until pricing is final."
    />
  );
}

