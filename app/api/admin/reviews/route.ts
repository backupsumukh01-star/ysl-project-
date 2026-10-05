import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ reviews: [] });
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { email: true, name: true } } } });
  return ok({
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      email: review.user?.email || "",
      name: review.reviewerName || review.user?.name || "",
      isDemo: review.isDemo,
      createdAt: review.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Reviews are not available.", 503);
  const body = z.object({ id: z.string(), status: z.enum(["PENDING", "APPROVED", "REJECTED"]) }).safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "That review update was not accepted.");
  await prisma.review.update({ where: { id: body.data.id }, data: { status: body.data.status } });
  await prisma.reviewMedia.updateMany({ where: { reviewId: body.data.id }, data: { status: body.data.status } });
  return ok({ updated: true });
}
