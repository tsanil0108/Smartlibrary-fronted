import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    TicketPercent,
    Plus,
    Search,
    RefreshCw,
    Copy,
    Check,
    X,
    CalendarDays,
    Users,
    Percent,
    CheckCircle2,
    XCircle,
    Clock3,
    AlertCircle,
    AlertTriangle,
    LoaderCircle,
    Gift,
    Power,
    ShieldCheck,
    Ticket,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    adminCouponApi,
    formatCouponDate,
    getCouponStatus,
    getUsagePercentage,
    getTodayDate,
} from "../../services/adminCouponApi";

import "../../styles/admin/Coupons.css";


// ==========================================
// CONSTANTS
// ==========================================

const PAGE_SIZE = 9;

const FILTERS = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
    "EXPIRED",
    "EXHAUSTED",
];

const STATUS_LABELS = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    EXPIRED: "Expired",
    EXHAUSTED: "Usage limit reached",
};

const INITIAL_FORM = {
    code: "",
    percent: "100",
    maxUses: "100",
    expiresOn: "",
};


// ==========================================
// STATUS BADGE
// ==========================================

function CouponStatus({ coupon }) {

    const status = getCouponStatus(coupon);

    return (

        <span
            className={`ac-status ac-status-${status.toLowerCase()}`}
        >

            <span className="ac-status-dot" />

            {STATUS_LABELS[status]}

        </span>

    );

}


// ==========================================
// CREATE COUPON MODAL
// ==========================================

function CreateCouponModal({
    onClose,
    onSuccess,
}) {

    const [form, setForm] =
        useState({ ...INITIAL_FORM });

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    function updateField(event) {

        const { name, value } = event.target;

        setForm(previous => ({

            ...previous,

            [name]: name === "code"
                ? value.toUpperCase().replace(/\s/g, "")
                : value,

        }));

    }

    function generateCode() {

        const random = Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase();

        setForm(previous => ({

            ...previous,

            code: `LIB${random}`,

        }));

    }

    async function handleSubmit(event) {

        event.preventDefault();

        if (saving) return;

        setError("");

        const code = form.code.trim();

        const percent = Number(form.percent);

        const maxUses = Number(form.maxUses);

        if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {

            setError(
                "Enter a valid coupon code with 3–30 characters."
            );

            return;

        }

        if (
            !Number.isInteger(percent) ||
            percent < 1 ||
            percent > 100
        ) {

            setError(
                "Discount must be between 1 and 100."
            );

            return;

        }

        if (
            !Number.isInteger(maxUses) ||
            maxUses < 1
        ) {

            setError(
                "Maximum usage must be a positive integer."
            );

            return;

        }

        if (
            form.expiresOn &&
            form.expiresOn < getTodayDate()
        ) {

            setError(
                "Expiry date cannot be in the past."
            );

            return;

        }

        setSaving(true);

        try {

            await adminCouponApi.createCoupon({

                code,

                percent,

                maxUses,

                expiresOn: form.expiresOn || null,

            });

            onSuccess(
                `Coupon ${code} created successfully.`
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to create coupon."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="ac-overlay">

            <section
                className="ac-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ac-create-title"
            >

                <header className="ac-modal-header">

                    <div className="ac-icon ac-purple">

                        <TicketPercent size={25} />

                    </div>

                    <div className="ac-modal-heading">

                        <h2 id="ac-create-title">
                            Create new coupon
                        </h2>

                        <p>
                            Create a membership discount offer.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="ac-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >

                        <X size={21} />

                    </button>

                </header>

                <form onSubmit={handleSubmit}>

                    <div className="ac-modal-body">

                        {/* COUPON CODE */}

                        <div className="ac-field">

                            <label htmlFor="ac-code">
                                Coupon code *
                            </label>

                            <div className="ac-input-group">

                                <input
                                    id="ac-code"
                                    name="code"
                                    value={form.code}
                                    onChange={updateField}
                                    placeholder="WELCOME100"
                                    maxLength={30}
                                    required
                                />

                                <button
                                    type="button"
                                    className="ac-generate"
                                    onClick={generateCode}
                                >

                                    <Sparkles size={15} />

                                    Generate

                                </button>

                            </div>

                            <small>
                                Members will enter this code
                                during membership checkout.
                            </small>

                        </div>


                        {/* DISCOUNT & USAGE */}

                        <div className="ac-form-grid">

                            <div className="ac-field">

                                <label htmlFor="ac-percent">
                                    Discount percentage *
                                </label>

                                <div className="ac-input-icon">

                                    <Percent size={18} />

                                    <input
                                        id="ac-percent"
                                        type="number"
                                        name="percent"
                                        min="1"
                                        max="100"
                                        step="1"
                                        value={form.percent}
                                        onChange={updateField}
                                        required
                                    />

                                </div>

                            </div>

                            <div className="ac-field">

                                <label htmlFor="ac-max">
                                    Maximum usage *
                                </label>

                                <div className="ac-input-icon">

                                    <Users size={18} />

                                    <input
                                        id="ac-max"
                                        type="number"
                                        name="maxUses"
                                        min="1"
                                        step="1"
                                        value={form.maxUses}
                                        onChange={updateField}
                                        required
                                    />

                                </div>

                            </div>

                        </div>


                        {/* EXPIRY */}

                        <div className="ac-field">

                            <label htmlFor="ac-expiry">
                                Expiry date
                            </label>

                            <input
                                id="ac-expiry"
                                type="date"
                                name="expiresOn"
                                min={getTodayDate()}
                                value={form.expiresOn}
                                onChange={updateField}
                            />

                            <small>
                                Leave empty for no expiry,
                                if supported by the backend.
                            </small>

                        </div>


                        {/* LIVE COUPON PREVIEW */}

                        <div className="ac-form-preview">

                            <div>

                                <span>COUPON PREVIEW</span>

                                <h3>

                                    {form.code || "YOURCODE"}

                                </h3>

                                <p>
                                    Library membership offer
                                </p>

                            </div>

                            <div className="ac-preview-percent">

                                {Number(form.percent) || 0}%

                                <small>OFF</small>

                            </div>

                        </div>


                        {/* DEMO PAYMENT NOTICE */}

                        <div className="ac-info">

                            <AlertCircle size={20} />

                            <div>

                                <strong>
                                    Demo membership checkout
                                </strong>

                                <p>

                                    The current checkout supports
                                    free membership activation
                                    using a 100% discount coupon.
                                    Partial discounts require a
                                    real payment integration.

                                </p>

                            </div>

                        </div>

                        {error && (

                            <div
                                className="ac-message ac-error"
                                role="alert"
                            >

                                <AlertCircle size={19} />

                                {error}

                            </div>

                        )}

                    </div>

                    <footer className="ac-modal-footer">

                        <button
                            type="button"
                            className="ac-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >

                            Cancel

                        </button>

                        <button
                            type="submit"
                            className="ac-primary"
                            disabled={saving}
                        >

                            {saving ? (

                                <LoaderCircle
                                    size={18}
                                    className="ac-spin"
                                />

                            ) : (

                                <Plus size={18} />

                            )}

                            {saving
                                ? "Creating..."
                                : "Create coupon"}

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );

}


// ==========================================
// COUPON STATUS CONFIRMATION
// ==========================================

function StatusModal({
    coupon,
    onClose,
    onSuccess,
}) {

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const nextActive = !coupon.active;

    async function handleUpdate() {

        if (saving) return;

        setSaving(true);
        setError("");

        try {

            await adminCouponApi.updateCouponStatus(
                coupon.code,
                nextActive
            );

            onSuccess(

                `Coupon ${coupon.code} ${
                    nextActive
                        ? "activated"
                        : "deactivated"
                } successfully.`

            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to update coupon."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="ac-overlay">

            <section
                className="ac-modal ac-small-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ac-status-title"
            >

                <div className="ac-modal-body">

                    <div className={
                        `ac-icon ${
                            nextActive
                                ? "ac-green"
                                : "ac-orange"
                        }`
                    }>

                        {nextActive ? (

                            <CheckCircle2 size={27} />

                        ) : (

                            <AlertTriangle size={27} />

                        )}

                    </div>

                    <h2 id="ac-status-title">

                        {nextActive
                            ? "Activate coupon?"
                            : "Deactivate coupon?"}

                    </h2>

                    <p className="ac-muted">

                        You are about to{" "}

                        {nextActive
                            ? "activate"
                            : "deactivate"}

                        {" "}coupon{" "}

                        <strong>{coupon.code}</strong>.

                        {" "}

                        {nextActive
                            ? "Members can redeem it if it is valid and has remaining uses."
                            : "Members will no longer be able to redeem this coupon."}

                    </p>

                    {error && (

                        <div className="ac-message ac-error">

                            <AlertCircle size={18} />

                            {error}

                        </div>

                    )}

                </div>

                <footer className="ac-modal-footer">

                    <button
                        className="ac-secondary"
                        onClick={onClose}
                        disabled={saving}
                    >

                        Cancel

                    </button>

                    <button
                        className={
                            nextActive
                                ? "ac-primary"
                                : "ac-danger"
                        }
                        onClick={handleUpdate}
                        disabled={saving}
                    >

                        {saving ? (

                            <LoaderCircle
                                size={18}
                                className="ac-spin"
                            />

                        ) : (

                            <Power size={18} />

                        )}

                        {saving
                            ? "Updating..."
                            : nextActive
                                ? "Activate"
                                : "Deactivate"}

                    </button>

                </footer>

            </section>

        </div>

    );

}


// ==========================================
// COUPON CARD
// ==========================================

function CouponCard({
    coupon,
    onToggle,
    onCopy,
    copied,
}) {

    const usage = getUsagePercentage(coupon);

    const used = Number(coupon.used || 0);

    const maxUses = Number(coupon.maxUses || 0);

    const remaining = Math.max(
        0,
        maxUses - used
    );

    const status = getCouponStatus(coupon);

    const cannotActivate =
        !coupon.active &&
        (
            status === "EXPIRED" ||
            (
                coupon.maxUses != null &&
                used >= maxUses
            )
        );

    return (

        <article className="ac-coupon-card">

            <div className="ac-ticket-top">

                <div className="ac-ticket-heading">

                    <span>

                        <Gift size={15} />

                        MEMBERSHIP OFFER

                    </span>

                    <h3>{coupon.percent}%</h3>

                    <p>Membership discount</p>

                </div>

                <div className="ac-ticket-decoration">

                    <TicketPercent
                        size={83}
                        strokeWidth={1}
                    />

                </div>

            </div>

            <div className="ac-ticket-divider" />

            <div className="ac-card-body">

                <div className="ac-card-status-row">

                    <CouponStatus coupon={coupon} />

                    {coupon.percent === 100 && (

                        <span className="ac-free-label">

                            Free membership

                        </span>

                    )}

                </div>

                <div className="ac-code-box">

                    <div>

                        <span>COUPON CODE</span>

                        <strong>{coupon.code}</strong>

                    </div>

                    <button
                        className="ac-copy"
                        onClick={() =>
                            onCopy(coupon.code)
                        }
                        title="Copy coupon code"
                        aria-label={`Copy ${coupon.code}`}
                    >

                        {copied === coupon.code ? (

                            <Check size={19} />

                        ) : (

                            <Copy size={19} />

                        )}

                    </button>

                </div>


                {/* USAGE */}

                <div className="ac-usage">

                    <div className="ac-usage-heading">

                        <span>Coupon usage</span>

                        <strong>

                            {used} / {coupon.maxUses ?? "Unlimited"}

                        </strong>

                    </div>

                    <div
                        className="ac-progress"
                        role="progressbar"
                        aria-label="Coupon usage"
                        aria-valuenow={usage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >

                        <div
                            className={
                                usage >= 100
                                    ? "ac-progress-full"
                                    : ""
                            }
                            style={{
                                width: `${usage}%`,
                            }}
                        />

                    </div>

                    <small>

                        {coupon.maxUses == null
                            ? "Unlimited usage"
                            : `${remaining} redemptions remaining`}

                    </small>

                </div>


                {/* EXPIRY */}

                <div className="ac-card-expiry">

                    <CalendarDays size={18} />

                    <div>

                        <span>Valid until</span>

                        <strong>

                            {formatCouponDate(
                                coupon.expiresOn
                            )}

                        </strong>

                    </div>

                </div>

            </div>

            <footer className="ac-card-footer">

                <button
                    className={
                        `ac-toggle-button ${
                            coupon.active
                                ? "ac-toggle-off"
                                : "ac-toggle-on"
                        }`
                    }
                    disabled={cannotActivate}
                    onClick={() => onToggle(coupon)}
                >

                    <Power size={17} />

                    {coupon.active
                        ? "Deactivate coupon"
                        : "Activate coupon"}

                </button>

            </footer>

        </article>

    );

}


// ==========================================
// MAIN PAGE
// ==========================================

export default function Coupons() {

    const [coupons, setCoupons] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState("ALL");

    const [page, setPage] =
        useState(0);

    const [modal, setModal] =
        useState(null);

    const [copied, setCopied] =
        useState("");

    const [refresh, setRefresh] =
        useState(0);

    const [serverTotal, setServerTotal] =
        useState(null);

    const reload = useCallback(() => {

        setRefresh(value => value + 1);

    }, []);


    // ======================================
    // LOAD COUPONS
    // ======================================

    useEffect(() => {

        let active = true;

        setLoading(true);
        setError("");

        adminCouponApi.getCoupons()

            .then(data => {

                if (!active) return;

                const items = Array.isArray(data)
                    ? data
                    : data?.content;

                if (!Array.isArray(items)) {

                    throw new Error(
                        "Unexpected coupon response."
                    );

                }

                setCoupons(items);

                setServerTotal(
                    data?.totalElements ??
                    data?.total ??
                    items.length
                );

            })

            .catch(err => {

                if (!active) return;

                setError(
                    err.message ||
                    "Unable to load coupons."
                );

                setCoupons([]);
                setServerTotal(null);

            })

            .finally(() => {

                if (active) {
                    setLoading(false);
                }

            });

        return () => {

            active = false;

        };

    }, [refresh]);


    // ======================================
    // COPY FEEDBACK
    // ======================================

    useEffect(() => {

        if (!copied) return;

        const timeout = setTimeout(() => {

            setCopied("");

        }, 2000);

        return () => clearTimeout(timeout);

    }, [copied]);

    async function copyCode(code) {

        try {

            await navigator.clipboard.writeText(code);

            setCopied(code);

            setMessage(
                `Coupon ${code} copied to clipboard.`
            );

        } catch {

            setMessage(
                `Unable to copy automatically. Coupon code: ${code}`
            );

        }

    }


    // ======================================
    // STATISTICS
    // ======================================

    const counts = useMemo(() => {

        const result = {

            ALL: coupons.length,

            ACTIVE: 0,

            INACTIVE: 0,

            EXPIRED: 0,

            EXHAUSTED: 0,

            USED: 0,

        };

        coupons.forEach(coupon => {

            result[getCouponStatus(coupon)] += 1;

            result.USED += Number(
                coupon.used || 0
            );

        });

        return result;

    }, [coupons]);

    const stats = [

        {
            label: "Total coupons",
            value: serverTotal ?? "—",
            icon: TicketPercent,
            color: "purple",
            filter: "ALL",
        },

        {
            label: "Active coupons",
            value: counts.ACTIVE,
            icon: CheckCircle2,
            color: "green",
            filter: "ACTIVE",
        },

        {
            label: "Total redemptions",
            value: counts.USED,
            icon: Users,
            color: "blue",
        },

        {
            label: "Inactive coupons",
            value: counts.INACTIVE,
            icon: XCircle,
            color: "red",
            filter: "INACTIVE",
        },

        {
            label: "Expired coupons",
            value: counts.EXPIRED,
            icon: Clock3,
            color: "orange",
            filter: "EXPIRED",
        },

        {
            label: "Usage limit reached",
            value: counts.EXHAUSTED,
            icon: Ticket,
            color: "gray",
            filter: "EXHAUSTED",
        },

    ];


    // ======================================
    // SEARCH & FILTER
    // ======================================

    const filteredCoupons = useMemo(() => {

        const query = search.trim().toLowerCase();

        return coupons.filter(coupon => {

            const matchesSearch = String(
                coupon.code || ""
            ).toLowerCase().includes(query);

            const matchesStatus =
                filter === "ALL" ||
                getCouponStatus(coupon) === filter;

            return matchesSearch && matchesStatus;

        });

    }, [coupons, search, filter]);

    const totalPages = Math.ceil(
        filteredCoupons.length / PAGE_SIZE
    );

    const currentPage = Math.min(
        page,
        Math.max(0, totalPages - 1)
    );

    const visibleCoupons = filteredCoupons.slice(

        currentPage * PAGE_SIZE,

        (currentPage + 1) * PAGE_SIZE

    );

    function changeFilter(value) {

        setFilter(value);
        setPage(0);

    }

    function handleSuccess(text) {

        setModal(null);
        setMessage(text);
        reload();

    }


    // ======================================
    // PAGE UI
    // ======================================

    return (

        <main className="ac-page">

            {/* PAGE HEADER */}

            <header className="ac-page-header">

                <div>

                    <span className="ac-eyebrow">

                        LIBRARY ADMINISTRATION

                    </span>

                    <h1>Membership & Coupons</h1>

                    <p>

                        Create membership offers and
                        manage coupon redemptions.

                    </p>

                </div>

                <div className="ac-header-actions">

                    <button
                        className="ac-secondary"
                        onClick={reload}
                        disabled={loading}
                    >

                        <RefreshCw
                            size={18}
                            className={
                                loading ? "ac-spin" : ""
                            }
                        />

                        Refresh

                    </button>

                    <button
                        className="ac-primary"
                        onClick={() =>
                            setModal({ type: "create" })
                        }
                    >

                        <Plus size={19} />

                        Create coupon

                    </button>

                </div>

            </header>


            {/* HERO */}

            <section className="ac-hero">

                <div className="ac-hero-content">

                    <span className="ac-hero-tag">

                        <Sparkles size={14} />

                        MEMBERSHIP BENEFITS

                    </span>

                    <h2>

                        Make reading more accessible.

                    </h2>

                    <p>

                        Reward your readers with exclusive
                        membership discounts and special
                        promotional offers.

                    </p>

                    <button
                        className="ac-hero-button"
                        onClick={() =>
                            setModal({ type: "create" })
                        }
                    >

                        <Gift size={19} />

                        Create membership offer

                    </button>

                </div>

                <div className="ac-hero-art">

                    <div className="ac-hero-ticket">

                        <TicketPercent
                            size={44}
                            strokeWidth={1.5}
                        />

                        <strong>100%</strong>

                        <span>MEMBERSHIP OFFER</span>

                    </div>

                </div>

            </section>


            {/* STATISTICS */}

            <section className="ac-stats">

                {stats.map(item => {

                    const Icon = item.icon;

                    const content = (

                        <>

                            <div className={
                                `ac-icon ac-${item.color}`
                            }>

                                <Icon size={23} />

                            </div>

                            <span>{item.label}</span>

                            <strong>

                                {loading || error
                                    ? "—"
                                    : item.value}

                            </strong>

                        </>

                    );

                    return item.filter ? (

                        <button
                            key={item.label}
                            className={
                                `ac-stat ${
                                    filter === item.filter
                                        ? "ac-stat-selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                changeFilter(item.filter)
                            }
                            aria-pressed={
                                filter === item.filter
                            }
                        >

                            {content}

                        </button>

                    ) : (

                        <div
                            key={item.label}
                            className="ac-stat"
                        >

                            {content}

                        </div>

                    );

                })}

            </section>


            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="ac-message ac-notice"
                    role="status"
                >

                    <AlertCircle size={20} />

                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >

                        <X size={18} />

                    </button>

                </div>

            )}


            {/* PAYMENT MODE INFORMATION */}

            <section className="ac-demo-banner">

                <div className="ac-icon ac-orange">

                    <ShieldCheck size={25} />

                </div>

                <div>

                    <strong>

                        Demo membership payment mode

                    </strong>

                    <p>

                        Use 100% discount coupons for free
                        membership activation. Real online
                        payments are not enabled yet.

                    </p>

                </div>

            </section>


            {/* COUPON PANEL */}

            <section className="ac-panel">

                <header className="ac-panel-header">

                    <div>

                        <h3>Membership coupons</h3>

                        <p>

                            Manage all promotional codes
                            and their usage limits.

                        </p>

                    </div>

                    <span className="ac-count">

                        {coupons.length} loaded

                    </span>

                </header>


                {/* FILTERS */}

                <div className="ac-tabs">

                    {FILTERS.map(status => (

                        <button
                            key={status}
                            className={
                                filter === status
                                    ? "ac-tab ac-tab-active"
                                    : "ac-tab"
                            }
                            onClick={() =>
                                changeFilter(status)
                            }
                        >

                            {status === "ALL"
                                ? "All coupons"
                                : STATUS_LABELS[status]}

                            <span>

                                {counts[status] || 0}

                            </span>

                        </button>

                    ))}

                </div>


                {/* SEARCH */}

                <div className="ac-search">

                    <Search size={19} />

                    <input
                        value={search}
                        placeholder="Search coupon code..."
                        aria-label="Search coupon code"
                        onChange={event => {

                            setSearch(event.target.value);
                            setPage(0);

                        }}
                    />

                    {search && (

                        <button
                            onClick={() => {

                                setSearch("");
                                setPage(0);

                            }}
                            aria-label="Clear search"
                        >

                            <X size={17} />

                        </button>

                    )}

                </div>

                {serverTotal > coupons.length && (

                    <p className="ac-muted">

                        Search, status counts and usage
                        statistics apply to loaded records only.

                    </p>

                )}


                {/* LOADING */}

                {loading ? (

                    <div className="ac-empty">

                        <LoaderCircle
                            size={43}
                            className="ac-spin"
                        />

                        <h3>Loading coupons...</h3>

                    </div>

                ) : error ? (

                    <div className="ac-empty">

                        <AlertCircle size={45} />

                        <h3>Unable to load coupons</h3>

                        <p>{error}</p>

                        <button
                            className="ac-primary"
                            onClick={reload}
                        >

                            Try again

                        </button>

                    </div>

                ) : visibleCoupons.length === 0 ? (

                    <div className="ac-empty">

                        <TicketPercent size={52} />

                        <h3>No coupons found</h3>

                        <p>

                            Create a new coupon or
                            change your search filters.

                        </p>

                        <button
                            className="ac-primary"
                            onClick={() =>
                                setModal({ type: "create" })
                            }
                        >

                            <Plus size={18} />

                            Create coupon

                        </button>

                    </div>

                ) : (

                    <div className="ac-coupon-grid">

                        {visibleCoupons.map(coupon => (

                            <CouponCard
                                key={coupon.code}
                                coupon={coupon}
                                copied={copied}
                                onCopy={copyCode}
                                onToggle={item =>

                                    setModal({

                                        type: "status",

                                        coupon: item,

                                    })

                                }
                            />

                        ))}

                    </div>

                )}


                {/* PAGINATION */}

                {!loading &&
                    !error &&
                    totalPages > 0 && (

                    <footer className="ac-pagination">

                        <span>

                            Showing{" "}

                            {currentPage * PAGE_SIZE + 1}

                            {" "}to{" "}

                            {Math.min(
                                (currentPage + 1) * PAGE_SIZE,
                                filteredCoupons.length
                            )}

                            {" "}of{" "}

                            {filteredCoupons.length}

                            {" "}coupons

                        </span>

                        <div>

                            <button
                                disabled={currentPage === 0}
                                onClick={() =>
                                    setPage(currentPage - 1)
                                }
                                aria-label="Previous page"
                            >

                                <ChevronLeft size={19} />

                            </button>

                            <strong>

                                {currentPage + 1} / {totalPages}

                            </strong>

                            <button
                                disabled={
                                    currentPage + 1 >= totalPages
                                }
                                onClick={() =>
                                    setPage(currentPage + 1)
                                }
                                aria-label="Next page"
                            >

                                <ChevronRight size={19} />

                            </button>

                        </div>

                    </footer>

                )}

            </section>


            {/* CREATE MODAL */}

            {modal?.type === "create" && (

                <CreateCouponModal
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />

            )}


            {/* STATUS MODAL */}

            {modal?.type === "status" && (

                <StatusModal
                    coupon={modal.coupon}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />

            )}

        </main>

    );

}