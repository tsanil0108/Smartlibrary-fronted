import { api } from "./api";

function normalizeCode(code) {
  return String(code ?? "").trim().toUpperCase() || null;
}

export const membershipApi = {

  getDashboard() {
    return api("/member/dashboard");
  },

  getQuote(code = null) {
    return api("/payments/checkout/quote", "POST", {
      code: normalizeCode(code),
    });
  },

  applyCoupon(code) {
    return api("/payments/checkout/quote", "POST", {
      code: normalizeCode(code),
    });
  },

  createOrder(code = null) {
    return api("/payments/create-order", "POST", {
      code: normalizeCode(code),
    });
  },

  verifyPayment(payload) {
    return api("/payments/verify", "POST", payload);
  },

  redeemCoupon(code) {
    return api("/payments/redeem", "POST", {
      code: normalizeCode(code),
    });
  },

  activateMembership(code) {
    return api("/payments/redeem", "POST", {
      code: normalizeCode(code),
    });
  },

  getOrder(orderId) {
    return api(`/payments/orders/${orderId}`);
  },

  getPaymentHistory() {
    return api("/payments/me");
  },

};

export function formatCurrency(amount) {

  if (amount == null) return "—";

  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);

}

export function formatMembershipDate(value) {

  if (!value) return "—";

  const normalized =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00+05:30`
      : value;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);

}