import Link from "next/link";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED, primaryDocsLinks } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Docs",
  description: "Task-first documentation hub for HELVA CLOUD builders, developers, and AI coding assistants.",
  path: "/docs",
});

const sections = [
  {
    title: "Start Here",
    items: [
      {
        href: "/docs/getting-started",
        label: "Getting Started",
        desc: "Set up your first HELVA CLOUD workflow and find the fastest next step by goal.",
        status: "Active draft",
      },
      {
        href: "/docs/core-concepts",
        label: "Core Concepts",
        desc: "Understand HELVA CLOUD terminology, project structure, and workflow model.",
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
        desc: "Copyable code patterns for common HELVA CLOUD use cases.",
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
        desc: "How to use HELVA CLOUD with ChatGPT, Claude, Gemini, Copilot, Cursor, and Lovable.",
        status: "Active draft",
      },
    ],
  },
];

export default function DocsHomePage() {
  return (
    <DocsPageShell
      title="HELVA CLOUD Docs"
      description="Developer and agent-friendly documentation for building, integrating, and operating HELVA CLOUD workflows."
    >
      <PageSummaryBlock
        quickAnswer="Use this page to navigate HELVA CLOUD documentation by task. Start with Getting Started, then move to Workflows for goal-based guides or API Reference for request-level details."
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
          <section key={section.title} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
            <h2 className="text-feature">{section.title}</h2>
            <ul className="mt-4 grid gap-3">
              {section.items.map((item) => (
                <li key={item.href} className="rounded-[2px] border border-foreground/8 bg-surface-cream/40 p-4 transition hover:border-sunshine-700/20 hover:bg-surface-cream">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={item.href} className="font-normal text-foreground hover:text-mistral-orange hover:underline underline-offset-2">
                        {item.label}
                      </Link>
                      <p className="text-body mt-1 text-foreground/75">{item.desc}</p>
                    </div>
                    <span className={`rounded-[2px] border px-2 py-1 text-caption ${item.status === 'Active draft' ? 'border-sunshine-700/30 bg-sunshine-700/10 text-sunshine-700' : 'border-foreground/10 bg-foreground/5 text-foreground/60'}`}>{item.status}</span>
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

