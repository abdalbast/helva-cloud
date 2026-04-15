import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

const baseUrl = "https://helva.cloud";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "HELVA CLOUD",
    template: "%s | HELVA CLOUD",
  },
  description: "Launchpad for HELVA business tools.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: baseUrl,
    title: "HELVA CLOUD",
    description: "Launchpad for HELVA business tools.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "HELVA CLOUD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HELVA CLOUD",
    description: "Launchpad for HELVA business tools.",
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
