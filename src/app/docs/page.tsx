import Link from "next/link";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED, primaryDocsLinks } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Docs",
  description: "Task-first documentation hub for Helva Cloud builders, developers, and AI coding assistants.",
  path: "/docs",
});

const sections = [
  {
    title: "Start Here",
    items: [
      {
        href: "/docs/getting-started",
        label: "Getting Started",
        desc: "Set up your first Helva Cloud workflow and find the fastest next step by goal.",
        status: "Active draft",
      },
      {
        href: "/docs/core-concepts",
        label: "Core Concepts",
        desc: "Understand Helva Cloud terminology, project structure, and workflow model.",
        status: "Planned",
      },
    ],
  },
  {
    title: "Build and Integrate",
    items: [
      {
        href: "/docs/workflows",
        label: "Workflows",
        desc: "Task-based guides for MVPs, deployments, AI features, and automation.",
        status: "Active draft",
      },
      {
        href: "/docs/integrations",
        label: "Integrations",
        desc: "Connect databases, auth providers, hosting, and AI tools.",
        status: "Planned",
      },
      {
        href: "/docs/examples",
        label: "Examples",
        desc: "Copyable code patterns for common Helva Cloud use cases.",
        status: "Planned",
      },
    ],
  },
  {
    title: "API and SDKs",
    items: [
      {
        href: "/docs/api",
        label: "API Reference",
        desc: "Base URL, versions, request/response conventions, and endpoint docs.",
        status: "Active draft",
      },
      {
        href: "/docs/authentication",
        label: "Authentication",
        desc: "How to authenticate requests and manage credentials safely.",
        status: "Planned",
      },
      {
        href: "/docs/sdks",
        label: "SDKs",
        desc: "Language-specific clients and setup examples.",
        status: "Planned",
      },
      {
        href: "/docs/webhooks",
        label: "Webhooks",
        desc: "Event delivery format, signatures, and retry behaviour.",
        status: "Planned",
      },
    ],
  },
  {
    title: "Operations and Support",
    items: [
      {
        href: "/rate-limits",
        label: "Rate Limits",
        desc: "Quota rules, headers, and retry guidance.",
        status: "Planned",
      },
      {
        href: "/errors",
        label: "Errors",
        desc: "Error catalogue, HTTP status mapping, and troubleshooting fixes.",
        status: "Planned",
      },
      {
        href: "/changelog",
        label: "Changelog",
        desc: "Product, API, and docs changes with exact dates.",
        status: "Planned",
      },
      {
        href: "/docs/llm-usage-guide",
        label: "LLM Usage Guide",
        desc: "How to use Helva Cloud with ChatGPT, Claude, Gemini, Copilot, Cursor, and Lovable.",
        status: "Active draft",
      },
    ],
  },
];

export default function DocsHomePage() {
  return (
    <DocsPageShell
      title="Helva Cloud Docs"
      description="Developer and agent-friendly documentation for building, integrating, and operating Helva Cloud workflows."
    >
      <PageSummaryBlock
        quickAnswer="Use this page to navigate Helva Cloud documentation by task. Start with Getting Started, then move to Workflows for goal-based guides or API Reference for request-level details."
        audience={["Developers", "Technical founders", "Builders", "LLM and coding agents"]}
        actions={[
          "Find the correct doc page by goal",
          "Jump to API and auth guidance",
          "Find workflow guides and examples",
          "Find operational docs for limits, errors, and changes",
        ]}
        codeExamples={{
          curl: false,
          ts: false,
          python: false,
          json: false,
          config: false,
          statusLabels: ["Active draft", "Planned"],
        }}
        relatedDocs={primaryDocsLinks}
        lastUpdated={DOCS_LAST_UPDATED}
      />

      <section className="grid gap-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-lg border p-5">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <ul className="mt-4 grid gap-3">
              {section.items.map((item) => (
                <li key={item.href} className="rounded border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={item.href} className="font-medium underline underline-offset-2">
                        {item.label}
                      </Link>
                      <p className="mt-1 text-sm text-foreground/75">{item.desc}</p>
                    </div>
                    <span className="rounded border px-2 py-1 text-xs text-foreground/70">{item.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </DocsPageShell>
  );
}

