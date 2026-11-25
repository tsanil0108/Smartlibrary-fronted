import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    Receipt,
    IndianRupee,
    Wallet,
    Clock3,
    ShieldCheck,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    BookOpen,
    BookX,
    Search,
    RefreshCw,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    ClipboardList,
    CircleDollarSign,
} from "lucide-react";

import {
    adminFineApi,
    formatFineMoney,
    formatFineDate,
} from "../../services/adminFineApi";

import "../../styles/admin/AdminFines.css";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
    "ALL",
    "PENDING",
    "PAID",
    "WAIVED",
];

const TYPE_LABELS = {
    OVERDUE: "Overdue",
    DAMAGED: "Damaged book",
    LOST: "Lost book",
};


// ==========================================
// STATUS BADGE
// ==========================================

function FineStatus({ status }) {

    return (

        <span
            className={`af-status af-status-${String(
                status || "unknown"
            ).toLowerCase()}`}
        >

            <span className="af-status-dot" />

            {status || "Unknown"}

        </span>

    );

}


// ==========================================
// FINE TYPE
// ==========================================

function FineType({ type }) {

    const Icon =
        type === "OVERDUE"
            ? Clock3
            : type === "DAMAGED"
                ? AlertTriangle
                : BookX;

    return (

        <span
            className={`af-type af-type-${String(
                type || "unknown"
            ).toLowerCase()}`}
        >

            <Icon size={14} />

            {TYPE_LABELS[type] || type || "Unknown"}

        </span>

    );

}


// ==========================================
// DETAIL ITEM
// ==========================================

function DetailItem({ label, value }) {

    return (

        <div className="af-detail-item">

            <span>{label}</span>

            <strong>{value ?? "—"}</strong>

        </div>

    );

}


// ==========================================
// FINE DETAILS MODAL
// ==========================================

function FineDetailsModal({
    fine,
    onClose,
    onPay,
    onWaive,
}) {

    return (

        <div className="af-overlay">

            <section
                className="af-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="af-details-title"
            >

                <header className="af-modal-header">

                    <div className="af-icon af-purple">

                        <Receipt size={25} />

                    </div>

                    <div className="af-modal-heading">

                        <h2 id="af-details-title">

                            Fine details

                        </h2>

                        <p>

                            Library fine #{fine.id}

                        </p>

                    </div>

                    <button
                        className="af-icon-button"
                        onClick={onClose}
                        aria-label="Close details"
                    >

                        <X size={21} />

                    </button>

                </header>

                <div className="af-modal-body">

                    <div className="af-receipt-hero">

                        <CircleDollarSign size={34} />

                        <span>FINE AMOUNT</span>

                        <h2>

                            {formatFineMoney(fine.amount)}

                        </h2>

                        <FineStatus status={fine.status} />

                    </div>

                    <div className="af-detail-grid">

                        <DetailItem
                            label="Fine ID"
                            value={`#${fine.id}`}
                        />

                        <DetailItem
                            label="Member name"
                            value={
                                fine.memberName ||
                                `Member #${fine.userId}`
                            }
                        />

                        <DetailItem
                            label="Book title"
                            value={fine.bookTitle}
                        />

                        <DetailItem
                            label="Loan ID"
                            value={fine.loanId}
                        />

                        <DetailItem
                            label="Fine type"
                            value={
                                TYPE_LABELS[fine.type] ||
                                fine.type
                            }
                        />

                        <DetailItem
                            label="Overdue days"
                            value={fine.overdueDays}
                        />

                        <DetailItem
                            label="Created on"
                            value={formatFineDate(
                                fine.createdAt
                            )}
                        />

                        <DetailItem
                            label="Payment method"
                            value={fine.paymentMethod}
                        />

                        {fine.paidAt && (

                            <DetailItem
                                label="Paid on"
                                value={formatFineDate(
                                    fine.paidAt
                                )}
                            />

                        )}

                        {fine.waivedAt && (

                            <DetailItem
                                label="Waived on"
                                value={formatFineDate(
                                    fine.waivedAt
                                )}
                            />

                        )}

                    </div>

                    {fine.description && (

                        <div className="af-description">

                            <strong>Description</strong>

                            <p>{fine.description}</p>

                        </div>

                    )}

                    {fine.waiverReason && (

                        <div className="af-waiver-note">

                            <ShieldCheck size={21} />

                            <div>

                                <strong>Waiver reason</strong>

                                <p>{fine.waiverReason}</p>

                            </div>

                        </div>

                    )}

                </div>

                <footer className="af-modal-footer">

                    <button
                        className="af-secondary"
                        onClick={onClose}
                    >

                        Close

                    </button>

                    {fine.status === "PENDING" && (

                        <>

                            <button
                                className="af-secondary"
                                onClick={() => onWaive(fine)}
                            >

                                <ShieldCheck size={17} />

                                Waive fine

                            </button>

                            <button
                                className="af-pay-button"
                                onClick={() => onPay(fine)}
                            >

                                <CheckCircle2 size={17} />

                                Mark as paid

                            </button>

                        </>

                    )}

                </footer>

            </section>

        </div>

    );

}


// ==========================================
// PAYMENT & WAIVER CONFIRMATION
// ==========================================

function FineActionModal({
    fine,
    type,
    onClose,
    onSuccess,
}) {

    const [reason, setReason] = useState("");

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const isWaive = type === "waive";

    async function handleSubmit(event) {

        event.preventDefault();

        if (saving) return;

        if (isWaive && !reason.trim()) {

            setError("Please enter a waiver reason.");

            return;

        }

        setSaving(true);
        setError("");

        try {

            if (isWaive) {

                await adminFineApi.waiveFine(
                    fine.id,
                    reason.trim()
                );

            } else {

                await adminFineApi.markAsPaid(fine.id);

            }

            onSuccess(
                isWaive
                    ? `Fine #${fine.id} waived successfully.`
                    : `Fine #${fine.id} marked as paid.`
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to update fine."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="af-overlay">

            <section
                className="af-modal af-small-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="af-action-title"
            >

                <form onSubmit={handleSubmit}>

                    <header className="af-modal-header">

                        <div className={
                            `af-icon ${
                                isWaive
                                    ? "af-purple"
                                    : "af-green"
                            }`
                        }>

                            {isWaive ? (

                                <ShieldCheck size={25} />

                            ) : (

                                <CheckCircle2 size={25} />

                            )}

                        </div>

                        <div className="af-modal-heading">

                            <h2 id="af-action-title">

                                {isWaive
                                    ? "Waive library fine"
                                    : "Confirm fine payment"}

                            </h2>

                            <p>

                                Fine #{fine.id}

                            </p>

                        </div>

                        <button
                            type="button"
                            className="af-icon-button"
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Close"
                        >

                            <X size={20} />

                        </button>

                    </header>

                    <div className="af-modal-body">

                        <div className="af-action-summary">

                            <span>Fine amount</span>

                            <strong>

                                {formatFineMoney(
                                    fine.amount
                                )}

                            </strong>

                            <p>

                                {fine.memberName ||
                                    `Member #${fine.userId}`}

                            </p>

                            <small>

                                {fine.bookTitle}

                            </small>

                        </div>

                        {isWaive ? (

                            <>

                                <div className="af-warning">

                                    <AlertTriangle size={20} />

                                    <p>

                                        Waiving this fine removes
                                        the member's outstanding
                                        obligation for this record.

                                    </p>

                                </div>

                                <div className="af-field">

                                    <label htmlFor="af-reason">

                                        Waiver reason *

                                    </label>

                                    <textarea
                                        id="af-reason"
                                        value={reason}
                                        onChange={event =>
                                            setReason(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter the reason for waiving this fine..."
                                        rows={4}
                                        maxLength={500}
                                        required
                                    />

                                    <small>

                                        {reason.length}/500 characters

                                    </small>

                                </div>

                            </>

                        ) : (

                            <div className="af-warning">

                                <AlertTriangle size={20} />

                                <p>

                                    Confirm only after the fine
                                    amount has actually been
                                    received. This action records
                                    payment; it does not collect
                                    money online.

                                </p>

                            </div>

                        )}

                        {error && (

                            <div
                                className="af-error"
                                role="alert"
                            >

                                <AlertCircle size={18} />

                                {error}

                            </div>

                        )}

                    </div>

                    <footer className="af-modal-footer">

                        <button
                            type="button"
                            className="af-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >

                            Cancel

                        </button>

                        <button
                            type="submit"
                            className={
                                isWaive
                                    ? "af-primary"
                                    : "af-pay-button"
                            }
                            disabled={saving}
                        >

                            {saving ? (

                                <LoaderCircle
                                    size={18}
                                    className="af-spin"
                                />

                            ) : isWaive ? (

                                <ShieldCheck size={18} />

                            ) : (

                                <CheckCircle2 size={18} />

                            )}

                            {saving
                                ? "Processing..."
                                : isWaive
                                    ? "Confirm waiver"
                                    : "Confirm payment"}

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );

}


// ==========================================
// MAIN PAGE
// ==========================================

export default function AdminFines() {

    const [fines, setFines] = useState([]);

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [summaryError, setSummaryError] = useState("");

    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState("ALL");

    const [fineType, setFineType] = useState("ALL");

    const [page, setPage] = useState(0);

    const [modal, setModal] = useState(null);

    const [serverTotal, setServerTotal] = useState(null);

    const [refresh, setRefresh] = useState(0);

    const reload = useCallback(() => {

        setRefresh(value => value + 1);

    }, []);


    // ======================================
    // LOAD FINES AND SUMMARY
    // ======================================

    useEffect(() => {

        let active = true;

        setLoading(true);
        setError("");
        setSummaryError("");

        Promise.allSettled([

            adminFineApi.getFines(),

            adminFineApi.getSummary(),

        ]).then(([fineResult, summaryResult]) => {

            if (!active) return;

            if (fineResult.status === "fulfilled") {

                const data = fineResult.value;

                const items = Array.isArray(data)
                    ? data
                    : data?.content;

                if (Array.isArray(items)) {

                    setFines(items);

                    setServerTotal(
                        data?.totalElements ??
                        data?.total ??
                        items.length
                    );

                } else {

                    setFines([]);
                    setServerTotal(null);
                    setError("Unexpected fine response.");

                }

            } else {

                setFines([]);
                setServerTotal(null);

                setError(
                    fineResult.reason?.message ||
                    "Unable to load fines."
                );

            }

            if (summaryResult.status === "fulfilled") {

                setSummary(summaryResult.value);

            } else {

                setSummary(null);

                setSummaryError(
                    "Fine summary could not be loaded."
                );

            }

            setLoading(false);

        });

        return () => {

            active = false;

        };

    }, [refresh]);


    // ======================================
    // STATISTICS
    // ======================================

    const stats = [

        {
            label: "Total fines",
            value: summary?.totalFines ?? "—",
            icon: Receipt,
            color: "purple",
            filter: "ALL",
        },

        {
            label: "Pending amount",
            value: formatFineMoney(
                summary?.pendingAmount
            ),
            icon: Clock3,
            color: "orange",
            filter: "PENDING",
        },

        {
            label: "Collected amount",
            value: formatFineMoney(
                summary?.paidAmount
            ),
            icon: Wallet,
            color: "green",
            filter: "PAID",
        },

        {
            label: "Waived amount",
            value: formatFineMoney(
                summary?.waivedAmount
            ),
            icon: ShieldCheck,
            color: "blue",
            filter: "WAIVED",
        },

    ];

    const counts = {

        ALL: summary?.totalFines,

        PENDING: summary?.pendingFines,

        PAID: summary?.paidFines,

        WAIVED: summary?.waivedFines,

    };


    // ======================================
    // SEARCH AND FILTER
    // ======================================

    const filteredFines = useMemo(() => {

        const query = search.trim().toLowerCase();

        return fines.filter(fine => {

            const searchable = [

                fine.id,

                fine.userId,

                fine.memberName,

                fine.bookTitle,

                fine.loanId,

                fine.type,

            ].filter(value => value != null)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                searchable.includes(query);

            const matchesStatus =
                status === "ALL" ||
                fine.status === status;

            const matchesType =
                fineType === "ALL" ||
                fine.type === fineType;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );

        });

    }, [fines, search, status, fineType]);

    const totalPages = Math.ceil(
        filteredFines.length / PAGE_SIZE
    );

    const currentPage = Math.min(
        page,
        Math.max(0, totalPages - 1)
    );

    const visibleFines = filteredFines.slice(

        currentPage * PAGE_SIZE,

        (currentPage + 1) * PAGE_SIZE

    );

    function changeStatus(value) {

        setStatus(value);
        setPage(0);

    }

    function openModal(type, fine) {

        setModal({ type, fine });

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

        <main className="af-page">

            {/* HEADER */}

            <header className="af-page-header">

                <div>

                    <span className="af-eyebrow">

                        LIBRARY ADMINISTRATION

                    </span>

                    <h1>Fine Management</h1>

                    <p>

                        Monitor library penalties and
                        manage outstanding payments.

                    </p>

                </div>

                <button
                    className="af-secondary"
                    onClick={reload}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={
                            loading ? "af-spin" : ""
                        }
                    />

                    Refresh

                </button>

            </header>


            {/* HERO */}

            <section className="af-hero">

                <div className="af-hero-content">

                    <span className="af-hero-tag">

                        <ShieldCheck size={15} />

                        FINANCIAL OPERATIONS

                    </span>

                    <h2>

                        Manage fines with confidence.

                    </h2>

                    <p>

                        Track overdue returns, damaged
                        books and outstanding library
                        penalties from one place.

                    </p>

                    <div className="af-hero-total">

                        <span>OUTSTANDING FINES</span>

                        <strong>

                            {loading
                                ? "—"
                                : formatFineMoney(
                                    summary?.pendingAmount
                                )}

                        </strong>

                    </div>

                </div>

                <div className="af-hero-art">

                    <ClipboardList
                        size={170}
                        strokeWidth={1}
                    />

                    <div className="af-hero-coin">

                        <IndianRupee size={46} />

                    </div>

                </div>

            </section>


            {/* STATS */}

            <section className="af-stats">

                {stats.map(item => {

                    const Icon = item.icon;

                    return (

                        <button
                            key={item.label}
                            className={
                                `af-stat ${
                                    status === item.filter
                                        ? "af-stat-selected"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                changeStatus(item.filter)
                            }
                            aria-pressed={
                                status === item.filter
                            }
                        >

                            <div className={
                                `af-icon af-${item.color}`
                            }>

                                <Icon size={24} />

                            </div>

                            <span>{item.label}</span>

                            <strong>

                                {loading
                                    ? "—"
                                    : item.value}

                            </strong>

                        </button>

                    );

                })}

            </section>


            {/* SUMMARY ERROR */}

            {summaryError && !loading && (

                <div className="af-warning">

                    <AlertCircle size={19} />

                    <p>{summaryError}</p>

                </div>

            )}


            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="af-message"
                    role="status"
                >

                    <CheckCircle2 size={20} />

                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >

                        <X size={18} />

                    </button>

                </div>

            )}


            {/* FINE TABLE */}

            <section className="af-panel">

                <header className="af-panel-header">

                    <div>

                        <h3>Fine records</h3>

                        <p>

                            Review and manage member fines.

                        </p>

                    </div>

                    <span className="af-count">

                        {fines.length} records loaded

                    </span>

                </header>


                {/* STATUS FILTERS */}

                <div className="af-tabs">

                    {STATUS_FILTERS.map(item => (

                        <button
                            key={item}
                            className={
                                status === item
                                    ? "af-tab af-tab-active"
                                    : "af-tab"
                            }
                            onClick={() =>
                                changeStatus(item)
                            }
                        >

                            {item === "ALL"
                                ? "All fines"
                                : item.charAt(0) +
                                  item.slice(1).toLowerCase()}

                            <span>

                                {counts[item] ?? "—"}

                            </span>

                        </button>

                    ))}

                </div>


                {/* SEARCH & TYPE FILTER */}

                <div className="af-toolbar">

                    <div className="af-search">

                        <Search size={19} />

                        <input
                            value={search}
                            placeholder="Search member, book or fine ID..."
                            aria-label="Search fines"
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

                    <select
                        value={fineType}
                        aria-label="Filter fine type"
                        onChange={event => {

                            setFineType(event.target.value);
                            setPage(0);

                        }}
                    >

                        <option value="ALL">

                            All fine types

                        </option>

                        <option value="OVERDUE">

                            Overdue

                        </option>

                        <option value="DAMAGED">

                            Damaged book

                        </option>

                        <option value="LOST">

                            Lost book

                        </option>

                    </select>

                </div>

                {serverTotal > fines.length && (

                    <div className="af-warning">

                        <AlertCircle size={18} />

                        <p>

                            Search and filters apply to
                            loaded records only.

                        </p>

                    </div>

                )}


                {/* LOADING */}

                {loading ? (

                    <div className="af-empty">

                        <LoaderCircle
                            size={42}
                            className="af-spin"
                        />

                        <h3>Loading fine records...</h3>

                    </div>

                ) : error ? (

                    <div className="af-empty">

                        <AlertCircle size={44} />

                        <h3>Unable to load fines</h3>

                        <p>{error}</p>

                        <button
                            className="af-primary"
                            onClick={reload}
                        >

                            Try again

                        </button>

                    </div>

                ) : visibleFines.length === 0 ? (

                    <div className="af-empty">

                        <Receipt size={52} />

                        <h3>No fines found</h3>

                        <p>

                            No fine records match your filters.

                        </p>

                        <button
                            className="af-secondary"
                            onClick={() => {

                                setSearch("");
                                setFineType("ALL");
                                changeStatus("ALL");

                            }}
                        >

                            Clear filters

                        </button>

                    </div>

                ) : (

                    <div className="af-table-wrapper">

                        <table className="af-table">

                            <thead>

                                <tr>

                                    <th>Fine ID</th>

                                    <th>Member</th>

                                    <th>Book</th>

                                    <th>Fine type</th>

                                    <th>Amount</th>

                                    <th>Created on</th>

                                    <th>Status</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {visibleFines.map(fine => (

                                    <tr key={fine.id}>

                                        <td>

                                            <strong>

                                                #{fine.id}

                                            </strong>

                                            <small>

                                                Loan #{fine.loanId ?? "—"}

                                            </small>

                                        </td>

                                        <td>

                                            <strong>

                                                {fine.memberName ||
                                                    `Member #${fine.userId}`}

                                            </strong>

                                            <small>

                                                Member ID: {fine.userId}

                                            </small>

                                        </td>

                                        <td>

                                            <div className="af-book">

                                                <div className="af-book-icon">

                                                    <BookOpen size={18} />

                                                </div>

                                                <div>

                                                    <strong>

                                                        {fine.bookTitle || "—"}

                                                    </strong>

                                                    {fine.type === "OVERDUE" && (

                                                        <small>

                                                            {fine.overdueDays ?? "—"} days overdue

                                                        </small>

                                                    )}

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <FineType type={fine.type} />

                                        </td>

                                        <td>

                                            <strong className="af-amount">

                                                {formatFineMoney(
                                                    fine.amount
                                                )}

                                            </strong>

                                        </td>

                                        <td>

                                            {formatFineDate(
                                                fine.createdAt
                                            )}

                                        </td>

                                        <td>

                                            <FineStatus
                                                status={fine.status}
                                            />

                                        </td>

                                        <td>

                                            <div className="af-actions">

                                                <button
                                                    className="af-icon-button"
                                                    title="View fine details"
                                                    aria-label="View fine details"
                                                    onClick={() =>
                                                        openModal(
                                                            "details",
                                                            fine
                                                        )
                                                    }
                                                >

                                                    <Eye size={18} />

                                                </button>

                                                {fine.status === "PENDING" && (

                                                    <>

                                                        <button
                                                            className="af-icon-button af-action-pay"
                                                            title="Mark as paid"
                                                            aria-label="Mark as paid"
                                                            onClick={() =>
                                                                openModal(
                                                                    "pay",
                                                                    fine
                                                                )
                                                            }
                                                        >

                                                            <CheckCircle2 size={18} />

                                                        </button>

                                                        <button
                                                            className="af-icon-button af-action-waive"
                                                            title="Waive fine"
                                                            aria-label="Waive fine"
                                                            onClick={() =>
                                                                openModal(
                                                                    "waive",
                                                                    fine
                                                                )
                                                            }
                                                        >

                                                            <ShieldCheck size={18} />

                                                        </button>

                                                    </>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* PAGINATION */}

                {!loading &&
                    !error &&
                    totalPages > 0 && (

                    <footer className="af-pagination">

                        <span>

                            Showing{" "}

                            {currentPage * PAGE_SIZE + 1}

                            {" "}to{" "}

                            {Math.min(
                                (currentPage + 1) * PAGE_SIZE,
                                filteredFines.length
                            )}

                            {" "}of{" "}

                            {filteredFines.length} fines

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


            {/* FINE DETAILS MODAL */}

            {modal?.type === "details" && (

                <FineDetailsModal
                    fine={modal.fine}
                    onClose={() => setModal(null)}
                    onPay={fine =>
                        openModal("pay", fine)
                    }
                    onWaive={fine =>
                        openModal("waive", fine)
                    }
                />

            )}


            {/* PAYMENT OR WAIVER MODAL */}

            {(modal?.type === "pay" ||
                modal?.type === "waive") && (

                <FineActionModal
                    key={`${modal.type}-${modal.fine.id}`}
                    fine={modal.fine}
                    type={modal.type}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />

            )}

        </main>

    );

}