import { api } from "./api";

// ==========================================
// MEMBER DASHBOARD API
// ==========================================

export const dashboardApi = {

  // GET COMPLETE DASHBOARD

  getDashboard() {
    return api("/member/dashboard");
  },

  // GET DIGITAL LIBRARY CARD

  getLibraryCard() {
    return api("/member/library-card");
  },

  // GET READING STATISTICS

  getReadingStats() {
    return api("/member/analytics/stats");
  },

  // GET MONTHLY READING ACTIVITY

  getMonthlyActivity(months = 6) {
    return api(
      `/member/analytics/monthly?months=${months}`
    );
  },

  // GET RECOMMENDED BOOKS

  getRecommendations() {
    return api("/member/analytics/recommendations");
  },

  // GET UPCOMING RETURNS

  getUpcomingReturns() {
    return api("/member/analytics/upcoming");
  },

  // GET RECENT ACTIVITY

  getRecentActivity() {
    return api("/member/analytics/recent");
  },

};

// ==========================================
// DATE FORMATTER
// ==========================================

export function formatDashboardDate(value) {

  if (!value) return "—";

  const normalized =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00+05:30`
      : value;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);

}

// ==========================================
// CURRENCY FORMATTER
// Amount in rupees
// ==========================================

export function formatDashboardMoney(amount) {

  if (amount == null) return "—";

  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

}