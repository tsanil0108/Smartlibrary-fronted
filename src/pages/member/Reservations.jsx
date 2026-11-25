import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  CalendarClock,
  Clock,
  CheckCircle2,
  BookOpen,
  LibraryBig,
  XCircle,
  ArrowRight,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Search,
  Mail,
  X,
  Hourglass,
  BookCheck,
  Plus,
} from "lucide-react";

import BookCover from "../../components/member/BookCover";

import { reservationApi } from "../../services/reservationApi";

import "../../styles/member/Reservations.css";

// ==========================================
// STATUS CONFIGURATION
// ==========================================

const STATUS_CONFIG = {
  WAITING: {
    label: "Waiting",
    color: "waiting",
    icon: Clock,
  },

  READY: {
    label: "Ready to borrow",
    color: "ready",
    icon: CheckCircle2,
  },

  FULFILLED: {
    label: "Completed",
    color: "completed",
    icon: BookCheck,
  },

  CANCELLED: {
    label: "Cancelled",
    color: "cancelled",
    icon: XCircle,
  },

  EXPIRED: {
    label: "Expired",
    color: "expired",
    icon: Hourglass,
  },
};

const FILTERS = [
  { value: "ALL", label: "All reservations" },
  { value: "WAITING", label: "Waiting" },
  { value: "READY", label: "Ready to borrow" },
  { value: "HISTORY", label: "History" },
];

// ==========================================
// DATE HELPERS
// ==========================================

function parseDate(value) {
  if (!value) return null;

  // Backend LocalDateTime without offset:
  // assume Asia/Kolkata timezone.
  const normalized =
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    !/(Z|[+-]\d{2}:\d{2})$/.test(value)
      ? `${value}+05:30`
      : value;

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function getCountdown(expiresAt, now) {
  const date = parseDate(expiresAt);

  if (!date) return "Expiry unavailable";

  const difference = date.getTime() - now;

  if (difference <= 0) {
    return "Reservation expired";
  }

  const totalSeconds = Math.floor(
    difference / 1000
  );

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}h ${String(
    minutes
  ).padStart(2, "0")}m ${String(
    seconds
  ).padStart(2, "0")}s`;
}

// ==========================================
// STATUS BADGE
// ==========================================

function ReservationStatus({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "cancelled",
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <span
      className={`rv-status rv-status-${config.color}`}
    >
      <Icon size={14} />

      {config.label}
    </span>
  );
}

// ==========================================
// RESERVATION CARD
// ==========================================

function ReservationCard({
  reservation,
  now,
  onCancel,
  onBorrow,
}) {
  const status = reservation.status;

  const waiting = status === "WAITING";
  const ready = status === "READY";

  const expiry = parseDate(
    reservation.expiresAt
  );

  const expired =
    ready &&
    expiry &&
    expiry.getTime() <= now;

  const active = waiting || ready;

  const book = {
    id: reservation.bookId,
    title:
      reservation.bookTitle ||
      reservation.title ||
      "Reserved book",
    author: reservation.author,
    isbn: reservation.isbn,
    coverUrl: reservation.coverUrl,
  };

  return (
    <article className="rv-reservation-card">

      <div className="rv-card-main">

        {/* BOOK COVER */}

        <div className="rv-book-cover">
          <BookCover book={book} />
        </div>

        {/* BOOK INFORMATION */}

        <div className="rv-book-info">

          <div className="rv-card-heading">

            <div>
              <span className="rv-reference">
                RESERVATION #{String(
                  reservation.id
                ).padStart(5, "0")}
              </span>

              <h3>{book.title}</h3>

              <p>
                {book.author || "Unknown author"}
              </p>
            </div>

            <ReservationStatus status={status} />

          </div>

          <div className="rv-card-details">

            <div className="rv-detail">

              <CalendarDays size={19} />

              <div>
                <span>Reserved on</span>

                <strong>
                  {formatDate(
                    reservation.createdAt
                  )}
                </strong>
              </div>

            </div>

            {waiting && (
              <div className="rv-detail">

                <Hourglass size={19} />

                <div>
                  <span>Queue position</span>

                  <strong className="rv-queue">
                    {reservation.queuePosition > 0
                      ? `#${reservation.queuePosition}`
                      : "—"}
                  </strong>
                </div>

              </div>
            )}

            {ready && (
              <div className="rv-detail">

                <CheckCircle2 size={19} />

                <div>
                  <span>Available since</span>

                  <strong>
                    {formatDate(
                      reservation.readyAt
                    )}
                  </strong>
                </div>

              </div>
            )}

            {!active && (
              <div className="rv-detail">

                <BookOpen size={19} />

                <div>
                  <span>Reservation status</span>

                  <strong>
                    {STATUS_CONFIG[status]?.label ||
                      status}
                  </strong>
                </div>

              </div>
            )}

          </div>

          {/* WAITING MESSAGE */}

          {waiting && (
            <div className="rv-info-box rv-info-waiting">

              <Mail size={21} />

              <div>
                <strong>You're on the waiting list!</strong>

                <p>
                  We will email you when your
                  reserved book becomes available.
                </p>
              </div>

            </div>
          )}

          {/* READY COUNTDOWN */}

          {ready && (
            <div
              className={`rv-countdown ${
                expired ? "rv-countdown-expired" : ""
              }`}
            >

              <div className="rv-countdown-icon">
                <CalendarClock size={25} />
              </div>

              <div>
                <span>
                  {expired
                    ? "Reservation hold ended"
                    : "Reservation expires in"}
                </span>

                <strong>
                  {getCountdown(
                    reservation.expiresAt,
                    now
                  )}
                </strong>

                <small>
                  {expired
                    ? "Refresh to check the latest status."
                    : `Valid until ${formatDate(
                        reservation.expiresAt
                      )}`}
                </small>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* CARD ACTIONS */}

      <div className="rv-card-footer">

        <Link
          className="rv-text-link"
          to={`/books/${reservation.bookId}`}
        >
          View book details
          <ArrowRight size={16} />
        </Link>

        <div className="rv-card-actions">

          {active && !expired && (
            <button
              type="button"
              className="rv-cancel-btn"
              onClick={() =>
                onCancel(reservation)
              }
            >
              <XCircle size={17} />
              Cancel reservation
            </button>
          )}

          {ready && !expired && (
            <button
              type="button"
              className="rv-primary"
              onClick={() =>
                onBorrow(reservation)
              }
            >
              <BookOpen size={18} />
              Borrow now
            </button>
          )}

        </div>

      </div>

    </article>
  );
}

// ==========================================
// MAIN RESERVATIONS PAGE
// ==========================================

export default function Reservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState(null);

  const [filter, setFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [now, setNow] =
    useState(Date.now());

  const [cancelTarget, setCancelTarget] =
    useState(null);

  const [cancelling, setCancelling] =
    useState(false);

  // ========================================
  // LOAD RESERVATIONS
  // ========================================

  async function loadReservations() {
    setLoading(true);
    setError("");

    try {
      const data =
        await reservationApi.getMyReservations();

      const records = Array.isArray(data)
        ? data
        : data?.content;

      if (!Array.isArray(records)) {
        throw new Error(
          "Invalid reservation response."
        );
      }

      setReservations(records);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load reservations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  // ========================================
  // LIVE COUNTDOWN
  // ========================================

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ========================================
  // AUTO DISMISS MESSAGE
  // ========================================

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notice]);

  // ========================================
  // MODAL KEYBOARD SUPPORT
  // ========================================

  useEffect(() => {
    if (!cancelTarget) return;

    function handleKeyDown(event) {
      if (
        event.key === "Escape" &&
        !cancelling
      ) {
        setCancelTarget(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [cancelTarget, cancelling]);

  // ========================================
  // STATISTICS
  // ========================================

  const stats = useMemo(() => {
    return [
      {
        label: "Total reservations",
        value: reservations.length,
        icon: CalendarDays,
        color: "purple",
      },
      {
        label: "Waiting",
        value: reservations.filter(
          (item) => item.status === "WAITING"
        ).length,
        icon: Clock,
        color: "orange",
      },
      {
        label: "Ready to borrow",
        value: reservations.filter(
          (item) => item.status === "READY"
        ).length,
        icon: CheckCircle2,
        color: "green",
      },
      {
        label: "Completed",
        value: reservations.filter(
          (item) => item.status === "FULFILLED"
        ).length,
        icon: BookCheck,
        color: "blue",
      },
    ];
  }, [reservations]);

  // ========================================
  // FILTER & SEARCH
  // ========================================

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    const priority = {
      READY: 0,
      WAITING: 1,
      FULFILLED: 2,
      CANCELLED: 3,
      EXPIRED: 4,
    };

    return reservations
      .filter((item) => {
        const matchesSearch = [
          item.bookTitle,
          item.author,
          item.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesFilter =
          filter === "ALL" ||
          item.status === filter ||
          (
            filter === "HISTORY" &&
            [
              "FULFILLED",
              "CANCELLED",
              "EXPIRED",
            ].includes(item.status)
          );

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const statusDifference =
          (priority[a.status] ?? 9) -
          (priority[b.status] ?? 9);

        if (statusDifference !== 0) {
          return statusDifference;
        }

        return (
          (parseDate(b.createdAt)?.getTime() || 0) -
          (parseDate(a.createdAt)?.getTime() || 0)
        );
      });
  }, [reservations, filter, search]);

  // ========================================
  // CANCEL RESERVATION
  // ========================================

  async function confirmCancellation() {
    if (!cancelTarget || cancelling) return;

    setCancelling(true);

    try {
      await reservationApi.cancelReservation(
        cancelTarget.id
      );

      setCancelTarget(null);

      setNotice({
        type: "success",
        message:
          "Reservation cancelled successfully.",
      });

      await loadReservations();

    } catch (err) {
      setCancelTarget(null);

      setNotice({
        type: "error",
        message:
          err.message ||
          "Unable to cancel reservation.",
      });
    } finally {
      setCancelling(false);
    }
  }

  function handleBorrow(reservation) {
    navigate(`/books/${reservation.bookId}`);
  }

  function getFilterCount(value) {
    if (value === "ALL") {
      return reservations.length;
    }

    if (value === "HISTORY") {
      return reservations.filter((item) =>
        [
          "FULFILLED",
          "CANCELLED",
          "EXPIRED",
        ].includes(item.status)
      ).length;
    }

    return reservations.filter(
      (item) => item.status === value
    ).length;
  }

  return (
    <div className="rv-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <header className="rv-header">

        <div>
          <span className="rv-eyebrow">
            <CalendarDays size={16} />
            YOUR READING JOURNEY
          </span>

          <h1>My Reservations</h1>

          <p>
            Manage your reserved books and
            track their availability.
          </p>
        </div>

        <Link
          to="/member/books"
          className="rv-primary"
        >
          <Plus size={19} />
          Browse books
        </Link>

      </header>

      {/* =====================================
          HERO BANNER
      ====================================== */}

      <section className="rv-hero">

        <div className="rv-hero-content">

          <span>
            NEVER MISS YOUR NEXT READ
          </span>

          <h2>
            Your next chapter
            <br />
            <em>awaits.</em>
          </h2>

          <p>
            Reserve your favourite books and
            get notified by email when they
            become available.
          </p>

          <Link
            to="/member/books"
            className="rv-hero-link"
          >
            Explore collection
            <ArrowRight size={18} />
          </Link>

        </div>

        <div
          className="rv-hero-art"
          aria-hidden="true"
        >
          <div className="rv-art-circle" />

          <div className="rv-art-book">
            <BookOpen size={65} />
          </div>

          <div className="rv-art-clock">
            <Clock size={48} />
          </div>
        </div>

      </section>

      {/* =====================================
          STATISTICS
      ====================================== */}

      <section className="rv-stats">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rv-stat-card"
            >

              <div
                className={`rv-stat-icon rv-icon-${stat.color}`}
              >
                <Icon size={24} />
              </div>

              <div>
                <span>{stat.label}</span>

                <h2>
                  {loading
                    ? "..."
                    : error
                    ? "—"
                    : stat.value}
                </h2>
              </div>

            </article>
          );
        })}

      </section>

      {/* =====================================
          SUCCESS / ERROR MESSAGE
      ====================================== */}

      {notice && (
        <div
          role="status"
          className={`rv-notice rv-notice-${notice.type}`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={21} />
          ) : (
            <AlertCircle size={21} />
          )}

          <span>{notice.message}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* =====================================
          RESERVATION LIST
      ====================================== */}

      <section className="rv-list-section">

        <div className="rv-section-heading">

          <div>
            <h2>Your reservations</h2>

            <p>
              Track and manage your book requests.
            </p>
          </div>

          <button
            type="button"
            className="rv-refresh"
            onClick={loadReservations}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading ? "rv-spin" : ""
              }
            />
            Refresh
          </button>

        </div>

        {/* FILTER PANEL */}

        <div className="rv-filter-panel">

          <div className="rv-tabs">

            {FILTERS.map((item) => (
              <button
                type="button"
                key={item.value}
                className={
                  filter === item.value
                    ? "rv-tab-active"
                    : ""
                }
                aria-pressed={
                  filter === item.value
                }
                onClick={() =>
                  setFilter(item.value)
                }
              >
                {item.label}

                <span>
                  {loading || error
                    ? "—"
                    : getFilterCount(item.value)}
                </span>
              </button>
            ))}

          </div>

          <div className="rv-search">

            <Search size={19} />

            <input
              type="search"
              placeholder="Search reservations..."
              aria-label="Search reservations"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        {/* LOADING STATE */}

        {loading ? (
          <div className="rv-empty">

            <LoaderCircle
              size={42}
              className="rv-spin"
            />

            <h3>Loading reservations...</h3>

          </div>

        /* ERROR STATE */

        ) : error ? (
          <div className="rv-empty">

            <AlertCircle size={45} />

            <h3>Unable to load reservations</h3>

            <p>{error}</p>

            <button
              type="button"
              className="rv-primary"
              onClick={loadReservations}
            >
              Try again
            </button>

          </div>

        /* EMPTY STATE */

        ) : reservations.length === 0 ? (
          <div className="rv-empty">

            <div className="rv-empty-icon">

              <CalendarDays size={49} />

              <span>
                <BookOpen size={23} />
              </span>

            </div>

            <h3>No reservations yet</h3>

            <p>
              Is your favourite book unavailable?
              Reserve it and we'll notify you
              when it's ready to borrow.
            </p>

            <Link
              to="/member/books"
              className="rv-primary"
            >
              <LibraryBig size={18} />
              Explore books
              <ArrowRight size={17} />
            </Link>

          </div>

        /* NO SEARCH RESULTS */

        ) : filteredReservations.length === 0 ? (
          <div className="rv-empty">

            <Search size={45} />

            <h3>No matching reservations</h3>

            <p>
              Try another search or change
              your selected filter.
            </p>

            <button
              type="button"
              className="rv-primary"
              onClick={() => {
                setSearch("");
                setFilter("ALL");
              }}
            >
              Clear filters
            </button>

          </div>

        /* RESERVATION CARDS */

        ) : (
          <div className="rv-card-list">

            {filteredReservations.map(
              (reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  now={now}
                  onCancel={setCancelTarget}
                  onBorrow={handleBorrow}
                />
              )
            )}

          </div>
        )}

      </section>

      {/* =====================================
          INFORMATION PANEL
      ====================================== */}

      <section className="rv-help-panel">

        <div className="rv-help-icon">
          <Mail size={27} />
        </div>

        <div>
          <h3>How reservations work</h3>

          <p>
            When a book becomes available,
            you will receive an email.
            Borrow the book before your
            reservation hold expires.
            Otherwise, it may be offered
            to the next member.
          </p>
        </div>

        <Link to="/member/support">
          Need help?
          <ArrowRight size={16} />
        </Link>

      </section>

      {/* =====================================
          CANCEL CONFIRMATION MODAL
      ====================================== */}

      {cancelTarget && (
        <div
          className="rv-modal-overlay"
          onClick={() => {
            if (!cancelling) {
              setCancelTarget(null);
            }
          }}
        >

          <div
            className="rv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rv-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="rv-modal-close"
              aria-label="Close dialog"
              disabled={cancelling}
              onClick={() =>
                setCancelTarget(null)
              }
            >
              <X size={21} />
            </button>

            <div className="rv-modal-icon">
              <AlertCircle size={35} />
            </div>

            <h2 id="rv-modal-title">
              Cancel reservation?
            </h2>

            <p>
              Are you sure you want to cancel
              your reservation for
              <strong>
                {" "}
                {cancelTarget.bookTitle}
              </strong>
              ?
            </p>

            <div className="rv-modal-warning">
              You may lose your current queue
              position or reserved copy.
            </div>

            <div className="rv-modal-actions">

              <button
                type="button"
                className="rv-secondary"
                disabled={cancelling}
                autoFocus
                onClick={() =>
                  setCancelTarget(null)
                }
              >
                Keep reservation
              </button>

              <button
                type="button"
                className="rv-danger"
                disabled={cancelling}
                onClick={confirmCancellation}
              >
                {cancelling && (
                  <LoaderCircle
                    size={17}
                    className="rv-spin"
                  />
                )}

                {cancelling
                  ? "Cancelling..."
                  : "Yes, cancel"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}