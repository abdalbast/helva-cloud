import type { Metadata } from "next";

export const SITE_NAME = "Helva Cloud";
export const SITE_URL = "https://helva.cloud";
export const DOCS_LAST_UPDATED = "2026-02-24";
export const DOCS_VERSION = "0.1.0";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
}: BuildMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: new URL(path, SITE_URL).toString(),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export type RelatedDocLink = {
  href: string;
  label: string;
  reason: string;
};

export const primaryDocsLinks: RelatedDocLink[] = [
  { href: "/docs", label: "Docs Home", reason: "Browse docs by task and goal" },
  {
    href: "/docs/getting-started",
    label: "Getting Started",
    reason: "Set up your first Helva Cloud workflow",
  },
  { href: "/docs/workflows", label: "Workflows", reason: "Solve common build and automation tasks" },
  { href: "/docs/api", label: "API Reference", reason: "Find request and response conventions" },
  {
    href: "/docs/llm-usage-guide",
    label: "LLM Usage Guide",
    reason: "Use Helva Cloud with coding assistants",
  },
];
