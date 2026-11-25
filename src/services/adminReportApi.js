import { api } from "./api";

export function getRows(response) {
    return Array.isArray(response)
        ? response
        : response?.content || [];
}

export function getTotal(response) {
    if (Array.isArray(response)) {
        return response.length;
    }

    return response?.totalElements
        ?? response?.total
        ?? null;
}

// Load paginated records with a safety limit.
async function loadRecords(path) {

    const size = 100;
    const maxPages = 50;
    const separator = path.includes("?") ? "&" : "?";

    const first = await api(
        `${path}${separator}page=0&size=${size}`
    );

    if (Array.isArray(first)) {
        return {
            rows: first,
            total: first.length,
            complete: true,
        };
    }

    if (!Array.isArray(first?.content)) {
        throw new Error("Unexpected report response.");
    }

    const rows = [...first.content];

    const total = getTotal(first);

    const pages = first.totalPages
        ?? (total !== null
            ? Math.ceil(total / size)
            : 1);

    const limit = Math.min(pages, maxPages);

    for (let page = 1; page < limit; page++) {

        const response = await api(
            `${path}${separator}page=${page}&size=${size}`
        );

        if (!Array.isArray(response?.content)) {
            throw new Error("Invalid paginated response.");
        }

        rows.push(...response.content);
    }

    return {
        rows,
        total,
        complete: total !== null
            ? rows.length >= total
            : first.totalPages != null && pages <= maxPages,
    };
}

export const adminReportApi = {

    getBooks() {
        return api("/books?page=0&size=1");
    },

    getMembers() {
        return api("/admin/users?page=0&size=1");
    },

    getLoans() {
        return loadRecords("/loans");
    },

    getReservations() {
        return loadRecords("/admin/reservations");
    },

    getFineSummary() {
        return api("/admin/fines/summary");
    },

    getSupportSummary() {
        return api("/admin/support/summary");
    },

    async getReportData() {

        const requests = {
            books: this.getBooks(),
            members: this.getMembers(),
            loans: this.getLoans(),
            reservations: this.getReservations(),
            fines: this.getFineSummary(),
            support: this.getSupportSummary(),
        };

        const entries = Object.entries(requests);

        const results = await Promise.allSettled(
            entries.map(([, request]) => request)
        );

        const data = {};
        const errors = [];

        results.forEach((result, index) => {

            const key = entries[index][0];

            if (result.status === "fulfilled") {
                data[key] = result.value;
            } else {
                data[key] = null;

                errors.push({
                    section: key,
                    message: result.reason?.message
                        || "Unable to load data.",
                });
            }
        });

        return {
            ...data,
            errors,
        };
    },

};

export function formatReportMoney(value) {

    if (value == null) return "—";

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value));
}

export function dateKey(value = new Date()) {

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kolkata",
    }).formatToParts(date);

    const get = type =>
        parts.find(part => part.type === type)?.value;

    return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatReportDate(value) {

    if (!value) return "—";

    const key = dateKey(value);

    if (!key) return "—";

    return new Date(`${key}T12:00:00+05:30`)
        .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });
}

export function isOverdue(loan) {

    const dueDate = loan.dueDate
        ? dateKey(loan.dueDate)
        : "";

    return loan.status === "ACTIVE"
        && Boolean(dueDate)
        && dueDate < dateKey();
}

export function downloadReportCsv(filename, rows) {

    function escapeCell(value) {

        let text = String(value ?? "");

        // Prevent spreadsheet formula injection.
        if (/^[\s]*[=+\-@]/.test(text) ||
            /^[\t\r\n]/.test(text)) {
            text = "'" + text;
        }

        return `"${text.replaceAll('"', '""')}"`;
    }

    const csv = rows
        .map(row => row.map(escapeCell).join(","))
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF", csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}