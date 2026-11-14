const API_BASE = ""; // Proxied via Next.js rewrites to /api/v1

export type ApiFetchOptions = RequestInit;

/**
 * Same-origin API client.
 *
 * The browser session lives in httpOnly cookies, so this function never reads
 * or writes an access token. On a 401 it asks the refresh endpoint to rotate
 * the session cookies, then retries the original request once.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const url = endpoint.startsWith("/api/v1")
    ? endpoint
    : `/api/v1${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const run = () =>
    fetch(url, {
      headers,
      credentials: "same-origin",
      ...restOptions,
    });

  let res = await run();

  // Access cookie expired? Rotate it with the refresh cookie and retry once.
  if (
    res.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register") &&
    !endpoint.includes("/auth/refresh")
  ) {
    try {
      const refreshRes = await fetch("/api/v1/auth/refresh?cookie_only=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      });

      if (refreshRes.ok) {
        res = await run();
      } else if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("futera:session-expired"));
      }
    } catch {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("futera:session-expired"));
      }
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.detail || data?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return data?.data !== undefined ? data.data : data;
}
