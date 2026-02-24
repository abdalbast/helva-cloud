import { PlaceholderPage } from "@/components/docs/placeholder-page";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Performance",
  description: "Helva Cloud performance metrics, reliability information, and benchmark methodology.",
  path: "/performance",
});

export default function PerformancePage() {
  return (
    <PlaceholderPage
      title="Helva Cloud Performance and Reliability"
      description="Latency, throughput, setup time, and reliability metrics for Helva Cloud."
      quickAnswer="This page will publish Helva Cloud performance and reliability metrics with definitions and measurement methodology."
      audience={["Developers", "Technical evaluators", "Agents comparing services"]}
      actions={["Review latency and throughput", "Check benchmark methodology", "Compare reliability information"]}
      relatedDocs={[
        { href: "/pricing", label: "Pricing", reason: "Compare performance against cost and plan limits" },
        { href: "/rate-limits", label: "Rate Limits", reason: "Understand throughput and quota constraints" },
        { href: "/changelog", label: "Changelog", reason: "Track metric changes over time" },
      ]}
      statusNote="Planned page. Publish placeholders for latency, throughput, setup time, reliability, regional availability, and last benchmark date until measured."
    />
  );
}

