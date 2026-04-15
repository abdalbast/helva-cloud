import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchAction } from "convex/nextjs";
import { z } from "zod";
import { api } from "convex/_generated/api";
import { timingSafeEqualString } from "@/lib/timing-safe";

const ContactInputSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const BodySchema = z.object({
  contacts: z.array(ContactInputSchema),
});

function getBearerToken(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return undefined;
  }
  const token = authorization.slice("Bearer ".length).trim();
  return token || undefined;
}

function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isImportAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Unauthenticated") ||
    message.includes("Authenticated identity is missing an email")
  );
}

function convexSiteUrl(): string {
  return process.env.NEXT_PUBLIC_CONVEX_URL!.replace(
    ".convex.cloud",
    ".convex.site",
  );
}

export async function POST(req: Request) {
  const headerEmail = req.headers.get("X-Import-Email");
  const headerSecret = req.headers.get("X-Import-Secret");
  const adminSecret = process.env.ADMIN_IMPORT_SECRET;
  const hasAdminHeaders = headerEmail !== null || headerSecret !== null;

  if (hasAdminHeaders) {
    if (!headerEmail || !headerSecret) {
      return Response.json(
        { error: "Admin import requires both X-Import-Email and X-Import-Secret" },
        { status: 400 },
      );
    }
    if (!adminSecret) {
      return Response.json(
        { error: "Server admin import is not configured" },
        { status: 500 },
      );
    }
  }

  const isAdminRequest =
    !!headerEmail &&
    !!headerSecret &&
    !!adminSecret &&
    timingSafeEqualString(headerSecret, adminSecret);

  let token: string | undefined;

  if (!isAdminRequest) {
    if (hasAdminHeaders) {
      return unauthorizedResponse();
    }
    token = getBearerToken(req) ?? (await convexAuthNextjsToken());
    if (!token) return unauthorizedResponse();
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.contacts.length === 0) {
    return Response.json({ created: 0, skipped: 0, failed: 0 });
  }

  if (isAdminRequest) {
    const res = await fetch(`${convexSiteUrl()}/api/admin-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Import-Email": headerEmail!,
        "X-Import-Secret": headerSecret!,
      },
      body: JSON.stringify({ contacts: parsed.data.contacts }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Import failed" }));
      return Response.json(err, { status: res.status });
    }

    return Response.json(await res.json());
  } else {
    try {
      const result = await fetchAction(
        api.importContacts.importMany,
        { contacts: parsed.data.contacts },
        { token },
      );
      return Response.json(result);
    } catch (error) {
      if (isImportAuthError(error)) {
        return unauthorizedResponse();
      }
      return Response.json({ error: "Import failed" }, { status: 500 });
    }
  }
}
