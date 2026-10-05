import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { listReviews, parseReviewFamily, parseReviewFilter, parseReviewSort } from "@/lib/reviews";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(4).max(2000),
  imageUrl: z.string().trim().max(300).optional(),
});

function mediaTypeFor(imageUrl: string) {
  const lower = imageUrl.toLowerCase();
  if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov")) return "video";
  return "photo";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId") || "";
  const page = Number(url.searchParams.get("page") || "1");
  const data = await listReviews(
    productId,
    parseReviewFilter(url.searchParams.get("filter")),
    parseReviewSort(url.searchParams.get("sort")),
    page,
    parseReviewFamily(url.searchParams.get("family")),
  );
  return ok(data);
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to review a purchase.", 401);
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Reviews are not available.", 503);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the review and try again.");
  const imageUrl = parsed.data.imageUrl || "";
  if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("https://")) {
    return fail("VALIDATION", "Use a site image path or an https link.");
  }
  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: user.id, paymentStatus: "PAID" },
    include: { items: true },
  });
  if (!order || !order.items.some((item) => item.productId === parsed.data.productId)) {
    return fail("NOT_PURCHASED", "Reviews are limited to products you have purchased.", 403);
  }
  const settings = await getSettings();
  const status = settings.reviewsPublicWithoutModeration ? "APPROVED" : "PENDING";
  try {
    const review = await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        userId: user.id,
        orderId: order.id,
        rating: parsed.data.rating,
        title: parsed.data.title || "",
        comment: parsed.data.comment,
        imageUrl,
        status,
        reviewerName: user.name || "",
        isDemo: false,
        verifiedPurchase: true,
        reviewDate: new Date(),
        media: imageUrl
          ? {
              create: {
                type: mediaTypeFor(imageUrl),
                url: imageUrl,
                status,
              },
            }
          : undefined,
      },
    });
    return ok({ id: review.id, status: review.status });
  } catch {
    return fail("DUPLICATE_REVIEW", "A review for this purchase already exists.", 409);
  }
}
