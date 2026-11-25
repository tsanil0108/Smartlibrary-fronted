import { api } from "./api";

const MEMBER = "/member/support";
const ADMIN = "/admin/support";

export const supportApi = {
  getTickets(page = 0, size = 10, admin = false) {
    const base = admin ? ADMIN : MEMBER;

    return api(
      `${base}/tickets?page=${page}&size=${size}`
    );
  },

  getSummary(admin = false) {
    return api(
      `${admin ? ADMIN : MEMBER}/summary`
    );
  },

  createTicket(data) {
    return api(
      `${MEMBER}/tickets`,
      "POST",
      data
    );
  },

  getTicket(ticketId, admin = false) {
    return api(
      `${admin ? ADMIN : MEMBER}/tickets/${ticketId}`
    );
  },

  getReplies(ticketId, admin = false) {
    return api(
      `${admin ? ADMIN : MEMBER}/tickets/${ticketId}/replies`
    );
  },

  sendReply(ticketId, message, admin = false) {
    return api(
      `${admin ? ADMIN : MEMBER}/tickets/${ticketId}/replies`,
      "POST",
      { message: message.trim() }
    );
  },

  closeTicket(ticketId) {
    return api(
      `${MEMBER}/tickets/${ticketId}/close`,
      "PATCH"
    );
  },

  reopenTicket(ticketId) {
    return api(
      `${MEMBER}/tickets/${ticketId}/reopen`,
      "PATCH"
    );
  },

  updateStatus(ticketId, status) {
    return api(
      `${ADMIN}/tickets/${ticketId}/status`,
      "PATCH",
      { status }
    );
  },

  updatePriority(ticketId, priority) {
    return api(
      `${ADMIN}/tickets/${ticketId}/priority`,
      "PATCH",
      { priority }
    );
  },
};

export const ticketCategories = [
  { value: "BOOK", label: "Book & Borrowing" },
  { value: "MEMBERSHIP", label: "Membership" },
  { value: "PAYMENT", label: "Payment" },
  { value: "FINE", label: "Fine & Charges" },
  { value: "RESERVATION", label: "Reservation" },
  { value: "LIBRARY_CARD", label: "Library Card" },
  { value: "TECHNICAL", label: "Technical Issue" },
  { value: "ACCOUNT", label: "My Account" },
  { value: "OTHER", label: "Other" },
];

export function formatTicketDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

export function ticketList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) {
    return data.content;
  }

  throw new Error("Invalid ticket response.");
}

export function categoryLabel(value) {
  return (
    ticketCategories.find(
      (item) => item.value === value
    )?.label || value || "Other"
  );
}