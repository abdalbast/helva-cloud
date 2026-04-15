import type { MetadataRoute } from "next";
import { DOCS_LAST_UPDATED, SITE_URL } from "@/lib/site";

const routes = [
  "/",
  "/documentation",
  "/docs",
  "/docs/getting-started",
  "/docs/core-concepts",
  "/docs/workflows",
  "/docs/integrations",
  "/docs/authentication",
  "/docs/api",
  "/docs/sdks",
  "/docs/webhooks",
  "/docs/examples",
  "/docs/llm-usage-guide",
  "/pricing",
  "/performance",
  "/rate-limits",
  "/errors",
  "/changelog",
  "/faq",
  "/support",
  "/llm.txt",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: DOCS_LAST_UPDATED,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/docs") ? 0.8 : 0.7,
  }));
}
