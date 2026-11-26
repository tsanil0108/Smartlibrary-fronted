import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";

import {
    Wallet,
    CreditCard,
    CheckCircle2,
    Clock,
    TicketPercent,
    Undo2,
    RefreshCw,
    Search,
    Download,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    AlertCircle,
    ShieldCheck,
    Receipt,
    IndianRupee,
    ListOrdered,
    ArrowUpRight,
} from "lucide-react";

import {
    adminPaymentApi,
    formatPaymentMoney,
    formatPaymentDate,
    getTransactionId,
    getPaymentStatus,
    getPaymentMethod,
    canRefund,
    canDownloadReceipt,
} from "../../services/adminPaymentApi";

import "../../styles/admin/AdminPayments.css";

const PAGE_SIZE = 10;

const TABS = [
    {
        id: "payments",
        label: "Transactions",
        icon: CreditCard,
    },
    {
        id: "orders",
        label: "Payment Orders",
        icon: ListOrdered,
    },
    {
        id: "refunds",
        label: "Refund History",
        icon: Undo2,
    },
];

const STATUS_OPTIONS = {
    payments: [
        "SUCCESS",
        "REFUND_PENDING",
        "REFUNDED",
        "UNVERIFIED",
        "FAILED",
    ],

    orders: [
        "CREATED",
        "PENDING",
        "CAPTURED",
        "SUCCESS",
        "FAILED",
        "EXPIRED",
        "REFUND_PENDING",
        "REFUNDED",
    ],

    refunds: [
        "REQUESTED",
        "PROCESSING",
        "PROCESSED",
        "FAILED",
        "RECONCILIATION_REQUIRED",
    ],
};

const money = formatPaymentMoney;
const date = formatPaymentDate;

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {

    const value = String(
        status || "UNVERIFIED"
    ).toUpperCase();

    let tone = "neutral";

    if (["SUCCESS", "PROCESSED"].includes(value)) {
        tone = "success";
    } else if (
        [
            "PENDING",
            "CREATED",
            "CAPTURED",
            "REQUESTED",
            "PROCESSING",
            "REFUND_PENDING",
        ].includes(value)
    ) {
        tone = "warning";
    } else if (
        [
            "FAILED",
            "EXPIRED",
            "RECONCILIATION_REQUIRED",
        ].includes(value)
    ) {
        tone = "danger";
    } else if (value === "REFUNDED") {
        tone = "purple";
    }

    return (
        <span className={`ap-status ap-status-${tone}`}>
            <span className="ap-status-dot" />

            {value.replace(/_/g, " ")}
        </span>
    );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
    label,
    value,
    icon: Icon,
    tone,
    description,
}) {

    return (
        <div className="ap-stat-card">

            <div className="ap-stat-top">
                <span>{label}</span>

                <div className={`ap-stat-icon ap-icon-${tone}`}>
                    <Icon size={21} />
                </div>
            </div>

            <h3>{value}</h3>

            <p>{description}</p>

        </div>
    );
}

// ==========================================
// DETAIL ITEM
// ==========================================

function DetailItem({ label, value }) {

    return (
        <div className="ap-detail-item">

            <span>{label}</span>

            <strong>{value ?? "—"}</strong>

        </div>
    );
}

// ==========================================
// MODAL
// ==========================================

function Modal({
    title,
    subtitle,
    onClose,
    busy,
    children,
}) {

    const panelRef = useRef(null);

    useEffect(() => {

        const previousFocus = document.activeElement;

        panelRef.current?.focus();

        function handleKey(event) {

            if (event.key === "Escape" && !busy) {
                onClose();
            }

            if (event.key !== "Tab") return;

            const elements = Array.from(
                panelRef.current?.querySelectorAll(
                    'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]'
                ) || []
            );

            if (!elements.length) {
                event.preventDefault();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];

            if (
                event.shiftKey &&
                (
                    document.activeElement === first ||
                    document.activeElement === panelRef.current
                )
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKey);

        return () => {

            document.removeEventListener(
                "keydown",
                handleKey
            );

            previousFocus?.focus?.();
        };

    }, [busy, onClose]);

    return (
        <div
            className="ap-modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !busy
                ) {
                    onClose();
                }
            }}
        >

            <section
                className="ap-modal"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                ref={panelRef}
            >

                <header className="ap-modal-header">

                    <div>
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>

                    <button
                        className="ap-icon-button"
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Close dialog"
                    >
                        <X size={21} />
                    </button>

                </header>

                <div className="ap-modal-body">
                    {children}
                </div>

            </section>

        </div>
    );
}

// ==========================================
// PAGINATION
// ==========================================

function Pagination({
    page,
    totalPages,
    total,
    onChange,
    disabled,
}) {

    return (
        <div className="ap-pagination">

            <span>
                {total === 0
                    ? "No records"
                    : `Showing ${page * PAGE_SIZE + 1}–${Math.min(
                        (page + 1) * PAGE_SIZE,
                        total
                    )} of ${total}`}
            </span>

            <div className="ap-pagination-actions">

                <button
                    className="ap-icon-button"
                    disabled={disabled || page === 0}
                    onClick={() => onChange(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>

                <span className="ap-page-number">
                    {page + 1} / {Math.max(1, totalPages)}
                </span>

                <button
                    className="ap-icon-button"
                    disabled={
                        disabled ||
                        page + 1 >= totalPages
                    }
                    onClick={() => onChange(page + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight size={18} />
                </button>

            </div>

        </div>
    );
}

// ==========================================
// MAIN ADMIN PAYMENTS PAGE
// ==========================================

export default function AdminPayments() {

    const [tab, setTab] = useState("payments");

    const [summary, setSummary] = useState(null);

    const [payments, setPayments] = useState([]);

    const [serverPage, setServerPage] = useState({
        content: [],
        totalPages: 0,
        totalElements: 0,
    });

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("");

    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);

    const [summaryLoading, setSummaryLoading] =
        useState(true);

    const [error, setError] = useState("");

    const [summaryError, setSummaryError] =
        useState("");

    const [notice, setNotice] = useState("");

    const [busy, setBusy] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);

    const [modal, setModal] = useState(null);

    const [modalError, setModalError] = useState("");

    const [refundReason, setRefundReason] = useState("");

    const [confirmed, setConfirmed] = useState(false);

    const actionLock = useRef(false);

    // ==========================================
    // LOAD SUMMARY
    // ==========================================

    useEffect(() => {

        let active = true;

        async function loadSummary() {

            setSummaryLoading(true);
            setSummaryError("");

            try {

                const data =
                    await adminPaymentApi.getSummary();

                if (active) {
                    setSummary(data);
                }

            } catch (err) {

                if (active) {
                    setSummaryError(err.message);
                    setSummary(null);
                }

            } finally {

                if (active) {
                    setSummaryLoading(false);
                }
            }
        }

        loadSummary();

        return () => {
            active = false;
        };

    }, [refreshKey]);

    // ==========================================
    // LOAD TRANSACTIONS
    // ==========================================

    useEffect(() => {

        let active = true;

        async function loadPayments() {

            try {

                const data =
                    await adminPaymentApi.getPayments();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "Invalid payment history response."
                    );
                }

                if (active) {
                    setPayments(data);
                }

            } catch (err) {

                if (active) {
                    setPayments([]);
                    setError(err.message);
                }
            }
        }

        if (tab !== "payments") return;

        setLoading(true);
        setError("");

        loadPayments().finally(() => {
            if (active) {
                setLoading(false);
            }
        });

        return () => {
            active = false;
        };

    }, [tab, refreshKey]);

    // ==========================================
    // LOAD ORDERS / REFUNDS
    // ==========================================

    useEffect(() => {

        if (tab === "payments") return;

        let active = true;

        async function loadPage() {

            setLoading(true);
            setError("");

            try {

                const data =
                    tab === "orders"

                        ? await adminPaymentApi.getOrders(
                            page,
                            PAGE_SIZE,
                            status
                        )

                        : await adminPaymentApi.getRefunds(
                            page,
                            PAGE_SIZE,
                            status
                        );

                if (!Array.isArray(data?.content)) {
                    throw new Error(
                        "Invalid paginated response."
                    );
                }

                if (active) {

                    setServerPage(data);

                    if (
                        page > 0 &&
                        page >= data.totalPages
                    ) {
                        setPage(
                            Math.max(0, data.totalPages - 1)
                        );
                    }
                }

            } catch (err) {

                if (active) {

                    setServerPage({
                        content: [],
                        totalPages: 0,
                        totalElements: 0,
                    });

                    setError(err.message);
                }

            } finally {

                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPage();

        return () => {
            active = false;
        };

    }, [tab, page, status, refreshKey]);

    // ==========================================
    // FILTER PAYMENTS
    // ==========================================

    const filteredPayments = useMemo(() => {

        const query = search.trim().toLowerCase();

        return payments.filter((payment) => {

            const matchesStatus =
                !status ||
                getPaymentStatus(payment) === status;

            const searchable = [
                payment.id,
                payment.userId,
                payment.couponCode,
                payment.razorpayPaymentId,
                payment.razorpayOrderId,
                getTransactionId(payment),
                getPaymentMethod(payment),
            ]
                .filter((value) => value != null)
                .join(" ")
                .toLowerCase();

            return (
                matchesStatus &&
                (!query || searchable.includes(query))
            );
        });

    }, [payments, search, status]);

    const totalPages = tab === "payments"

        ? Math.ceil(
            filteredPayments.length / PAGE_SIZE
        )

        : serverPage.totalPages;

    const total = tab === "payments"

        ? filteredPayments.length

        : serverPage.totalElements;

    const rows = tab === "payments"

        ? filteredPayments.slice(
            page * PAGE_SIZE,
            (page + 1) * PAGE_SIZE
        )

        : serverPage.content;

    useEffect(() => {

        if (
            tab === "payments" &&
            page > 0 &&
            page >= totalPages
        ) {
            setPage(Math.max(0, totalPages - 1));
        }

    }, [tab, page, totalPages]);

    // ==========================================
    // UI ACTIONS
    // ==========================================

    function refresh() {

        setLoading(true);

        setRefreshKey((value) => value + 1);
    }

    function changeTab(value) {

        if (value === tab || busy) return;

        setLoading(true);
        setTab(value);
        setPage(0);
        setStatus("");
        setSearch("");
        setError("");
        setNotice("");
    }

    const closeModal = useCallback(() => {

        if (actionLock.current) return;

        setModal(null);
        setModalError("");
        setRefundReason("");
        setConfirmed(false);

    }, []);

    function beginAction() {

        if (actionLock.current) {
            return false;
        }

        actionLock.current = true;
        setBusy(true);
        setError("");
        setModalError("");
        setNotice("");

        return true;
    }

    function endAction() {

        actionLock.current = false;
        setBusy(false);
    }

    // ==========================================
    // RECEIPT PREVIEW
    // ==========================================

    async function openReceipt(payment) {

        if (!canDownloadReceipt(payment)) return;

        if (!beginAction()) return;

        try {

            const data =
                await adminPaymentApi.getReceiptDetails(
                    payment.id
                );

            setModal({
                type: "receipt",
                data,
            });

        } catch (err) {

            setError(err.message);

        } finally {

            endAction();
        }
    }

    async function downloadReceipt(id) {

        if (!beginAction()) return;

        try {

            await adminPaymentApi.downloadReceipt(id);

            setNotice("Receipt downloaded.");

        } catch (err) {

            setError(err.message);
            setModalError(err.message);

        } finally {

            endAction();
        }
    }

    // ==========================================
    // REFUND REQUEST
    // ==========================================

    function openRefund(payment) {

        if (!canRefund(payment) || busy) return;

        setRefundReason("");
        setConfirmed(false);
        setModalError("");

        setModal({
            type: "refund-request",
            data: payment,
        });
    }

    async function submitRefund(event) {

        event.preventDefault();

        if (
            modal?.type !== "refund-request" ||
            !confirmed ||
            refundReason.trim().length < 5 ||
            refundReason.trim().length > 500
        ) {
            return;
        }

        if (!beginAction()) return;

        try {

            const result =
                await adminPaymentApi.requestRefund(
                    modal.data.id,
                    refundReason
                );

            setModal({
                type: "refund-details",
                data: result,
            });

            setConfirmed(false);
            setRefundReason("");

            if (result.status === "PROCESSED") {

                setNotice(
                    "Refund confirmed by Razorpay."
                );

            } else {

                setNotice(
                    `Refund status: ${result.status.replace(
                        /_/g,
                        " "
                    )}. Check refund history for updates.`
                );
            }

        } catch (err) {

            setModalError(
                `${err.message} Check refund history before taking further action.`
            );

            setConfirmed(false);

        } finally {

            refresh();
            endAction();
        }
    }

    // ==========================================
    // RECONCILE PAYMENT ORDER
    // ==========================================

    async function reconcileOrder(order) {

        if (!beginAction()) return;

        try {

            const result =
                await adminPaymentApi.reconcileOrder(
                    order.id
                );

            setNotice(
                result.message ||
                `Order status: ${result.status}`
            );

        } catch (err) {

            setError(err.message);

        } finally {

            refresh();
            endAction();
        }
    }

    // ==========================================
    // RECONCILE REFUND
    // ==========================================

    async function reconcileRefund(refund) {

        if (!beginAction()) return;

        try {

            const result =
                await adminPaymentApi.reconcileRefund(
                    refund.id
                );

            setModal({
                type: "refund-details",
                data: result,
            });

            setNotice(
                `Refund status: ${result.status.replace(
                    /_/g,
                    " "
                )}`
            );

        } catch (err) {

            setError(err.message);
            setModalError(err.message);

        } finally {

            refresh();
            endAction();
        }
    }

    async function openRefundByPayment(payment) {

        if (!beginAction()) return;

        try {

            const result =
                await adminPaymentApi.getRefundByPayment(
                    payment.id
                );

            setModal({
                type: "refund-details",
                data: result,
            });

        } catch (err) {

            setError(err.message);

        } finally {

            endAction();
        }
    }

    // ==========================================
    // STATISTICS
    // ==========================================

    const stats = [

        {
            label: "Net Revenue",
            value: money(summary?.netRevenuePaise),
            icon: Wallet,
            tone: "purple",
            description: "After recorded refunds",
        },

        {
            label: "Successful Payments",
            value: summary?.successfulPayments,
            icon: CheckCircle2,
            tone: "green",
            description: "Successful transactions",
        },

        {
            label: "Pending Orders",
            value: summary?.pendingOrders,
            icon: Clock,
            tone: "orange",
            description: "Awaiting payment completion",
        },

        {
            label: "Total Refunded",
            value: money(summary?.totalRefundedPaise),
            icon: Undo2,
            tone: "red",
            description: "Gateway confirmed refunds",
        },

        {
            label: "Coupon Redemptions",
            value: summary?.couponRedemptions,
            icon: TicketPercent,
            tone: "purple",
            description: "Free membership activations",
        },

        {
            label: "Total Discounts",
            value: money(summary?.totalDiscountPaise),
            icon: IndianRupee,
            tone: "orange",
            description: "Coupon savings recorded",
        },
    ];

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <main className="ap-page">

            {/* HERO */}

            <section className="ap-hero">

                <div className="ap-hero-content">

                    <div className="ap-eyebrow">
                        <ShieldCheck size={16} />
                        FINANCE & TRANSACTIONS
                    </div>

                    <h1>Payment Management</h1>

                    <p>
                        Manage membership payments, coupon
                        redemptions, orders and refunds.
                    </p>

                    <button
                        className="ap-hero-button"
                        onClick={refresh}
                        disabled={loading || busy}
                    >
                        <RefreshCw
                            size={17}
                            className={
                                loading ? "ap-spin" : ""
                            }
                        />
                        Refresh Data
                    </button>

                </div>

                <div className="ap-hero-art">
                    <div className="ap-hero-orbit">
                        <CreditCard size={65} />
                    </div>
                </div>

            </section>

            {/* STATS */}

            <section className="ap-stats-grid">

                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        {...stat}
                        value={
                            summaryLoading
                                ? "..."
                                : stat.value ?? "—"
                        }
                    />
                ))}

            </section>

            {/* SUMMARY ERROR */}

            {summaryError && (
                <div className="ap-alert ap-alert-error" role="alert">
                    <AlertCircle size={19} />
                    <span>
                        Statistics unavailable: {summaryError}
                    </span>
                </div>
            )}

            {/* FINANCE OVERVIEW */}

            <section className="ap-overview">

                <DetailItem
                    label="Gross revenue"
                    value={money(summary?.grossRevenuePaise)}
                />

                <DetailItem
                    label="Online payments"
                    value={summary?.onlinePayments}
                />

                <DetailItem
                    label="Refunds awaiting resolution"
                    value={summary?.refundPending}
                />

                <DetailItem
                    label="Completed refunds"
                    value={summary?.refundedPayments}
                />

            </section>

            {/* ALERTS */}

            {error && (
                <div
                    className="ap-alert ap-alert-error"
                    role="alert"
                >
                    <AlertCircle size={19} />

                    <span>{error}</span>

                    <button
                        className="ap-alert-close"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {notice && (
                <div
                    className="ap-alert ap-alert-info"
                    role="status"
                >
                    <AlertCircle size={19} />

                    <span>{notice}</span>

                    <button
                        className="ap-alert-close"
                        onClick={() => setNotice("")}
                        aria-label="Dismiss notification"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* MAIN PANEL */}

            <section className="ap-panel">

                <div className="ap-panel-heading">

                    <div>
                        <h2>Payment Activity</h2>
                        <p>
                            View transactions and manage
                            payment operations.
                        </p>
                    </div>

                    <span className="ap-record-count">
                        {total} Records
                    </span>

                </div>

                {/* TABS */}

                <div className="ap-tabs">

                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`ap-tab ${
                                tab === id
                                    ? "ap-tab-active"
                                    : ""
                            }`}
                            onClick={() => changeTab(id)}
                            disabled={busy}
                            aria-pressed={tab === id}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}

                </div>

                {/* FILTERS */}

                <div className="ap-toolbar">

                    {tab === "payments" ? (

                        <div className="ap-search">

                            <Search size={19} />

                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search transaction, member ID, coupon..."
                                aria-label="Search payments"
                            />

                            {search && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setPage(0);
                                    }}
                                    aria-label="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}

                        </div>

                    ) : (

                        <p className="ap-filter-hint">
                            {tab === "orders"
                                ? "Verify and recover captured payment orders."
                                : "Track and reconcile existing refund requests."}
                        </p>

                    )}

                    <select
                        className="ap-select"
                        value={status}
                        disabled={busy}
                        aria-label="Filter by status"
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setPage(0);
                        }}
                    >

                        <option value="">
                            All Statuses
                        </option>

                        {STATUS_OPTIONS[tab].map((value) => (
                            <option key={value} value={value}>
                                {value.replace(/_/g, " ")}
                            </option>
                        ))}

                    </select>

                </div>

                {/* LOADING */}

                {loading ? (

                    <div className="ap-empty">
                        <LoaderCircle
                            size={35}
                            className="ap-spin"
                        />
                        <h3>Loading records...</h3>
                        <p>Please wait.</p>
                    </div>

                ) : rows.length === 0 ? (

                    <div className="ap-empty">
                        <Receipt size={40} />
                        <h3>No records found</h3>
                        <p>
                            {error
                                ? "Unable to load records."
                                : "No matching records available."}
                        </p>
                    </div>

                ) : (

                    <div className="ap-table-wrapper">

                        {/* TRANSACTIONS TABLE */}

                        {tab === "payments" && (

                            <table className="ap-table">

                                <thead>
                                    <tr>
                                        <th>Transaction</th>
                                        <th>Member</th>
                                        <th>Method</th>
                                        <th>Coupon</th>
                                        <th>Discount</th>
                                        <th>Paid Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {rows.map((payment) => (

                                        <tr key={payment.id}>

                                            <td>
                                                <div className="ap-transaction">

                                                    <div className="ap-transaction-icon">
                                                        <CreditCard size={18} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {getTransactionId(payment)}
                                                        </strong>

                                                        <small>
                                                            {date(payment.createdAt)}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                #{payment.userId}
                                            </td>

                                            <td>
                                                {getPaymentMethod(payment)}
                                            </td>

                                            <td>
                                                {payment.couponCode ? (
                                                    <span className="ap-coupon">
                                                        {payment.couponCode}
                                                    </span>
                                                ) : "—"}
                                            </td>

                                            <td className="ap-discount">
                                                {money(payment.discountPaise)}
                                            </td>

                                            <td className="ap-amount">
                                                {money(payment.paidPaise)}
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={getPaymentStatus(payment)}
                                                />
                                            </td>

                                            <td>
                                                <div className="ap-actions">

                                                    {canDownloadReceipt(payment) && (
                                                        <>
                                                            <button
                                                                className="ap-icon-button"
                                                                title="View receipt"
                                                                aria-label="View receipt"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    openReceipt(payment)
                                                                }
                                                            >
                                                                <Eye size={17} />
                                                            </button>

                                                            <button
                                                                className="ap-icon-button"
                                                                title="Download receipt"
                                                                aria-label="Download receipt"
                                                                disabled={busy}
                                                                onClick={() =>
                                                                    downloadReceipt(payment.id)
                                                                }
                                                            >
                                                                <Download size={17} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {canRefund(payment) && (
                                                        <button
                                                            className="ap-action-refund"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                openRefund(payment)
                                                            }
                                                        >
                                                            <Undo2 size={15} />
                                                            Refund
                                                        </button>
                                                    )}

                                                    {[
                                                        "REFUND_PENDING",
                                                        "REFUNDED",
                                                    ].includes(
                                                        getPaymentStatus(payment)
                                                    ) && (
                                                        <button
                                                            className="ap-action-primary"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                openRefundByPayment(payment)
                                                            }
                                                        >
                                                            Refund Details
                                                        </button>
                                                    )}

                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                        {/* PAYMENT ORDERS TABLE */}

                        {tab === "orders" && (

                            <table className="ap-table">

                                <thead>
                                    <tr>
                                        <th>Order Reference</th>
                                        <th>Member</th>
                                        <th>Plan</th>
                                        <th>Coupon</th>
                                        <th>Payable</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {rows.map((order) => (

                                        <tr key={order.id}>

                                            <td>
                                                <div className="ap-cell-stack">

                                                    <strong>
                                                        {order.orderReference}
                                                    </strong>

                                                    <small>
                                                        {order.razorpayOrderId || "No gateway order"}
                                                    </small>

                                                    <small>
                                                        {date(order.createdAt)}
                                                    </small>

                                                </div>
                                            </td>

                                            <td>#{order.userId}</td>

                                            <td>
                                                {order.planName}
                                            </td>

                                            <td>
                                                {order.couponCode || "—"}
                                            </td>

                                            <td className="ap-amount">
                                                {money(order.payablePaise)}
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                            </td>

                                            <td>
                                                <div className="ap-actions">

                                                    <button
                                                        className="ap-icon-button"
                                                        disabled={busy}
                                                        title="Order details"
                                                        aria-label="Order details"
                                                        onClick={() => {
                                                            setModalError("");
                                                            setModal({
                                                                type: "order-details",
                                                                data: order,
                                                            });
                                                        }}
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {[
                                                        "PENDING",
                                                        "CAPTURED",
                                                    ].includes(order.status) &&
                                                        order.razorpayOrderId && (

                                                        <button
                                                            className="ap-action-primary"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                reconcileOrder(order)
                                                            }
                                                        >
                                                            <RefreshCw size={15} />
                                                            Verify
                                                        </button>

                                                    )}

                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                        {/* REFUNDS TABLE */}

                        {tab === "refunds" && (

                            <table className="ap-table">

                                <thead>
                                    <tr>
                                        <th>Refund Reference</th>
                                        <th>Payment</th>
                                        <th>Member</th>
                                        <th>Amount</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {rows.map((refund) => (

                                        <tr key={refund.id}>

                                            <td>
                                                <div className="ap-cell-stack">

                                                    <strong>
                                                        {refund.refundReference}
                                                    </strong>

                                                    <small>
                                                        {refund.razorpayRefundId || "Awaiting gateway ID"}
                                                    </small>

                                                    <small>
                                                        {date(refund.createdAt)}
                                                    </small>

                                                </div>
                                            </td>

                                            <td>
                                                #{refund.paymentId}
                                            </td>

                                            <td>
                                                #{refund.userId}
                                            </td>

                                            <td className="ap-refund-amount">
                                                {money(refund.amountPaise)}
                                            </td>

                                            <td>
                                                <span
                                                    className="ap-reason-text"
                                                    title={refund.reason}
                                                >
                                                    {refund.reason}
                                                </span>
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={refund.status}
                                                />
                                            </td>

                                            <td>
                                                <div className="ap-actions">

                                                    <button
                                                        className="ap-icon-button"
                                                        title="Refund details"
                                                        aria-label="Refund details"
                                                        disabled={busy}
                                                        onClick={() => {
                                                            setModalError("");
                                                            setModal({
                                                                type: "refund-details",
                                                                data: refund,
                                                            });
                                                        }}
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {refund.status !== "PROCESSED" && (
                                                        <button
                                                            className="ap-action-primary"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                reconcileRefund(refund)
                                                            }
                                                        >
                                                            <RefreshCw size={15} />
                                                            Verify
                                                        </button>
                                                    )}

                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                    </div>

                )}

                {!loading && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        disabled={busy}
                        onChange={setPage}
                    />
                )}

            </section>

            {/* SECURITY NOTE */}

            <section className="ap-security-note">

                <div className="ap-security-icon">
                    <ShieldCheck size={24} />
                </div>

                <div>
                    <h3>Secure Payment Operations</h3>
                    <p>
                        Refunds are verified through Razorpay.
                        Reconciliation checks existing transactions
                        without creating another refund.
                    </p>
                </div>

            </section>

            {/* REFUND REQUEST MODAL */}

            {modal?.type === "refund-request" && (

                <Modal
                    title="Confirm Refund"
                    subtitle="Review the transaction before proceeding."
                    onClose={closeModal}
                    busy={busy}
                >

                    <form onSubmit={submitRefund}>

                        <div className="ap-refund-preview">

                            <div className="ap-refund-preview-icon">
                                <Undo2 size={28} />
                            </div>

                            <span>Full refund amount</span>

                            <h2>
                                {money(modal.data.paidPaise)}
                            </h2>

                            <small>
                                Refund to original payment method
                            </small>

                        </div>

                        <div className="ap-details-grid">

                            <DetailItem
                                label="Transaction ID"
                                value={getTransactionId(modal.data)}
                            />

                            <DetailItem
                                label="Member ID"
                                value={`#${modal.data.userId}`}
                            />

                            <DetailItem
                                label="Payment Method"
                                value={getPaymentMethod(modal.data)}
                            />

                            <DetailItem
                                label="Coupon Discount"
                                value={money(modal.data.discountPaise)}
                            />

                        </div>

                        <div className="ap-warning-box">

                            <AlertCircle size={21} />

                            <p>
                                This requests a full refund through
                                Razorpay. Membership validity is not
                                automatically cancelled. Refunds may
                                take time to process.
                            </p>

                        </div>

                        <label
                            className="ap-field-label"
                            htmlFor="refund-reason"
                        >
                            Refund reason *
                        </label>

                        <textarea
                            id="refund-reason"
                            className="ap-textarea"
                            value={refundReason}
                            onChange={(event) =>
                                setRefundReason(event.target.value)
                            }
                            placeholder="Enter the reason for this refund..."
                            minLength={5}
                            maxLength={500}
                            disabled={busy}
                            required
                        />

                        <div className="ap-character-count">
                            {refundReason.length}/500
                        </div>

                        <label className="ap-confirm-check">

                            <input
                                type="checkbox"
                                checked={confirmed}
                                disabled={busy}
                                onChange={(event) =>
                                    setConfirmed(event.target.checked)
                                }
                            />

                            <span>
                                I confirm that this full refund
                                is authorized and the amount
                                is correct.
                            </span>

                        </label>

                        {modalError && (
                            <div
                                className="ap-alert ap-alert-error"
                                role="alert"
                            >
                                <AlertCircle size={18} />
                                <span>{modalError}</span>
                            </div>
                        )}

                        <div className="ap-modal-footer">

                            <button
                                type="button"
                                className="ap-button-secondary"
                                disabled={busy}
                                onClick={closeModal}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="ap-button-danger"
                                disabled={
                                    busy ||
                                    !confirmed ||
                                    refundReason.trim().length < 5 ||
                                    refundReason.trim().length > 500
                                }
                            >
                                {busy ? (
                                    <LoaderCircle
                                        size={17}
                                        className="ap-spin"
                                    />
                                ) : (
                                    <Undo2 size={17} />
                                )}

                                {busy
                                    ? "Submitting..."
                                    : "Confirm Full Refund"}
                            </button>

                        </div>

                    </form>

                </Modal>

            )}

            {/* REFUND DETAILS MODAL */}

            {modal?.type === "refund-details" && (

                <Modal
                    title="Refund Details"
                    subtitle="Gateway refund information and status."
                    onClose={closeModal}
                    busy={busy}
                >

                    <div className="ap-refund-preview">

                        <Undo2 size={28} />

                        <span>Refund Amount</span>

                        <h2>
                            {money(modal.data.amountPaise)}
                        </h2>

                        <StatusBadge status={modal.data.status} />

                    </div>

                    <div className="ap-details-grid">

                        <DetailItem
                            label="Refund ID"
                            value={`#${modal.data.id}`}
                        />

                        <DetailItem
                            label="Payment ID"
                            value={`#${modal.data.paymentId}`}
                        />

                        <DetailItem
                            label="Refund Reference"
                            value={modal.data.refundReference}
                        />

                        <DetailItem
                            label="Razorpay Refund ID"
                            value={modal.data.razorpayRefundId}
                        />

                        <DetailItem
                            label="Member ID"
                            value={modal.data.userId}
                        />

                        <DetailItem
                            label="Requested By Admin"
                            value={modal.data.requestedBy}
                        />

                        <DetailItem
                            label="Requested On"
                            value={date(modal.data.createdAt)}
                        />

                        <DetailItem
                            label="Processed On"
                            value={date(modal.data.processedAt)}
                        />

                        <DetailItem
                            label="Last Checked"
                            value={date(modal.data.lastCheckedAt)}
                        />

                        <DetailItem
                            label="Gateway Payment ID"
                            value={modal.data.razorpayPaymentId}
                        />

                    </div>

                    <div className="ap-reason-box">
                        <span>Refund Reason</span>
                        <p>{modal.data.reason}</p>
                    </div>

                    {modal.data.failureReason && (
                        <div className="ap-warning-box">
                            <AlertCircle size={20} />
                            <p>{modal.data.failureReason}</p>
                        </div>
                    )}

                    {modalError && (
                        <div
                            className="ap-alert ap-alert-error"
                            role="alert"
                        >
                            <AlertCircle size={18} />
                            <span>{modalError}</span>
                        </div>
                    )}

                    <div className="ap-modal-footer">

                        <button
                            className="ap-button-secondary"
                            onClick={closeModal}
                            disabled={busy}
                        >
                            Close
                        </button>

                        {modal.data.status !== "PROCESSED" && (
                            <button
                                className="ap-button-primary"
                                disabled={busy}
                                onClick={() =>
                                    reconcileRefund(modal.data)
                                }
                            >
                                <RefreshCw
                                    size={17}
                                    className={busy ? "ap-spin" : ""}
                                />
                                Check Refund Status
                            </button>
                        )}

                    </div>

                </Modal>

            )}

            {/* ORDER DETAILS MODAL */}

            {modal?.type === "order-details" && (

                <Modal
                    title="Payment Order Details"
                    subtitle="Membership checkout information."
                    onClose={closeModal}
                    busy={busy}
                >

                    <div className="ap-receipt-banner">

                        <CreditCard size={30} />

                        <div>
                            <span>Payable Amount</span>
                            <h2>{money(modal.data.payablePaise)}</h2>
                        </div>

                        <StatusBadge status={modal.data.status} />

                    </div>

                    <div className="ap-details-grid">

                        <DetailItem
                            label="Order ID"
                            value={modal.data.id}
                        />

                        <DetailItem
                            label="Member ID"
                            value={modal.data.userId}
                        />

                        <DetailItem
                            label="Order Reference"
                            value={modal.data.orderReference}
                        />

                        <DetailItem
                            label="Razorpay Order ID"
                            value={modal.data.razorpayOrderId}
                        />

                        <DetailItem
                            label="Membership Plan"
                            value={modal.data.planName}
                        />

                        <DetailItem
                            label="Membership Days"
                            value={modal.data.membershipDays}
                        />

                        <DetailItem
                            label="Original Amount"
                            value={money(modal.data.originalPaise)}
                        />

                        <DetailItem
                            label="Discount"
                            value={money(modal.data.discountPaise)}
                        />

                        <DetailItem
                            label="Coupon"
                            value={modal.data.couponCode}
                        />

                        <DetailItem
                            label="Created On"
                            value={date(modal.data.createdAt)}
                        />

                        <DetailItem
                            label="Gateway Payment ID"
                            value={modal.data.razorpayPaymentId}
                        />

                        <DetailItem
                            label="Completed On"
                            value={date(modal.data.completedAt)}
                        />

                    </div>

                    {modal.data.failureReason && (
                        <div className="ap-warning-box">
                            <AlertCircle size={20} />
                            <p>{modal.data.failureReason}</p>
                        </div>
                    )}

                    <div className="ap-modal-footer">

                        <button
                            className="ap-button-secondary"
                            onClick={closeModal}
                            disabled={busy}
                        >
                            Close
                        </button>

                    </div>

                </Modal>

            )}

            {/* RECEIPT MODAL */}

            {modal?.type === "receipt" && (

                <Modal
                    title="Payment Receipt"
                    subtitle={modal.data.receiptNumber}
                    onClose={closeModal}
                    busy={busy}
                >

                    <div className="ap-receipt-banner">

                        <Receipt size={30} />

                        <div>
                            <span>Total Paid</span>
                            <h2>{money(modal.data.paidPaise)}</h2>
                        </div>

                        <StatusBadge
                            status={modal.data.paymentStatus}
                        />

                    </div>

                    <div className="ap-details-grid">

                        <DetailItem
                            label="Member Name"
                            value={modal.data.memberName}
                        />

                        <DetailItem
                            label="Email"
                            value={modal.data.email}
                        />

                        <DetailItem
                            label="Transaction ID"
                            value={modal.data.transactionId}
                        />

                        <DetailItem
                            label="Payment Date"
                            value={date(modal.data.paymentDate)}
                        />

                        <DetailItem
                            label="Membership Plan"
                            value={modal.data.membershipPlan}
                        />

                        <DetailItem
                            label="Payment Method"
                            value={modal.data.paymentMethod}
                        />

                        <DetailItem
                            label="Membership Start"
                            value={modal.data.membershipStartDate}
                        />

                        <DetailItem
                            label="Membership End"
                            value={modal.data.membershipEndDate}
                        />

                        <DetailItem
                            label="Original Amount"
                            value={money(modal.data.originalPaise)}
                        />

                        <DetailItem
                            label="Discount"
                            value={money(modal.data.discountPaise)}
                        />

                    </div>

                    {modalError && (
                        <div
                            className="ap-alert ap-alert-error"
                            role="alert"
                        >
                            <AlertCircle size={18} />
                            <span>{modalError}</span>
                        </div>
                    )}

                    <div className="ap-modal-footer">

                        <button
                            className="ap-button-secondary"
                            onClick={closeModal}
                            disabled={busy}
                        >
                            Close
                        </button>

                        <button
                            className="ap-button-primary"
                            disabled={busy}
                            onClick={() =>
                                downloadReceipt(modal.data.paymentId)
                            }
                        >
                            <Download size={18} />
                            Download PDF
                        </button>

                    </div>

                </Modal>

            )}

        </main>
    );
}