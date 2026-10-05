import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";

export type ErrorBody = { code: string; message: string };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (host && (origin === `http://${host}` || origin === `https://${host}`)) return true;
  try {
    return origin === new URL(siteConfig.siteUrl).origin;
  } catch {
    return false;
  }
}

export function guardOrigin(request: Request) {
  if (!sameOrigin(request)) return fail("FORBIDDEN", "This request was rejected.", 403);
  return null;
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
