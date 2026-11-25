import { api } from "./api";

export const reservationApi = {
  getMyReservations: () =>
    api("/member/reservations"),

  reserveBook: (bookId) =>
    api(`/member/reservations/${bookId}`, "POST"),

  cancelReservation: (reservationId) =>
    api(
      `/member/reservations/${reservationId}`,
      "DELETE"
    ),
};