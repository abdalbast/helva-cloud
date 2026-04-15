import type { ReactNode } from "react";

type CodeSampleProps = {
  title: string;
  language: string;
  status?: "Live" | "Beta" | "Planned" | "Coming soon" | "Active draft";
  children: ReactNode;
};

export function CodeSample({ title, language, status, children }: CodeSampleProps) {
  const statusStyles = status === "Live" || status === "Active draft"
    ? "border-sunshine-700/30 bg-sunshine-700/10 text-sunshine-700"
    : status === "Beta"
    ? "border-mistral-orange/30 bg-mistral-orange/10 text-mistral-orange"
    : "border-foreground/10 bg-foreground/5 text-foreground/60";

  return (
    <section className="rounded-[2px] border border-foreground/10 bg-surface-pure shadow-golden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 bg-surface-cream/50 px-4 py-2">
        <div className="text-sm font-normal">{title}</div>
        <div className="flex items-center gap-2 text-caption text-foreground/70">
          <span>{language}</span>
          {status ? <span className={`rounded-[2px] border px-2 py-0.5 ${statusStyles}`}>{status}</span> : null}
        </div>
      </div>
      <pre className="overflow-x-auto bg-surface-pure p-4 text-caption leading-5">
        <code className="text-foreground/90">{children}</code>
      </pre>
    </section>
  );
}
