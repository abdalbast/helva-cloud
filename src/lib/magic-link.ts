export const DEFAULT_MAGIC_LINK_FROM = "HELVA CLOUD <no-reply@helva.group>";

export function isLocalSiteUrl(siteUrl?: string) {
  if (!siteUrl) {
    return false;
  }

  try {
    const hostname = new URL(siteUrl).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

export function resolveMagicLinkSender({
  siteUrl,
  authEmailFrom,
}: {
  siteUrl?: string;
  authEmailFrom?: string;
}) {
  if (authEmailFrom?.trim()) {
    return authEmailFrom.trim();
  }

  if (isLocalSiteUrl(siteUrl)) {
    return DEFAULT_MAGIC_LINK_FROM;
  }

  return DEFAULT_MAGIC_LINK_FROM;
}

export function extractEmailAddress(sender: string) {
  const match = sender.match(/<([^>]+)>/);
  return (match?.[1] ?? sender).trim().toLowerCase();
}

export type InboxLink = {
  description: string;
  href: string;
  label: string;
};

export function getInboxLink(
  recipientEmail: string,
  senderEmail: string,
): InboxLink | null {
  const [, domain = ""] = recipientEmail.toLowerCase().split("@");
  const fromQuery = `from:${senderEmail}`;

  switch (domain) {
    case "gmail.com":
    case "googlemail.com":
      return {
        label: "Open Gmail",
        href: `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(fromQuery)}`,
        description: `This opens Gmail with a search for messages from ${senderEmail}.`,
      };
    case "outlook.com":
    case "hotmail.com":
    case "live.com":
    case "msn.com":
      return {
        label: "Open Outlook",
        href: `https://outlook.live.com/mail/0/?q=${encodeURIComponent(fromQuery)}`,
        description: `This opens Outlook with a search for messages from ${senderEmail}.`,
      };
    case "yahoo.com":
    case "ymail.com":
    case "rocketmail.com":
      return {
        label: "Open Yahoo Mail",
        href: `https://mail.yahoo.com/d/search/keyword=${encodeURIComponent(senderEmail)}`,
        description: `This opens Yahoo Mail with a search for ${senderEmail}.`,
      };
    case "icloud.com":
    case "me.com":
    case "mac.com":
      return {
        label: "Open iCloud Mail",
        href: "https://www.icloud.com/mail/",
        description: `Then search for messages from ${senderEmail}.`,
      };
    case "proton.me":
    case "protonmail.com":
      return {
        label: "Open Proton Mail",
        href: "https://mail.proton.me/u/0/inbox",
        description: `Then search for messages from ${senderEmail}.`,
      };
    case "aol.com":
      return {
        label: "Open AOL Mail",
        href: "https://mail.aol.com/webmail-std/en-us/suite",
        description: `Then search for messages from ${senderEmail}.`,
      };
    default:
      return null;
  }
}
