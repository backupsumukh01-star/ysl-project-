export type ReviewFilter = "all" | "5" | "4" | "3" | "2" | "1" | "photos" | "videos";
export type ReviewSort = "recent" | "highest" | "lowest" | "helpful";

export type PublicReviewMedia = {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl: string;
  caption: string;
  placeholder: boolean;
};

export type PublicReview = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  name: string;
  reviewDate: string;
  isDemo: boolean;
  verifiedPurchase: boolean;
  helpfulCount: number;
  cartridgeFamily: string;
  media: PublicReviewMedia[];
};

export type ReviewTheme = {
  label: string;
  count: number;
  share: number;
};

export type ReviewFamilyStat = {
  name: string;
  count: number;
};

export type ReviewHighlight = {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  cartridgeFamily: string;
  isDemo: boolean;
  verifiedPurchase: boolean;
  media: PublicReviewMedia;
};

export type ReviewSummary = {
  total: number;
  average: number | null;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  withMedia: number;
  withPhotos: number;
  withVideos: number;
  includesSampleData: boolean;
  sampleOnly: boolean;
  themes: ReviewTheme[];
  families: ReviewFamilyStat[];
  highlights: ReviewHighlight[];
};

export type ReviewList = {
  summary: ReviewSummary;
  reviews: PublicReview[];
  page: number;
  pageSize: number;
  pageCount: number;
  matchCount: number;
  filter: ReviewFilter;
  sort: ReviewSort;
  family: string;
};

export const REVIEW_PAGE_SIZE = 12;

export const REVIEW_FAMILIES = ["Red", "Pink", "Orange", "Nude", "Warm Red", "Warm Nude", "Cool Nude"] as const;

export function formatReviewAverage(average: number) {
  return (Math.round(average * 10) / 10).toFixed(1);
}
