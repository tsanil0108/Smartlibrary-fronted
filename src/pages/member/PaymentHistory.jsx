import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Wallet,
  ReceiptText,
  TicketPercent,
  CheckCircle2,
  CreditCard,
  Search,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  ShieldCheck,
  X,
  Smartphone,
  Landmark,
} from "lucide-react";

import {
  paymentHistoryApi,
  getPaymentStatus,
  getTransactionId,
  getPaymentMethod,
  canDownloadReceipt,
  formatMoney,
  formatPaymentDate,
} from "../../services/paymentHistoryApi";

import "../../styles/member/PaymentHistory.css";

const PAGE_SIZE = 6;

// ==========================================
// PAYMENT METHOD ICON
// ==========================================

function MethodIcon({ payment }) {

  const method = String(
    payment?.paymentMethod || ""
  ).toUpperCase();

  if (method === "UPI") {
    return <Smartphone size={20} />;
  }

  if (method === "NETBANKING") {
    return <Landmark size={20} />;
  }

  if (
    method === "COUPON" ||
    method === "DEMO_COUPON"
  ) {
    return <TicketPercent size={20} />;
  }

  return <CreditCard size={20} />;
}

// ==========================================
// PAYMENT STATUS
// ==========================================

function PaymentStatus({ status }) {

  const className =
    status === "SUCCESS"
      ? "success"
      : status === "FAILED"
        ? "danger"
        : status === "REFUNDED"
          ? "neutral"
          : "warning";

  return (

    <span className={`ph-status ph-status-${className}`}>

      {status === "SUCCESS" && (
        <CheckCircle2 size={13} />
      )}

      {status === "SUCCESS"
        ? "Successful"
        : status.replaceAll("_", " ")}

    </span>
  );
}

// ==========================================
// RECEIPT DETAIL ROW
// ==========================================

function Detail({ label, value }) {

  return (

    <div className="ph-detail-row">

      <span>{label}</span>

      <strong>{value ?? "—"}</strong>

    </div>
  );
}

// ==========================================
// RECEIPT MODAL
// ==========================================

function ReceiptModal({
  receipt,
  onClose,
  onDownload,
  downloading,
}) {

  useEffect(() => {

    function onKeyDown(event) {

      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => document.removeEventListener(
      "keydown",
      onKeyDown
    );

  }, [onClose]);

  return (

    <div
      className="ph-modal-overlay"
      onClick={onClose}
    >

      <section
        className="ph-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ph-receipt-title"
        onClick={(event) => event.stopPropagation()}
      >

        <div className="ph-modal-header">

          <div className="ph-modal-icon">

            <ReceiptText size={25} />

          </div>

          <div>

            <h2 id="ph-receipt-title">
              Payment Receipt
            </h2>

            <p>{receipt.receiptNumber}</p>

          </div>

          <button
            className="ph-close-btn"
            onClick={onClose}
            aria-label="Close receipt"
            autoFocus
          >

            <X size={21} />

          </button>

        </div>

        <div className="ph-modal-body">

          <div className="ph-receipt-success">

            <CheckCircle2 size={20} />

            Payment successfully verified

          </div>

          <h3>Member Details</h3>

          <Detail
            label="Member name"
            value={receipt.memberName}
          />

          <Detail
            label="Email"
            value={receipt.email}
          />

          <Detail
            label="Member ID"
            value={receipt.userId}
          />

          <h3>Membership Details</h3>

          <Detail
            label="Plan"
            value={receipt.membershipPlan}
          />

          <Detail
            label="Valid from"
            value={formatPaymentDate(
              receipt.membershipStartDate
            )}
          />

          <Detail
            label="Valid until"
            value={formatPaymentDate(
              receipt.membershipEndDate
            )}
          />

          <h3>Payment Details</h3>

          <Detail
            label="Transaction ID"
            value={receipt.transactionId}
          />

          <Detail
            label="Payment date"
            value={formatPaymentDate(
              receipt.paymentDate
            )}
          />

          <Detail
            label="Payment method"
            value={getPaymentMethod(receipt)}
          />

          <Detail
            label="Coupon code"
            value={receipt.couponCode || "Not applied"}
          />

          <Detail
            label="Original price"
            value={formatMoney(receipt.originalPaise)}
          />

          <Detail
            label="Discount"
            value={`−${formatMoney(
              receipt.discountPaise
            )}`}
          />

          <div className="ph-receipt-total">

            <span>Total Paid</span>

            <strong>
              {formatMoney(receipt.paidPaise)}
            </strong>

          </div>

        </div>

        <div className="ph-modal-footer">

          <button
            className="ph-outline-btn"
            onClick={onClose}
          >

            Close

          </button>

          <button
            className="ph-primary-btn"
            onClick={() => onDownload(receipt.paymentId)}
            disabled={downloading}
          >

            {downloading
              ? <LoaderCircle size={17} className="ph-spin" />
              : <Download size={17} />}

            Download PDF

          </button>

        </div>

      </section>

    </div>
  );
}

// ==========================================
// PAYMENT HISTORY PAGE
// ==========================================

export default function PaymentHistory() {

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [methodFilter, setMethodFilter] =
    useState("ALL");

  const [page, setPage] = useState(1);

  const [selectedReceipt, setSelectedReceipt] =
    useState(null);

  const [viewingId, setViewingId] =
    useState(null);

  const [downloadingId, setDownloadingId] =
    useState(null);

  // ==========================================
  // LOAD PAYMENTS
  // ==========================================

  async function loadPayments() {

    setLoading(true);

    setError("");

    try {

      const response =
        await paymentHistoryApi.getPayments();

      const list = Array.isArray(response)

        ? response

        : Array.isArray(response?.content)

          ? response.content

          : null;

      if (!list) {

        throw new Error(
          "Invalid payment history response."
        );
      }

      setPayments(list);

    } catch (err) {

      setError(
        err.message ||
        "Unable to load payment history."
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

  }, [search, statusFilter, methodFilter]);

  // ==========================================
  // PAYMENT STATISTICS
  // ==========================================

  const stats = useMemo(() => {

    const successful = payments.filter(
      (payment) => canDownloadReceipt(payment)
    );

    return {

      total: payments.length,

      successful: successful.length,

      paid: successful.reduce(
        (sum, payment) =>
          sum + Number(payment.paidPaise || 0),
        0
      ),

      savings: successful.reduce(
        (sum, payment) =>
          sum + Number(payment.discountPaise || 0),
        0
      ),
    };

  }, [payments]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredPayments = useMemo(() => {

    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {

      const status = getPaymentStatus(payment);

      const method = String(
        payment.paymentMethod || ""
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        statusFilter === status;

      const matchesMethod =
        methodFilter === "ALL" ||
        methodFilter === method ||
        (
          methodFilter === "COUPON" &&
          method === "DEMO_COUPON"
        );

      const searchable = [

        getTransactionId(payment),

        getPaymentMethod(payment),

        payment.couponCode,

        payment.id,

      ].filter(Boolean).join(" ").toLowerCase();

      return (

        matchesStatus &&

        matchesMethod &&

        searchable.includes(query)
      );
    });

  }, [
    payments,
    search,
    statusFilter,
    methodFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visiblePayments = filteredPayments.slice(

    (currentPage - 1) * PAGE_SIZE,

    currentPage * PAGE_SIZE
  );

  // ==========================================
  // VIEW RECEIPT
  // ==========================================

  async function handleViewReceipt(paymentId) {

    if (viewingId !== null) return;

    setViewingId(paymentId);

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

      setViewingId(null);
    }
  }

  // ==========================================
  // DOWNLOAD RECEIPT
  // ==========================================

  async function handleDownload(paymentId) {

    if (downloadingId !== null) return;

    setDownloadingId(paymentId);

    setActionError("");

    try {

      await paymentHistoryApi.downloadReceipt(
        paymentId
      );

    } catch (err) {

      setSelectedReceipt(null);

      setActionError(
        err.message || "Receipt download failed."
      );

    } finally {

      setDownloadingId(null);
    }
  }

  const statCards = [

    {
      label: "Total Transactions",
      value: stats.total,
      icon: ReceiptText,
      color: "purple",
    },

    {
      label: "Total Paid",
      value: formatMoney(stats.paid),
      icon: Wallet,
      color: "purple",
    },

    {
      label: "Coupon Savings",
      value: formatMoney(stats.savings),
      icon: TicketPercent,
      color: "orange",
    },

    {
      label: "Successful Payments",
      value: stats.successful,
      icon: CheckCircle2,
      color: "green",
    },
  ];

  // ==========================================
  // PAGE UI
  // ==========================================

  return (

    <div className="ph-page">

      <header className="ph-page-header">

        <div>

          <span className="ph-eyebrow">
            MEMBER SERVICES
          </span>

          <h1>Payment History</h1>

          <p>
            Manage your membership payments and receipts.
          </p>

        </div>

        <Link
          className="ph-primary-btn"
          to="/member/membership/payment"
        >

          Buy Membership

          <ArrowRight size={17} />

        </Link>

      </header>

      <section className="ph-hero">

        <div>

          <span className="ph-hero-label">

            <ShieldCheck size={15} />

            SECURE TRANSACTIONS

          </span>

          <h2>
            Every payment.
            <br />
            All in one place.
          </h2>

          <p>
            Track online payments, coupon savings
            and download your membership receipts.
          </p>

        </div>

        <div className="ph-hero-art">

          <Wallet size={65} strokeWidth={1.5} />

        </div>

      </section>

      <section className="ph-stats">

        {statCards.map((stat) => {

          const Icon = stat.icon;

          return (

            <article
              className="ph-stat-card"
              key={stat.label}
            >

              <div
                className={`ph-stat-icon ph-${stat.color}`}
              >

                <Icon size={22} />

              </div>

              <span>{stat.label}</span>

              <strong>
                {loading || error ? "—" : stat.value}
              </strong>

            </article>
          );
        })}

      </section>

      {actionError && (

        <div className="ph-error">

          <AlertCircle size={20} />

          <span>{actionError}</span>

          <button
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
          >

            <X size={17} />

          </button>

        </div>
      )}

      <section className="ph-transactions">

        <div className="ph-section-header">

          <div>

            <h2>Membership Transactions</h2>

            <p>
              View all your completed payment records.
            </p>

          </div>

          <button
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

        <div className="ph-filters">

          <div className="ph-search">

            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transaction or coupon..."
              aria-label="Search payments"
            />

          </div>

          <select
            value={methodFilter}
            onChange={(event) =>
              setMethodFilter(event.target.value)
            }
            aria-label="Payment method"
          >

            <option value="ALL">All methods</option>

            <option value="UPI">UPI</option>

            <option value="CARD">Credit / Debit Card</option>

            <option value="NETBANKING">Net Banking</option>

            <option value="WALLET">Wallet</option>

            <option value="COUPON">Coupon</option>

            <option value="RAZORPAY">Razorpay</option>

          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Payment status"
          >

            <option value="ALL">All statuses</option>

            <option value="SUCCESS">Successful</option>

            <option value="UNVERIFIED">Unverified</option>

            <option value="FAILED">Failed</option>

            <option value="REFUNDED">Refunded</option>

            <option value="REFUND_PENDING">
              Refund Pending
            </option>

          </select>

        </div>

        {loading ? (

          <div className="ph-empty">

            <LoaderCircle
              size={35}
              className="ph-spin"
            />

            <h3>Loading transactions...</h3>

          </div>

        ) : error ? (

          <div className="ph-empty">

            <AlertCircle size={35} />

            <h3>Unable to load transactions</h3>

            <p>{error}</p>

            <button
              className="ph-primary-btn"
              onClick={loadPayments}
            >

              Try Again

            </button>

          </div>

        ) : visiblePayments.length === 0 ? (

          <div className="ph-empty">

            <ReceiptText size={43} />

            <h3>

              {payments.length
                ? "No matching transactions"
                : "No transactions yet"}

            </h3>

            <p>

              {payments.length

                ? "Try changing your search or filters."

                : "Your membership payments will appear here."}

            </p>

            {payments.length ? (

              <button
                className="ph-outline-btn"
                onClick={() => {

                  setSearch("");

                  setMethodFilter("ALL");

                  setStatusFilter("ALL");
                }}
              >

                Clear Filters

              </button>

            ) : (

              <Link
                className="ph-primary-btn"
                to="/member/membership/payment"
              >

                Buy Membership

              </Link>

            )}

          </div>

        ) : (

          <>

            <div className="ph-table-wrap">

              <table className="ph-table">

                <thead>

                  <tr>

                    <th>Transaction</th>

                    <th>Method</th>

                    <th>Coupon</th>

                    <th>Discount</th>

                    <th>Paid Amount</th>

                    <th>Status</th>

                    <th>Receipt</th>

                  </tr>

                </thead>

                <tbody>

                  {visiblePayments.map((payment) => {

                    const available =
                      canDownloadReceipt(payment);

                    return (

                      <tr key={payment.id}>

                        <td>

                          <div className="ph-transaction">

                            <div className="ph-transaction-icon">

                              <MethodIcon payment={payment} />

                            </div>

                            <div>

                              <strong>
                                {getTransactionId(payment)}
                              </strong>

                              <span>
                                {formatPaymentDate(
                                  payment.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>
                          {getPaymentMethod(payment)}
                        </td>

                        <td>

                          {payment.couponCode ? (

                            <span className="ph-coupon">

                              <TicketPercent size={13} />

                              {payment.couponCode}

                            </span>

                          ) : "—"}

                        </td>

                        <td className="ph-discount">

                          {formatMoney(
                            payment.discountPaise
                          )}

                        </td>

                        <td className="ph-paid">

                          {formatMoney(
                            payment.paidPaise
                          )}

                        </td>

                        <td>

                          <PaymentStatus
                            status={getPaymentStatus(payment)}
                          />

                        </td>

                        <td>

                          {available ? (

                            <div className="ph-actions">

                              <button
                                title="View receipt"
                                aria-label="View receipt"
                                disabled={viewingId !== null}
                                onClick={() =>
                                  handleViewReceipt(payment.id)
                                }
                              >

                                {viewingId === payment.id

                                  ? <LoaderCircle
                                      size={17}
                                      className="ph-spin"
                                    />

                                  : <Eye size={17} />}

                              </button>

                              <button
                                title="Download PDF"
                                aria-label="Download PDF"
                                disabled={downloadingId !== null}
                                onClick={() =>
                                  handleDownload(payment.id)
                                }
                              >

                                {downloadingId === payment.id

                                  ? <LoaderCircle
                                      size={17}
                                      className="ph-spin"
                                    />

                                  : <Download size={17} />}

                              </button>

                            </div>

                          ) : "—"}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

            <div className="ph-pagination">

              <span>

                Showing {(currentPage - 1) * PAGE_SIZE + 1}

                {" – "}

                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredPayments.length
                )}

                {" of "}

                {filteredPayments.length} transactions

              </span>

              <div>

                <button
                  onClick={() =>
                    setPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >

                  <ChevronLeft size={17} />

                </button>

                <strong>
                  {currentPage} / {totalPages}
                </strong>

                <button
                  onClick={() =>
                    setPage(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >

                  <ChevronRight size={17} />

                </button>

              </div>

            </div>

          </>
        )}

      </section>

      <footer className="ph-footer">

        <ShieldCheck size={19} />

        <span>
          Receipts are available for successful verified
          membership payments and coupon redemptions.
        </span>

        <Link to="/member/support">
          Need help?
        </Link>

      </footer>

      {selectedReceipt && (

        <ReceiptModal

          receipt={selectedReceipt}

          onClose={() => setSelectedReceipt(null)}

          onDownload={handleDownload}

          downloading={downloadingId !== null}

        />
      )}

    </div>
  );
}