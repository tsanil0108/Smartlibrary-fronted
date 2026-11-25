import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Wallet,
  ReceiptText,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  BookX,
  Search,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Info,
  Eye,
  X,
  CalendarDays,
  CircleDollarSign,
  LibraryBig,
} from "lucide-react";

import {
  fineApi,
  formatFineAmount,
  formatFineDate,
  getFineType,
  getFineStatus,
} from "../../services/fineApi";

import "../../styles/member/Fines.css";

const PAGE_SIZE = 6;

const EMPTY_SUMMARY = {
  totalFines: 0,
  pendingFines: 0,
  paidFines: 0,
  waivedFines: 0,
  totalAmount: 0,
  pendingAmount: 0,
  paidAmount: 0,
  waivedAmount: 0,
};

// ==========================================
// FINE TYPE CONFIGURATION
// ==========================================

const TYPE_CONFIG = {
  OVERDUE: {
    icon: Clock,
    color: "orange",
  },

  DAMAGED: {
    icon: BookX,
    color: "red",
  },

  LOST: {
    icon: BookOpen,
    color: "purple",
  },
};

function FineTypeIcon({ type }) {
  const config = TYPE_CONFIG[type] || {
    icon: ReceiptText,
    color: "purple",
  };

  const Icon = config.icon;

  return (
    <div
      className={`fn-type-icon fn-${config.color}`}
    >
      <Icon size={20} />
    </div>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {
  return (
    <span
      className={`fn-badge fn-badge-${String(
        status || "unknown"
      ).toLowerCase()}`}
    >
      <span />
      {getFineStatus(status)}
    </span>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  icon: Icon,
  color,
  label,
  amount,
  count,
}) {
  return (
    <article className="fn-stat">

      <div className="fn-stat-top">

        <div className={`fn-stat-icon fn-${color}`}>
          <Icon size={24} />
        </div>

        <span className="fn-stat-count">
          {count ?? 0} records
        </span>

      </div>

      <span className="fn-stat-label">
        {label}
      </span>

      <h3>{formatFineAmount(amount)}</h3>

    </article>
  );
}

// ==========================================
// DETAIL ROW
// ==========================================

function DetailRow({ label, value }) {
  return (
    <div className="fn-detail-row">

      <span>{label}</span>

      <strong>{value ?? "—"}</strong>

    </div>
  );
}

// ==========================================
// FINE DETAILS MODAL
// ==========================================

function FineDetails({ fine, onClose }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [onClose]);

  return (
    <div
      className="fn-modal-overlay"
      onClick={onClose}
    >

      <div
        className="fn-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fn-modal-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          className="fn-modal-close"
          aria-label="Close fine details"
          onClick={onClose}
          autoFocus
        >
          <X size={21} />
        </button>

        <div className="fn-modal-heading">

          <FineTypeIcon type={fine.type} />

          <div>

            <h2 id="fn-modal-title">
              Fine details
            </h2>

            <p>Fine reference #{fine.id}</p>

          </div>

        </div>

        <div className="fn-modal-amount">

          <span>Fine amount</span>

          <h2>
            {formatFineAmount(fine.amount)}
          </h2>

          <StatusBadge status={fine.status} />

        </div>

        <div className="fn-modal-details">

          <DetailRow
            label="Book title"
            value={fine.bookTitle}
          />

          <DetailRow
            label="Loan reference"
            value={`#${fine.loanId ?? "—"}`}
          />

          <DetailRow
            label="Fine type"
            value={getFineType(fine.type)}
          />

          <DetailRow
            label="Issued on"
            value={formatFineDate(fine.createdAt)}
          />

          {fine.type === "OVERDUE" && (
            <DetailRow
              label="Overdue days"
              value={fine.overdueDays ?? 0}
            />
          )}

          {fine.status === "PAID" && (
            <>
              <DetailRow
                label="Payment date"
                value={formatFineDate(fine.paidAt)}
              />

              <DetailRow
                label="Payment method"
                value={fine.paymentMethod}
              />
            </>
          )}

          {fine.status === "WAIVED" && (
            <>
              <DetailRow
                label="Waived on"
                value={formatFineDate(fine.waivedAt)}
              />

              <DetailRow
                label="Waiver reason"
                value={fine.waiverReason}
              />
            </>
          )}

        </div>

        {fine.description && (
          <div className="fn-description">

            <strong>Description</strong>

            <p>{fine.description}</p>

          </div>
        )}

        {fine.status === "PENDING" && (
          <div className="fn-modal-note">

            <Info size={19} />

            <span>
              Contact the librarian to settle
              this outstanding fine.
            </span>

          </div>
        )}

        <div className="fn-modal-actions">

          <Link
            to="/member/support"
            className="fn-outline"
          >
            <Headphones size={17} />
            Get help
          </Link>

          <button
            type="button"
            className="fn-primary"
            onClick={onClose}
          >
            Close details
          </button>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// MAIN FINES PAGE
// ==========================================

export default function Fines() {
  const [summary, setSummary] =
    useState(EMPTY_SUMMARY);

  const [fines, setFines] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [page, setPage] =
    useState(1);

  const [selectedFine, setSelectedFine] =
    useState(null);

  // ========================================
  // LOAD FINES
  // ========================================

  async function loadFines() {
    setLoading(true);
    setError("");

    try {
      const response = await fineApi.getSummary();

      if (!response || typeof response !== "object") {
        throw new Error("Invalid fine summary response.");
      }

      let records = response.fines;

      if (!Array.isArray(records)) {
        const fineResponse =
          await fineApi.getMyFines();

        records = Array.isArray(fineResponse)
          ? fineResponse
          : fineResponse?.content;
      }

      if (!Array.isArray(records)) {
        throw new Error("Invalid fine records response.");
      }

      setSummary({
        ...EMPTY_SUMMARY,
        ...response,
      });

      setFines(records);

      setPage(1);

    } catch (err) {
      setError(
        err.message ||
        "Unable to load your fine records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFines();
  }, []);

  // ========================================
  // SEARCH & FILTER
  // ========================================

  const filteredFines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return fines
      .filter((fine) => {
        const matchesSearch = [
          fine.bookTitle,
          fine.description,
          fine.id,
          fine.loanId,
          getFineType(fine.type),
        ]
          .map((value) => String(value ?? ""))
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesStatus =
          statusFilter === "ALL" ||
          fine.status === statusFilter;

        const matchesType =
          typeFilter === "ALL" ||
          fine.type === typeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType
        );
      })
      .sort(
        (a, b) =>
          Number(b.id) - Number(a.id)
      );
  }, [fines, search, statusFilter, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFines.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleFines = filteredFines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const pendingAmount =
    Number(summary.pendingAmount || 0);

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setPage(1);
  }

  return (
    <div className="fn-page">

      {/* PAGE HEADER */}

      <header className="fn-header">

        <div>

          <span className="fn-eyebrow">
            <Wallet size={16} />
            ACCOUNT & FINANCES
          </span>

          <h1>My Fines & Charges</h1>

          <p>
            Track, review and manage your
            library fine records.
          </p>

        </div>

        <button
          type="button"
          className="fn-outline"
          onClick={loadFines}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "fn-spin" : ""}
          />
          Refresh records
        </button>

      </header>

      {loading ? (

        <div className="fn-empty">

          <LoaderCircle
            size={44}
            className="fn-spin"
          />

          <h3>Loading your fines...</h3>

          <p>Fetching your account information.</p>

        </div>

      ) : error ? (

        <div className="fn-empty">

          <AlertCircle size={44} />

          <h3>Unable to load fine records</h3>

          <p>{error}</p>

          <button
            type="button"
            className="fn-primary"
            onClick={loadFines}
          >
            Try again
          </button>

        </div>

      ) : (

        <>

          {/* OUTSTANDING BALANCE HERO */}

          <section className="fn-hero">

            <div className="fn-hero-content">

              <span className="fn-hero-label">
                YOUR LIBRARY ACCOUNT
              </span>

              <p>Total outstanding balance</p>

              <h2>
                {formatFineAmount(pendingAmount)}
              </h2>

              <div className="fn-hero-status">

                {pendingAmount > 0 ? (
                  <>
                    <Clock size={17} />
                    {summary.pendingFines} pending fines
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    No outstanding balance
                  </>
                )}

              </div>

              <p className="fn-hero-description">

                {pendingAmount > 0
                  ? "Contact your librarian to settle pending charges and avoid borrowing restrictions."
                  : "You have no outstanding recorded fines. Keep returning your books on time!"}

              </p>

              <Link
                to={
                  pendingAmount > 0
                    ? "/member/support"
                    : "/member/loans"
                }
                className="fn-hero-button"
              >

                {pendingAmount > 0
                  ? "Contact library"
                  : "View my loans"}

                <ArrowRight size={17} />

              </Link>

            </div>

            <div
              className="fn-hero-art"
              aria-hidden="true"
            >

              <div className="fn-art-circle" />

              <div className="fn-art-wallet">

                <Wallet size={75} />

                <div className="fn-art-wallet-line" />

              </div>

              <div className="fn-art-coin">
                ₹
              </div>

              <div className="fn-art-check">
                <ShieldCheck size={28} />
              </div>

            </div>

          </section>

          {/* SUMMARY CARDS */}

          <section className="fn-stats">

            <StatCard
              icon={ReceiptText}
              color="purple"
              label="Total fines"
              amount={summary.totalAmount}
              count={summary.totalFines}
            />

            <StatCard
              icon={Clock}
              color="orange"
              label="Pending amount"
              amount={summary.pendingAmount}
              count={summary.pendingFines}
            />

            <StatCard
              icon={CheckCircle2}
              color="green"
              label="Paid amount"
              amount={summary.paidAmount}
              count={summary.paidFines}
            />

            <StatCard
              icon={ShieldCheck}
              color="blue"
              label="Waived amount"
              amount={summary.waivedAmount}
              count={summary.waivedFines}
            />

          </section>

          {/* OUTSTANDING FINE NOTICE */}

          {pendingAmount > 0 && (
            <section className="fn-warning">

              <div className="fn-warning-icon">
                <ShieldAlert size={25} />
              </div>

              <div>

                <h3>
                  You have outstanding fines
                </h3>

                <p>
                  Pending fines may restrict new
                  book borrowing. Contact your
                  librarian to clear the balance.
                </p>

              </div>

              <Link to="/member/support">
                Get assistance
                <ArrowRight size={16} />
              </Link>

            </section>
          )}

          {/* FINE HISTORY */}

          <section className="fn-history">

            <div className="fn-section-heading">

              <div>

                <h2>Fine history</h2>

                <p>
                  Review all your library charges
                  and settlement records.
                </p>

              </div>

              <span className="fn-record-count">
                {fines.length} records
              </span>

            </div>

            {/* STATUS TABS */}

            <div className="fn-tabs">

              {[
                {
                  value: "ALL",
                  label: "All fines",
                  count: summary.totalFines,
                },
                {
                  value: "PENDING",
                  label: "Pending",
                  count: summary.pendingFines,
                },
                {
                  value: "PAID",
                  label: "Paid",
                  count: summary.paidFines,
                },
                {
                  value: "WAIVED",
                  label: "Waived",
                  count: summary.waivedFines,
                },
              ].map((tab) => (

                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={
                    statusFilter === tab.value
                  }
                  className={
                    statusFilter === tab.value
                      ? "fn-tab fn-tab-active"
                      : "fn-tab"
                  }
                  onClick={() =>
                    setStatusFilter(tab.value)
                  }
                >

                  {tab.label}

                  <span>{tab.count ?? 0}</span>

                </button>

              ))}

            </div>

            {/* SEARCH & FILTER */}

            <div className="fn-filters">

              <div className="fn-search">

                <Search size={19} />

                <input
                  type="search"
                  aria-label="Search fines"
                  placeholder="Search book, fine or loan..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

              </div>

              <select
                aria-label="Filter by fine type"
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
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

              {(search ||
                typeFilter !== "ALL" ||
                statusFilter !== "ALL") && (

                <button
                  type="button"
                  className="fn-clear"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>

              )}

            </div>

            {/* EMPTY STATE */}

            {visibleFines.length === 0 ? (

              <div className="fn-table-empty">

                <div className="fn-empty-icon">

                  {fines.length === 0 ? (
                    <ShieldCheck size={43} />
                  ) : (
                    <Search size={43} />
                  )}

                </div>

                <h3>

                  {fines.length === 0
                    ? "You're all clear!"
                    : "No matching fines"}

                </h3>

                <p>

                  {fines.length === 0
                    ? "You don't have any recorded library fines. Keep up your good reading habits."
                    : "Try changing your search or selected filters."}

                </p>

                {fines.length === 0 ? (

                  <Link
                    to="/member/loans"
                    className="fn-primary"
                  >
                    <BookOpen size={17} />
                    View my loans
                  </Link>

                ) : (

                  <button
                    type="button"
                    className="fn-outline"
                    onClick={clearFilters}
                  >
                    Reset filters
                  </button>

                )}

              </div>

            ) : (

              <>

                {/* FINE RECORDS TABLE */}

                <div className="fn-table-scroll">

                  <table className="fn-table">

                    <thead>

                      <tr>
                        <th>Book / Reference</th>
                        <th>Fine type</th>
                        <th>Issued date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>

                    </thead>

                    <tbody>

                      {visibleFines.map((fine) => (

                        <tr key={fine.id}>

                          <td>

                            <div className="fn-book-cell">

                              <FineTypeIcon
                                type={fine.type}
                              />

                              <div>

                                <strong>
                                  {fine.bookTitle ||
                                    "Library book"}
                                </strong>

                                <span>
                                  Fine #{fine.id}
                                  {" · "}
                                  Loan #{fine.loanId}
                                </span>

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="fn-type-cell">

                              <strong>
                                {getFineType(fine.type)}
                              </strong>

                              {fine.type === "OVERDUE" && (
                                <span>
                                  {fine.overdueDays ?? 0}
                                  {" overdue days"}
                                </span>
                              )}

                            </div>

                          </td>

                          <td>
                            {formatFineDate(
                              fine.createdAt
                            )}
                          </td>

                          <td>

                            <strong className="fn-amount">
                              {formatFineAmount(
                                fine.amount
                              )}
                            </strong>

                          </td>

                          <td>
                            <StatusBadge
                              status={fine.status}
                            />
                          </td>

                          <td>

                            <button
                              type="button"
                              className="fn-view-button"
                              aria-label={`View fine ${fine.id}`}
                              onClick={() =>
                                setSelectedFine(fine)
                              }
                            >
                              <Eye size={17} />
                              Details
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

                {/* PAGINATION */}

                <div className="fn-pagination">

                  <p>
                    Showing{" "}
                    {(currentPage - 1) * PAGE_SIZE + 1}
                    {"–"}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredFines.length
                    )}
                    {" of "}
                    {filteredFines.length} records
                  </p>

                  <div className="fn-page-controls">

                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setPage(currentPage - 1)
                      }
                    >
                      <ChevronLeft size={19} />
                    </button>

                    <span>
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        setPage(currentPage + 1)
                      }
                    >
                      <ChevronRight size={19} />
                    </button>

                  </div>

                </div>

              </>

            )}

          </section>

          {/* FINE POLICY & HELP */}

          <section className="fn-bottom-grid">

            <article className="fn-policy">

              <div className="fn-panel-heading">

                <div className="fn-stat-icon fn-purple">
                  <LibraryBig size={24} />
                </div>

                <div>

                  <h2>Library fine policy</h2>

                  <p>
                    Standard library charges.
                  </p>

                </div>

              </div>

              {[
                {
                  icon: Clock,
                  title: "Overdue charges",
                  description:
                    "For each day after the due date",
                  amount: "₹5 / day",
                  color: "orange",
                },
                {
                  icon: CircleDollarSign,
                  title: "Maximum overdue fine",
                  description:
                    "Maximum overdue charge per loan",
                  amount: "₹500",
                  color: "purple",
                },
                {
                  icon: BookX,
                  title: "Damaged book",
                  description:
                    "For books returned damaged",
                  amount: "₹200",
                  color: "red",
                },
                {
                  icon: BookOpen,
                  title: "Lost book",
                  description:
                    "For books reported as lost",
                  amount: "₹500",
                  color: "blue",
                },
              ].map((policy) => {

                const Icon = policy.icon;

                return (
                  <div
                    className="fn-policy-row"
                    key={policy.title}
                  >

                    <div
                      className={`fn-policy-icon fn-${policy.color}`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="fn-policy-text">

                      <strong>{policy.title}</strong>

                      <span>{policy.description}</span>

                    </div>

                    <strong className="fn-policy-amount">
                      {policy.amount}
                    </strong>

                  </div>
                );
              })}

              <div className="fn-policy-note">

                <Info size={16} />

                <span>
                  Standard rates are shown for reference.
                  Actual charges are calculated by the
                  library backend.
                </span>

              </div>

            </article>

            <article className="fn-help">

              <div className="fn-help-icon">
                <Headphones size={34} />
              </div>

              <h2>Need help with a fine?</h2>

              <p>
                If you believe a fine is incorrect
                or need assistance with settlement,
                contact our library support team.
              </p>

              <div className="fn-help-feature">

                <CheckCircle2 size={18} />
                Request a fine review

              </div>

              <div className="fn-help-feature">

                <CheckCircle2 size={18} />
                Ask about payment options

              </div>

              <div className="fn-help-feature">

                <CheckCircle2 size={18} />
                Request waiver consideration

              </div>

              <Link
                to="/member/support"
                className="fn-primary"
              >
                Contact support
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/member/loans"
                className="fn-help-link"
              >
                <CalendarDays size={17} />
                Check upcoming return dates
              </Link>

            </article>

          </section>

        </>

      )}

      {/* FINE DETAILS MODAL */}

      {selectedFine && (
        <FineDetails
          fine={selectedFine}
          onClose={() => setSelectedFine(null)}
        />
      )}

    </div>
  );
}