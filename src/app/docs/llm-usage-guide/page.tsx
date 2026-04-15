import Link from "next/link";
import { CodeSample } from "@/components/docs/code-sample";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "LLM Usage Guide",
  description: "Use HELVA CLOUD with ChatGPT, Claude, Gemini, Copilot, Cursor, Lovable, and other coding assistants using canonical docs and task-safe prompts.",
  path: "/docs/llm-usage-guide",
});

export default function LlmUsageGuidePage() {
  return (
    <DocsPageShell
      title="Using HELVA CLOUD with LLMs and Coding Agents"
      description="Guidance for ChatGPT, Claude, Gemini, Perplexity, Copilot, Cursor, Lovable, and agentic coding tools to use HELVA CLOUD docs and APIs accurately."
    >
      <PageSummaryBlock
        quickAnswer="Start agent sessions with /llm.txt, then provide the exact task and the canonical docs pages for that task. Require the agent to label planned endpoints and validate against Errors and Rate Limits before finalising code."
        audience={["Developers using coding assistants", "Founders prototyping with AI tools", "Agentic coding workflows"]}
        actions={[
          "Give agents the correct docs in the correct order",
          "Use prompt templates that reduce incorrect assumptions",
          "Force explicit handling of planned vs live features",
          "Validate generated code before shipping",
        ]}
        codeExamples={{
          curl: false,
          ts: true,
          python: false,
          json: false,
          config: true,
          statusLabels: ["Live", "Beta", "Planned", "Coming soon"],
        }}
        relatedDocs={[
          { href: "/llm.txt", label: "llm.txt", reason: "Machine-readable site summary for agents" },
          { href: "/docs/workflows", label: "Workflows", reason: "Task-based implementation paths" },
          { href: "/docs/api", label: "API Reference", reason: "Request conventions and endpoint docs" },
        ]}
        lastUpdated={DOCS_LAST_UPDATED}
      />

      <section className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
        <h2 className="text-feature">Read this first (for agents)</h2>
        <ol className="text-body mt-3 space-y-2 text-foreground/80">
          <li className="flex items-start gap-2"><span className="text-sunshine-700 font-normal">1.</span> Read <Link href="/llm.txt" className="text-mistral-orange hover:underline">/llm.txt</Link> to identify HELVA CLOUD purpose, audiences, workflows, and canonical pages.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700 font-normal">2.</span> Read the exact task page in <Link href="/docs/workflows" className="text-mistral-orange hover:underline">/docs/workflows</Link> or <Link href="/docs/getting-started" className="text-mistral-orange hover:underline">/docs/getting-started</Link>.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700 font-normal">3.</span> Read <Link href="/docs/api" className="text-mistral-orange hover:underline">/docs/api</Link>, <Link href="/errors" className="text-mistral-orange hover:underline">/errors</Link>, and <Link href="/rate-limits" className="text-mistral-orange hover:underline">/rate-limits</Link> before generating production integration code.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700 font-normal">4.</span> Treat anything labelled Planned or Coming soon as non-live and generate placeholders only.</li>
        </ol>
      </section>

      <CodeSample title="Prompt template for coding agents" language="txt" status="Active draft">
        {`You are implementing a HELVA CLOUD integration.
Goal: [describe exact task]
Read first: /llm.txt
Then read: /docs/getting-started, /docs/workflows, /docs/api, /errors, /rate-limits
Rules:
- Use only documented live endpoints.
- If docs label a feature Planned/Beta, mark code and comments clearly.
- Include cURL and TypeScript examples when possible.
- Include error handling and retry/backoff logic.
- List assumptions and unresolved placeholders.`}
      </CodeSample>

      <CodeSample title="Project context block for Cursor/Lovable" language="txt" status="Active draft">
        {`HELVA CLOUD integration task
- Site purpose: build and tooling layer for AI workflows, app delivery, automation
- Canonical docs: /llm.txt, /docs, /docs/workflows, /docs/api
- Required output: parsable setup steps, env vars, code examples, error handling
- Do not invent endpoints; use Planned placeholders if necessary`}
      </CodeSample>

      <section className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
        <h2 className="text-feature">Common mistakes to avoid</h2>
        <ul className="text-body mt-3 space-y-2 text-foreground/80">
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Assuming a placeholder endpoint is live because an example exists.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Omitting error handling or rate limit retries in generated code.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Hiding configuration values instead of documenting required environment variables.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Using stale docs without checking the changelog date.</li>
        </ul>
      </section>
    </DocsPageShell>
  );
}
