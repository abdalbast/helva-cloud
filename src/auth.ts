import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const allowedEmails = (process.env.HELVA_ALLOWED_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile }) {
      const email = (profile?.email || "").toLowerCase();
      if (!email) return false;
      if (allowedEmails.length === 0) return true; // allow all if not configured
      return allowedEmails.includes(email);
    },
  },
});
