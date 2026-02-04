import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const baseUrl = "https://helva.cloud";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Helva Cloud",
    template: "%s | Helva Cloud",
  },
  description: "Launchpad for Helva business tools.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: baseUrl,
    title: "Helva Cloud",
    description: "Launchpad for Helva business tools.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Helva Cloud" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helva Cloud",
    description: "Launchpad for Helva business tools.",
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
