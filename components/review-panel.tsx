"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  formatReviewAverage,
  type PublicReview,
  type ReviewFilter,
  type ReviewList,
  type ReviewSort,
  type ReviewSummary,
} from "@/lib/review-types";

const sorts: Array<{ id: ReviewSort; label: string }> = [
  { id: "recent", label: "Recent" },
  { id: "highest", label: "Highest" },
  { id: "lowest", label: "Lowest" },
  { id: "helpful", label: "Helpful" },
];

const filters: Array<{ id: ReviewFilter; label: string; name: string }> = [
  { id: "all", label: "All", name: "All reviews" },
  { id: "5", label: "5", name: "5 star reviews" },
  { id: "4", label: "4", name: "4 star reviews" },
  { id: "3", label: "3", name: "3 star reviews" },
  { id: "2", label: "2", name: "2 star reviews" },
  { id: "1", label: "1", name: "1 star reviews" },
];

function Stars({ rating, large = false }: { rating: number; large?: boolean }) {
  return (
    <span className={large ? "journal-stars is-large" : "journal-stars"} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span key={value} className={value <= rating ? "is-on" : undefined}>
          ★
        </span>
      ))}
    </span>
  );
}

function shortName(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return `${parts[0]?.charAt(0) || ""}${parts[1]?.charAt(0) || ""}`.toUpperCase();
}

export function ReviewBrowser({ productId, initialSummary }: { productId: string; initialSummary: ReviewSummary | null }) {
  const [summary, setSummary] = useState(initialSummary);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [page, setPage] = useState(1);
  const [matchCount, setMatchCount] = useState(initialSummary?.total ?? 0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const currentSort = sorts.find((item) => item.id === sort) ?? sorts[0];

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ productId, filter, sort, page: String(page) });
    fetch(`/api/reviews?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as { success?: boolean; data?: ReviewList };
        if (!response.ok || !payload.success || !payload.data) throw new Error("Reviews could not be loaded.");
        const data = payload.data;
        setSummary(data.summary);
        setMatchCount(data.matchCount);
        setPageCount(data.pageCount);
        setReviews((current) => {
          if (page === 1) return data.reviews;
          const seen = new Set(current.map((review) => review.id));
          return [...current, ...data.reviews.filter((review) => !seen.has(review.id))];
        });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("Reviews could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [productId, filter, sort, page]);

  useEffect(() => {
    if (!sortOpen) return;
    function onPointer(event: PointerEvent) {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  function chooseFilter(next: ReviewFilter) {
    setFilter(next);
    setPage(1);
  }

  const shown = summary;

  return (
    <div className="journal">
      <header className="journal-hero">
        {shown && shown.total > 0 && shown.average != null ? (
          <div className="journal-score">
            <div className="journal-score__top">
              <h2 id="reviews-title">Review</h2>
              <p>{formatReviewAverage(shown.average)}</p>
            </div>
            <div className="journal-score__meta">
              <Stars rating={Math.round(shown.average)} />
              <span>
                {shown.total.toLocaleString("en-US")} {shown.total === 1 ? "review" : "reviews"}
              </span>
            </div>
            <ol className="journal-dist">
              {([5, 4, 3, 2, 1] as const).map((rating) => (
                <li key={rating}>
                  <span>{rating}</span>
                  <i>
                    <b style={{ width: `${shown.total ? (shown.counts[rating] / shown.total) * 100 : 0}%` }} />
                  </i>
                  <span>{shown.counts[rating].toLocaleString("en-US")}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <h2 id="reviews-title" className="journal-sr">
            Review
          </h2>
        )}
      </header>

      <div className="journal-bar">
        <div className="journal-filters" role="toolbar" aria-label="Filter reviews">
          {filters.map((item) => (
            <button key={item.id} type="button" aria-pressed={filter === item.id} aria-label={item.name} onClick={() => chooseFilter(item.id)}>
              {item.id === "all" ? item.label : <><b>{item.label}</b><span aria-hidden="true">★</span></>}
            </button>
          ))}
        </div>
        <div className={`journal-sort${sortOpen ? " is-open" : ""}`} ref={sortRef}>
          <button type="button" className="journal-sort__btn" aria-haspopup="listbox" aria-expanded={sortOpen} onClick={() => setSortOpen((value) => !value)}>
            {currentSort.label}
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          {sortOpen ? (
            <ul className="journal-sort__menu" role="listbox" aria-label="Sort reviews">
              {sorts.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === item.id}
                    onClick={() => {
                      setSort(item.id);
                      setPage(1);
                      setSortOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {error ? <p role="alert">{error}</p> : null}
      <div className="journal-grid" aria-busy={loading}>
        {reviews.map((review, index) => {
          const featured = review.rating >= 4 && review.comment.length > 140 && index % 12 === 4;
          const expanded = Boolean(open[review.id]);
          const long = review.comment.length > 180;
          const marked = Boolean(helpful[review.id]);
          return (
            <article key={review.id} className={featured ? "journal-card is-featured" : "journal-card"}>
              <div>
                <Stars rating={review.rating} />
                {featured ? <blockquote>{review.comment}</blockquote> : review.title ? <h3>{review.title}</h3> : null}
                {featured ? null : (
                  <p className={expanded || !long ? undefined : "is-clamped"}>
                    {review.comment}
                  </p>
                )}
                {long && !featured ? (
                  <button type="button" className="journal-more" onClick={() => setOpen((current) => ({ ...current, [review.id]: !current[review.id] }))}>
                    {expanded ? "Show less" : "Read more"}
                  </button>
                ) : null}
                <footer>
                  <span className="journal-avatar" aria-hidden="true">
                    {initials(review.name)}
                  </span>
                  <span>
                    <strong>{shortName(review.name)}</strong>
                    {review.verifiedPurchase && !review.isDemo ? <em>Verified purchase</em> : null}
                  </span>
                  <time dateTime={review.reviewDate}>
                    {new Date(review.reviewDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </time>
                  <button
                    type="button"
                    className="journal-help"
                    aria-pressed={marked}
                    onClick={() => setHelpful((current) => ({ ...current, [review.id]: !current[review.id] }))}
                  >
                    {marked ? "♥" : "♡"} Helpful {review.helpfulCount + (marked ? 1 : 0)}
                  </button>
                </footer>
              </div>
            </article>
          );
        })}
      </div>
      <div className="journal-foot">
        <p>
          Showing {reviews.length.toLocaleString("en-US")} of {matchCount.toLocaleString("en-US")} reviews
        </p>
        {page < pageCount ? (
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={loading}>
            {loading ? "Loading" : "Load more"}
          </button>
        ) : null}
      </div>
      <aside className="journal-write">
        <h3>Have your own Rouge story?</h3>
        <p>Share your experience with Rouge Sur Mesure from a paid order.</p>
        <Link href="/account/orders">Write a review</Link>
      </aside>
    </div>
  );
}
