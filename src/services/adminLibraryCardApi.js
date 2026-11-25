import { api } from "./api";

export const adminLibraryCardApi = {

    verifyQrCode(qrCode) {

        return api(
            "/admin/library-cards/verify",
            "POST",
            { qrCode: qrCode.trim() }
        );

    },

    verifyCardNumber(cardNumber) {

        return api(
            `/admin/library-cards/verify/${encodeURIComponent(
                cardNumber.trim().toUpperCase()
            )}`
        );

    },

    updateCardStatus(userId, active) {

        return api(
            `/admin/library-cards/${userId}/status`,
            "PATCH",
            { active }
        );

    },

};

export function formatCardDate(value) {

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

export function getCardStatusLabel(status) {

    const labels = {

        ACTIVE: "Active",

        DISABLED: "Disabled",

        INVALID_MEMBER: "Invalid member",

        SUSPENDED: "Suspended member",

        NO_MEMBERSHIP: "No membership",

        MEMBERSHIP_INACTIVE: "Inactive membership",

    };

    return labels[status] || status || "Unknown";

}