import Link from "next/link";
import { CodeSample } from "@/components/docs/code-sample";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { buildPageMetadata, DOCS_LAST_UPDATED } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "API Reference",
  description: "Helva Cloud API overview and reference structure: authentication, versions, request and response conventions, errors, and rate limits.",
  path: "/docs/api",
});

export default function ApiReferencePage() {
  return (
    <DocsPageShell
      title="Helva Cloud API Reference"
      description="API-first documentation for Helva Cloud. This page defines the request conventions and endpoint documentation structure used by developers and coding assistants."
    >
      <PageSummaryBlock
        quickAnswer="Use this page to understand how Helva Cloud APIs are documented and called: base URL, auth, request/response format, endpoint status labels, errors, and rate limits."
        audience={["Developers", "Integrators", "AI coding assistants", "Technical founders evaluating API fit"]}
        actions={[
          "Find the API base URL and versioning model",
          "Learn authentication and headers",
          "Understand JSON request and response conventions",
          "Jump to errors, rate limits, and examples",
        ]}
        codeExamples={{
          curl: true,
          ts: true,
          python: true,
          json: true,
          config: true,
          statusLabels: ["Live", "Beta", "Planned", "Coming soon"],
        }}
        relatedDocs={[
          { href: "/docs/authentication", label: "Authentication", reason: "Credentials, auth headers, and token handling" },
          { href: "/rate-limits", label: "Rate Limits", reason: "Quota rules and retry strategy" },
          { href: "/errors", label: "Errors", reason: "Error format and troubleshooting" },
        ]}
        lastUpdated={DOCS_LAST_UPDATED}
      />

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">API overview</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>- API-first usage is a core Helva Cloud principle for automation and developer workflows.</li>
          <li>- Current public docs are an active draft while endpoint inventory and auth methods are finalised.</li>
          <li>- Current repo includes an internal ingestion endpoint pattern at <code>/api/ingest/openclaw</code>.</li>
          <li>- Every endpoint page should include cURL, TypeScript, Python, JSON request/response, errors, and rate-limit notes.</li>
        </ul>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Base URL and versioning (placeholder)</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>- Base URL (planned): <code>https://helva.cloud/api/v1</code></li>
          <li>- Versioning model (planned): version in path</li>
          <li>- Endpoint lifecycle labels: Live, Beta, Planned, Coming soon</li>
          <li>- Breaking changes will be published on <Link href="/changelog" className="underline">/changelog</Link> with exact dates</li>
        </ul>
      </section>

      <CodeSample title="Authenticated request (cURL placeholder)" language="bash" status="Planned">
        {`curl -X POST "https://helva.cloud/api/v1/workflows/execute" \\
  -H "Authorization: Bearer hc_example_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "wf_example",
    "input": {
      "goal": "deploy-founder-mvp"
    }
  }'`}
      </CodeSample>

      <CodeSample title="Authenticated request (TypeScript placeholder)" language="ts" status="Planned">
        {`const response = await fetch("https://helva.cloud/api/v1/workflows/execute", {
  method: "POST",
  headers: {
    Authorization: "Bearer hc_example_token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    workflowId: "wf_example",
    input: { goal: "deploy-founder-mvp" },
  }),
});

const payload = await response.json();`}
      </CodeSample>

      <CodeSample title="Authenticated request (Python placeholder)" language="python" status="Planned">
        {`import requests

payload = {
    "workflowId": "wf_example",
    "input": {"goal": "deploy-founder-mvp"},
}

resp = requests.post(
    "https://helva.cloud/api/v1/workflows/execute",
    headers={
        "Authorization": "Bearer hc_example_token",
        "Content-Type": "application/json",
    },
    json=payload,
    timeout=30,
)
print(resp.status_code, resp.json())`}
      </CodeSample>

      <CodeSample title="JSON response envelope (placeholder)" language="json" status="Planned">
        {`{
  "requestId": "req_123",
  "status": "accepted",
  "data": {
    "workflowRunId": "wfr_456",
    "state": "queued"
  },
  "error": null
}`}
      </CodeSample>

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Endpoint groups (documentation map)</h2>
        <ul className="mt-3 space-y-2 text-sm text-foreground/80">
          <li>- Authentication and identity (planned)</li>
          <li>- Projects and environments (planned)</li>
          <li>- Workflows and automation runs (planned)</li>
          <li>- Integrations and provider connections (planned)</li>
          <li>- Usage and analytics events (beta/internal patterns today)</li>
          <li>- Webhooks and event subscriptions (planned)</li>
        </ul>
      </section>
    </DocsPageShell>
  );
}

