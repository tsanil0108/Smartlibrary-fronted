import { api } from "./api";

export const adminCouponApi = {

    getCoupons() {
        return api("/admin/coupons");
    },

    createCoupon(data) {
        return api(
            "/admin/coupons",
            "POST",
            data
        );
    },

    updateCouponStatus(code, active) {
        return api(
            `/admin/coupons/${encodeURIComponent(code)}?active=${active}`,
            "PATCH"
        );
    },

};

export function getTodayDate() {

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

}

export function formatCouponDate(value) {

    if (!value) return "No expiry";

    const date = new Date(
        `${String(value).slice(0, 10)}T00:00:00+05:30`
    );

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

export function getCouponStatus(coupon) {

    if (
        coupon.expiresOn &&
        coupon.expiresOn.slice(0, 10) < getTodayDate()
    ) {
        return "EXPIRED";
    }

    if (!coupon.active) {
        return "INACTIVE";
    }

    if (
        coupon.maxUses != null &&
        Number(coupon.used || 0) >= Number(coupon.maxUses)
    ) {
        return "EXHAUSTED";
    }

    return "ACTIVE";

}

export function getUsagePercentage(coupon) {

    const used = Number(coupon.used || 0);
    const maxUses = Number(coupon.maxUses || 0);

    if (maxUses <= 0) return 0;

    return Math.min(
        100,
        Math.max(0, Math.round((used / maxUses) * 100))
    );

}