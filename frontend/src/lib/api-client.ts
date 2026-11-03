const API_BASE = ""; // Proxied via Next.js rewrites to /api/v1

export interface ApiFetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const storedToken =
    token || (typeof window !== "undefined" ? localStorage.getItem("futera_access_token") : null);

  if (storedToken) {
    headers["Authorization"] = `Bearer ${storedToken}`;
  }

  const url = endpoint.startsWith("/api/v1") ? endpoint : `/api/v1${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  let res = await fetch(url, {
    headers,
    ...restOptions,
  });

  // Handle 401: Token expired, attempt refresh
  if (res.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    try {
      const refreshRes = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData?.data?.access_token;
        if (newToken && typeof window !== "undefined") {
          localStorage.setItem("futera_access_token", newToken);
          headers["Authorization"] = `Bearer ${newToken}`;
          // Retry original request with fresh token
          res = await fetch(url, {
            headers,
            ...restOptions,
          });
        }
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem("futera_access_token");
        }
      }
    } catch (e) {
      console.error("Token refresh failed", e);
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.detail || data?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return data?.data !== undefined ? data.data : data;
}
