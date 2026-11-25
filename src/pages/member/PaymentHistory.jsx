import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Wallet,
  ReceiptText,
  CreditCard,
  TicketPercent,
  Download,
  Search,
  RefreshCw,
  ArrowRight,
  Plus,
  ShieldCheck,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from "lucide-react";

import {
  paymentHistoryApi,
  formatMoney,
  formatPaymentDate,
} from "../../services/paymentHistoryApi";

import "../../styles/member/PaymentHistory.css";

const PAGE_SIZE = 6;

function getTransactionId(payment) {
  return (
    payment.transactionId ||
    `SLM-DEMO-${String(payment.id).padStart(8, "0")}`
  );
}

function getPaymentStatus(payment) {
  if (payment.status) {
    return String(payment.status).toUpperCase();
  }

  const original = Number(payment.originalPaise);
  const discount = Number(payment.discountPaise);
  const paid = Number(payment.paidPaise);

  return original > 0 &&
    discount === original &&
    paid === 0 &&
    payment.membershipId != null
    ? "SUCCESS"
    : "UNVERIFIED";
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [page, setPage] = useState(1);

  const [downloading, setDownloading] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(null);

  const [selectedReceipt, setSelectedReceipt] =
    useState(null);

  async function loadPayments() {
    setLoading(true);
    setError("");

    try {
      const response =
        await paymentHistoryApi.getPayments();

      const records = Array.isArray(response)
        ? response
        : response?.content;

      if (!Array.isArray(records)) {
        throw new Error("Invalid payment history response.");
      }

      setPayments(records);
      setPage(1);
    } catch (err) {
      setError(
        err.message || "Unable to load payment history."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!selectedReceipt) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedReceipt(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      );
  }, [selectedReceipt]);

  const summary = useMemo(() => {
    const successful = payments.filter(
      (payment) =>
        getPaymentStatus(payment) === "SUCCESS"
    );

    return {
      totalTransactions: payments.length,

      totalPaid: successful.reduce(
        (total, payment) =>
          total + Number(payment.paidPaise || 0),
        0
      ),

      totalSavings: successful.reduce(
        (total, payment) =>
          total + Number(payment.discountPaise || 0),
        0
      ),

      successful: successful.length,
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments
      .filter((payment) => {
        const status = getPaymentStatus(payment);

        const matchesStatus =
          statusFilter === "ALL" ||
          status === statusFilter;

        const searchable = [
          getTransactionId(payment),
          payment.couponCode,
          payment.id,
          payment.membershipId,
          payment.createdAt,
          "Monthly membership",
        ]
          .filter((value) => value != null)
          .join(" ")
          .toLowerCase();

        return (
          matchesStatus &&
          searchable.includes(query)
        );
      })
      .sort(
        (a, b) => Number(b.id) - Number(a.id)
      );
  }, [payments, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visiblePayments = filteredPayments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleDownload(paymentId) {
    if (downloading !== null) return;

    setDownloading(paymentId);
    setActionError("");

    try {
      await paymentHistoryApi.downloadReceipt(
        paymentId
      );
    } catch (err) {
      setActionError(
        err.message || "Unable to download receipt."
      );
    } finally {
      setDownloading(null);
    }
  }

  async function handleViewReceipt(paymentId) {
    if (detailsLoading !== null) return;

    setDetailsLoading(paymentId);
    setActionError("");

    try {
      const receipt =
        await paymentHistoryApi.getReceiptDetails(
          paymentId
        );

      setSelectedReceipt(receipt);
    } catch (err) {
      setActionError(
        err.message || "Unable to load receipt."
      );
    } finally {
      setDetailsLoading(null);
    }
  }

  const stats = [
    {
      label: "Total transactions",
      value: summary.totalTransactions,
      icon: ReceiptText,
      color: "purple",
      description: "All membership transactions",
    },
    {
      label: "Total amount paid",
      value: formatMoney(summary.totalPaid),
      icon: Wallet,
      color: "green",
      description: "Successful transactions",
    },
    {
      label: "Total savings",
      value: formatMoney(summary.totalSavings),
      icon: TicketPercent,
      color: "orange",
      description: "Savings through coupons",
    },
    {
      label: "Successful payments",
      value: summary.successful,
      icon: CheckCircle2,
      color: "blue",
      description: "Completed transactions",
    },
  ];

  return (
    <div className="ph-page">

      {/* Page Header */}

      <header className="ph-header">
        <div>
          <div className="ph-eyebrow">
            <Wallet size={15} />
            BILLING & TRANSACTIONS
          </div>

          <h1>Payment History</h1>

          <p>
            Manage your membership transactions
            and download payment receipts.
          </p>
        </div>

        <Link
          to="/member/membership/payment"
          className="ph-primary-btn"
        >
          <Plus size={18} />
          Buy membership
        </Link>
      </header>

      {/* Hero Banner */}

      <section className="ph-hero">
        <div className="ph-hero-content">
          <span className="ph-hero-label">
            <ShieldCheck size={15} />
            YOUR BILLING CENTER
          </span>

          <h2>
            Every transaction.
            <span> One place.</span>
          </h2>

          <p>
            Stay informed about your membership
            payments, coupon savings and receipts.
          </p>

          <div className="ph-hero-note">
            <CheckCircle2 size={17} />
            Secure membership transaction records
          </div>
        </div>

        <div
          className="ph-hero-art"
          aria-hidden="true"
        >
          <div className="ph-art-circle" />

          <div className="ph-art-card">
            <CreditCard size={40} />
          </div>

          <div className="ph-art-receipt">
            <ReceiptText size={65} />
          </div>

          <div className="ph-art-check">
            <CheckCircle2 size={31} />
          </div>
        </div>
      </section>

      {/* Statistics */}

      <section className="ph-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="ph-stat-card"
              key={stat.label}
            >
              <div
                className={
                  `ph-stat-icon ph-${stat.color}`
                }
              >
                <Icon size={23} />
              </div>

              <span>{stat.label}</span>

              <h2>
                {loading
                  ? "..."
                  : error
                  ? "—"
                  : stat.value}
              </h2>

              <p>{stat.description}</p>
            </article>
          );
        })}
      </section>

      {/* Transaction History */}

      <section className="ph-transactions">

        <div className="ph-section-header">
          <div>
            <h2>Transaction history</h2>

            <p>
              View your membership payment records.
            </p>
          </div>

          <button
            type="button"
            className="ph-outline-btn"
            onClick={loadPayments}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "ph-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}

        <div className="ph-filters">
          <div className="ph-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search transaction or coupon..."
              aria-label="Search transactions"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            aria-label="Filter payment status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">
              All statuses
            </option>

            <option value="SUCCESS">
              Successful
            </option>

            <option value="UNVERIFIED">
              Unverified
            </option>
          </select>
        </div>

        {/* Errors */}

        {error && (
          <div className="ph-error" role="alert">
            <AlertCircle size={20} />

            <div>
              <strong>
                Unable to load transactions
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadPayments}
            >
              Retry
            </button>
          </div>
        )}

        {actionError && (
          <div className="ph-error" role="alert">
            <AlertCircle size={20} />
            <p>{actionError}</p>

            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="ph-loading">
            <LoaderCircle
              size={32}
              className="ph-spin"
            />

            <p>Loading your transactions...</p>
          </div>
        )}

        {/* Empty State */}

        {!loading &&
          !error &&
          payments.length === 0 && (
            <div className="ph-empty">

              <div className="ph-empty-illustration">
                <ReceiptText size={52} />

                <div className="ph-empty-small">
                  <Wallet size={23} />
                </div>
              </div>

              <h3>No transactions yet</h3>

              <p>
                Your membership payments will appear
                here once you complete your first
                coupon redemption.
              </p>

              <Link
                to="/member/membership/payment"
                className="ph-primary-btn"
              >
                Explore membership
                <ArrowRight size={17} />
              </Link>
            </div>
          )}

        {/* No Search Results */}

        {!loading &&
          !error &&
          payments.length > 0 &&
          filteredPayments.length === 0 && (
            <div className="ph-empty">
              <div className="ph-empty-illustration">
                <Search size={45} />
              </div>

              <h3>No matching transactions</h3>

              <p>
                Try another search or change the
                selected status.
              </p>

              <button
                type="button"
                className="ph-outline-btn"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Transaction Table */}

        {!loading &&
          !error &&
          visiblePayments.length > 0 && (
            <>
              <div className="ph-table-wrapper">

                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>Coupon</th>
                      <th>Discount</th>
                      <th>Paid amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visiblePayments.map((payment) => {
                      const status =
                        getPaymentStatus(payment);

                      const successful =
                        status === "SUCCESS";

                      return (
                        <tr key={payment.id}>

                          <td>
                            <div className="ph-transaction-name">
                              <div className="ph-transaction-icon">
                                <CreditCard size={21} />
                              </div>

                              <div>
                                <strong>
                                  Monthly membership
                                </strong>

                                <span>
                                  {getTransactionId(
                                    payment
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="ph-date">
                              <CalendarDays size={15} />

                              {formatPaymentDate(
                                payment.createdAt
                              )}
                            </div>
                          </td>

                          <td>
                            <span className="ph-coupon">
                              <TicketPercent size={14} />

                              {payment.couponCode || "—"}
                            </span>
                          </td>

                          <td>
                            <strong className="ph-saving">
                              {formatMoney(
                                payment.discountPaise
                              )}
                            </strong>
                          </td>

                          <td>
                            <strong>
                              {formatMoney(
                                payment.paidPaise
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={
                                successful
                                  ? "ph-status ph-status-success"
                                  : "ph-status ph-status-warning"
                              }
                            >
                              {successful ? (
                                <CheckCircle2 size={13} />
                              ) : (
                                <AlertCircle size={13} />
                              )}

                              {successful
                                ? "Successful"
                                : status}
                            </span>
                          </td>

                          <td>
                            <div className="ph-actions">

                              <button
                                type="button"
                                title="View receipt"
                                aria-label={
                                  `View receipt ${payment.id}`
                                }
                                disabled={
                                  !successful ||
                                  detailsLoading !== null
                                }
                                onClick={() =>
                                  handleViewReceipt(
                                    payment.id
                                  )
                                }
                              >
                                {detailsLoading ===
                                payment.id ? (
                                  <LoaderCircle
                                    size={17}
                                    className="ph-spin"
                                  />
                                ) : (
                                  <Eye size={17} />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Download PDF receipt"
                                aria-label={
                                  `Download receipt ${payment.id}`
                                }
                                disabled={
                                  !successful ||
                                  downloading !== null
                                }
                                onClick={() =>
                                  handleDownload(
                                    payment.id
                                  )
                                }
                              >
                                {downloading ===
                                payment.id ? (
                                  <LoaderCircle
                                    size={17}
                                    className="ph-spin"
                                  />
                                ) : (
                                  <Download size={17} />
                                )}
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>

              </div>

              {/* Pagination */}

              <div className="ph-pagination">
                <p>
                  Showing{" "}
                  {(currentPage - 1) * PAGE_SIZE + 1}
                  {" "}–{" "}
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredPayments.length
                  )}
                  {" "}of {filteredPayments.length}
                  {" "}transactions
                </p>

                <div className="ph-pagination-controls">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPage(currentPage - 1)
                    }
                  >
                    <ChevronLeft size={18} />
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
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}

      </section>

      {/* Help Section */}

      <section className="ph-help">
        <div className="ph-help-icon">
          <ShieldCheck size={25} />
        </div>

        <div className="ph-help-content">
          <h3>Have a billing question?</h3>

          <p>
            Contact library support for assistance
            with membership payments and receipts.
          </p>
        </div>

        <Link
          to="/member/support"
          className="ph-outline-btn"
        >
          Contact support
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Receipt Details Modal */}

      {selectedReceipt && (
        <div
          className="ph-modal-overlay"
          onClick={() => setSelectedReceipt(null)}
        >
          <section
            className="ph-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ph-receipt-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="ph-modal-close"
              aria-label="Close receipt"
              autoFocus
              onClick={() => setSelectedReceipt(null)}
            >
              <X size={22} />
            </button>

            <div className="ph-modal-icon">
              <ReceiptText size={32} />
            </div>

            <h2 id="ph-receipt-title">
              Payment Receipt
            </h2>

            <p className="ph-modal-subtitle">
              Smart Library Membership
            </p>

            <div className="ph-receipt-details">

              {[
                [
                  "Receipt number",
                  selectedReceipt.receiptNumber,
                ],
                [
                  "Transaction ID",
                  selectedReceipt.transactionId,
                ],
                [
                  "Member name",
                  selectedReceipt.memberName,
                ],
                [
                  "Membership plan",
                  selectedReceipt.membershipPlan,
                ],
                [
                  "Payment date",
                  formatPaymentDate(
                    selectedReceipt.paymentDate
                  ),
                ],
                [
                  "Valid until",
                  formatPaymentDate(
                    selectedReceipt.membershipEndDate
                  ),
                ],
                [
                  "Coupon code",
                  selectedReceipt.couponCode,
                ],
                [
                  "Original amount",
                  formatMoney(
                    selectedReceipt.originalPaise
                  ),
                ],
                [
                  "Discount",
                  formatMoney(
                    selectedReceipt.discountPaise
                  ),
                ],
              ].map(([label, value]) => (
                <div
                  className="ph-receipt-row"
                  key={label}
                >
                  <span>{label}</span>
                  <strong>{value ?? "—"}</strong>
                </div>
              ))}

            </div>

            <div className="ph-receipt-total">
              <span>Total paid</span>

              <h2>
                {formatMoney(
                  selectedReceipt.paidPaise
                )}
              </h2>
            </div>

            {actionError && (
              <div className="ph-error" role="alert">
                <AlertCircle size={18} />
                {actionError}
              </div>
            )}

            <button
              type="button"
              className="ph-primary-btn ph-modal-download"
              disabled={downloading !== null}
              onClick={() =>
                handleDownload(
                  selectedReceipt.paymentId
                )
              }
            >
              {downloading !== null ? (
                <LoaderCircle
                  size={19}
                  className="ph-spin"
                />
              ) : (
                <Download size={19} />
              )}

              Download PDF receipt
            </button>

          </section>
        </div>
      )}

    </div>
  );
}