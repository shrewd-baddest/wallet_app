const STORAGE_KEY = "mvp_wallet_token";

export interface ApiResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const buildHeaders = (extra?: HeadersInit): HeadersInit => {
  const token = getToken();
  console.log("API token", token ? "present" : "missing");
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const baseUrl = 'https://wallet-app-8ol3.onrender.com';
  const url = `${baseUrl}/api${path}`;
  console.log("API request", options.method ?? 'GET', url);

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: buildHeaders(options.headers as HeadersInit),
  });

  const body = await res.json().catch(() => ({}));
  console.log("API response", res.status, url, body);

  if (!res.ok) {
    return {
      success: false,
      message: (body && (body.errors?.[0].message || body.message)) ?? `Request failed with status ${res.status}`,
    };
  }

  return {
    success: true,
    message: body.message,
    data: body.data ?? body,
  };
}

export const apiGet = <T = unknown>(path: string): Promise<ApiResult<T>> => request(path, { method: 'GET' });
export const apiPost = <T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> =>
  request(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPatch = <T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> =>
  request(path, { method: 'PATCH', body: JSON.stringify(body) });
export default { getToken, setToken, clearToken, apiGet, apiPost, apiPatch };
