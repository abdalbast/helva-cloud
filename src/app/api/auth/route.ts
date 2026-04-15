import { api } from "convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

type AuthAction = "auth:signIn" | "auth:signOut";

type AuthTokens = {
  token: string;
  refreshToken: string;
} | null;

function isLocalHost(host: string) {
  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]")
  );
}

function cookieNames(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const prefix = isLocalHost(host) ? "" : "__Host-";
  return {
    token: `${prefix}__convexAuthJWT`,
    refreshToken: `${prefix}__convexAuthRefreshToken`,
    verifier: `${prefix}__convexAuthOAuthVerifier`,
  };
}

function cookieOptions(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  return {
    secure: !isLocalHost(host),
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  };
}

function setAuthCookies(
  request: NextRequest,
  response: NextResponse,
  tokens: AuthTokens,
) {
  const names = cookieNames(request);
  const options = cookieOptions(request);

  if (tokens === null) {
    response.cookies.delete(names.token);
    response.cookies.delete(names.refreshToken);
  } else {
    response.cookies.set(names.token, tokens.token, options);
    response.cookies.set(names.refreshToken, tokens.refreshToken, options);
  }

  response.cookies.delete(names.verifier);
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  const { action, args } = (await request.json()) as {
    action?: AuthAction;
    args?: Record<string, unknown> & { refreshToken?: string };
  };

  if (action !== "auth:signIn" && action !== "auth:signOut") {
    return new NextResponse("Invalid action", { status: 400 });
  }

  const names = cookieNames(request);
  const token = request.cookies.get(names.token)?.value;

  if (action === "auth:signIn") {
    const signInArgs = { ...(args ?? {}) };
    if (signInArgs.refreshToken !== undefined) {
      const refreshToken = request.cookies.get(names.refreshToken)?.value;
      if (!refreshToken) {
        const response = json({ tokens: null });
        setAuthCookies(request, response, null);
        return response;
      }
      signInArgs.refreshToken = refreshToken;
    }

    try {
      const result = await fetchAction(
        api.auth.signIn,
        signInArgs,
        signInArgs.refreshToken !== undefined ||
          (signInArgs as { params?: { code?: string } }).params?.code !==
            undefined
          ? {}
          : token
            ? { token }
            : {},
      );

      if (result.redirect !== undefined) {
        if (result.verifier === undefined) {
          const response = json({ error: "Missing OAuth verifier" }, 400);
          setAuthCookies(request, response, null);
          return response;
        }
        const response = json({ redirect: result.redirect });
        response.cookies.set(
          names.verifier,
          result.verifier,
          cookieOptions(request),
        );
        return response;
      }

      if (result.tokens !== undefined) {
        const response = json({
          tokens:
            result.tokens !== null
              ? { token: result.tokens.token, refreshToken: "dummy" }
              : null,
        });
        setAuthCookies(request, response, result.tokens);
        return response;
      }

      return json(result);
    } catch (error) {
      const response = json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        400,
      );
      setAuthCookies(request, response, null);
      return response;
    }
  }

  try {
    await fetchAction(api.auth.signOut, {}, token ? { token } : {});
  } catch {
    // Sign-out should still clear client cookies even if the backend call fails.
  }

  const response = json(null);
  setAuthCookies(request, response, null);
  return response;
}

export async function GET() {
  return new NextResponse("Method not allowed", { status: 405 });
}
