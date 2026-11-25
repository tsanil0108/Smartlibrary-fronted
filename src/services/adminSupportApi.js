import { api } from "./api";

const BASE = "/admin/support/tickets";

export const adminSupportApi = {

    getTickets(page = 0, size = 15) {
        return api(`${BASE}?page=${page}&size=${size}`);
    },

    getTicket(ticketId) {
        return api(`${BASE}/${ticketId}`);
    },

    getSummary() {
        return api("/admin/support/summary");
    },

    getReplies(ticketId) {
        return api(`${BASE}/${ticketId}/replies`);
    },

    sendReply(ticketId, message) {
        return api(
            `${BASE}/${ticketId}/replies`,
            "POST",
            { message: message.trim() }
        );
    },

    updateStatus(ticketId, status) {
        return api(
            `${BASE}/${ticketId}/status`,
            "PATCH",
            { status }
        );
    },

    updatePriority(ticketId, priority) {
        return api(
            `${BASE}/${ticketId}/priority`,
            "PATCH",
            { priority }
        );
    },

};

export function getTicketRows(response) {
    return Array.isArray(response)
        ? response
        : response?.content || [];
}

export function formatSupportDate(value) {

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