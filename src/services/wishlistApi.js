import { api } from "./api";

export const wishlistApi = {
  getWishlist: () =>
    api("/member/wishlist"),

  addBook: (bookId) =>
    api(`/member/wishlist/${bookId}`, "POST"),

  removeBook: (bookId) =>
    api(`/member/wishlist/${bookId}`, "DELETE"),

  getStatus: (bookId) =>
    api(`/member/wishlist/${bookId}/status`),

  getCount: () =>
    api("/member/wishlist/count"),
};