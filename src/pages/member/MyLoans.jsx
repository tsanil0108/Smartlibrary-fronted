import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  BookOpen,
  LibraryBig,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
  Search,
  History,
  LoaderCircle,
  BookCheck,
  RotateCcw,
  Wallet,
  X,
} from "lucide-react";

import {
  loanApi,
  formatLoanDate,
  getDaysRemaining,
  formatFine,
} from "../../services/loanApi";

import "../../styles/member/MyLoans.css";

import bookPlaceholder from "../../assets/images/book-placeholder.svg";

// ==========================================
// BOOK HELPERS
// ==========================================

function getBook(loan) {
  return {
    id:
      loan.bookId ??
      loan.book?.id ??
      loan.copy?.book?.id,

    title:
      loan.bookTitle ??
      loan.title ??
      loan.book?.title ??
      loan.copy?.book?.title ??
      "Library book",

    author:
      loan.author ??
      loan.book?.author ??
      loan.copy?.book?.author ??
      "",

    coverUrl:
      loan.coverUrl ??
      loan.book?.coverUrl ??
      loan.copy?.book?.coverUrl,

    isbn:
      loan.isbn ??
      loan.book?.isbn ??
      loan.copy?.book?.isbn,
  };
}

function isActive(loan) {
  return loan.status === "ACTIVE";
}

function isOverdue(loan) {
  const days = getDaysRemaining(loan.dueDate);

  return (
    isActive(loan) &&
    days !== null &&
    days < 0
  );
}

// ==========================================
// BOOK COVER
// ==========================================

function LoanBookCover({ book }) {
  const isbn = String(book.isbn || "")
    .replace(/[^0-9Xx]/g, "");

  const cover =
    book.coverUrl ||
    (
      isbn
        ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`
        : bookPlaceholder
    );

  return (
    <div className="ml-book-cover">
      <img
        src={cover}
        alt={book.title}
        loading="lazy"
        onError={(event) => {
          if (
            event.currentTarget.getAttribute("src") !==
            bookPlaceholder
          ) {
            event.currentTarget.src =
              bookPlaceholder;
          }
        }}
      />
    </div>
  );
}

// ==========================================
// STATUS
// ==========================================

function LoanStatus({ loan }) {
  const days = getDaysRemaining(loan.dueDate);

  let label = loan.status || "Unknown";
  let type = "neutral";

  if (isOverdue(loan)) {
    label = "Overdue";
    type = "danger";
  } else if (
    isActive(loan) &&
    days !== null &&
    days <= 3
  ) {
    label = "Due soon";
    type = "warning";
  } else if (isActive(loan)) {
    label = "Active";
    type = "success";
  } else if (loan.status === "RETURNED") {
    label = "Returned";
    type = "success";
  } else if (loan.status === "LOST") {
    label = "Lost";
    type = "danger";
  }

  return (
    <span className={`ml-status ml-${type}`}>
      <span className="ml-status-dot" />
      {label}
    </span>
  );
}

// ==========================================
// ACTIVE LOAN CARD
// ==========================================

function ActiveLoanCard({
  loan,
  onAction,
  busy,
}) {
  const book = getBook(loan);

  const days = getDaysRemaining(
    loan.dueDate
  );

  const overdue =
    days !== null && days < 0;

  const dueSoon =
    days !== null &&
    days >= 0 &&
    days <= 3;

  const issuedAt =
    loan.issueDate ||
    loan.borrowedAt ||
    loan.issuedAt;

  const issuedTime = Date.parse(
    String(issuedAt || "").slice(0, 10)
  );

  const dueTime = Date.parse(
    String(loan.dueDate || "").slice(0, 10)
  );

  const duration =
    (dueTime - issuedTime) / 86400000;

  const progress =
    Number.isFinite(duration) &&
    duration > 0 &&
    days !== null
      ? Math.min(
          100,
          Math.max(0, (days / duration) * 100)
        )
      : null;

  const renewals =
    loan.renewalCount ??
    loan.renewCount ??
    loan.renewals ??
    null;

  return (
    <article className="ml-loan-card">

      <div className="ml-card-body">

        <LoanBookCover book={book} />

        <div className="ml-book-info">

          <div className="ml-book-heading">

            <div>
              <span className="ml-reference">
                LOAN #{loan.id}
              </span>

              <h3>{book.title}</h3>

              <p>{book.author}</p>
            </div>

            <LoanStatus loan={loan} />

          </div>

          <div className="ml-date-grid">

            <div>
              <CalendarDays size={19} />

              <section>
                <span>Borrowed on</span>

                <strong>
                  {formatLoanDate(issuedAt)}
                </strong>
              </section>
            </div>

            <div>
              <Clock size={19} />

              <section>
                <span>Return by</span>

                <strong>
                  {formatLoanDate(loan.dueDate)}
                </strong>
              </section>
            </div>

          </div>

          <div className="ml-progress-heading">

            <span>Time remaining</span>

            <strong
              className={
                overdue
                  ? "ml-red-text"
                  : dueSoon
                  ? "ml-orange-text"
                  : "ml-green-text"
              }
            >
              {days === null
                ? "Unavailable"
                : overdue
                ? `${Math.abs(days)} days overdue`
                : days === 0
                ? "Due today"
                : `${days} days left`}
            </strong>

          </div>

          {progress !== null && (
            <div
              className="ml-progress-track"
              role="progressbar"
              aria-label="Loan time remaining"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className={
                  overdue
                    ? "ml-progress-red"
                    : dueSoon
                    ? "ml-progress-orange"
                    : "ml-progress-purple"
                }
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          )}

          {renewals !== null && (
            <div className="ml-renewal-count">
              <RefreshCw size={14} />

              Renewals used: {renewals}
            </div>
          )}

          {overdue && (
            <div className="ml-alert ml-alert-danger">
              <AlertCircle size={19} />

              <span>
                This book is overdue.
                Additional fines may apply.
              </span>
            </div>
          )}

          {dueSoon && (
            <div className="ml-alert ml-alert-warning">
              <Clock size={19} />

              <span>
                Your return date is approaching.
                Return or renew your book on time.
              </span>
            </div>
          )}

        </div>

      </div>

      <div className="ml-card-footer">

        {book.id ? (
          <Link
            className="ml-text-link"
            to={`/books/${book.id}`}
          >
            View book
            <ArrowRight size={16} />
          </Link>
        ) : (
          <span />
        )}

        <div className="ml-actions">

          <button
            type="button"
            className="ml-outline"
            disabled={busy || overdue}
            onClick={() =>
              onAction("renew", loan)
            }
          >
            <RefreshCw size={17} />
            Renew book
          </button>

          <button
            type="button"
            className="ml-primary"
            disabled={busy}
            onClick={() =>
              onAction("return", loan)
            }
          >
            <RotateCcw size={17} />
            Return book
          </button>

        </div>

      </div>

    </article>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function MyLoans() {
  const [loans, setLoans] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const [action, setAction] =
    useState(null);

  const [processing, setProcessing] =
    useState(false);

  const [fine, setFine] =
    useState(null);

  const [fineLoading, setFineLoading] =
    useState(false);

  const [fineError, setFineError] =
    useState("");

  // ========================================
  // LOAD LOANS
  // ========================================

  async function loadLoans() {
    setLoading(true);
    setError("");

    try {
      const data =
        await loanApi.getMyLoans();

      setLoans(data);
    } catch (err) {
      setError(
        err.message ||
        "Unable to load loans."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice(null);
    }, 6000);

    return () => clearTimeout(timer);
  }, [notice]);

  // ========================================
  // FINE ESTIMATE
  // ========================================

  useEffect(() => {
    if (action?.type !== "return") {
      return;
    }

    let cancelled = false;

    setFineLoading(true);
    setFine(null);
    setFineError("");

    loanApi
      .getFineEstimate(action.loan.id)
      .then((data) => {
        if (!cancelled) {
          setFine(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFineError(
            err.message ||
            "Fine estimate unavailable."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setFineLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [action]);

  // ========================================
  // MODAL KEYBOARD SUPPORT
  // ========================================

  useEffect(() => {
    if (!action) return;

    function handleKey(event) {
      if (
        event.key === "Escape" &&
        !processing
      ) {
        setAction(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [action, processing]);

  // ========================================
  // LOAN STATISTICS
  // ========================================

  const activeLoans = useMemo(
    () =>
      loans
        .filter(isActive)
        .sort((a, b) =>
          String(a.dueDate || "").localeCompare(
            String(b.dueDate || "")
          )
        ),
    [loans]
  );

  const overdueLoans = activeLoans.filter(
    isOverdue
  );

  const dueSoonLoans = activeLoans.filter(
    (loan) => {
      const days = getDaysRemaining(
        loan.dueDate
      );

      return (
        days !== null &&
        days >= 0 &&
        days <= 3
      );
    }
  );

  const returnedLoans = loans.filter(
    (loan) => loan.status === "RETURNED"
  );

  const stats = [
    {
      label: "Total borrowed",
      value: loans.length,
      icon: LibraryBig,
      color: "purple",
    },
    {
      label: "Active loans",
      value: activeLoans.length,
      icon: BookOpen,
      color: "blue",
    },
    {
      label: "Due soon",
      value: dueSoonLoans.length,
      icon: Clock,
      color: "orange",
    },
    {
      label: "Overdue",
      value: overdueLoans.length,
      icon: AlertCircle,
      color: "red",
    },
  ];

  // ========================================
  // SEARCH & HISTORY
  // ========================================

  const history = useMemo(() => {
    const query = search.trim().toLowerCase();

    return loans
      .filter((loan) => {
        const book = getBook(loan);

        const matchesSearch = [
          book.title,
          book.author,
          loan.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesFilter =
          filter === "ALL" ||
          (
            filter === "OVERDUE" &&
            isOverdue(loan)
          ) ||
          loan.status === filter;

        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          Number(b.id) - Number(a.id)
      );
  }, [loans, search, filter]);

  // ========================================
  // OPEN CONFIRMATION
  // ========================================

  function openAction(type, loan) {
    setFine(null);
    setFineError("");
    setFineLoading(type === "return");

    setAction({
      type,
      loan,
    });
  }

  // ========================================
  // RETURN / RENEW
  // ========================================

  async function confirmAction() {
    if (!action || processing) return;

    setProcessing(true);

    try {
      if (action.type === "renew") {
        await loanApi.renewLoan(
          action.loan.id
        );
      } else {
        await loanApi.returnLoan(
          action.loan.id
        );
      }

      setNotice({
        type: "success",
        message:
          action.type === "renew"
            ? "Book renewed successfully."
            : "Book returned successfully.",
      });

      setAction(null);

      await loadLoans();

    } catch (err) {
      setAction(null);

      setNotice({
        type: "error",
        message:
          err.message ||
          "Unable to complete the request.",
      });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="ml-page">

      {/* PAGE HEADER */}

      <header className="ml-header">

        <div>
          <span className="ml-eyebrow">
            <BookOpen size={16} />
            YOUR READING JOURNEY
          </span>

          <h1>My Loans & History</h1>

          <p>
            Manage borrowed books, renewals
            and return dates.
          </p>
        </div>

        <Link
          to="/member/books"
          className="ml-primary"
        >
          <LibraryBig size={18} />
          Browse books
        </Link>

      </header>

      {/* HERO */}

      <section className="ml-hero">

        <div className="ml-hero-content">

          <span>
            KEEP READING, KEEP GROWING
          </span>

          <h2>
            Every book is a
            <br />
            <em>new adventure.</em>
          </h2>

          <p>
            Stay on top of your reading journey.
            Track your books and never miss
            a return date.
          </p>

          <Link to="/member/books">
            Explore more books
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

      {/* STATISTICS */}

      <section className="ml-stats">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="ml-stat"
              key={stat.label}
            >
              <div
                className={`ml-stat-icon ml-icon-${stat.color}`}
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

      {/* NOTIFICATION MESSAGE */}

      {notice && (
        <div
          role="status"
          className={`ml-notice ml-notice-${notice.type}`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
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

      {/* OVERDUE ALERT */}

      {!loading &&
        !error &&
        overdueLoans.length > 0 && (
          <section className="ml-overdue-banner">

            <AlertCircle size={28} />

            <div>
              <h3>
                You have {overdueLoans.length}
                {" "}overdue book(s)
              </h3>

              <p>
                Return your overdue books to
                avoid additional fines.
              </p>
            </div>

            <Link to="/member/fines">
              View fines
              <ArrowRight size={16} />
            </Link>

          </section>
        )}

      {/* ACTIVE LOANS HEADER */}

      <div className="ml-section-heading">

        <div>
          <h2>Currently borrowed</h2>

          <p>
            Your active books and return dates.
          </p>
        </div>

        <button
          type="button"
          className="ml-outline"
          onClick={loadLoans}
          disabled={loading || processing}
        >
          <RefreshCw
            size={17}
            className={loading ? "ml-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {/* LOADING / ERROR / EMPTY */}

      {loading ? (
        <div className="ml-empty">
          <LoaderCircle
            size={42}
            className="ml-spin"
          />

          <h3>Loading your books...</h3>
        </div>
      ) : error ? (
        <div className="ml-empty">

          <AlertCircle size={42} />

          <h3>Unable to load loans</h3>

          <p>{error}</p>

          <button
            type="button"
            className="ml-primary"
            onClick={loadLoans}
          >
            Try again
          </button>

        </div>
      ) : activeLoans.length === 0 ? (
        <div className="ml-empty">

          <div className="ml-empty-icon">
            <BookOpen size={48} />
          </div>

          <h3>No active borrowed books</h3>

          <p>
            Discover your next favourite book
            from our library collection.
          </p>

          <Link
            to="/member/books"
            className="ml-primary"
          >
            Explore books
            <ArrowRight size={17} />
          </Link>

        </div>
      ) : (
        <div className="ml-loan-list">

          {activeLoans.map((loan) => (
            <ActiveLoanCard
              key={loan.id}
              loan={loan}
              busy={processing}
              onAction={openAction}
            />
          ))}

        </div>
      )}

      {/* BORROWING HISTORY */}

      {!loading && !error && (
        <section className="ml-history">

          <div className="ml-section-heading">

            <div>
              <h2>
                <History size={23} />
                Borrowing history
              </h2>

              <p>
                Your complete library activity.
              </p>
            </div>

            <span className="ml-history-count">
              {returnedLoans.length} returned
            </span>

          </div>

          <div className="ml-history-panel">

            <div className="ml-filters">

              <div className="ml-search">

                <Search size={19} />

                <input
                  type="search"
                  placeholder="Search books..."
                  aria-label="Search loan history"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

              </div>

              <select
                aria-label="Filter loan status"
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All statuses
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="RETURNED">
                  Returned
                </option>

                <option value="OVERDUE">
                  Overdue
                </option>

                <option value="LOST">
                  Lost
                </option>
              </select>

            </div>

            {history.length === 0 ? (
              <div className="ml-history-empty">

                <History size={38} />

                <h3>No matching records</h3>

                <p>
                  Your borrowing activity
                  will appear here.
                </p>

              </div>
            ) : (
              <div className="ml-table-wrapper">

                <table className="ml-table">

                  <thead>
                    <tr>
                      <th>Book details</th>
                      <th>Borrowed on</th>
                      <th>Due date</th>
                      <th>Returned on</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {history.map((loan) => {
                      const book = getBook(loan);

                      return (
                        <tr key={loan.id}>

                          <td>
                            <div className="ml-table-book">

                              <div className="ml-table-cover">
                                <LoanBookCover
                                  book={book}
                                />
                              </div>

                              <div>
                                <strong>
                                  {book.title}
                                </strong>

                                <small>
                                  {book.author}
                                </small>
                              </div>

                            </div>
                          </td>

                          <td>
                            {formatLoanDate(
                              loan.issueDate ||
                              loan.borrowedAt ||
                              loan.issuedAt
                            )}
                          </td>

                          <td>
                            {formatLoanDate(
                              loan.dueDate
                            )}
                          </td>

                          <td>
                            {formatLoanDate(
                              loan.returnedAt ||
                              loan.returnDate
                            )}
                          </td>

                          <td>
                            <LoanStatus loan={loan} />
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

            <div className="ml-table-footer">
              Showing {history.length} of
              {" "}{loans.length} records
            </div>

          </div>

        </section>
      )}

      {/* INFORMATION PANEL */}

      <section className="ml-help">

        <div className="ml-help-icon">
          <BookCheck size={28} />
        </div>

        <div>
          <h3>Responsible reading</h3>

          <p>
            Return books on time to keep
            your account in good standing.
            Renewal requests depend on
            membership and book availability.
          </p>
        </div>

        <Link to="/member/support">
          Need help?
          <ArrowRight size={16} />
        </Link>

      </section>

      {/* CONFIRMATION MODAL */}

      {action && (
        <div
          className="ml-modal-overlay"
          onClick={() => {
            if (!processing) {
              setAction(null);
            }
          }}
        >

          <div
            className="ml-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ml-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="ml-modal-close"
              aria-label="Close dialog"
              disabled={processing}
              onClick={() =>
                setAction(null)
              }
            >
              <X size={21} />
            </button>

            <div className="ml-modal-icon">
              {action.type === "renew" ? (
                <RefreshCw size={32} />
              ) : (
                <RotateCcw size={32} />
              )}
            </div>

            <h2 id="ml-modal-title">
              {action.type === "renew"
                ? "Renew this book?"
                : "Return this book?"}
            </h2>

            <p>
              {action.type === "renew"
                ? "Request an extension for "
                : "Confirm the return of "}

              <strong>
                {getBook(action.loan).title}
              </strong>
              .
            </p>

            {action.type === "renew" && (
              <div className="ml-modal-info">
                Your new due date will be
                calculated by the library system.
                Renewal is subject to eligibility.
              </div>
            )}

            {action.type === "return" && (
              <div className="ml-fine-box">

                <Wallet size={22} />

                <div>
                  <span>
                    Estimated return fine
                  </span>

                  <strong>
                    {fineLoading
                      ? "Calculating..."
                      : fineError
                      ? "Unavailable"
                      : fine?.totalFine != null
                      ? formatFine(fine.totalFine)
                      : "Unavailable"}
                  </strong>

                  <small>
                    Final charges are calculated
                    by the backend.
                  </small>
                </div>

              </div>
            )}

            {action.type === "return" && (
              <p className="ml-return-warning">
                Confirm only after you have
                physically returned the book.
              </p>
            )}

            <div className="ml-modal-actions">

              <button
                type="button"
                className="ml-outline"
                disabled={processing}
                autoFocus
                onClick={() =>
                  setAction(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="ml-primary"
                disabled={
                  processing ||
                  (
                    action.type === "return" &&
                    fineLoading
                  )
                }
                onClick={confirmAction}
              >
                {processing && (
                  <LoaderCircle
                    size={17}
                    className="ml-spin"
                  />
                )}

                {processing
                  ? "Processing..."
                  : action.type === "renew"
                  ? "Confirm renewal"
                  : "Confirm return"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}