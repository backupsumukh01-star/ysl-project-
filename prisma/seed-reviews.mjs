import { PrismaClient } from "@prisma/client";
import { buildDemoReviews, printDemoReviewStats, summarizeDemoReviews } from "./demo-reviews.mjs";

const prisma = new PrismaClient();
const product = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
if (!product) {
  console.error("Rouge Sur Mesure is not in the catalog, so sample reviews were not seeded.");
  process.exit(1);
}

const reviews = buildDemoReviews();
console.log("generator");
printDemoReviewStats(summarizeDemoReviews(reviews));

for (let index = 0; index < reviews.length; index += 20) {
  const slice = reviews.slice(index, index + 20);
  await prisma.$transaction(
    slice.flatMap((review) => {
      const data = {
        productId: product.id,
        userId: null,
        orderId: null,
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
      };
      return [
        prisma.review.upsert({
          where: { id: review.id },
          create: { id: review.id, ...data },
          update: data,
        }),
        prisma.reviewMedia.deleteMany({ where: { reviewId: review.id } }),
        ...review.media.map((media) =>
          prisma.reviewMedia.create({
            data: {
              id: media.id,
              reviewId: review.id,
              type: media.type,
              url: media.url,
              thumbnailUrl: media.thumbnailUrl,
              caption: media.caption,
              status: media.status,
              createdAt: new Date(media.createdAt),
            },
          }),
        ),
      ];
    }),
    { timeout: 30000 },
  );
}

const stored = await prisma.review.findMany({
  where: { productId: product.id, isDemo: true },
  select: { id: true, rating: true, reviewDate: true, media: { select: { type: true } } },
});
console.log("database");
printDemoReviewStats(
  summarizeDemoReviews(
    stored.map((row) => ({
      rating: row.rating,
      reviewDate: row.reviewDate.toISOString(),
      media: row.media,
    })),
  ),
);
console.log(`demo rows in database: ${stored.length}`);
await prisma.$disconnect();
