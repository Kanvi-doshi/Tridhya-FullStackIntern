import axios, { type InternalAxiosRequestConfig } from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`;
const REFRESH_MARGIN_MS = 30_000;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Separate client prevents refresh interceptor loops.
const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;
let redirecting = false;

function skipRefresh(url?: string): boolean {
  if (!url) return false;

  const pathname = new URL(url, `${BASE_URL}/`).pathname
    .replace(/^\/api(?=\/)/, "")
    .replace(/\/+$/, "");

  return [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
  ].includes(pathname);
}

// Reading expiry is only for refresh timing.
// The backend still verifies the token's signature.
function needsRefresh(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded: { exp?: number } = JSON.parse(atob(padded));

    if (typeof decoded.exp !== "number" || !Number.isFinite(decoded.exp)) {
      return true;
    }
    return decoded.exp * 1000 <= Date.now() + REFRESH_MARGIN_MS;
  } catch {
    return true;
  }
}

function endSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (!redirecting && window.location.pathname !== "/login") {
    redirecting = true;
    window.location.replace("/login");
  }
}

function refreshAccessToken(): Promise<string> {
  // All requests in this tab wait for the same refresh.
  if (!refreshPromise) {
    refreshPromise = refreshApi
      .post<{ token: string }>("/auth/refresh")
      .then((response) => {
        const token = response.data.token;

        if (typeof token !== "string" || !token) {
          throw new Error("Refresh response did not contain an access token.");
        }

        localStorage.setItem("token", token);
        return token;
      })
      .catch((error: unknown) => {
        // Don't log the user out for temporary network/server failures.
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          endSession();
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  if (skipRefresh(config.url)) {
    return config;
  }
  let token = localStorage.getItem("token");

  // Wait for a refresh already underway, or refresh before sending.
  if (refreshPromise) {
    token = await refreshPromise;
  } else if (!token || needsRefresh(token)) {
    token = await refreshAccessToken();
  }
  config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryConfig | undefined;
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      skipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // Retry a protected request at most once.
    if (originalRequest._retry) {
      endSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const currentToken = localStorage.getItem("token");
    const sentAuthorization = originalRequest.headers.get("Authorization");

    // A different request may already have refreshed the token while this failed request was still travelling.
    let token: string;
    if (
      currentToken &&
      !needsRefresh(currentToken) &&
      sentAuthorization !== `Bearer ${currentToken}`
    ) {
      token = currentToken;
    } else {
      token = await refreshAccessToken();
    }
    originalRequest.headers.set("Authorization", `Bearer ${token}`);
    return api(originalRequest);
  },
);

export default api;
