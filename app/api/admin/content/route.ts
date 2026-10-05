import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings, saveSettings } from "@/lib/settings";
import { faqItems } from "@/lib/content";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const settings = await getSettings();
  const prisma = db();
  const faq = prisma ? await prisma.siteSetting.findUnique({ where: { key: "faqJson" } }) : null;
  return ok({ settings, faq: faq?.value || JSON.stringify(faqItems) });
}

export async function PUT(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const body = (await readJson(request)) as { settings?: Record<string, string>; faq?: string } | null;
  if (!body?.settings && body?.faq == null) return fail("VALIDATION", "Nothing to save.");
  const next: Record<string, string> = { ...(body.settings || {}) };
  if (body.faq != null) next.faqJson = body.faq;
  await saveSettings(next);
  return ok({ saved: true });
}
