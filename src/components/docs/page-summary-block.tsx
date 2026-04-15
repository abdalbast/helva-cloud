import Link from "next/link";
import type { RelatedDocLink } from "@/lib/site";

type PageSummaryBlockProps = {
  quickAnswer: string;
  audience: string[];
  actions: string[];
  codeExamples: {
    curl: boolean;
    ts: boolean;
    python: boolean;
    json: boolean;
    config: boolean;
    statusLabels: string[];
  };
  relatedDocs: RelatedDocLink[];
  lastUpdated: string;
};

function yesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export function PageSummaryBlock({
  quickAnswer,
  audience,
  actions,
  codeExamples,
  relatedDocs,
  lastUpdated,
}: PageSummaryBlockProps) {
  return (
    <section aria-labelledby="page-summary" className="rounded-[2px] border border-foreground/10 bg-surface-cream/50 p-5 shadow-golden">
      <h2 id="page-summary" className="text-feature">
        Page Summary
      </h2>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-caption uppercase tracking-wide text-foreground/80">Quick Answer</h3>
          <p className="text-body mt-2 text-foreground/80">{quickAnswer}</p>
        </div>

        <div>
          <h3 className="text-caption uppercase tracking-wide text-foreground/80">Who this is for</h3>
          <ul className="text-body mt-2 space-y-1 text-foreground/80">
            {audience.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-sunshine-700">-</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-caption uppercase tracking-wide text-foreground/80">What you can do here</h3>
          <ul className="text-body mt-2 space-y-1 text-foreground/80">
            {actions.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-sunshine-700">-</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-caption uppercase tracking-wide text-foreground/80">Code examples on this page</h3>
          <ul className="text-body mt-2 space-y-1 text-foreground/80">
            <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> cURL: {yesNo(codeExamples.curl)}</li>
            <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> JavaScript/TypeScript: {yesNo(codeExamples.ts)}</li>
            <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Python: {yesNo(codeExamples.python)}</li>
            <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> JSON request/response: {yesNo(codeExamples.json)}</li>
            <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Config snippets: {yesNo(codeExamples.config)}</li>
            <li className="flex items-start gap-2"><span className="text-sunshine-700">-</span> Status labels: {codeExamples.statusLabels.join(", ")}</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-foreground/10 pt-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <h3 className="text-caption uppercase tracking-wide text-foreground/80">Related docs</h3>
          <ul className="text-body mt-2 space-y-1.5">
            {relatedDocs.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-foreground hover:text-mistral-orange underline underline-offset-2">
                  {link.label}
                </Link>{" "}
                <span className="text-foreground/70">- {link.reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-body text-foreground/70">
          <div className="text-caption uppercase tracking-wide text-foreground">Last updated</div>
          <div className="text-sunshine-700">{lastUpdated}</div>
        </div>
      </div>
    </section>
  );
}

