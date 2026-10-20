import { clearAdminAuthStorage, getAdminAccessToken } from "../../modules/auth/hooks/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export type AdminApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export class AdminApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type RequestOptions = RequestInit & {
  skipUnauthorizedRedirect?: boolean;
};

export async function adminRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await sendAdminRequest(path, options);
  return (await readJson(response)) as TResponse;
}

/** Same auth and error/401 handling as adminRequest, but resolves with the response body as a Blob. */
export async function adminRequestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const response = await sendAdminRequest(path, options);
  return response.blob();
}

/** Sends the request and returns the response only when it is ok; otherwise throws AdminApiError. */
async function sendAdminRequest(path: string, options: RequestOptions): Promise<Response> {
  const token = getAdminAccessToken();
  const headers = new Headers(options.headers);
  // For FormData the browser must set Content-Type itself (with the multipart boundary).
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new AdminApiError("NETWORK_ERROR", "Unable to connect to server", 0);
  }

  if (!response.ok) {
    const error = toApiError(await readJson(response), response.status);
    if (response.status === 401 && !options.skipUnauthorizedRedirect) {
      clearAdminAuthStorage();
      window.location.assign("/admin/login");
    }
    throw error;
  }

  return response;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function toApiError(body: unknown, status: number): AdminApiError {
  if (isAdminErrorBody(body)) {
    return new AdminApiError(body.error.code, body.error.message, status);
  }

  return new AdminApiError("UNKNOWN_ERROR", "Request failed", status);
}

function isAdminErrorBody(body: unknown): body is AdminApiErrorBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as AdminApiErrorBody;
  return (
    candidate.success === false &&
    typeof candidate.error?.code === "string" &&
    typeof candidate.error.message === "string"
  );
}
