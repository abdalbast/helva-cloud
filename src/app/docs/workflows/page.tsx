import Link from "next/link";
import { CodeSample } from "@/components/docs/code-sample";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Workflows",
  description: "Task-based Helva Cloud workflows for MVP delivery, AI features, automation, integrations, and deployment.",
  path: "/docs/workflows",
});

const workflowCards = [
  {
    title: "How do I build an MVP with Helva Cloud?",
    status: "Active draft",
    bullets: [
      "Choose a founder MVP stack (Next.js, Helva Cloud, Supabase, Vercel, AI provider).",
      "Start from Getting Started, then wire auth and one core workflow.",
      "Use Examples for a copyable baseline, then add Pricing/Rate Limits checks before launch.",
    ],
  },
  {
    title: "How do I connect Supabase to a Helva Cloud workflow?",
    status: "Planned",
    bullets: [
      "Store Helva-related entities and workflow state in Supabase Postgres.",
      "Use Helva Cloud APIs/webhooks to trigger updates.",
      "Add retry handling and schema validation for durable automation.",
    ],
  },
  {
    title: "How do I deploy a Helva project?",
    status: "Planned",
    bullets: [
      "Prepare environment variables and deployment secrets.",
      "Validate API base URLs and webhook callback endpoints.",
      "Publish with Vercel and monitor rate limits, errors, and changelog updates.",
    ],
  },
  {
    title: "How do I use Helva Cloud with Lovable or Cursor?",
    status: "Active draft",
    bullets: [
      "Give the agent canonical docs paths plus /llm.txt.",
      "Use explicit status labels for planned endpoints.",
      "Validate generated code against API, Errors, and Rate Limits pages before shipping.",
    ],
  },
];

export default function WorkflowsPage() {
  return (
    <DocsPageShell
      title="Helva Cloud Workflows"
      description="Task-based implementation guides for common Helva Cloud goals. Each section is written for direct retrieval by coding assistants and developers."
    >
      <PageSummaryBlock
        quickAnswer="Use this page when you know the outcome you want (MVP, AI feature, deployment, integration, or automation) and need a clear sequence of steps plus the right related docs."
        audience={["Founders", "Builders", "Developers", "AI coding assistants"]}
        actions={[
          "Pick a workflow by outcome",
          "See the recommended stack for each workflow",
          "Find the next docs pages to complete implementation",
          "Copy starter config and request examples",
        ]}
        codeExamples={{
          curl: true,
          ts: true,
          python: false,
          json: true,
          config: true,
          statusLabels: ["Active draft", "Planned", "Beta"],
        }}
        relatedDocs={[
          { href: "/docs/getting-started", label: "Getting Started", reason: "Set up first project and request pattern" },
          { href: "/docs/integrations", label: "Integrations", reason: "Connect databases, hosting, and providers" },
          { href: "/docs/examples", label: "Examples", reason: "Start from copyable implementation patterns" },
        ]}
        lastUpdated={DOCS_LAST_UPDATED}
      />

      <section className="grid gap-4">
        {workflowCards.map((card) => (
          <section key={card.title} className="rounded-lg border p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <span className="rounded border px-2 py-1 text-xs text-foreground/70">{card.status}</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              {card.bullets.map((bullet) => (
                <li key={bullet}>- {bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Recommended stacks by common goal</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>- Founder MVP: Next.js + Helva Cloud + Supabase + Vercel + AI provider.</li>
          <li>- AI automation workflow: Helva Cloud + webhooks + worker runtime + Postgres + notifications.</li>
          <li>- Internal tools: Helva Cloud launcher + auth + analytics ingestion + dashboard UI.</li>
          <li>- Product docs and support hub: Helva Cloud docs pages + changelog + FAQ + support paths.</li>
        </ul>
      </section>

      <CodeSample title="Workflow config template (placeholder)" language="json" status="Planned">
        {`{
  "workflowId": "wf_founder_mvp",
  "name": "Founder MVP launch path",
  "status": "planned",
  "steps": [
    { "id": "setup-auth", "doc": "/docs/authentication" },
    { "id": "connect-db", "doc": "/docs/integrations" },
    { "id": "call-api", "doc": "/docs/api" },
    { "id": "deploy", "doc": "/docs/workflows" }
  ]
}`}
      </CodeSample>

      <CodeSample title="Agent prompt pattern for workflow execution" language="txt" status="Active draft">
        {`Task: Build a founder MVP using Helva Cloud.
Read first: /llm.txt, /docs/getting-started, /docs/workflows, /docs/api, /errors, /rate-limits.
Constraints: Use only documented endpoints. If an endpoint is labelled Planned, generate placeholder code and mark it clearly.
Output: setup steps, code snippets, env vars, deployment checklist.`}
      </CodeSample>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Related pages for implementation details</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/docs/api" className="underline underline-offset-2">
              API Reference
            </Link>{" "}
            - request and response formats, endpoint status labels
          </li>
          <li>
            <Link href="/errors" className="underline underline-offset-2">
              Errors
            </Link>{" "}
            - debugging and retry guidance
          </li>
          <li>
            <Link href="/rate-limits" className="underline underline-offset-2">
              Rate Limits
            </Link>{" "}
            - quotas, headers, and backoff rules
          </li>
        </ul>
      </section>
    </DocsPageShell>
  );
}

