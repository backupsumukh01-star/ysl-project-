import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ cartridges: [], faqs: [], app: null });
  const [cartridges, faqs, app] = await Promise.all([
    prisma.cartridge.findMany({ orderBy: { code: "asc" }, include: { family: true } }),
    prisma.productFaq.findMany({ where: { scope: "global" }, orderBy: { sortOrder: "asc" } }),
    prisma.appRequirement.findUnique({ where: { id: "default" } }),
  ]);
  return ok({
    cartridges: cartridges.map((item) => ({
      code: item.code,
      name: item.name,
      family: item.family.name,
      ingredients: item.ingredients,
      soldIndividually: item.soldIndividually,
    })),
    faqs,
    app,
  });
}

export async function PATCH(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Catalog data is not available.", 503);
  const body = (await readJson(request)) as {
    cartridges?: { code?: string; name?: string; ingredients?: string; soldIndividually?: boolean }[];
    faqs?: { id?: string; question?: string; answer?: string }[];
    app?: { ios?: string; android?: string; bluetooth?: string; iosUrl?: string; androidUrl?: string; methods?: string; note?: string };
  } | null;
  if (!body) return fail("VALIDATION", "Nothing to update.");
  if (Array.isArray(body.cartridges)) {
    for (const cartridge of body.cartridges) {
      if (!cartridge.code) continue;
      await prisma.cartridge.update({
        where: { code: cartridge.code },
        data: {
          ...(typeof cartridge.name === "string" ? { name: cartridge.name } : {}),
          ...(typeof cartridge.ingredients === "string" ? { ingredients: cartridge.ingredients } : {}),
          ...(typeof cartridge.soldIndividually === "boolean" ? { soldIndividually: cartridge.soldIndividually } : {}),
        },
      });
    }
  }
  if (Array.isArray(body.faqs)) {
    for (const faq of body.faqs) {
      if (!faq.id || typeof faq.question !== "string" || typeof faq.answer !== "string") continue;
      await prisma.productFaq.update({ where: { id: faq.id }, data: { question: faq.question, answer: faq.answer } });
    }
  }
  if (body.app) {
    const app = body.app;
    await prisma.appRequirement.update({
      where: { id: "default" },
      data: {
        ...(typeof app.ios === "string" ? { ios: app.ios } : {}),
        ...(typeof app.android === "string" ? { android: app.android } : {}),
        ...(typeof app.bluetooth === "string" ? { bluetooth: app.bluetooth } : {}),
        ...(typeof app.iosUrl === "string" ? { iosUrl: app.iosUrl } : {}),
        ...(typeof app.androidUrl === "string" ? { androidUrl: app.androidUrl } : {}),
        ...(typeof app.methods === "string" ? { methods: app.methods } : {}),
        ...(typeof app.note === "string" ? { note: app.note } : {}),
      },
    });
  }
  return ok({ saved: true });
}
