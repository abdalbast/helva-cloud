import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isSignInRoute = createRouteMatcher(["/sign-in"]);

function parseHostHeader(host: string | null) {
  if (!host) {
    return null;
  }

  try {
    const url = new URL(`http://${host}`);
    return {
      hostname: url.hostname,
      port: url.port,
    };
  } catch {
    return null;
  }
}

function requestPath(request: NextRequest) {
  return request.nextUrl.pathname + request.nextUrl.search;
}

function isDocumentRequest(request: NextRequest) {
  return (
    request.method === "GET" &&
    (request.headers.get("accept") ?? "").includes("text/html")
  );
}

function redirectTo(url: string) {
  return new NextResponse(null, {
    status: 308,
    headers: {
      Location: url,
    },
  });
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderCanonicalLocalhostPage(target: string) {
  const escapedTarget = escapeHtmlAttribute(target);
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting…</title><meta http-equiv="refresh" content="0;url=${escapedTarget}"><script>window.location.replace(${JSON.stringify(target)});</script></head><body>Redirecting to <a href="${escapedTarget}">${escapedTarget}</a>…</body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
}

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const host = parseHostHeader(request.headers.get("host"));

  if (host?.hostname === "www.helva.cloud") {
    return redirectTo(`https://helva.cloud${requestPath(request)}`);
  }

  if (host?.hostname === "127.0.0.1" || host?.hostname === "[::1]") {
    const port = host.port ? `:${host.port}` : "";
    const target = `http://localhost${port}${requestPath(request)}`;

    if (isDocumentRequest(request)) {
      return renderCanonicalLocalhostPage(target);
    }

    return NextResponse.json(
      {
        error: "Use http://localhost for local development.",
        redirectTo: target,
      },
      { status: 409 },
    );
  }

  if (isSignInRoute(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/app");
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
