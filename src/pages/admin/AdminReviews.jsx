import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

import {
    Star,
    MessageSquare,
    MessageSquareText,
    Eye,
    EyeOff,
    Trash2,
    Search,
    RefreshCw,
    ShieldCheck,
    BadgeCheck,
    BookOpen,
    UserRound,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    ChevronLeft,
    ChevronRight,
    X,
    CalendarDays,
    Filter,
} from "lucide-react";

import {
    adminReviewApi,
    formatReviewDate,
    getReviewRows,
} from "../../services/adminReviewApi";

import "../../styles/admin/AdminReviews.css";

const PAGE_SIZE = 20;


// ==========================================
// STAR RATING
// ==========================================

function StarRating({ rating = 0 }) {

    const value = Math.max(
        0,
        Math.min(5, Number(rating) || 0)
    );

    return (
        <div
            className="ar-stars"
            aria-label={`${value} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={17}
                    fill={
                        star <= value
                            ? "#f59e0b"
                            : "none"
                    }
                    color={
                        star <= value
                            ? "#f59e0b"
                            : "#d1d5db"
                    }
                />
            ))}

            <span>{value.toFixed(1)}</span>
        </div>
    );
}


// ==========================================
// MEMBER AVATAR
// ==========================================

function MemberAvatar({ name }) {

    const initials = (name || "Member")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();

    return (
        <div className="ar-avatar">
            {initials || "M"}
        </div>
    );
}


// ==========================================
// STATUS BADGE
// ==========================================

function ReviewStatus({ status }) {

    return (
        <span className={
            `ar-status ${
                status === "PUBLISHED"
                    ? "ar-status-published"
                    : status === "HIDDEN"
                        ? "ar-status-hidden"
                        : "ar-status-unknown"
            }`
        }>
            {status === "PUBLISHED" ? (
                <Eye size={13} />
            ) : (
                <EyeOff size={13} />
            )}

            {status === "PUBLISHED"
                ? "Published"
                : status === "HIDDEN"
                    ? "Hidden"
                    : status || "Unknown"}
        </span>
    );
}


// ==========================================
// REVIEW DETAILS & MODERATION MODAL
// ==========================================

function ReviewModal({
    review,
    action,
    saving,
    error,
    onClose,
    onConfirm,
}) {

    const [reason, setReason] = useState("");

    const titles = {
        view: "Review details",
        hide: "Hide review",
        publish: "Publish review",
        delete: "Delete review",
    };

    const descriptions = {
        view: "View complete member feedback.",
        hide: "Remove this review from public visibility.",
        publish: "Restore this review to public visibility.",
        delete: "Permanently remove this review.",
    };

    useEffect(() => {

        function handleEscape(event) {
            if (event.key === "Escape" && !saving) {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => window.removeEventListener(
            "keydown",
            handleEscape
        );

    }, [saving, onClose]);

    function handleSubmit(event) {

        event.preventDefault();

        if (saving) return;

        if (
            action === "hide" &&
            !reason.trim()
        ) return;

        onConfirm(reason.trim());
    }

    return (

        <div
            className="ar-overlay"
            onClick={event => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) onClose();
            }}
        >

            <section
                className="ar-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ar-modal-title"
            >

                <header className="ar-modal-header">

                    <div className={
                        `ar-icon ${
                            action === "delete"
                                ? "ar-red"
                                : "ar-purple"
                        }`
                    }>
                        {action === "delete" ? (
                            <Trash2 size={24} />
                        ) : (
                            <MessageSquareText size={24} />
                        )}
                    </div>

                    <div className="ar-modal-heading">

                        <h2 id="ar-modal-title">
                            {titles[action]}
                        </h2>

                        <p>{descriptions[action]}</p>

                    </div>

                    <button
                        type="button"
                        className="ar-icon-button"
                        disabled={saving}
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>

                </header>

                <form onSubmit={handleSubmit}>

                    <div className="ar-modal-body">

                        <div className="ar-review-preview">

                            <div className="ar-review-user">

                                <MemberAvatar
                                    name={review.memberName}
                                />

                                <div className="ar-user-info">

                                    <strong>
                                        {review.memberName ||
                                            "Unknown member"}
                                    </strong>

                                    <small>
                                        Member #{review.userId ?? "—"}
                                    </small>

                                </div>

                                <ReviewStatus
                                    status={review.status}
                                />

                            </div>

                            <div className="ar-preview-book">

                                <BookOpen size={20} />

                                <strong>
                                    {review.bookTitle ||
                                        `Book #${review.bookId}`}
                                </strong>

                            </div>

                            <StarRating rating={review.rating} />

                            <p className="ar-full-comment">
                                {review.comment ||
                                    "No written comment."}
                            </p>

                            {review.verifiedBorrower && (
                                <div className="ar-verified">
                                    <BadgeCheck size={16} />
                                    Verified borrower
                                </div>
                            )}

                        </div>

                        {action === "view" && (

                            <div className="ar-details-grid">

                                {[
                                    ["Review ID", review.id],
                                    ["Book ID", review.bookId],
                                    ["Member ID", review.userId],
                                    ["Rating", `${review.rating}/5`],
                                    [
                                        "Created",
                                        formatReviewDate(
                                            review.createdAt
                                        ),
                                    ],
                                    [
                                        "Last updated",
                                        formatReviewDate(
                                            review.updatedAt
                                        ),
                                    ],
                                ].map(([label, value]) => (

                                    <div key={label}>
                                        <span>{label}</span>
                                        <strong>
                                            {value ?? "—"}
                                        </strong>
                                    </div>

                                ))}

                            </div>

                        )}

                        {action === "hide" && (

                            <div className="ar-field">

                                <label htmlFor="ar-reason">
                                    Moderation reason *
                                </label>

                                <textarea
                                    id="ar-reason"
                                    value={reason}
                                    onChange={event =>
                                        setReason(event.target.value)
                                    }
                                    placeholder="Explain why this review is being hidden..."
                                    rows={4}
                                    maxLength={500}
                                    required
                                    autoFocus
                                    disabled={saving}
                                />

                                <small>
                                    {reason.length}/500 characters
                                </small>

                            </div>

                        )}

                        {action === "publish" && (

                            <div className="ar-info">

                                <Eye size={19} />

                                This review will become visible
                                to users again.

                            </div>

                        )}

                        {action === "delete" && (

                            <div className="ar-warning">

                                <AlertCircle size={20} />

                                This action permanently deletes
                                the review. It cannot be undone.

                            </div>

                        )}

                        {error && (

                            <div className="ar-error" role="alert">
                                <AlertCircle size={18} />
                                {error}
                            </div>

                        )}

                    </div>

                    <footer className="ar-modal-footer">

                        <button
                            type="button"
                            className="ar-secondary"
                            disabled={saving}
                            onClick={onClose}
                        >
                            {action === "view"
                                ? "Close"
                                : "Cancel"}
                        </button>

                        {action !== "view" && (

                            <button
                                type="submit"
                                className={
                                    action === "delete"
                                        ? "ar-danger"
                                        : "ar-primary"
                                }
                                disabled={
                                    saving ||
                                    (
                                        action === "hide" &&
                                        !reason.trim()
                                    )
                                }
                            >

                                {saving && (
                                    <LoaderCircle
                                        size={18}
                                        className="ar-spin"
                                    />
                                )}

                                {saving
                                    ? "Processing..."
                                    : titles[action]}

                            </button>

                        )}

                    </footer>

                </form>

            </section>

        </div>

    );
}


// ==========================================
// MAIN ADMIN REVIEWS PAGE
// ==========================================

export default function AdminReviews() {

    const [reviews, setReviews] = useState([]);

    const [page, setPage] = useState(0);

    const [totalPages, setTotalPages] = useState(1);

    const [totalElements, setTotalElements] = useState(0);

    const [paginated, setPaginated] = useState(false);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [ratingFilter, setRatingFilter] = useState("ALL");

    const [borrowerFilter, setBorrowerFilter] = useState("ALL");

    const [modal, setModal] = useState(null);

    const [saving, setSaving] = useState(false);

    const [modalError, setModalError] = useState("");

    const [reloadKey, setReloadKey] = useState(0);


    // ======================================
    // LOAD REVIEWS
    // ======================================

    useEffect(() => {

        let cancelled = false;

        async function loadReviews() {

            setLoading(true);
            setError("");

            try {

                const response =
                    await adminReviewApi.getReviews(
                        page,
                        PAGE_SIZE
                    );

                if (cancelled) return;

                const rows = getReviewRows(response);

                const isPaginated =
                    !Array.isArray(response) &&
                    Array.isArray(response?.content);

                setReviews(rows);

                setPaginated(isPaginated);

                setTotalElements(
                    response?.totalElements ?? rows.length
                );

                const pages = Math.max(
                    1,
                    response?.totalPages ??
                    Math.ceil(
                        (response?.totalElements ?? rows.length) /
                        PAGE_SIZE
                    )
                );

                setTotalPages(isPaginated ? pages : 1);

                if (isPaginated && page >= pages) {
                    setPage(pages - 1);
                }

            } catch (err) {

                if (cancelled) return;

                setReviews([]);

                setError(
                    err.message ||
                    "Unable to load reviews."
                );

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }

        }

        loadReviews();

        return () => {
            cancelled = true;
        };

    }, [page, reloadKey]);


    // ======================================
    // FILTER REVIEWS
    // ======================================

    const filteredReviews = useMemo(() => {

        const query = search.trim().toLowerCase();

        return reviews.filter(review => {

            const matchesSearch = [
                review.bookTitle,
                review.memberName,
                review.comment,
                review.id,
                review.userId,
                review.bookId,
            ]
                .map(value => String(value ?? ""))
                .join(" ")
                .toLowerCase()
                .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                review.status === statusFilter;

            const matchesRating =
                ratingFilter === "ALL" ||
                Number(review.rating) ===
                    Number(ratingFilter);

            const matchesBorrower =
                borrowerFilter === "ALL" ||
                (
                    borrowerFilter === "VERIFIED"
                        ? review.verifiedBorrower === true
                        : review.verifiedBorrower !== true
                );

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRating &&
                matchesBorrower
            );

        });

    }, [
        reviews,
        search,
        statusFilter,
        ratingFilter,
        borrowerFilter,
    ]);


    // ======================================
    // REVIEW STATISTICS
    // ======================================

    const stats = useMemo(() => {

        const published = reviews.filter(
            review => review.status === "PUBLISHED"
        ).length;

        const hidden = reviews.filter(
            review => review.status === "HIDDEN"
        ).length;

        const verified = reviews.filter(
            review => review.verifiedBorrower === true
        ).length;

        const ratings = reviews
            .map(review => Number(review.rating))
            .filter(rating =>
                Number.isFinite(rating) &&
                rating >= 1 &&
                rating <= 5
            );

        const average = ratings.length
            ? ratings.reduce(
                (sum, rating) => sum + rating,
                0
            ) / ratings.length
            : 0;

        const distribution = [5, 4, 3, 2, 1].map(
            rating => {

                const count = ratings.filter(
                    value => value === rating
                ).length;

                return {
                    rating,
                    count,
                    percentage: ratings.length
                        ? count / ratings.length * 100
                        : 0,
                };

            }
        );

        return {
            published,
            hidden,
            verified,
            average,
            distribution,
        };

    }, [reviews]);


    // ======================================
    // MODERATION ACTIONS
    // ======================================

    function openModal(review, action) {

        setModalError("");

        setModal({ review, action });

    }

    const closeModal = useCallback(() => {

        if (!saving) {
            setModal(null);
            setModalError("");
        }

    }, [saving]);

    async function handleModeration(reason) {

        if (!modal || saving) return;

        setSaving(true);
        setModalError("");
        setMessage("");

        const { review, action } = modal;

        try {

            if (action === "hide") {

                await adminReviewApi.updateStatus(
                    review.id,
                    "HIDDEN",
                    reason
                );

                setMessage(
                    "Review hidden successfully."
                );

            } else if (action === "publish") {

                await adminReviewApi.updateStatus(
                    review.id,
                    "PUBLISHED",
                    ""
                );

                setMessage(
                    "Review published successfully."
                );

            } else if (action === "delete") {

                await adminReviewApi.deleteReview(
                    review.id
                );

                setMessage(
                    "Review deleted successfully."
                );

            }

            setModal(null);

            // Reload server data after moderation.
            setReloadKey(value => value + 1);

        } catch (err) {

            setModalError(
                err.message ||
                "Unable to complete moderation."
            );

        } finally {

            setSaving(false);

        }

    }

    function resetFilters() {

        setSearch("");
        setStatusFilter("ALL");
        setRatingFilter("ALL");
        setBorrowerFilter("ALL");

    }

    const statCards = [

        {
            title: "Total reviews",
            value: totalElements,
            icon: MessageSquare,
            color: "purple",
            description: "All review records",
        },

        {
            title: "Average rating",
            value: reviews.length
                ? stats.average.toFixed(1)
                : "—",
            icon: Star,
            color: "orange",
            description: "Out of 5 stars",
        },

        {
            title: "Published",
            value: stats.published,
            icon: Eye,
            color: "green",
            description: "Visible to readers",
        },

        {
            title: "Hidden",
            value: stats.hidden,
            icon: EyeOff,
            color: "red",
            description: "Moderated reviews",
        },

        {
            title: "Verified borrowers",
            value: stats.verified,
            icon: BadgeCheck,
            color: "blue",
            description: "Verified reading feedback",
        },

    ];


    // ======================================
    // PAGE UI
    // ======================================

    return (

        <main className="ar-page">

            {/* PAGE HEADER */}

            <header className="ar-page-header">

                <div>

                    <span className="ar-eyebrow">
                        LIBRARY ADMINISTRATION
                    </span>

                    <h1>Reviews & Ratings</h1>

                    <p>
                        Manage member feedback and maintain
                        review quality.
                    </p>

                </div>

                <button
                    className="ar-secondary"
                    disabled={loading || saving}
                    onClick={() =>
                        setReloadKey(value => value + 1)
                    }
                >

                    <RefreshCw
                        size={18}
                        className={loading ? "ar-spin" : ""}
                    />

                    Refresh reviews

                </button>

            </header>


            {/* HERO */}

            <section className="ar-hero">

                <div className="ar-hero-content">

                    <span className="ar-hero-tag">

                        <ShieldCheck size={15} />

                        REVIEW MODERATION

                    </span>

                    <h2>
                        Every review matters.
                    </h2>

                    <p>
                        Build a trusted reading community
                        by managing meaningful feedback,
                        authentic ratings and responsible
                        book reviews.
                    </p>

                    <div className="ar-hero-stars">

                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={24}
                                fill="#ffb347"
                                color="#ffb347"
                            />
                        ))}

                    </div>

                </div>

                <div className="ar-hero-art">

                    <MessageSquareText size={85} />

                    <div className="ar-art-badge">
                        <ShieldCheck size={30} />
                    </div>

                </div>

            </section>


            {/* STATISTICS */}

            <section className="ar-stats">

                {statCards.map(item => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="ar-stat-card"
                            key={item.title}
                        >

                            <div className={
                                `ar-icon ar-${item.color}`
                            }>
                                <Icon size={23} />
                            </div>

                            <span>{item.title}</span>

                            <strong>
                                {loading || error
                                    ? "—"
                                    : item.value}
                            </strong>

                            <small>{item.description}</small>

                        </article>

                    );

                })}

            </section>

            {paginated && (

                <p className="ar-scope-note">
                    Total reviews is the server total.
                    Other statistics and filters apply
                    to the currently loaded page.
                </p>

            )}


            {/* RATING OVERVIEW */}

            {!loading && !error && (

                <section className="ar-panel">

                    <div className="ar-panel-header">

                        <div className="ar-icon ar-orange">
                            <Star size={24} />
                        </div>

                        <div>

                            <h3>Rating overview</h3>

                            <p>
                                Distribution of loaded review ratings.
                            </p>

                        </div>

                    </div>

                    <div className="ar-rating-overview">

                        <div className="ar-average">

                            <strong>
                                {reviews.length
                                    ? stats.average.toFixed(1)
                                    : "—"}
                            </strong>

                            <StarRating
                                rating={Math.round(stats.average)}
                            />

                            <span>
                                {reviews.length} loaded reviews
                            </span>

                        </div>

                        <div className="ar-distribution">

                            {stats.distribution.map(item => (

                                <div
                                    className="ar-rating-row"
                                    key={item.rating}
                                >

                                    <span>
                                        {item.rating}
                                        <Star
                                            size={14}
                                            fill="#f59e0b"
                                            color="#f59e0b"
                                        />
                                    </span>

                                    <div className="ar-rating-track">

                                        <div
                                            className="ar-rating-fill"
                                            style={{
                                                width:
                                                    `${item.percentage}%`,
                                            }}
                                        />

                                    </div>

                                    <strong>{item.count}</strong>

                                </div>

                            ))}

                        </div>

                    </div>

                </section>

            )}


            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="ar-success"
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


            {/* REVIEW MANAGEMENT */}

            <section className="ar-panel">

                <div className="ar-panel-header">

                    <div className="ar-icon ar-purple">
                        <MessageSquare size={24} />
                    </div>

                    <div>

                        <h3>Member reviews</h3>

                        <p>
                            Search, filter and moderate book reviews.
                        </p>

                    </div>

                </div>


                {/* FILTERS */}

                <div className="ar-toolbar">

                    <div className="ar-search">

                        <Search size={19} />

                        <input
                            value={search}
                            onChange={event =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search book, member or review..."
                            aria-label="Search reviews"
                        />

                        {search && (

                            <button
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>

                        )}

                    </div>

                    <select
                        value={statusFilter}
                        onChange={event =>
                            setStatusFilter(event.target.value)
                        }
                        aria-label="Review status"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="HIDDEN">Hidden</option>
                    </select>

                    <select
                        value={ratingFilter}
                        onChange={event =>
                            setRatingFilter(event.target.value)
                        }
                        aria-label="Star rating"
                    >

                        <option value="ALL">All ratings</option>

                        {[5, 4, 3, 2, 1].map(rating => (
                            <option
                                key={rating}
                                value={rating}
                            >
                                {rating} star{rating > 1 ? "s" : ""}
                            </option>
                        ))}

                    </select>

                    <select
                        value={borrowerFilter}
                        onChange={event =>
                            setBorrowerFilter(event.target.value)
                        }
                        aria-label="Borrower verification"
                    >
                        <option value="ALL">All borrowers</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="UNVERIFIED">Unverified</option>
                    </select>

                    <button
                        className="ar-secondary"
                        onClick={resetFilters}
                    >
                        <Filter size={16} />
                        Reset
                    </button>

                </div>


                {/* LOADING STATE */}

                {loading ? (

                    <div className="ar-empty">

                        <LoaderCircle
                            size={38}
                            className="ar-spin"
                        />

                        <h3>Loading reviews...</h3>

                        <p>Please wait.</p>

                    </div>

                ) : error ? (

                    <div className="ar-empty">

                        <AlertCircle size={40} />

                        <h3>Unable to load reviews</h3>

                        <p role="alert">{error}</p>

                        <button
                            className="ar-primary"
                            onClick={() =>
                                setReloadKey(value => value + 1)
                            }
                        >
                            Try again
                        </button>

                    </div>

                ) : filteredReviews.length === 0 ? (

                    <div className="ar-empty">

                        <MessageSquare size={42} />

                        <h3>No matching reviews</h3>

                        <p>
                            No reviews match your current filters.
                        </p>

                        <button
                            className="ar-secondary"
                            onClick={resetFilters}
                        >
                            Clear filters
                        </button>

                    </div>

                ) : (

                    <>

                        <div className="ar-result-count">

                            Showing {filteredReviews.length}
                            {" "}of {reviews.length} loaded reviews

                        </div>


                        {/* REVIEW TABLE */}

                        <div className="ar-table-wrap">

                            <table className="ar-table">

                                <thead>

                                    <tr>
                                        <th>Member</th>
                                        <th>Book & review</th>
                                        <th>Rating</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredReviews.map(review => (

                                        <tr key={review.id}>

                                            <td>

                                                <div className="ar-review-user">

                                                    <MemberAvatar
                                                        name={review.memberName}
                                                    />

                                                    <div className="ar-user-info">

                                                        <strong>
                                                            {review.memberName ||
                                                                "Unknown member"}
                                                        </strong>

                                                        {review.verifiedBorrower ? (

                                                            <span className="ar-verified">

                                                                <BadgeCheck size={13} />

                                                                Verified borrower

                                                            </span>

                                                        ) : (

                                                            <small>
                                                                Unverified borrower
                                                            </small>

                                                        )}

                                                    </div>

                                                </div>

                                            </td>

                                            <td>

                                                <div className="ar-book-info">

                                                    <strong>
                                                        {review.bookTitle ||
                                                            `Book #${review.bookId}`}
                                                    </strong>

                                                    <p>
                                                        {review.comment ||
                                                            "No written comment."}
                                                    </p>

                                                </div>

                                            </td>

                                            <td>

                                                <StarRating
                                                    rating={review.rating}
                                                />

                                            </td>

                                            <td>

                                                <ReviewStatus
                                                    status={review.status}
                                                />

                                            </td>

                                            <td>

                                                <span className="ar-date">

                                                    {formatReviewDate(
                                                        review.createdAt
                                                    )}

                                                </span>

                                            </td>

                                            <td>

                                                <div className="ar-actions">

                                                    <button
                                                        className="ar-icon-button"
                                                        title="View review"
                                                        aria-label="View review"
                                                        onClick={() =>
                                                            openModal(review, "view")
                                                        }
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {review.status === "PUBLISHED" && (

                                                        <button
                                                            className="ar-icon-button ar-action-hide"
                                                            title="Hide review"
                                                            aria-label="Hide review"
                                                            onClick={() =>
                                                                openModal(review, "hide")
                                                            }
                                                        >
                                                            <EyeOff size={17} />
                                                        </button>

                                                    )}

                                                    {review.status === "HIDDEN" && (

                                                        <button
                                                            className="ar-icon-button ar-action-publish"
                                                            title="Publish review"
                                                            aria-label="Publish review"
                                                            onClick={() =>
                                                                openModal(review, "publish")
                                                            }
                                                        >
                                                            <CheckCircle2 size={17} />
                                                        </button>

                                                    )}

                                                    <button
                                                        className="ar-icon-button ar-action-delete"
                                                        title="Delete review"
                                                        aria-label="Delete review"
                                                        onClick={() =>
                                                            openModal(review, "delete")
                                                        }
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </>

                )}


                {/* PAGINATION */}

                {!loading && !error && paginated && (

                    <div className="ar-pagination">

                        <span>
                            Page {page + 1} of {totalPages}
                        </span>

                        <div>

                            <button
                                className="ar-secondary"
                                disabled={page === 0}
                                onClick={() =>
                                    setPage(value => value - 1)
                                }
                            >
                                <ChevronLeft size={17} />
                                Previous
                            </button>

                            <button
                                className="ar-secondary"
                                disabled={page + 1 >= totalPages}
                                onClick={() =>
                                    setPage(value => value + 1)
                                }
                            >
                                Next
                                <ChevronRight size={17} />
                            </button>

                        </div>

                    </div>

                )}

            </section>


            {/* MODERATION POLICY */}

            <section className="ar-policy">

                <div className="ar-icon ar-purple">
                    <ShieldCheck size={25} />
                </div>

                <div>

                    <h3>Responsible review moderation</h3>

                    <p>
                        Hide spam, abusive content and reviews
                        that violate library policies. Do not
                        hide genuine negative feedback simply
                        because it has a low rating. Prefer
                        hiding over permanent deletion when
                        further review may be necessary.
                    </p>

                </div>

            </section>


            {/* REVIEW MODAL */}

            {modal && (

                <ReviewModal
                    key={`${modal.review.id}-${modal.action}`}
                    review={modal.review}
                    action={modal.action}
                    saving={saving}
                    error={modalError}
                    onClose={closeModal}
                    onConfirm={handleModeration}
                />

            )}

        </main>

    );

}