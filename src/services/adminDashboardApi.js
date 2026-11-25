import { api } from "./api";

// ==========================================
// RESPONSE HELPERS
// ==========================================

function getRows(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.content || [];
}

function getCount(data) {
  if (data == null) return null;

  if (Array.isArray(data)) {
    return data.length;
  }

  return (
    data.totalElements ??
    data.total ??
    getRows(data).length
  );
}

// ==========================================
// ADMIN DASHBOARD API
// ==========================================

async function getDashboard() {

  const requests = [
    {
      key: "books",
      path: "/books?page=0&size=1",
    },
    {
      key: "members",
      path: "/admin/users?page=0&size=1",
    },
    {
      key: "activeLoans",
      path: "/loans?status=ACTIVE&page=0&size=1",
    },
    {
      key: "recentLoans",
      path: "/loans?page=0&size=6&sort=id,desc",
    },
    {
      key: "reservations",
      path: "/admin/reservations",
    },
    {
      key: "fines",
      path: "/admin/fines/summary",
    },
    {
      key: "support",
      path: "/admin/support/summary",
    },
  ];

  const results = await Promise.allSettled(
    requests.map((request) => api(request.path))
  );

  const data = {};
  const errors = [];

  results.forEach((result, index) => {

    const key = requests[index].key;

    if (result.status === "fulfilled") {

      data[key] = result.value;

    } else {

      data[key] = null;

      errors.push(
        `${key}: ${
          result.reason?.message || "Unable to load data"
        }`
      );

    }

  });

  return {

    totalBooks: getCount(data.books),

    totalMembers: getCount(data.members),

    activeLoans: getCount(data.activeLoans),

    recentLoans: getRows(data.recentLoans),

    reservations: getRows(data.reservations),

    fines: data.fines || {},

    support: data.support || {},

    errors,

  };
}

export const adminDashboardApi = {

  getDashboard,

  getOverview: getDashboard,

  getDashboardData: getDashboard,

};

// ==========================================
// CURRENCY FORMATTER
// ==========================================

export function formatAdminMoney(amount) {

  if (amount == null) return "—";

  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

}

// ==========================================
// DATE FORMATTER
// ==========================================

export function formatAdminDate(value) {

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