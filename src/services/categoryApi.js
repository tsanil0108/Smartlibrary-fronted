import { api } from "./api";

export const categoryApi = {

    getCategories() {
        return api("/categories");
    },

    createCategory(data) {
        return api("/admin/categories", "POST", data);
    },

    updateCategory(id, data) {
        return api(`/admin/categories/${id}`, "PUT", data);
    },

    deleteCategory(id) {
        return api(`/admin/categories/${id}`, "DELETE");
    },

};