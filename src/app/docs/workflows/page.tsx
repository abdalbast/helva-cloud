import Link from "next/link";
import { CodeSample } from "@/components/docs/code-sample";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Workflows",
  description: "Task-based HELVA CLOUD workflows for MVP delivery, AI features, automation, integrations, and deployment.",
  path: "/docs/workflows",
});

const workflowCards = [
  {
    title: "How do I build an MVP with HELVA CLOUD?",
    status: "Active draft",
    bullets: [
      "Choose a founder MVP stack (Next.js, HELVA CLOUD, Supabase, Vercel, AI provider).",
      "Start from Getting Started, then wire auth and one core workflow.",
      "Use Examples for a copyable baseline, then add Pricing/Rate Limits checks before launch.",
    ],
  },
  {
    title: "How do I connect Supabase to a HELVA CLOUD workflow?",
    status: "Planned",
    bullets: [
      "Store Helva-related entities and workflow state in Supabase Postgres.",
      "Use HELVA CLOUD APIs/webhooks to trigger updates.",
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
    title: "How do I use HELVA CLOUD with Lovable or Cursor?",
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
      title="HELVA CLOUD Workflows"
      description="Task-based implementation guides for common HELVA CLOUD goals. Each section is written for direct retrieval by coding assistants and developers."
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
          <section key={card.title} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-feature">{card.title}</h2>
              <span className={`rounded-[2px] border px-2 py-1 text-caption ${card.status === 'Active draft' ? 'border-sunshine-700/30 bg-sunshine-700/10 text-sunshine-700' : 'border-foreground/10 bg-foreground/5 text-foreground/60'}`}>{card.status}</span>
            </div>
            <ul className="text-body mt-3 space-y-2 text-foreground/80">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2"><span className="text-sunshine-700">-</span> {bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
        <h2 className="text-feature">Recommended stacks by common goal</h2>
        <ul className="text-body mt-3 space-y-2 text-foreground/80">
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Founder MVP: Next.js + HELVA CLOUD + Supabase + Vercel + AI provider.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> AI automation workflow: HELVA CLOUD + webhooks + worker runtime + Postgres + notifications.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Internal tools: HELVA CLOUD launcher + auth + analytics ingestion + dashboard UI.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Product docs and support hub: HELVA CLOUD docs pages + changelog + FAQ + support paths.</li>
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
        {`Task: Build a founder MVP using HELVA CLOUD.
Read first: /llm.txt, /docs/getting-started, /docs/workflows, /docs/api, /errors, /rate-limits.
Constraints: Use only documented endpoints. If an endpoint is labelled Planned, generate placeholder code and mark it clearly.
Output: setup steps, code snippets, env vars, deployment checklist.`}
      </CodeSample>

      <section className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
        <h2 className="text-feature">Related pages for implementation details</h2>
        <ul className="text-body mt-3 space-y-2">
          <li>
            <Link href="/docs/api" className="text-mistral-orange hover:underline underline-offset-2">
              API Reference
            </Link>{" "}
            - request and response formats, endpoint status labels
          </li>
          <li>
            <Link href="/errors" className="text-mistral-orange hover:underline underline-offset-2">
              Errors
            </Link>{" "}
            - debugging and retry guidance
          </li>
          <li>
            <Link href="/rate-limits" className="text-mistral-orange hover:underline underline-offset-2">
              Rate Limits
            </Link>{" "}
            - quotas, headers, and backoff rules
          </li>
        </ul>
      </section>
    </DocsPageShell>
  );
}

