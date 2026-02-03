import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;

  // Protect everything under /app
  if (nextUrl.pathname.startsWith("/app")) {
    if (!req.auth) {
      const url = new URL("/api/auth/signin", nextUrl.origin);
      url.searchParams.set("callbackUrl", nextUrl.toString());
      return Response.redirect(url);
    }
  }

  return;
});

export const config = {
  matcher: ["/app/:path*"],
};
