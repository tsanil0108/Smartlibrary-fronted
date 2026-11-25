import { api } from "./api";

export const analyticsApi = {
  getDashboard: () =>
    api("/member/dashboard"),

  getStats: () =>
    api("/member/analytics/stats"),

  getMonthlyActivity: (months = 6) =>
    api(`/member/analytics/monthly?months=${months}`),

  getCategories: () =>
    api("/member/analytics/categories"),

  getRecentActivity: () =>
    api("/member/analytics/recent"),

  getUpcomingReturns: () =>
    api("/member/analytics/upcoming"),

  getAccountSummary: () =>
    api("/member/analytics/account"),

  getRecommendations: () =>
    api("/member/analytics/recommendations"),
};

export function formatAnalyticsDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatAnalyticsMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value) || 0);
}

export function asAnalyticsList(value) {
  if (Array.isArray(value)) return value;

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  throw new Error("Invalid analytics list response.");
}