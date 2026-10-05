import assert from "node:assert/strict";
import test from "node:test";
import { buildDemoReviews, summarizeDemoReviews } from "../prisma/demo-reviews.mjs";

const reviews = buildDemoReviews();
const stats = summarizeDemoReviews(reviews);

test("sample set is 1,200 reviews averaging 4.8", () => {
  assert.equal(stats.total, 1200);
  assert.equal(stats.points, 5760);
  assert.equal(stats.average, 4.8);
  assert.deepEqual(stats.counts, { 5: 1044, 4: 108, 3: 24, 2: 12, 1: 12 });
});

test("sample reviews are marked as demo and not verified purchases", () => {
  assert.equal(reviews.every((review) => review.isDemo === true && review.verifiedPurchase === false), true);
  assert.equal(new Set(reviews.map((review) => review.id)).size, 1200);
  assert.equal(new Set(reviews.map((review) => review.reviewerName)).size, 1200);
});

test("about 10 percent carry placeholder media and dates are spread out", () => {
  assert.equal(stats.withMedia, 120);
  assert.equal(stats.photos, 120);
  assert.equal(stats.videos, 24);
  assert.ok(stats.busiestDay < 20);
  assert.ok(stats.firstDay <= "2022-10-04");
  assert.ok(stats.lastDay >= "2026-10-04");
  assert.ok(stats.lastDay > stats.firstDay);
  assert.equal(reviews.some((review) => review.media.some((item) => item.url.startsWith("/images/reviews/demo/"))), true);
});

test("copy stays specific and does not use the stock phrases", () => {
  const blob = reviews.map((review) => `${review.title} ${review.body}`).join("\n");
  assert.equal(/game changer|obsessed|absolutely amazing|must have|highly recommend/i.test(blob), false);
  assert.equal(new Set(reviews.map((review) => review.title)).size, 1200);
  assert.equal(new Set(reviews.map((review) => review.body)).size, 1200);
});
