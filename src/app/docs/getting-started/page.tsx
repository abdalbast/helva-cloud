import Link from "next/link";
import { CodeSample } from "@/components/docs/code-sample";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Getting Started",
  description: "Get started with Helva Cloud quickly with setup steps, first request patterns, and next steps by goal.",
  path: "/docs/getting-started",
});

export default function GettingStartedPage() {
  return (
    <DocsPageShell
      title="Getting Started with Helva Cloud"
      description="Fast onboarding for builders and developers who want to start a workflow, explore the API, or prepare an MVP stack."
    >
      <PageSummaryBlock
        quickAnswer="Start by identifying your goal (MVP, API integration, AI workflow, or internal tools), then use the docs paths on this page to set up authentication, test a first request pattern, and move into workflow-specific guides."
        audience={["Builders", "Founders", "Developers", "Coding assistants generating starter code"]}
        actions={[
          "Choose the right start path by goal",
          "Prepare environment variables and credentials",
          "Test a first request pattern",
          "Move to API, workflow, or integration docs",
        ]}
        codeExamples={{
          curl: true,
          ts: true,
          python: true,
          json: true,
          config: true,
          statusLabels: ["Planned", "Active draft"],
        }}
        relatedDocs={[
          { href: "/docs/authentication", label: "Authentication", reason: "Set up credentials and request auth" },
          { href: "/docs/api", label: "API Reference", reason: "Learn request and response conventions" },
          { href: "/docs/workflows", label: "Workflows", reason: "Choose a task-based implementation path" },
        ]}
        lastUpdated={DOCS_LAST_UPDATED}
      />

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">How do I get started with Helva Cloud?</h2>
        <ol className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>1. Decide your primary goal: founder MVP, developer integration, AI workflow, or internal tool delivery.</li>
          <li>2. Review <Link href="/docs/core-concepts" className="underline">Core Concepts</Link> for platform terminology and workflow model.</li>
          <li>3. Configure credentials and environment variables (see <Link href="/docs/authentication" className="underline">Authentication</Link>).</li>
          <li>4. Test a first request pattern in cURL, JavaScript/TypeScript, or Python.</li>
          <li>5. Continue with a task guide in <Link href="/docs/workflows" className="underline">Workflows</Link>.</li>
        </ol>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Recommended start paths by goal</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>- Founder MVP: start with Workflows, then Examples, then Pricing.</li>
          <li>- Developer integration: start with Authentication, API Reference, and Errors.</li>
          <li>- AI workflow: start with LLM Usage Guide, Workflows, and Integrations.</li>
          <li>- Internal tool delivery: start with Workflows, API Reference, and Performance.</li>
        </ul>
      </section>

      <CodeSample title="Environment setup (starter placeholder)" language=".env" status="Planned">
        {`HELVA_CLOUD_BASE_URL=https://helva.cloud
HELVA_API_KEY=hc_your_api_key_here
HELVA_PROJECT_ID=proj_your_project_id

# Integration examples (optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_key`}
      </CodeSample>

      <CodeSample title="First request pattern (cURL placeholder)" language="bash" status="Planned">
        {`curl -X GET "$HELVA_CLOUD_BASE_URL/api/v1/projects/$HELVA_PROJECT_ID" \\
  -H "Authorization: Bearer $HELVA_API_KEY" \\
  -H "Accept: application/json"`}
      </CodeSample>

      <CodeSample title="First request pattern (TypeScript placeholder)" language="ts" status="Planned">
        {`const res = await fetch(
  \`\${process.env.HELVA_CLOUD_BASE_URL}/api/v1/projects/\${process.env.HELVA_PROJECT_ID}\`,
  {
    headers: {
      Authorization: \`Bearer \${process.env.HELVA_API_KEY}\`,
      Accept: "application/json",
    },
  }
);

if (!res.ok) {
  throw new Error(\`Helva Cloud request failed: \${res.status}\`);
}

const data = await res.json();
console.log(data);`}
      </CodeSample>

      <CodeSample title="First request pattern (Python placeholder)" language="python" status="Planned">
        {`import os
import requests

url = f"{os.environ['HELVA_CLOUD_BASE_URL']}/api/v1/projects/{os.environ['HELVA_PROJECT_ID']}"
headers = {
    "Authorization": f"Bearer {os.environ['HELVA_API_KEY']}",
    "Accept": "application/json",
}

response = requests.get(url, headers=headers, timeout=30)
response.raise_for_status()
print(response.json())`}
      </CodeSample>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">What is available now vs planned?</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>- Current site: public landing page and private app launcher pattern.</li>
          <li>- Current repo capability: OpenClaw usage ingestion endpoint pattern and usage dashboard.</li>
          <li>- Planned docs expansion: public API reference, integrations, SDKs, rate limits, errors, pricing, and performance pages.</li>
        </ul>
      </section>
    </DocsPageShell>
  );
}

