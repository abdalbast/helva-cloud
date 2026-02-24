import type { ReactNode } from "react";

type CodeSampleProps = {
  title: string;
  language: string;
  status?: "Live" | "Beta" | "Planned" | "Coming soon" | "Active draft";
  children: ReactNode;
};

export function CodeSample({ title, language, status, children }: CodeSampleProps) {
  return (
    <section className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <span>{language}</span>
          {status ? <span className="rounded border px-2 py-0.5">{status}</span> : null}
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-5">
        <code>{children}</code>
      </pre>
    </section>
  );
}
