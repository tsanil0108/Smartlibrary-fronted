import { api } from "./api";

// Keep loan endpoints in one place.
// Match these paths with your LoanController.

const LOAN_PATH = "/loans";

export const loanApi = {
  getMyLoans: async () => {
    let page = 0;
    let records = [];

    while (true) {
      const response = await api(
        `${LOAN_PATH}?page=${page}&size=100`
      );

      if (Array.isArray(response)) {
        return response;
      }

      if (!Array.isArray(response?.content)) {
        throw new Error("Invalid loan response.");
      }

      records = [...records, ...response.content];

      if (
        response.last === true ||
        response.content.length < 100 ||
        (
          response.totalPages != null &&
          page + 1 >= response.totalPages
        )
      ) {
        return records;
      }

      page += 1;
    }
  },

  renewLoan: (loanId) =>
    api(`${LOAN_PATH}/${loanId}/renew`, "POST"),

  returnLoan: (loanId) =>
    api(`${LOAN_PATH}/${loanId}/return`, "POST", {
      condition: "GOOD",
    }),

  getFineEstimate: (loanId) =>
    api(`/member/fines/estimate/${loanId}`),
};

export function formatLoanDate(value) {
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

export function getDaysRemaining(dueDate) {
  if (!dueDate) return null;

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const due = Date.parse(
    String(dueDate).slice(0, 10) + "T00:00:00Z"
  );

  const current = Date.parse(
    today + "T00:00:00Z"
  );

  if (
    Number.isNaN(due) ||
    Number.isNaN(current)
  ) {
    return null;
  }

  return Math.round(
    (due - current) / 86400000
  );
}

export function formatFine(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));
}