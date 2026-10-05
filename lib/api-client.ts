export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const payload = (await response.json().catch(() => null)) as
      | { success: true; data: T }
      | { success: false; error?: { code?: string; message?: string } }
      | null;
    if (!payload || payload.success !== true) {
      const error = payload && "error" in payload ? payload.error : undefined;
      throw new ApiError(error?.code || "REQUEST_FAILED", error?.message || "Something went wrong. Try again.");
    }
    return payload.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("TIMEOUT", "The request timed out.");
    }
    throw new ApiError("NETWORK", "The network request failed.");
  } finally {
    clearTimeout(timer);
  }
}
