import { headers } from "next/headers";
import { SignInPageClient } from "./sign-in-page-client";
import { resolveMagicLinkSender } from "@/lib/magic-link";

export default async function SignInPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const requestSiteUrl = host ? `http://${host}` : undefined;
  const magicLinkSender = resolveMagicLinkSender({
    siteUrl: requestSiteUrl ?? process.env.SITE_URL,
    authEmailFrom: process.env.AUTH_EMAIL_FROM,
  });

  return <SignInPageClient magicLinkSender={magicLinkSender} />;
}
