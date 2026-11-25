import { api } from "./api";

export const membershipApi = {
  getDashboard: () => api("/member/dashboard"),

  applyCoupon: (code) =>
    api("/payments/quote", "POST", {
      code: code.trim(),
    }),

  activateMembership: (code) =>
    api("/payments/demo", "POST", {
      code: code.trim(),
    }),

  getPaymentHistory: () => api("/payments/me"),
};

export const formatCurrency = (paise = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(paise) / 100);

export const formatMembershipDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "—";

  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};