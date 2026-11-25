import { api } from "./api";

export const adminReservationApi = {

    getReservations() {
        return api("/admin/reservations");
    },

    cancelReservation(id) {
        return api(
            `/admin/reservations/${id}`,
            "DELETE"
        );
    },

};

export function formatReservationDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
    });

}

export function getExpiryTime(value) {

    if (!value) return "—";

    const expiry = new Date(value).getTime();

    if (!Number.isFinite(expiry)) {
        return "—";
    }

    const remaining = expiry - Date.now();

    if (remaining <= 0) {
        return "Expiry reached";
    }

    const minutes = Math.floor(
        remaining / 60000
    );

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h remaining`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m remaining`;
    }

    return `${minutes}m remaining`;

}