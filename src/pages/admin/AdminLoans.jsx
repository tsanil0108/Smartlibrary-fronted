import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    BookOpen,
    BookCheck,
    BookCopy,
    Clock3,
    AlertTriangle,
    Search,
    RefreshCw,
    RotateCcw,
    ArrowDownLeft,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle2,
    AlertCircle,
    LoaderCircle,
    LibraryBig,
    IndianRupee,
    UserRound,
    Eye,
    ShieldCheck,
} from "lucide-react";

import {
    adminLoanApi,
    formatLoanDate,
    formatFine,
    getDaysRemaining,
    isOverdue,
} from "../../services/adminLoanApi";

import "../../styles/admin/AdminLoans.css";


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getBookTitle(loan) {
    return loan.bookTitle ||
        loan.book?.title ||
        `Book #${loan.bookId || "—"}`;
}

function getMemberName(loan) {
    return loan.memberName ||
        loan.userName ||
        loan.user?.name ||
        `Member #${loan.userId || "—"}`;
}

function getLoanStatus(loan) {
    return isOverdue(loan)
        ? "OVERDUE"
        : loan.status || "UNKNOWN";
}


// ==========================================
// STATUS BADGE
// ==========================================

function LoanStatus({ loan }) {

    const status = getLoanStatus(loan);

    return (

        <span className={
            `al-status al-status-${status.toLowerCase()}`
        }>

            <span className="al-status-dot" />

            {status}

        </span>

    );

}


// ==========================================
// DUE DATE
// ==========================================

function DueDate({ loan }) {

    const days = getDaysRemaining(loan.dueDate);

    return (

        <div className="al-date-cell">

            <strong>
                {formatLoanDate(loan.dueDate)}
            </strong>

            {loan.status === "ACTIVE" && days !== null && (

                <small className={
                    days < 0
                        ? "al-text-red"
                        : days <= 3
                            ? "al-text-orange"
                            : "al-text-green"
                }>

                    {days < 0
                        ? `${Math.abs(days)} days overdue`
                        : days === 0
                            ? "Due today"
                            : `${days} days remaining`}

                </small>

            )}

        </div>

    );

}


// ==========================================
// LOAN DETAILS MODAL
// ==========================================

function LoanDetails({ loan, onClose }) {

    const details = [

        ["Loan ID", `#${loan.id}`],

        ["Book", getBookTitle(loan)],

        ["Member", getMemberName(loan)],

        ["Book copy", loan.copyCode || loan.copyId || "—"],

        ["Issue date", formatLoanDate(loan.issueDate)],

        ["Due date", formatLoanDate(loan.dueDate)],

        ["Returned on", formatLoanDate(loan.returnedAt)],

        ["Renewals", loan.renewalCount ?? loan.renewCount ?? "—"],

    ];

    return (

        <div className="al-overlay">

            <section
                className="al-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="al-details-title"
            >

                <header className="al-modal-header">

                    <div className="al-icon al-purple">
                        <BookOpen size={25} />
                    </div>

                    <div className="al-modal-heading">

                        <h2 id="al-details-title">
                            Loan details
                        </h2>

                        <p>Book circulation information.</p>

                    </div>

                    <button
                        className="al-close"
                        onClick={onClose}
                        aria-label="Close details"
                    >
                        <X size={21} />
                    </button>

                </header>

                <div className="al-modal-body">

                    <div className="al-book-preview">

                        <div className="al-book-icon">
                            <BookOpen size={35} />
                        </div>

                        <div>

                            <h3>{getBookTitle(loan)}</h3>

                            <p>{getMemberName(loan)}</p>

                            <LoanStatus loan={loan} />

                        </div>

                    </div>

                    <div className="al-detail-grid">

                        {details.map(([label, value]) => (

                            <div
                                className="al-detail-item"
                                key={label}
                            >

                                <span>{label}</span>

                                <strong>{value}</strong>

                            </div>

                        ))}

                    </div>

                </div>

                <footer className="al-modal-footer">

                    <button
                        className="al-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>

                </footer>

            </section>

        </div>

    );

}


// ==========================================
// RETURN BOOK MODAL
// ==========================================

function ReturnBookModal({
    loan,
    onClose,
    onSuccess,
}) {

    const [condition, setCondition] = useState("GOOD");

    const [estimate, setEstimate] = useState(null);

    const [estimating, setEstimating] = useState(true);

    const [estimateError, setEstimateError] = useState("");

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {

        let active = true;

        setEstimating(true);
        setEstimate(null);
        setEstimateError("");
        setConfirmed(false);

        adminLoanApi.estimateFine(loan.id, condition)

            .then(data => {

                if (active) setEstimate(data);

            })

            .catch(err => {

                if (active) {
                    setEstimateError(err.message);
                }

            })

            .finally(() => {

                if (active) setEstimating(false);

            });

        return () => {
            active = false;
        };

    }, [loan.id, condition]);

    async function submit(event) {

        event.preventDefault();

        if (!confirmed || saving || estimating || !estimate) {
            return;
        }

        setSaving(true);
        setError("");

        try {

            await adminLoanApi.returnLoan(
                loan.id,
                condition
            );

            onSuccess(
                condition === "LOST"
                    ? "Book marked as lost successfully."
                    : "Book returned successfully."
            );

        } catch (err) {

            setError(
                err.message || "Unable to process return."
            );

        } finally {

            setSaving(false);

        }

    }

    const conditions = [

        {
            value: "GOOD",
            title: "Good condition",
            description: "Book returned without damage.",
            icon: BookCheck,
            color: "green",
        },

        {
            value: "DAMAGED",
            title: "Damaged book",
            description: "Book returned with physical damage.",
            icon: AlertTriangle,
            color: "orange",
        },

        {
            value: "LOST",
            title: "Lost book",
            description: "Book cannot be returned.",
            icon: AlertCircle,
            color: "red",
        },

    ];

    return (

        <div className="al-overlay">

            <section
                className="al-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="al-return-title"
            >

                <header className="al-modal-header">

                    <div className="al-icon al-green">
                        <ArrowDownLeft size={25} />
                    </div>

                    <div className="al-modal-heading">

                        <h2 id="al-return-title">
                            Process book return
                        </h2>

                        <p>Verify book condition and applicable fines.</p>

                    </div>

                    <button
                        className="al-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close return form"
                    >
                        <X size={21} />
                    </button>

                </header>

                <form onSubmit={submit}>

                    <div className="al-modal-body">

                        <div className="al-book-preview">

                            <div className="al-book-icon">
                                <BookOpen size={32} />
                            </div>

                            <div>

                                <h3>{getBookTitle(loan)}</h3>

                                <p>{getMemberName(loan)}</p>

                                <LoanStatus loan={loan} />

                            </div>

                        </div>

                        <h3 className="al-section-title">
                            Select book condition
                        </h3>

                        <div className="al-conditions">

                            {conditions.map(item => {

                                const Icon = item.icon;

                                return (

                                    <label
                                        key={item.value}
                                        className={
                                            `al-condition ${
                                                condition === item.value
                                                    ? "al-condition-selected"
                                                    : ""
                                            }`
                                        }
                                    >

                                        <input
                                            type="radio"
                                            name="condition"
                                            value={item.value}
                                            checked={condition === item.value}
                                            onChange={() =>
                                                setCondition(item.value)
                                            }
                                            disabled={saving}
                                        />

                                        <div className={
                                            `al-icon al-${item.color}`
                                        }>
                                            <Icon size={21} />
                                        </div>

                                        <div>

                                            <strong>{item.title}</strong>

                                            <p>{item.description}</p>

                                        </div>

                                    </label>

                                );

                            })}

                        </div>

                        {/* FINE ESTIMATION */}

                        <section className="al-fine-card">

                            <div className="al-fine-heading">

                                <IndianRupee size={21} />

                                <h3>Estimated fine</h3>

                            </div>

                            {estimating ? (

                                <div className="al-inline-loading">

                                    <LoaderCircle
                                        size={19}
                                        className="al-spin"
                                    />

                                    Calculating fine...

                                </div>

                            ) : estimateError ? (

                                <div className="al-message al-error">

                                    <AlertCircle size={18} />

                                    {estimateError}

                                </div>

                            ) : estimate ? (

                                <>

                                    <div className="al-fine-row">

                                        <span>Overdue days</span>

                                        <strong>
                                            {estimate.overdueDays ?? 0}
                                        </strong>

                                    </div>

                                    <div className="al-fine-row">

                                        <span>Overdue fine</span>

                                        <strong>
                                            {formatFine(estimate.overdueFine)}
                                        </strong>

                                    </div>

                                    <div className="al-fine-row">

                                        <span>Damage charge</span>

                                        <strong>
                                            {formatFine(estimate.damageCharge)}
                                        </strong>

                                    </div>

                                    <div className="al-fine-row">

                                        <span>Lost book charge</span>

                                        <strong>
                                            {formatFine(estimate.lostCharge)}
                                        </strong>

                                    </div>

                                    <div className="al-fine-total">

                                        <span>Total estimated fine</span>

                                        <strong>
                                            {formatFine(estimate.totalFine)}
                                        </strong>

                                    </div>

                                </>

                            ) : (

                                <p>Fine estimate unavailable.</p>

                            )}

                        </section>

                        <div className="al-warning">

                            <AlertTriangle size={20} />

                            <span>

                                {condition === "LOST"
                                    ? "Confirm the book is lost before completing this operation."
                                    : "Confirm that the physical book has been received and inspected."}

                                {" "}The backend calculates the final
                                applicable fine.

                            </span>

                        </div>

                        <label className="al-confirm-checkbox">

                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={e =>
                                    setConfirmed(e.target.checked)
                                }
                                disabled={saving}
                            />

                            I have verified the book condition.

                        </label>

                        {error && (

                            <div className="al-message al-error">

                                <AlertCircle size={18} />

                                {error}

                            </div>

                        )}

                    </div>

                    <footer className="al-modal-footer">

                        <button
                            type="button"
                            className="al-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="al-primary"
                            disabled={
                                saving ||
                                estimating ||
                                !estimate ||
                                !confirmed
                            }
                        >

                            {saving ? (

                                <LoaderCircle
                                    size={18}
                                    className="al-spin"
                                />

                            ) : (

                                <CheckCircle2 size={18} />

                            )}

                            {saving
                                ? "Processing..."
                                : condition === "LOST"
                                    ? "Confirm lost book"
                                    : "Confirm return"}

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );

}


// ==========================================
// RENEW LOAN MODAL
// ==========================================

function RenewLoanModal({
    loan,
    onClose,
    onSuccess,
}) {

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function renew() {

        if (saving) return;

        setSaving(true);
        setError("");

        try {

            await adminLoanApi.renewLoan(loan.id);

            onSuccess("Loan renewed successfully.");

        } catch (err) {

            setError(
                err.message || "Unable to renew loan."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="al-overlay">

            <section
                className="al-modal al-small-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="al-renew-title"
            >

                <div className="al-modal-body">

                    <div className="al-icon al-purple">
                        <RotateCcw size={25} />
                    </div>

                    <h2 id="al-renew-title">
                        Renew book loan?
                    </h2>

                    <p className="al-muted">

                        Extend the borrowing period for{" "}

                        <strong>{getBookTitle(loan)}</strong>.

                    </p>

                    <div className="al-detail-item">

                        <span>Current due date</span>

                        <strong>
                            {formatLoanDate(loan.dueDate)}
                        </strong>

                    </div>

                    <div className="al-warning">

                        <AlertCircle size={19} />

                        <span>
                            Renewal depends on membership validity,
                            renewal limits, overdue status and
                            pending reservations.
                        </span>

                    </div>

                    {error && (

                        <div className="al-message al-error">

                            <AlertCircle size={18} />

                            {error}

                        </div>

                    )}

                </div>

                <footer className="al-modal-footer">

                    <button
                        className="al-secondary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        className="al-primary"
                        onClick={renew}
                        disabled={saving}
                    >

                        {saving ? (

                            <LoaderCircle
                                size={18}
                                className="al-spin"
                            />

                        ) : (

                            <RotateCcw size={17} />

                        )}

                        {saving ? "Renewing..." : "Renew loan"}

                    </button>

                </footer>

            </section>

        </div>

    );

}


// ==========================================
// MAIN ADMIN LOANS PAGE
// ==========================================

export default function AdminLoans() {

    const [loans, setLoans] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("ALL");

    const [page, setPage] = useState(0);

    const [totalPages, setTotalPages] = useState(0);

    const [total, setTotal] = useState(null);

    const [modal, setModal] = useState(null);

    const [refresh, setRefresh] = useState(0);

    const pageSize = 10;

    const reload = useCallback(() => {

        setRefresh(value => value + 1);

    }, []);

    useEffect(() => {

        let active = true;

        setLoading(true);
        setError("");

        adminLoanApi.getLoans({
            page,
            size: pageSize,
        })

            .then(data => {

                if (!active) return;

                const items = Array.isArray(data)
                    ? data
                    : data?.content || [];

                setLoans(items);

                setTotal(
                    data?.totalElements ??
                    data?.total ??
                    (Array.isArray(data) ? items.length : null)
                );

                setTotalPages(
                    data?.totalPages ??
                    (items.length ? 1 : 0)
                );

            })

            .catch(err => {

                if (!active) return;

                setError(
                    err.message || "Unable to load loans."
                );

                setLoans([]);
                setTotal(null);
                setTotalPages(0);

            })

            .finally(() => {

                if (active) setLoading(false);

            });

        return () => {
            active = false;
        };

    }, [page, refresh]);

    const activeLoans = loans.filter(
        loan => loan.status === "ACTIVE"
    );

    const overdueLoans = loans.filter(isOverdue);

    const returnedLoans = loans.filter(
        loan => loan.status === "RETURNED"
    );

    const stats = [

        {
            label: "Total loan records",
            value: total ?? "—",
            icon: BookCopy,
            color: "purple",
        },

        {
            label: "Active on page",
            value: activeLoans.length,
            icon: BookOpen,
            color: "blue",
        },

        {
            label: "Returned on page",
            value: returnedLoans.length,
            icon: BookCheck,
            color: "green",
        },

        {
            label: "Overdue on page",
            value: overdueLoans.length,
            icon: Clock3,
            color: "red",
        },

    ];

    const filteredLoans = loans.filter(loan => {

        const query = search.trim().toLowerCase();

        const matchesSearch = [

            getBookTitle(loan),
            getMemberName(loan),
            loan.id,
            loan.copyCode,
            loan.userId,

        ].some(value =>
            String(value ?? "")
                .toLowerCase()
                .includes(query)
        );

        let matchesStatus = true;

        if (filter === "OVERDUE") {

            matchesStatus = isOverdue(loan);

        } else if (filter !== "ALL") {

            matchesStatus = loan.status === filter;

        }

        return matchesSearch && matchesStatus;

    });

    function handleSuccess(text) {

        setModal(null);
        setMessage(text);
        reload();

    }

    const tabs = [

        { value: "ALL", label: "All loans" },
        { value: "ACTIVE", label: "Active" },
        { value: "OVERDUE", label: "Overdue" },
        { value: "RETURNED", label: "Returned" },
        { value: "LOST", label: "Lost" },

    ];

    return (

        <main className="al-page">

            {/* PAGE HEADER */}

            <header className="al-page-header">

                <div>

                    <span className="al-eyebrow">
                        LIBRARY ADMINISTRATION
                    </span>

                    <h1>Loan & Circulation</h1>

                    <p>
                        Manage borrowed books, returns and renewals.
                    </p>

                </div>

                <button
                    className="al-secondary"
                    onClick={reload}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={loading ? "al-spin" : ""}
                    />

                    Refresh

                </button>

            </header>

            {/* HERO */}

            <section className="al-hero">

                <div className="al-hero-content">

                    <span>SMART CIRCULATION MANAGEMENT</span>

                    <h2>
                        Keep knowledge moving.
                    </h2>

                    <p>
                        Monitor borrowing activity, manage book
                        returns and maintain an organized library
                        circulation system.
                    </p>

                    <div className="al-hero-label">

                        <ShieldCheck size={18} />

                        Secure circulation management

                    </div>

                </div>

                <div className="al-hero-decoration">

                    <LibraryBig size={150} strokeWidth={0.8} />

                </div>

            </section>

            {/* STATISTICS */}

            <section className="al-stats">

                {stats.map(item => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="al-stat"
                            key={item.label}
                        >

                            <div className={`al-icon al-${item.color}`}>

                                <Icon size={24} />

                            </div>

                            <span>{item.label}</span>

                            <strong>

                                {loading || error
                                    ? "—"
                                    : item.value}

                            </strong>

                        </article>

                    );

                })}

            </section>

            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="al-message al-success"
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

            {/* OVERDUE ALERT */}

            {!loading && !error && overdueLoans.length > 0 && (

                <div className="al-overdue-alert">

                    <div className="al-icon al-orange">

                        <AlertTriangle size={24} />

                    </div>

                    <div>

                        <strong>
                            Overdue books require attention
                        </strong>

                        <p>
                            {overdueLoans.length} overdue loan(s)
                            on the current page.
                        </p>

                    </div>

                    <button
                        className="al-secondary"
                        onClick={() => setFilter("OVERDUE")}
                    >
                        View overdue
                    </button>

                </div>

            )}

            {/* MAIN PANEL */}

            <section className="al-panel">

                <header className="al-panel-header">

                    <div>

                        <h3>Circulation records</h3>

                        <p>
                            Track and manage library loan transactions.
                        </p>

                    </div>

                    <span className="al-count">
                        {total ?? "—"} records
                    </span>

                </header>

                {/* STATUS TABS */}

                <div className="al-tabs">

                    {tabs.map(tab => (

                        <button
                            key={tab.value}
                            className={
                                filter === tab.value
                                    ? "al-tab al-tab-active"
                                    : "al-tab"
                            }
                            onClick={() => setFilter(tab.value)}
                        >

                            {tab.label}

                        </button>

                    ))}

                </div>

                {/* SEARCH */}

                <div className="al-search">

                    <Search size={19} />

                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search book, member or loan ID..."
                        aria-label="Search loans"
                    />

                    {search && (

                        <button
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            <X size={17} />
                        </button>

                    )}

                </div>

                <p className="al-filter-note">
                    Search and status filters apply to the current page.
                </p>

                {/* LOADING */}

                {loading ? (

                    <div className="al-empty">

                        <LoaderCircle
                            size={40}
                            className="al-spin"
                        />

                        <h3>Loading circulation records...</h3>

                    </div>

                ) : error ? (

                    <div className="al-empty">

                        <AlertCircle size={40} />

                        <h3>Unable to load loans</h3>

                        <p>{error}</p>

                        <button
                            className="al-primary"
                            onClick={reload}
                        >
                            Try again
                        </button>

                    </div>

                ) : filteredLoans.length === 0 ? (

                    <div className="al-empty">

                        <BookOpen size={48} />

                        <h3>No loan records found</h3>

                        <p>
                            Try changing your search or status filter.
                        </p>

                        <button
                            className="al-secondary"
                            onClick={() => {
                                setSearch("");
                                setFilter("ALL");
                            }}
                        >
                            Reset filters
                        </button>

                    </div>

                ) : (

                    <div className="al-table-wrapper">

                        <table className="al-table">

                            <thead>

                                <tr>

                                    <th>Book / Loan ID</th>
                                    <th>Member</th>
                                    <th>Issue date</th>
                                    <th>Due date</th>
                                    <th>Status</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredLoans.map(loan => (

                                    <tr key={loan.id}>

                                        <td>

                                            <div className="al-book-cell">

                                                <div className="al-table-book-icon">

                                                    <BookOpen size={23} />

                                                </div>

                                                <div>

                                                    <strong>
                                                        {getBookTitle(loan)}
                                                    </strong>

                                                    <small>
                                                        Loan #{loan.id}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <div className="al-member-cell">

                                                <UserRound size={17} />

                                                <span>
                                                    {getMemberName(loan)}
                                                </span>

                                            </div>

                                        </td>

                                        <td>

                                            {formatLoanDate(loan.issueDate)}

                                        </td>

                                        <td>

                                            <DueDate loan={loan} />

                                        </td>

                                        <td>

                                            <LoanStatus loan={loan} />

                                        </td>

                                        <td>

                                            <div className="al-actions">

                                                <button
                                                    className="al-action al-blue"
                                                    title="View loan"
                                                    aria-label={`View loan ${loan.id}`}
                                                    onClick={() =>
                                                        setModal({
                                                            type: "details",
                                                            loan,
                                                        })
                                                    }
                                                >
                                                    <Eye size={17} />
                                                </button>

                                                {loan.status === "ACTIVE" && (

                                                    <>

                                                        <button
                                                            className="al-action al-purple"
                                                            title="Renew loan"
                                                            aria-label={`Renew loan ${loan.id}`}
                                                            disabled={isOverdue(loan)}
                                                            onClick={() =>
                                                                setModal({
                                                                    type: "renew",
                                                                    loan,
                                                                })
                                                            }
                                                        >
                                                            <RotateCcw size={17} />
                                                        </button>

                                                        <button
                                                            className="al-action al-green"
                                                            title="Return book"
                                                            aria-label={`Return loan ${loan.id}`}
                                                            onClick={() =>
                                                                setModal({
                                                                    type: "return",
                                                                    loan,
                                                                })
                                                            }
                                                        >
                                                            <ArrowDownLeft size={18} />
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

                {!loading && !error && totalPages > 0 && (

                    <footer className="al-pagination">

                        <span>
                            Showing {filteredLoans.length} of{" "}
                            {loans.length} records on this page
                        </span>

                        <div>

                            <button
                                disabled={page === 0}
                                onClick={() =>
                                    setPage(value => value - 1)
                                }
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={19} />
                            </button>

                            <span className="al-page-number">

                                {page + 1} / {totalPages}

                            </span>

                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() =>
                                    setPage(value => value + 1)
                                }
                                aria-label="Next page"
                            >
                                <ChevronRight size={19} />
                            </button>

                        </div>

                    </footer>

                )}

            </section>

            {/* MODALS */}

            {modal?.type === "details" && (

                <LoanDetails
                    loan={modal.loan}
                    onClose={() => setModal(null)}
                />

            )}

            {modal?.type === "return" && (

                <ReturnBookModal
                    loan={modal.loan}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />

            )}

            {modal?.type === "renew" && (

                <RenewLoanModal
                    loan={modal.loan}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />

            )}

        </main>

    );

}