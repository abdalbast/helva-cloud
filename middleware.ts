import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;

  // Redirect www → apex (keep it simple + predictable)
  const host = req.headers.get("host");
  if (host === "www.helva.cloud") {
    const url = new URL(nextUrl.pathname + nextUrl.search, "https://helva.cloud");
    return Response.redirect(url, 308);
  }

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
  matcher: ["/:path*"],
};
