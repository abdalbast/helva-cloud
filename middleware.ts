import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);
const isSignInRoute = createRouteMatcher(["/sign-in"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const host = request.headers.get("host");
  if (host === "www.helva.cloud") {
    const url = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      "https://helva.cloud",
    );
    return NextResponse.redirect(url, 308);
  }

  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }

  if (isSignInRoute(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/app");
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
