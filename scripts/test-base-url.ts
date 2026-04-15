function getConfiguredBaseUrl() {
  const url = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");

  if (url.hostname === "127.0.0.1" || url.hostname === "[::1]") {
    url.hostname = "localhost";
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url;
}

export const PLAYWRIGHT_BASE_URL = getConfiguredBaseUrl().origin;

export const PLAYWRIGHT_LOOPBACK_BASE_URL = (() => {
  const url = getConfiguredBaseUrl();
  url.hostname = "127.0.0.1";
  return url.origin;
})();
