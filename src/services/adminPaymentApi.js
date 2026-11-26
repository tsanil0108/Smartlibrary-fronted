import { api } from "./api";

const ROOT = "/admin/payments";

function pageQuery(page = 0, size = 10, status = "") {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });

    if (status) {
        params.set("status", status);
    }

    return params.toString();
}

export const adminPaymentApi = {

    getPayments() {
        return api(ROOT);
    },

    getSummary() {
        return api(`${ROOT}/summary`);
    },

    getOrders(page = 0, size = 10, status = "") {
        return api(
            `${ROOT}/orders?${pageQuery(page, size, status)}`
        );
    },

    getOrder(id) {
        return api(`${ROOT}/orders/${id}`);
    },

    reconcileOrder(id) {
        return api(
            `${ROOT}/orders/${id}/reconcile`,
            "POST"
        );
    },

    getRefunds(page = 0, size = 10, status = "") {
        return api(
            `${ROOT}/refunds?${pageQuery(page, size, status)}`
        );
    },

    getRefund(id) {
        return api(`${ROOT}/refunds/${id}`);
    },

    getRefundByPayment(paymentId) {
        return api(`${ROOT}/${paymentId}/refund`);
    },

    requestRefund(paymentId, reason) {
        return api(
            `${ROOT}/${paymentId}/refund`,
            "POST",
            { reason: reason.trim() }
        );
    },

    reconcileRefund(refundId) {
        return api(
            `${ROOT}/refunds/${refundId}/reconcile`,
            "POST"
        );
    },

    getReceiptDetails(id) {
        return api(`${ROOT}/${id}/receipt/details`);
    },

    async downloadReceipt(id) {

        const token = sessionStorage.getItem("token");

        if (!token) {
            throw new Error("Please login again.");
        }

        const baseUrl = (
            import.meta.env.VITE_API_URL || "/api/v1"
        ).replace(/\/+$/, "");

        const response = await fetch(
            `${baseUrl}${ROOT}/${id}/receipt`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/pdf",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Unable to download receipt.");
        }

        const type =
            response.headers.get("content-type") || "";

        if (!type.includes("application/pdf")) {
            throw new Error("Invalid PDF response.");
        }

        const blob = await response.blob();

        if (!blob.size) {
            throw new Error("Empty receipt file.");
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download =
            `SLM-RCP-${String(id).padStart(8, "0")}.pdf`;

        document.body.appendChild(link);

        link.click();
        link.remove();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    },
};

export function formatPaymentMoney(paise) {

    const amount = Number(paise);

    if (paise == null || !Number.isFinite(amount)) {
        return "—";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount / 100);
}

export function formatPaymentDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

export function getTransactionId(payment) {

    return payment?.transactionId ||
        payment?.razorpayPaymentId ||
        "—";
}

export function getPaymentStatus(payment) {

    return String(
        payment?.status ||
        payment?.paymentStatus ||
        "UNVERIFIED"
    ).toUpperCase();
}

export function getPaymentMethod(payment) {

    const method = String(
        payment?.paymentMethod ||
        payment?.storedPaymentMethod ||
        ""
    ).toUpperCase();

    const labels = {
        UPI: "UPI",
        CARD: "Card",
        NETBANKING: "Net Banking",
        WALLET: "Wallet",
        RAZORPAY: "Razorpay",
        COUPON: "Coupon",
        DEMO_COUPON: "Coupon",
    };

    return labels[method] || method || "—";
}

export function canRefund(payment) {

    return (
        getPaymentStatus(payment) === "SUCCESS" &&
        payment?.successfulPayment === true &&
        payment?.verifiedOnlinePayment === true &&
        Number(payment?.paidPaise) > 0 &&
        Boolean(payment?.razorpayPaymentId) &&
        Boolean(payment?.paymentOrderId)
    );
}

export function canDownloadReceipt(payment) {

    return (
        getPaymentStatus(payment) === "SUCCESS" &&
        payment?.successfulPayment === true
    );
}