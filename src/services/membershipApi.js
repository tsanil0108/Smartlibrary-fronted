import { api } from "./api";

// ==========================================
// MEMBERSHIP API
// ==========================================

export const membershipApi = {

  // GET MEMBER DASHBOARD

  getDashboard() {
    return api("/member/dashboard");
  },

  // APPLY COUPON

  applyCoupon(code) {
    return api(
      "/payments/quote",
      "POST",
      {
        code: String(code || "")
          .trim()
          .toUpperCase(),
      }
    );
  },

  // ACTIVATE MEMBERSHIP

  activateMembership(code) {
    return api(
      "/payments/demo",
      "POST",
      {
        code: String(code || "")
          .trim()
          .toUpperCase(),
      }
    );
  },

  // PAYMENT HISTORY

  getPaymentHistory() {
    return api("/payments/me");
  },

};

// ==========================================
// CURRENCY FORMATTER
// Backend amount: Paise
// ==========================================

export function formatCurrency(amount) {

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
  }).format(value / 100);

}

// ==========================================
// MEMBERSHIP DATE FORMATTER
// ==========================================

export function formatMembershipDate(value) {

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