import { api } from "./api";

const BASE_URL =
  import.meta.env.VITE_API_URL || "/api/v1";

export const paymentHistoryApi = {
  getPayments: () => api("/payments/me"),

  getReceiptDetails: (paymentId) =>
    api(`/payments/${paymentId}/receipt/details`),

  downloadReceipt: async (paymentId) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("Please sign in again.");
    }

    const response = await fetch(
      `${BASE_URL}/payments/${paymentId}/receipt`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      }
    );

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => null);

      throw new Error(
        data?.message ||
          `Receipt download failed (${response.status})`
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/pdf")) {
      throw new Error("Invalid PDF response.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `SLM-Receipt-${paymentId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  },
};

export function formatMoney(paise = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(paise) / 100);
}

export function formatPaymentDate(date) {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}