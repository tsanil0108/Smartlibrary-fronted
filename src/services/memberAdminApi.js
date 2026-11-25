import { api } from "./api";

export const memberAdminApi = {

    getMembers({ page = 0, size = 10, q = "" } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            sort: "name,asc",
        });

        if (q.trim()) {
            params.set("q", q.trim());
        }

        return api(`/admin/users?${params}`);
    },

    getMember(id) {
        return api(`/admin/users/${id}`);
    },

    updateStatus(id, status) {
        return api(
            `/admin/users/${id}/status`,
            "PATCH",
            { status }
        );
    },

    getMembershipHistory(id) {
        return api(`/admin/users/${id}/memberships`);
    },

    assignMembership(id, data) {
        return api(
            `/admin/users/${id}/membership`,
            "PUT",
            data
        );
    },

};

export function formatMemberDate(value) {
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

export function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("") || "U";
}