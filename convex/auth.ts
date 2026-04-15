import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Email } from "@convex-dev/auth/providers/Email";

function env(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  return undefined;
}

const googleClientId = env(
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_ID",
);

const googleClientSecret = env(
  "AUTH_GOOGLE_SECRET",
  "AUTH_GOOGLE_CLIENT_SECRET",
  "GOOGLE_CLIENT_SECRET",
);

function isLocalSiteUrl() {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    return false;
  }

  try {
    return new URL(siteUrl).hostname === "localhost";
  } catch {
    return false;
  }
}

async function sendResendEmail({
  apiKey,
  from,
  to,
  subject,
  html,
  text,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  return await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
    }),
  });
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    Email({
      authorize: undefined,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const apiKey = process.env.AUTH_RESEND_KEY;
        const isLocal = isLocalSiteUrl();
        const configuredFrom =
          process.env.AUTH_EMAIL_FROM ?? "Helva Cloud <no-reply@helva.group>";
        const senderFrom = configuredFrom;

        if (!apiKey) {
          if (isLocal) {
            console.log(`[Helva Auth] Magic link for ${email}:\n${url}`);
            return;
          }
          throw new Error(
            "Failed to send email: AUTH_RESEND_KEY is not configured.",
          );
        }

        const subject = "Sign in to Helva Cloud";
        const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px"><h2 style="font-weight:normal;color:#1a1a1a">Sign in to Helva Cloud</h2><p style="color:#666;font-size:14px">Click below to sign in. This link expires in 1 hour.</p><a href="${url}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#e87b34;color:#fff;text-decoration:none;border-radius:4px;font-size:14px">Sign in →</a><p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p></div>`;
        const text = `Sign in to Helva Cloud\n\nOpen this sign-in link: ${url}\n\nIf you didn't request this, ignore this email.`;

        const res = await sendResendEmail({
          apiKey,
          from: senderFrom,
          to: email,
          subject,
          html,
          text,
        });

        if (!res.ok) {
          const errorText = await res.text();

          if (isLocal) {
            console.log(
              `[Helva Auth] Magic link preview for ${email}:\n${url}\n[Helva Auth] Sender used: ${senderFrom}\n[Helva Auth] Resend delivery failed: ${errorText}`,
            );
            return;
          }

          if (errorText.includes("domain is not verified")) {
            throw new Error(
              "Failed to send email: the sender domain is not verified in Resend. Verify the sender domain or use a verified from-address in AUTH_EMAIL_FROM.",
            );
          }
          throw new Error(`Failed to send email: ${errorText}`);
        }
      },
    }),
  ],
});
