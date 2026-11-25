import { api } from "./api";

export const adminFineApi = {

    getFines(status = "ALL") {

        const query = status === "ALL"
            ? ""
            : `?status=${encodeURIComponent(status)}`;

        return api(`/admin/fines${query}`);

    },

    getSummary() {

        return api("/admin/fines/summary");

    },

    markAsPaid(fineId) {

        return api(
            `/admin/fines/${fineId}/pay`,
            "PATCH"
        );

    },

    waiveFine(fineId, reason) {

        return api(
            `/admin/fines/${fineId}/waive`,
            "PATCH",
            { reason }
        );

    },

    estimateFine(loanId, condition = "GOOD") {

        return api(
            `/admin/fines/estimate/${loanId}?condition=${encodeURIComponent(condition)}`
        );

    },

};

export function formatFineMoney(amount) {

    if (amount == null) return "—";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(Number(amount));

}

export function formatFineDate(value) {

    if (!value) return "—";

    let input = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {

        input += "T00:00:00+05:30";

    }

    const date = new Date(input);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });

}