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
    <section aria-labelledby="page-summary" className="rounded-xl border bg-foreground/[0.02] p-5">
      <h2 id="page-summary" className="text-lg font-semibold">
        Page Summary
      </h2>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide">Quick Answer</h3>
          <p className="mt-2 text-sm leading-6 text-foreground/80">{quickAnswer}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide">Who this is for</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
            {audience.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide">What you can do here</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
            {actions.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide">Code examples on this page</h3>
          <ul className="mt-2 space-y-1 text-sm text-foreground/80">
            <li>- cURL: {yesNo(codeExamples.curl)}</li>
            <li>- JavaScript/TypeScript: {yesNo(codeExamples.ts)}</li>
            <li>- Python: {yesNo(codeExamples.python)}</li>
            <li>- JSON request/response: {yesNo(codeExamples.json)}</li>
            <li>- Config snippets: {yesNo(codeExamples.config)}</li>
            <li>- Status labels: {codeExamples.statusLabels.join(", ")}</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <h3 className="text-sm font-semibold tracking-wide">Related docs</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {relatedDocs.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="underline underline-offset-2">
                  {link.label}
                </Link>{" "}
                <span className="text-foreground/70">- {link.reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-foreground/70">
          <div className="font-semibold text-foreground">Last updated</div>
          <div>{lastUpdated}</div>
        </div>
      </div>
    </section>
  );
}

