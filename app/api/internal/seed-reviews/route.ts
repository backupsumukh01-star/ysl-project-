import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildDemoReviews } from "../../../../prisma/demo-reviews.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const expected = process.env.REVIEW_SEED_TOKEN || "";
  const header = request.headers.get("authorization") || "";
  if (!expected || header !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const prisma = db();
  if (!prisma) return NextResponse.json({ ok: false }, { status: 503 });
  const product = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" }, select: { id: true } });
  if (!product) return NextResponse.json({ ok: false }, { status: 404 });

  const reviews = buildDemoReviews();
  for (let index = 0; index < reviews.length; index += 200) {
    const slice = reviews.slice(index, index + 200);
    await prisma.review.createMany({
      data: slice.map((review) => ({
        id: review.id,
        productId: product.id,
        reviewerName: review.reviewerName,
        rating: review.rating,
        title: review.title,
        comment: review.body,
        imageUrl: "",
        status: "APPROVED",
        isDemo: true,
        verifiedPurchase: false,
        helpfulCount: review.helpfulCount,
        cartridgeFamily: review.cartridgeFamily,
        reviewDate: new Date(review.reviewDate),
        createdAt: new Date(review.reviewDate),
      })),
      skipDuplicates: true,
    });
  }

  const media = reviews.flatMap((review) =>
    review.media.map((item) => ({
      id: item.id,
      reviewId: review.id,
      type: item.type,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      caption: item.caption,
      status: item.status,
      createdAt: new Date(item.createdAt),
    })),
  );
  if (media.length) {
    await prisma.reviewMedia.createMany({ data: media, skipDuplicates: true });
  }

  const count = await prisma.review.count({ where: { productId: product.id, isDemo: true, status: "APPROVED" } });
  return NextResponse.json({ ok: true, count });
}
