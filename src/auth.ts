import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const allowedEmails = (process.env.HELVA_ALLOWED_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";
const hasGoogleAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

const providers = hasGoogleAuth
  ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ]
  : isProduction
    ? []
    : [
        // Local dev fallback so the app can boot without OAuth setup.
        Credentials({
          name: "Dev login",
          credentials: {
            email: { label: "Email", type: "email" },
          },
          async authorize(credentials) {
            const email = String(credentials?.email || "").trim().toLowerCase();
            if (!email) return null;

            return {
              id: email,
              email,
              name: email.split("@")[0] || "Developer",
            };
          },
        }),
      ];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ profile, user }) {
      const email = (profile?.email || user?.email || "").toLowerCase();
      if (!email) return false;

      // Safe-by-default:
      // - In production, require an allowlist.
      // - In dev, allow all if not configured.
      if (allowedEmails.length === 0) {
        return !isProduction;
      }

      return allowedEmails.includes(email);
    },
  },
});
