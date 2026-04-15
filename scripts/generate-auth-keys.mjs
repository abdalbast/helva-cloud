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

const convexSiteUrl =
  process.env.CONVEX_SITE_URL ?? "<your CONVEX_SITE_URL (.convex.site)>";
const publicConvexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "<your NEXT_PUBLIC_CONVEX_URL (.convex.cloud)>";
const siteUrl = process.env.SITE_URL ?? "<your SITE_URL>";

console.log("\n=== HELVA AUTH KEY SETUP ===\n");
console.log("Step 1 — Add to .env.local:\n");
console.log(`CONVEX_AUTH_PRIVATE_KEY='${JSON.stringify(privateJwk)}'`);
console.log(`SITE_URL='${siteUrl}'`);
console.log("\nStep 2 — Set Convex environment variables (run from project root):\n");
console.log(`npx convex env set CONVEX_AUTH_PUBLIC_KEY '${JSON.stringify(publicJwk)}'`);
console.log(`npx convex env set CONVEX_SITE_URL '${convexSiteUrl}'`);
console.log(
  "\nCONVEX_SITE_URL should be your `.convex.site` origin.\nNEXT_PUBLIC_CONVEX_URL should be your `.convex.cloud` origin.\nSITE_URL should be your app origin, with no trailing slash.\n",
);
console.log(`Current NEXT_PUBLIC_CONVEX_URL: ${publicConvexUrl}`);
console.log("Step 3 — Restart: npx convex dev  +  npm run dev\n");
