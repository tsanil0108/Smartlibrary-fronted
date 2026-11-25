import { api } from "./api";

// ==========================================
// BOOK API SERVICE
// ==========================================

export const bookApi = {

  // GET ALL BOOKS

  getBooks({
    page = 0,
    size = 12,
    q = "",
    category = "",
    onlyAvailable = false,
  } = {}) {

    const params = new URLSearchParams();

    params.set("page", page);
    params.set("size", size);

    if (q.trim()) {
      params.set("q", q.trim());
    }

    if (category) {
      params.set("category", category);
    }

    if (onlyAvailable) {
      params.set("onlyAvailable", "true");
    }

    return api(`/books?${params.toString()}`);
  },

  // GET BOOK DETAILS

  getBook(bookId) {
    return api(`/books/${bookId}`);
  },

  // GET ALL CATEGORIES

  getCategories() {
    return api("/categories");
  },

  // RESERVE BOOK

  reserveBook(bookId) {
    return api(
      `/member/reservations/${bookId}`,
      "POST"
    );
  },

  // BORROW BOOK

  borrowBook(bookId) {
    return api("/loans", "POST", {
      bookId,
    });
  },

};