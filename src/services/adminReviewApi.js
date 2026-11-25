import { api } from "./api";

export const adminReviewApi = {

    getReviews(page = 0, size = 20) {
        return api(
            `/admin/reviews?page=${page}&size=${size}`
        );
    },

    updateStatus(reviewId, status, reason = "") {
        return api(
            `/admin/reviews/${reviewId}/status`,
            "PATCH",
            {
                status,
                reason: reason.trim(),
            }
        );
    },

    deleteReview(reviewId) {
        return api(
            `/admin/reviews/${reviewId}`,
            "DELETE"
        );
    },

};

export function formatReviewDate(value) {

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

export function getReviewRows(response) {

    if (Array.isArray(response)) {
        return response;
    }

    return response?.content || [];
}