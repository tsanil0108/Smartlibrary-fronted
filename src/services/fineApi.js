import { api } from "./api";

export const fineApi = {
  getMyFines: () =>
    api("/member/fines"),

  getSummary: () =>
    api("/member/fines/summary"),

  estimateFine: (loanId) =>
    api(`/member/fines/estimate/${loanId}`),
};

export function formatFineAmount(amount) {
  const value = Number(amount ?? 0);

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

export function formatFineDate(value) {
  if (!value) return "—";

  const date = new Date(value);

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

export function getFineType(type) {
  const types = {
    OVERDUE: "Overdue charge",
    DAMAGED: "Damaged book",
    LOST: "Lost book",
  };

  return types[type] || type || "Library fine";
}

export function getFineStatus(status) {
  const statuses = {
    PENDING: "Pending",
    PAID: "Paid",
    WAIVED: "Waived",
  };

  return statuses[status] || status || "Unknown";
}