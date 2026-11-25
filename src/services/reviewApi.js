import { api } from "./api";

export const reviewApi = {
  getMyReviews: () =>
    api("/member/reviews"),

  getBookReviews: (bookId) =>
    api(`/books/${bookId}/reviews`),

  getRatingSummary: (bookId) =>
    api(`/books/${bookId}/ratings`),

  getEligibility: (bookId) =>
    api(`/member/reviews/eligibility/${bookId}`),

  createReview: (bookId, data) =>
    api(`/member/reviews/${bookId}`, "POST", {
      rating: Number(data.rating),
      comment: data.comment.trim(),
    }),

  updateReview: (reviewId, data) =>
    api(`/member/reviews/${reviewId}`, "PUT", {
      rating: Number(data.rating),
      comment: data.comment.trim(),
    }),

  deleteReview: (reviewId) =>
    api(`/member/reviews/${reviewId}`, "DELETE"),
};

export function reviewList(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  throw new Error("Invalid review list response.");
}

export function formatReviewDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}