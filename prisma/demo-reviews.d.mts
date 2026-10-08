export type DemoReview = {
  id: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  reviewDate: string;
  cartridgeFamily: string;
  helpfulCount: number;
  media: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl: string;
    caption: string;
    status: string;
    createdAt: string;
  }>;
};

export function buildDemoReviews(): DemoReview[];
