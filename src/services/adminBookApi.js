import { api } from "./api";

export const adminBookApi = {
    getBooks({
        page = 0,
        size = 10,
        q = "",
        category = "",
        status = "",
    } = {}) {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            sort: "title,asc",
        });

        if (q.trim()) params.set("q", q.trim());
        if (category) params.set("category", category);
        if (status) params.set("status", status);

        return api(`/books?${params.toString()}`);
    },

    getCategories() {
        return api("/categories");
    },

    createBook(data) {
        return api("/admin/books", "POST", data);
    },

    updateBook(id, data) {
        return api(`/admin/books/${id}`, "PUT", data);
    },

    archiveBook(id) {
        return api(`/admin/books/${id}`, "DELETE");
    },

    getCopies(bookId) {
        return api(`/admin/books/${bookId}/copies`);
    },

    addCopies(bookId, data) {
        return api(
            `/admin/books/${bookId}/copies`,
            "POST",
            data
        );
    },

    updateCopyStatus(copyId, status) {
        return api(
            `/admin/copies/${copyId}/status`,
            "PATCH",
            { status }
        );
    },
};