/**
 * One-time script to generate the ES256 key pair for Convex custom JWT auth.
 * Run: node scripts/generate-auth-keys.mjs
 */

const { privateKey, publicKey } = await crypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"],
);

const privateJwk = {
  ...(await crypto.subtle.exportKey("jwk", privateKey)),
  kid: "helva-auth-1",
  alg: "ES256",
  use: "sig",
};

const publicJwk = {
  ...(await crypto.subtle.exportKey("jwk", publicKey)),
  kid: "helva-auth-1",
  alg: "ES256",
  use: "sig",
};

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "<your NEXT_PUBLIC_CONVEX_URL>";

console.log("\n=== HELVA AUTH KEY SETUP ===\n");
console.log("Step 1 — Add to .env.local:\n");
console.log(`CONVEX_AUTH_PRIVATE_KEY='${JSON.stringify(privateJwk)}'`);
console.log("\nStep 2 — Set Convex environment variables (run from project root):\n");
console.log(`npx convex env set CONVEX_AUTH_PUBLIC_KEY '${JSON.stringify(publicJwk)}'`);
console.log(`npx convex env set CONVEX_SITE_URL '${convexUrl}'`);
console.log(
  "\n(CONVEX_SITE_URL must exactly match NEXT_PUBLIC_CONVEX_URL — no trailing slash)\n",
);
console.log("Step 3 — Restart: npx convex dev  +  npm run dev\n");
