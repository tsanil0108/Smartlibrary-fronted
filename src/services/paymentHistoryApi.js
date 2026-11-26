import { api } from "./api";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "/api/v1"
).replace(/\/+$/, "");

// ==========================================
// PAYMENT HISTORY API
// ==========================================

export const paymentHistoryApi = {

  getPayments() {
    return api("/payments/me");
  },

  getReceiptDetails(paymentId) {

    return api(
      `/payments/${encodeURIComponent(paymentId)}/receipt/details`
    );
  },

  async downloadReceipt(paymentId) {

    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("Please sign in again.");
    }

    const response = await fetch(

      `${BASE_URL}/payments/${encodeURIComponent(paymentId)}/receipt`,

      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },

        cache: "no-store",
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

    if (!blob.size) {
      throw new Error("Receipt file is empty.");
    }

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `SLM-RCP-${String(paymentId).padStart(8, "0")}.pdf`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  },
};

// ==========================================
// PAYMENT STATUS
// ==========================================

export function getPaymentStatus(payment) {

  return String(
    payment?.status || "UNVERIFIED"
  ).toUpperCase();
}

// ==========================================
// TRANSACTION ID
// ==========================================

export function getTransactionId(payment) {

  return (
    payment?.transactionId ||
    payment?.razorpayPaymentId ||
    "—"
  );
}

// ==========================================
// PAYMENT METHOD
// ==========================================

export function getPaymentMethod(payment) {

  const method = String(
    payment?.paymentMethod ||
    payment?.storedPaymentMethod ||
    ""
  ).toUpperCase();

  const labels = {

    UPI: "UPI",

    CARD: "Credit / Debit Card",

    NETBANKING: "Net Banking",

    WALLET: "Wallet",

    COUPON: "Coupon Redemption",

    DEMO_COUPON: "Coupon Redemption",

    RAZORPAY: "Razorpay",

    EMI: "EMI",

    PAYLATER: "Pay Later",
  };

  return labels[method] || method || "Unknown";
}

// ==========================================
// RECEIPT AVAILABILITY
// ==========================================

export function canDownloadReceipt(payment) {

  return (
    getPaymentStatus(payment) === "SUCCESS" &&
    payment?.successfulPayment === true
  );
}

// ==========================================
// CURRENCY
// ==========================================

export function formatMoney(paise = 0) {

  const value = Number(paise);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    minimumFractionDigits: 2,

  }).format(value / 100);
}

// ==========================================
// DATE
// ==========================================

export function formatPaymentDate(value) {

  if (!value) return "—";

  const normalized =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00+05:30`
      : value;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

    timeZone: "Asia/Kolkata",

  }).format(date);
}