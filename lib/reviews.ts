import { db } from "@/lib/db";
import {
  REVIEW_FAMILIES,
  REVIEW_PAGE_SIZE,
  type PublicReview,
  type ReviewFamilyStat,
  type ReviewFilter,
  type ReviewHighlight,
  type ReviewList,
  type ReviewSort,
  type ReviewSummary,
  type ReviewTheme,
} from "@/lib/review-types";

const filters = new Set<ReviewFilter>(["all", "5", "4", "3", "2", "1", "photos", "videos"]);
const sorts = new Set<ReviewSort>(["recent", "highest", "lowest", "helpful"]);

const themeRules: Array<{ label: string; pattern: RegExp }> = [
  { label: "Custom color", pattern: /\b(custom|shade|mix(?:ing|ed)?)\b/i },
  { label: "Premium design", pattern: /\b(case|lid|gold|monogram|brush)\b/i },
  { label: "Easy to personalize", pattern: /\b(app|experiment|saved|routine|practice)\b/i },
  { label: "Color variety", pattern: /\b(famil(?:y|ies)|trio|combination)\b/i },
  { label: "Gift-worthy", pattern: /\bgift\b/i },
];

const emptySummary = (): ReviewSummary => ({
  total: 0,
  average: null,
  counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  withMedia: 0,
  withPhotos: 0,
  withVideos: 0,
  includesSampleData: false,
  sampleOnly: false,
  themes: [],
  families: REVIEW_FAMILIES.map((name) => ({ name, count: 0 })),
  highlights: [],
});

function themesFrom(rows: Array<{ title: string; comment: string }>, total: number): ReviewTheme[] {
  if (!total) return [];
  return themeRules
    .map((theme) => {
      const count = rows.filter((row) => theme.pattern.test(`${row.title} ${row.comment}`)).length;
      return { label: theme.label, count, share: Math.round((count / total) * 100) };
    })
    .filter((theme) => theme.count > 0)
    .sort((a, b) => b.count - a.count);
}

function familiesFrom(rows: Array<{ cartridgeFamily: string }>): ReviewFamilyStat[] {
  return REVIEW_FAMILIES.map((name) => ({
    name,
    count: rows.filter((row) => row.cartridgeFamily === name).length,
  }));
}

export function parseReviewFilter(value: string | null): ReviewFilter {
  return value && filters.has(value as ReviewFilter) ? (value as ReviewFilter) : "all";
}

export function parseReviewSort(value: string | null): ReviewSort {
  return value && sorts.has(value as ReviewSort) ? (value as ReviewSort) : "recent";
}

export function parseReviewFamily(value: string | null) {
  return value && (REVIEW_FAMILIES as readonly string[]).includes(value) ? value : "";
}

function listWhere(productId: string, filter: ReviewFilter, family: string) {
  const where: {
    productId: string;
    status: string;
    rating?: number;
    cartridgeFamily?: string;
    media?: { some: { status: string; type?: string } };
  } = { productId, status: "APPROVED" };
  if (family) where.cartridgeFamily = family;
  if (filter === "photos") where.media = { some: { status: "APPROVED", type: "photo" } };
  else if (filter === "videos") where.media = { some: { status: "APPROVED", type: "video" } };
  else if (filter !== "all") where.rating = Number(filter);
  return where;
}

function orderBy(sort: ReviewSort) {
  if (sort === "highest") return [{ rating: "desc" as const }, { reviewDate: "desc" as const }];
  if (sort === "lowest") return [{ rating: "asc" as const }, { reviewDate: "desc" as const }];
  if (sort === "helpful") return [{ helpfulCount: "desc" as const }, { reviewDate: "desc" as const }];
  return [{ reviewDate: "desc" as const }];
}

export async function reviewSummary(productId: string): Promise<ReviewSummary> {
  const prisma = db();
  if (!prisma || !productId) return emptySummary();
  try {
    const where = { productId, status: "APPROVED" };
    const [grouped, aggregate, withMedia, withPhotos, withVideos, sampleCount, texts, highlightRows] = await Promise.all([
      prisma.review.groupBy({ by: ["rating"], where, _count: { _all: true } }),
      prisma.review.aggregate({ where, _sum: { rating: true }, _count: { _all: true } }),
      prisma.review.count({ where: { ...where, media: { some: { status: "APPROVED" } } } }),
      prisma.review.count({ where: { ...where, media: { some: { status: "APPROVED", type: "photo" } } } }),
      prisma.review.count({ where: { ...where, media: { some: { status: "APPROVED", type: "video" } } } }),
      prisma.review.count({ where: { ...where, isDemo: true } }),
      prisma.review.findMany({ where, select: { title: true, comment: true, cartridgeFamily: true } }),
      prisma.review.findMany({
        where: { ...where, media: { some: { status: "APPROVED" } } },
        orderBy: { reviewDate: "desc" },
        take: 6,
        include: { media: { where: { status: "APPROVED" }, orderBy: { createdAt: "asc" }, take: 1 } },
      }),
    ]);
    const counts: ReviewSummary["counts"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of grouped) {
      if (row.rating >= 1 && row.rating <= 5) counts[row.rating as 1 | 2 | 3 | 4 | 5] = row._count._all;
    }
    const total = aggregate._count._all;
    const points = aggregate._sum.rating ?? 0;
    const highlights: ReviewHighlight[] = highlightRows.flatMap((review) => {
      const item = review.media[0];
      if (!item) return [];
      return [{
        id: review.id,
        name: review.reviewerName || "Reviewer",
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        cartridgeFamily: review.cartridgeFamily,
        isDemo: review.isDemo,
        verifiedPurchase: review.isDemo ? false : Boolean(review.verifiedPurchase && review.orderId),
        media: {
          id: item.id,
          type: item.type === "video" ? "video" : "photo",
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          caption: item.caption,
          placeholder: item.url.startsWith("/images/reviews/demo/"),
        },
      }];
    });
    return {
      total,
      average: total ? points / total : null,
      counts,
      withMedia,
      withPhotos,
      withVideos,
      includesSampleData: sampleCount > 0,
      sampleOnly: total > 0 && sampleCount === total,
      themes: themesFrom(texts, total),
      families: familiesFrom(texts),
      highlights,
    };
  } catch {
    return emptySummary();
  }
}

export async function listReviews(productId: string, filter: ReviewFilter, sort: ReviewSort, page: number, family = ""): Promise<ReviewList> {
  const summary = await reviewSummary(productId);
  const prisma = db();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const selectedFamily = parseReviewFamily(family);
  if (!prisma || !productId) {
    return { summary, reviews: [], page: 1, pageSize: REVIEW_PAGE_SIZE, pageCount: 0, matchCount: 0, filter, sort, family: selectedFamily };
  }
  try {
    const where = listWhere(productId, filter, selectedFamily);
    const filtered = await prisma.review.count({ where });
    const pageCount = filtered ? Math.ceil(filtered / REVIEW_PAGE_SIZE) : 0;
    const current = pageCount ? Math.min(safePage, pageCount) : 1;
    const rows = await prisma.review.findMany({
      where,
      orderBy: orderBy(sort),
      skip: (current - 1) * REVIEW_PAGE_SIZE,
      take: REVIEW_PAGE_SIZE,
      include: {
        user: { select: { name: true } },
        media: { where: { status: "APPROVED" }, orderBy: { createdAt: "asc" } },
      },
    });
    const reviews: PublicReview[] = rows.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      name: review.reviewerName || review.user?.name || "Reviewer",
      reviewDate: review.reviewDate.toISOString(),
      isDemo: review.isDemo,
      verifiedPurchase: review.isDemo ? false : Boolean(review.verifiedPurchase && review.orderId),
      helpfulCount: review.helpfulCount,
      cartridgeFamily: review.cartridgeFamily,
      media: review.media.map((item) => ({
        id: item.id,
        type: item.type === "video" ? "video" : "photo",
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        caption: item.caption,
        placeholder: item.url.startsWith("/images/reviews/demo/"),
      })),
    }));
    return { summary, reviews, page: current, pageSize: REVIEW_PAGE_SIZE, pageCount, matchCount: filtered, filter, sort, family: selectedFamily };
  } catch {
    return { summary, reviews: [], page: 1, pageSize: REVIEW_PAGE_SIZE, pageCount: 0, matchCount: 0, filter, sort, family: selectedFamily };
  }
}
