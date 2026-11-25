import { api } from "./api";

export const adminPaymentApi = {

    getPayments() {
        return api("/admin/payments");
    },

    getReceiptDetails(id) {
        return api(
            `/admin/payments/${id}/receipt/details`
        );
    },

    async downloadReceipt(id) {

        const token = sessionStorage.getItem("token");

        const baseUrl =
            import.meta.env.VITE_API_URL || "/api/v1";

        const response = await fetch(
            `${baseUrl}/admin/payments/${id}/receipt`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
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

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `Library-Receipt-${id}.pdf`;

        document.body.appendChild(link);

        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

    },

};

export function formatPaymentMoney(paise) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(Number(paise || 0) / 100);

}

export function formatPaymentDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });

}

export function getTransactionId(payment) {

    return payment.transactionId ||
        `SLM-DEMO-${String(payment.id).padStart(8, "0")}`;

}