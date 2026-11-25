import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    CalendarClock,
    CalendarDays,
    BookOpen,
    BookMarked,
    Clock3,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    AlertCircle,
    Search,
    RefreshCw,
    Eye,
    X,
    Users,
    UserRound,
    Timer,
    LoaderCircle,
    ChevronLeft,
    ChevronRight,
    ListOrdered,
    ShieldCheck,
    LibraryBig,
} from "lucide-react";

import {
    adminReservationApi,
    formatReservationDate,
    getExpiryTime,
} from "../../services/adminReservationApi";

import "../../styles/admin/AdminReservations.css";


// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    "ALL",
    "WAITING",
    "READY",
    "FULFILLED",
    "CANCELLED",
    "EXPIRED",
];

const STATUS_CONFIG = {

    WAITING: {
        label: "Waiting",
        icon: Clock3,
        color: "orange",
    },

    READY: {
        label: "Ready",
        icon: BookMarked,
        color: "blue",
    },

    FULFILLED: {
        label: "Fulfilled",
        icon: CheckCircle2,
        color: "green",
    },

    CANCELLED: {
        label: "Cancelled",
        icon: XCircle,
        color: "red",
    },

    EXPIRED: {
        label: "Expired",
        icon: Timer,
        color: "gray",
    },

};


// ========================================
// HELPER FUNCTIONS
// ========================================

function getBookTitle(item) {

    return item.bookTitle ||
        item.book?.title ||
        `Book #${item.bookId}`;

}

function getMemberName(item) {

    return item.memberName ||
        item.user?.name ||
        `Member #${item.userId}`;

}

function canCancel(item) {

    return ["WAITING", "READY"]
        .includes(item.status);

}


// ========================================
// STATUS BADGE
// ========================================

function ReservationStatus({ status }) {

    const config = STATUS_CONFIG[status];

    const Icon = config?.icon || AlertCircle;

    return (

        <span className={
            `ar-status ar-${config?.color || "gray"}`
        }>

            <Icon size={13} />

            {config?.label || status || "Unknown"}

        </span>

    );

}


// ========================================
// DETAILS MODAL
// ========================================

function ReservationDetails({
    reservation,
    onClose,
    onCancel,
}) {

    const details = [

        [
            "Reservation ID",
            `#${reservation.id}`,
        ],

        [
            "Book ID",
            reservation.bookId,
        ],

        [
            "Member ID",
            reservation.userId,
        ],

        [
            "Queue position",
            reservation.status === "WAITING"
                ? reservation.queuePosition ?? "—"
                : "—",
        ],

        [
            "Reserved on",
            formatReservationDate(
                reservation.createdAt
            ),
        ],

        [
            "Ready since",
            formatReservationDate(
                reservation.readyAt
            ),
        ],

        [
            "Expiry date",
            formatReservationDate(
                reservation.expiresAt
            ),
        ],

        [
            "Author",
            reservation.author || "—",
        ],

    ];

    return (

        <div className="ar-overlay">

            <section
                className="ar-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ar-details-title"
            >

                <header className="ar-modal-header">

                    <div className="ar-icon ar-purple">
                        <CalendarClock size={25} />
                    </div>

                    <div className="ar-modal-heading">

                        <h2 id="ar-details-title">
                            Reservation details
                        </h2>

                        <p>
                            Complete reservation information.
                        </p>

                    </div>

                    <button
                        className="ar-close"
                        onClick={onClose}
                        aria-label="Close details"
                    >
                        <X size={21} />
                    </button>

                </header>

                <div className="ar-modal-body">

                    <div className="ar-book-preview">

                        <div className="ar-preview-cover">

                            <BookOpen size={34} />

                        </div>

                        <div>

                            <h3>
                                {getBookTitle(reservation)}
                            </h3>

                            <p>
                                {getMemberName(reservation)}
                            </p>

                            <ReservationStatus
                                status={reservation.status}
                            />

                        </div>

                    </div>

                    <div className="ar-details-grid">

                        {details.map(([label, value]) => (

                            <div
                                className="ar-detail-item"
                                key={label}
                            >

                                <span>{label}</span>

                                <strong>
                                    {value ?? "—"}
                                </strong>

                            </div>

                        ))}

                    </div>

                    {reservation.status === "READY" && (

                        <div className="ar-ready-alert">

                            <Timer size={22} />

                            <div>

                                <strong>
                                    Collection window
                                </strong>

                                <p>
                                    {getExpiryTime(
                                        reservation.expiresAt
                                    )}
                                </p>

                            </div>

                        </div>

                    )}

                </div>

                <footer className="ar-modal-footer">

                    <button
                        className="ar-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    {canCancel(reservation) && (

                        <button
                            className="ar-danger"
                            onClick={() =>
                                onCancel(reservation)
                            }
                        >

                            <XCircle size={18} />

                            Cancel reservation

                        </button>

                    )}

                </footer>

            </section>

        </div>

    );

}


// ========================================
// CANCEL RESERVATION MODAL
// ========================================

function CancelReservationModal({
    reservation,
    onClose,
    onSuccess,
}) {

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    async function handleCancel() {

        if (saving) return;

        setSaving(true);
        setError("");

        try {

            await adminReservationApi
                .cancelReservation(reservation.id);

            onSuccess(
                "Reservation cancelled successfully."
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to cancel reservation."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="ar-overlay">

            <section
                className="ar-modal ar-small-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ar-cancel-title"
            >

                <div className="ar-modal-body">

                    <div className="ar-icon ar-red">

                        <AlertTriangle size={27} />

                    </div>

                    <h2 id="ar-cancel-title">
                        Cancel reservation?
                    </h2>

                    <p className="ar-muted">

                        You are about to cancel the
                        reservation for{" "}

                        <strong>
                            {getBookTitle(reservation)}
                        </strong>

                        {" "}requested by{" "}

                        <strong>
                            {getMemberName(reservation)}
                        </strong>.

                    </p>

                    <div className="ar-warning">

                        <AlertTriangle size={20} />

                        <span>

                            This action removes the member's
                            active reservation. The backend
                            will manage the reservation queue.

                        </span>

                    </div>

                    {error && (

                        <div className="ar-message ar-error">

                            <AlertCircle size={19} />

                            {error}

                        </div>

                    )}

                </div>

                <footer className="ar-modal-footer">

                    <button
                        className="ar-secondary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Keep reservation
                    </button>

                    <button
                        className="ar-danger"
                        onClick={handleCancel}
                        disabled={saving}
                    >

                        {saving ? (

                            <LoaderCircle
                                size={18}
                                className="ar-spin"
                            />

                        ) : (

                            <XCircle size={18} />

                        )}

                        {saving
                            ? "Cancelling..."
                            : "Confirm cancellation"}

                    </button>

                </footer>

            </section>

        </div>

    );

}


// ========================================
// MAIN PAGE
// ========================================

export default function AdminReservations() {

    const [reservations, setReservations] =
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

    const [refresh, setRefresh] =
        useState(0);

    const [totalRecords, setTotalRecords] =
        useState(null);

    const [, setClock] =
        useState(0);


    // ====================================
    // LOAD RESERVATIONS
    // ====================================

    const reload = useCallback(() => {

        setRefresh(value => value + 1);

    }, []);

    useEffect(() => {

        let active = true;

        setLoading(true);
        setError("");

        adminReservationApi.getReservations()

            .then(data => {

                if (!active) return;

                const items = Array.isArray(data)
                    ? data
                    : data?.content;

                if (!Array.isArray(items)) {
                    throw new Error(
                        "Unexpected reservation response."
                    );
                }

                setReservations(items);

                setTotalRecords(
                    data?.totalElements ??
                    data?.total ??
                    items.length
                );

            })

            .catch(err => {

                if (!active) return;

                setError(
                    err.message ||
                    "Unable to load reservations."
                );

                setReservations([]);
                setTotalRecords(null);

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


    // ====================================
    // LIVE EXPIRY COUNTDOWN
    // ====================================

    useEffect(() => {

        const timer = setInterval(() => {

            setClock(value => value + 1);

        }, 30000);

        return () => clearInterval(timer);

    }, []);


    // ====================================
    // STATISTICS
    // ====================================

    const counts = useMemo(() => {

        const result = {

            ALL: reservations.length,

            WAITING: 0,

            READY: 0,

            FULFILLED: 0,

            CANCELLED: 0,

            EXPIRED: 0,

        };

        reservations.forEach(item => {

            if (
                Object.prototype.hasOwnProperty.call(
                    STATUS_CONFIG,
                    item.status
                )
            ) {

                result[item.status] += 1;

            }

        });

        return result;

    }, [reservations]);

    const stats = [

        {
            label: "Total reservations",
            value: totalRecords ?? "—",
            icon: CalendarDays,
            color: "purple",
            filter: "ALL",
        },

        {
            label: "Waiting queue",
            value: counts.WAITING,
            icon: Clock3,
            color: "orange",
            filter: "WAITING",
        },

        {
            label: "Ready for pickup",
            value: counts.READY,
            icon: BookMarked,
            color: "blue",
            filter: "READY",
        },

        {
            label: "Fulfilled",
            value: counts.FULFILLED,
            icon: CheckCircle2,
            color: "green",
            filter: "FULFILLED",
        },

        {
            label: "Cancelled",
            value: counts.CANCELLED,
            icon: XCircle,
            color: "red",
            filter: "CANCELLED",
        },

        {
            label: "Expired",
            value: counts.EXPIRED,
            icon: Timer,
            color: "gray",
            filter: "EXPIRED",
        },

    ];


    // ====================================
    // SEARCH & FILTER
    // ====================================

    const filteredReservations = useMemo(() => {

        const query = search.trim().toLowerCase();

        return reservations

            .filter(item => {

                const matchesStatus =
                    filter === "ALL" ||
                    item.status === filter;

                const matchesSearch = [

                    item.id,

                    item.bookId,

                    item.userId,

                    getBookTitle(item),

                    getMemberName(item),

                    item.author,

                ].some(value =>

                    String(value ?? "")
                        .toLowerCase()
                        .includes(query)

                );

                return matchesStatus &&
                    matchesSearch;

            })

            .sort((a, b) => {

                return Number(b.id) -
                    Number(a.id);

            });

    }, [reservations, search, filter]);

    const totalPages = Math.ceil(
        filteredReservations.length / PAGE_SIZE
    );

    const currentPage = Math.min(
        page,
        Math.max(0, totalPages - 1)
    );

    const visibleReservations =
        filteredReservations.slice(
            currentPage * PAGE_SIZE,
            (currentPage + 1) * PAGE_SIZE
        );

    const readyReservations =
        reservations.filter(
            item => item.status === "READY"
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


    // ====================================
    // PAGE UI
    // ====================================

    return (

        <main className="ar-page">

            {/* PAGE HEADER */}

            <header className="ar-page-header">

                <div>

                    <span className="ar-eyebrow">

                        LIBRARY ADMINISTRATION

                    </span>

                    <h1>Reservation Management</h1>

                    <p>

                        Manage book reservations,
                        waiting queues and collection windows.

                    </p>

                </div>

                <button
                    className="ar-secondary"
                    onClick={reload}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={
                            loading ? "ar-spin" : ""
                        }
                    />

                    Refresh

                </button>

            </header>


            {/* HERO SECTION */}

            <section className="ar-hero">

                <div className="ar-hero-content">

                    <span className="ar-hero-tag">

                        SMART RESERVATION SYSTEM

                    </span>

                    <h2>

                        Every reader deserves a turn.

                    </h2>

                    <p>

                        Organize book reservations,
                        monitor waiting members and
                        ensure a smooth collection experience.

                    </p>

                    <div className="ar-hero-label">

                        <ShieldCheck size={18} />

                        Organized reservation queues

                    </div>

                </div>

                <div className="ar-hero-decoration">

                    <CalendarClock
                        size={160}
                        strokeWidth={0.8}
                    />

                </div>

            </section>


            {/* STATISTICS */}

            <section className="ar-stats">

                {stats.map(item => {

                    const Icon = item.icon;

                    return (

                        <button
                            key={item.label}
                            className={
                                `ar-stat ${
                                    filter === item.filter
                                        ? "ar-stat-selected"
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

                            <div className={
                                `ar-icon ar-${item.color}`
                            }>

                                <Icon size={23} />

                            </div>

                            <span>{item.label}</span>

                            <strong>

                                {loading || error
                                    ? "—"
                                    : item.value}

                            </strong>

                        </button>

                    );

                })}

            </section>


            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="ar-message ar-success"
                    role="status"
                >

                    <CheckCircle2 size={21} />

                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >

                        <X size={18} />

                    </button>

                </div>

            )}


            {/* READY RESERVATIONS ALERT */}

            {!loading &&
                !error &&
                readyReservations.length > 0 && (

                <section className="ar-ready-banner">

                    <div className="ar-icon ar-blue">

                        <BookMarked size={24} />

                    </div>

                    <div className="ar-ready-content">

                        <strong>

                            Books are ready for collection

                        </strong>

                        <p>

                            {readyReservations.length}
                            {" "}reservation(s) are ready
                            for members to collect.

                        </p>

                    </div>

                    <button
                        className="ar-secondary"
                        onClick={() =>
                            changeFilter("READY")
                        }
                    >

                        View ready books

                    </button>

                </section>

            )}


            {/* RESERVATIONS TABLE */}

            <section className="ar-panel">

                <header className="ar-panel-header">

                    <div>

                        <h3>Reservation records</h3>

                        <p>

                            View and manage member
                            book reservations.

                        </p>

                    </div>

                    <span className="ar-count">

                        {reservations.length} loaded

                    </span>

                </header>


                {/* STATUS FILTERS */}

                <div className="ar-tabs">

                    {STATUS_OPTIONS.map(status => (

                        <button
                            key={status}
                            className={
                                filter === status
                                    ? "ar-tab ar-tab-active"
                                    : "ar-tab"
                            }
                            onClick={() =>
                                changeFilter(status)
                            }
                        >

                            {status === "ALL"
                                ? "All reservations"
                                : STATUS_CONFIG[status].label}

                            <span>

                                {counts[status] ?? 0}

                            </span>

                        </button>

                    ))}

                </div>


                {/* SEARCH BOX */}

                <div className="ar-search">

                    <Search size={19} />

                    <input
                        value={search}
                        placeholder="Search book, member or reservation ID..."
                        aria-label="Search reservations"
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

                {totalRecords > reservations.length && (

                    <p className="ar-muted">

                        Showing loaded records only.
                        Status counts and search apply
                        to these records.

                    </p>

                )}


                {/* LOADING */}

                {loading ? (

                    <div className="ar-empty">

                        <LoaderCircle
                            size={42}
                            className="ar-spin"
                        />

                        <h3>Loading reservations...</h3>

                    </div>

                ) : error ? (

                    <div className="ar-empty">

                        <AlertCircle size={42} />

                        <h3>Unable to load reservations</h3>

                        <p>{error}</p>

                        <button
                            className="ar-primary"
                            onClick={reload}
                        >

                            Try again

                        </button>

                    </div>

                ) : visibleReservations.length === 0 ? (

                    <div className="ar-empty">

                        <CalendarClock size={48} />

                        <h3>No reservations found</h3>

                        <p>

                            Try changing the search
                            or reservation status.

                        </p>

                        <button
                            className="ar-secondary"
                            onClick={() => {

                                setSearch("");
                                changeFilter("ALL");

                            }}
                        >

                            Reset filters

                        </button>

                    </div>

                ) : (

                    <div className="ar-table-wrapper">

                        <table className="ar-table">

                            <thead>

                                <tr>

                                    <th>Book / Reservation</th>

                                    <th>Member</th>

                                    <th>Queue</th>

                                    <th>Reserved on</th>

                                    <th>Expiry</th>

                                    <th>Status</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {visibleReservations.map(item => (

                                    <tr key={item.id}>

                                        {/* BOOK */}

                                        <td>

                                            <div className="ar-book-cell">

                                                <div className="ar-book-icon">

                                                    <BookOpen size={23} />

                                                </div>

                                                <div>

                                                    <strong>
                                                        {getBookTitle(item)}
                                                    </strong>

                                                    <small>
                                                        Reservation #{item.id}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>


                                        {/* MEMBER */}

                                        <td>

                                            <div className="ar-member-cell">

                                                <UserRound size={17} />

                                                <div>

                                                    <strong>
                                                        {getMemberName(item)}
                                                    </strong>

                                                    <small>
                                                        Member #{item.userId}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>


                                        {/* QUEUE POSITION */}

                                        <td>

                                            {item.status === "WAITING" ? (

                                                <span className="ar-queue">

                                                    <ListOrdered size={15} />

                                                    #{item.queuePosition ?? "—"}

                                                </span>

                                            ) : "—"}

                                        </td>


                                        {/* RESERVED DATE */}

                                        <td>

                                            <span className="ar-date">

                                                {formatReservationDate(
                                                    item.createdAt
                                                )}

                                            </span>

                                        </td>


                                        {/* EXPIRY */}

                                        <td>

                                            {item.status === "READY" ? (

                                                <div className="ar-expiry">

                                                    <strong>

                                                        {getExpiryTime(
                                                            item.expiresAt
                                                        )}

                                                    </strong>

                                                    <small>

                                                        {formatReservationDate(
                                                            item.expiresAt
                                                        )}

                                                    </small>

                                                </div>

                                            ) : (

                                                <span className="ar-date">

                                                    {formatReservationDate(
                                                        item.expiresAt
                                                    )}

                                                </span>

                                            )}

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <ReservationStatus
                                                status={item.status}
                                            />

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="ar-actions">

                                                <button
                                                    className="ar-action ar-blue"
                                                    title="View details"
                                                    aria-label={`View reservation ${item.id}`}
                                                    onClick={() =>

                                                        setModal({

                                                            type: "details",

                                                            reservation: item,

                                                        })

                                                    }
                                                >

                                                    <Eye size={18} />

                                                </button>

                                                {canCancel(item) && (

                                                    <button
                                                        className="ar-action ar-red"
                                                        title="Cancel reservation"
                                                        aria-label={`Cancel reservation ${item.id}`}
                                                        onClick={() =>

                                                            setModal({

                                                                type: "cancel",

                                                                reservation: item,

                                                            })

                                                        }
                                                    >

                                                        <XCircle size={18} />

                                                    </button>

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

                    <footer className="ar-pagination">

                        <span>

                            Showing{" "}

                            {currentPage * PAGE_SIZE + 1}

                            {" "}to{" "}

                            {Math.min(
                                (currentPage + 1) * PAGE_SIZE,
                                filteredReservations.length
                            )}

                            {" "}of{" "}

                            {filteredReservations.length}

                            {" "}reservations

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

                            <span className="ar-page-number">

                                {currentPage + 1} / {totalPages}

                            </span>

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


            {/* DETAILS MODAL */}

            {modal?.type === "details" && (

                <ReservationDetails

                    reservation={modal.reservation}

                    onClose={() => setModal(null)}

                    onCancel={reservation =>

                        setModal({

                            type: "cancel",

                            reservation,

                        })

                    }

                />

            )}


            {/* CANCEL MODAL */}

            {modal?.type === "cancel" && (

                <CancelReservationModal

                    reservation={modal.reservation}

                    onClose={() => setModal(null)}

                    onSuccess={handleSuccess}

                />

            )}

        </main>

    );

}