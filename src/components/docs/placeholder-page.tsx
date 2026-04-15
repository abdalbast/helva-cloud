import Link from "next/link";
import { DocsPageShell } from "@/components/docs/docs-page-shell";
import { PageSummaryBlock } from "@/components/docs/page-summary-block";
import { DOCS_LAST_UPDATED, type RelatedDocLink } from "@/lib/site";

type PlaceholderPageProps = {
  title: string;
  description: string;
  quickAnswer: string;
  audience: string[];
  actions: string[];
  relatedDocs: RelatedDocLink[];
  statusNote: string;
};

export function PlaceholderPage({
  title,
  description,
  quickAnswer,
  audience,
  actions,
  relatedDocs,
  statusNote,
}: PlaceholderPageProps) {
  return (
    <DocsPageShell title={title} description={description}>
      <PageSummaryBlock
        quickAnswer={quickAnswer}
        audience={audience}
        actions={actions}
        codeExamples={{
          curl: false,
          ts: false,
          python: false,
          json: false,
          config: false,
          statusLabels: ["Planned", "Coming soon"],
        }}
        relatedDocs={relatedDocs}
        lastUpdated={DOCS_LAST_UPDATED}
      />

      <section className="rounded-[2px] border border-foreground/10 bg-surface-pure p-5 shadow-golden">
        <h2 className="text-feature">Page Status</h2>
        <p className="text-body mt-2 text-foreground/80">{statusNote}</p>
        <ul className="text-body mt-4 space-y-2 text-foreground/80">
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> This page is intentionally published early to create a stable canonical path.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Content will be expanded with code snippets and operational details as features go live.</li>
          <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Placeholder sections are labelled clearly to reduce incorrect assumptions by agents.</li>
        </ul>
        <div className="text-body mt-4">
          <Link href="/docs" className="text-mistral-orange hover:underline underline-offset-2">
            ← Return to Docs Home
          </Link>
        </div>
      </section>
    </DocsPageShell>
  );
}
