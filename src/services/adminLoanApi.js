import { api } from "./api";

export const adminLoanApi = {

    getLoans({ page = 0, size = 10 } = {}) {

        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
        });

        return api(`/loans?${params}`);
    },

    renewLoan(id) {
        return api(`/loans/${id}/renew`, "POST");
    },

    returnLoan(id, condition = "GOOD") {
        return api(`/loans/${id}/return`, "POST", {
            condition,
        });
    },

    estimateFine(id, condition = "GOOD") {
        return api(
            `/admin/fines/estimate/${id}?condition=${encodeURIComponent(condition)}`
        );
    },

};

export function formatLoanDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

export function formatFine(amount = 0) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(Number(amount || 0));

}

export function getDaysRemaining(dueDate) {

    if (!dueDate) return null;

    const today = new Date()
        .toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
        });

    const due = String(dueDate).slice(0, 10);

    const difference =
        Date.parse(due) - Date.parse(today);

    return Number.isFinite(difference)
        ? Math.round(difference / 86400000)
        : null;

}

export function isOverdue(loan) {

    const days = getDaysRemaining(loan.dueDate);

    return loan.status === "ACTIVE" &&
        days !== null &&
        days < 0;

}