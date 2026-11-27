export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Array<{ field: string; rule: string; message: string }>;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorPayload["details"];

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  csrfToken?: string | null;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, csrfToken, headers, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();
  const isMutating = !["GET", "HEAD", "OPTIONS"].includes(method);

  const nextHeaders = new Headers(headers);
  if (body !== undefined) {
    nextHeaders.set("Content-Type", "application/json");
  }
  if (isMutating && csrfToken) {
    nextHeaders.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(path, {
    ...rest,
    method,
    credentials: "include",
    headers: nextHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const err = (payload as { error?: ApiErrorPayload } | null)?.error;
    throw new ApiClientError(response.status, {
      code: err?.code ?? "INTERNAL_ERROR",
      message: err?.message ?? "Permintaan gagal.",
      details: err?.details,
    });
  }

  return payload as T;
}
