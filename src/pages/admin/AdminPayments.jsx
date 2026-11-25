import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    CreditCard,
    IndianRupee,
    Receipt,
    TicketPercent,
    Search,
    RefreshCw,
    Download,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    AlertCircle,
    Wallet,
    ShieldCheck,
    CalendarDays,
    UserRound,
    Mail,
    CheckCircle2,
} from "lucide-react";

import {
    adminPaymentApi,
    formatPaymentMoney,
    formatPaymentDate,
    getTransactionId,
} from "../../services/adminPaymentApi";

import "../../styles/admin/AdminPayments.css";

const PAGE_SIZE = 10;


// ==========================================
// PAYMENT STATUS
// ==========================================

function PaymentStatus({ payment }) {

    const status =
        payment.paymentStatus ||
        payment.status ||
        "UNVERIFIED";

    return (

        <span className={
            `ap-status ${
                status === "SUCCESS"
                    ? "ap-success"
                    : "ap-unverified"
            }`
        }>

            <span />

            {status === "SUCCESS"
                ? "Successful"
                : status}

        </span>

    );

}


// ==========================================
// RECEIPT DETAILS MODAL
// ==========================================

function ReceiptModal({
    payment,
    onClose,
    onDownload,
    downloading,
}) {

    const [details, setDetails] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    useEffect(() => {

        let active = true;

        adminPaymentApi.getReceiptDetails(payment.id)

            .then(data => {

                if (active) setDetails(data);

            })

            .catch(err => {

                if (active) {
                    setError(err.message);
                }

            })

            .finally(() => {

                if (active) setLoading(false);

            });

        return () => {
            active = false;
        };

    }, [payment.id]);

    const data = details || payment;

    return (

        <div className="ap-overlay">

            <section
                className="ap-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ap-receipt-title"
            >

                <header className="ap-modal-header">

                    <div className="ap-icon ap-purple">

                        <Receipt size={25} />

                    </div>

                    <div className="ap-modal-heading">

                        <h2 id="ap-receipt-title">
                            Payment details
                        </h2>

                        <p>
                            Membership transaction receipt
                        </p>

                    </div>

                    <button
                        className="ap-icon-button"
                        onClick={onClose}
                        aria-label="Close"
                    >

                        <X size={21} />

                    </button>

                </header>

                <div className="ap-modal-body">

                    {loading ? (

                        <div className="ap-empty">

                            <LoaderCircle
                                size={35}
                                className="ap-spin"
                            />

                            <p>Loading receipt...</p>

                        </div>

                    ) : (

                        <>

                            {error && (

                                <div className="ap-error">

                                    <AlertCircle size={18} />

                                    {error}

                                </div>

                            )}

                            <div className="ap-receipt-hero">

                                <Receipt size={32} />

                                <span>AMOUNT PAID</span>

                                <h2>

                                    {formatPaymentMoney(
                                        data.paidPaise
                                    )}

                                </h2>

                                <PaymentStatus payment={data} />

                            </div>

                            <div className="ap-detail-grid">

                                <DetailItem
                                    label="Transaction ID"
                                    value={
                                        getTransactionId(data)
                                    }
                                />

                                <DetailItem
                                    label="Receipt number"
                                    value={data.receiptNumber}
                                />

                                <DetailItem
                                    label="Member name"
                                    value={data.memberName}
                                />

                                <DetailItem
                                    label="Email address"
                                    value={data.email}
                                />

                                <DetailItem
                                    label="Membership plan"
                                    value={data.membershipPlan}
                                />

                                <DetailItem
                                    label="Coupon code"
                                    value={data.couponCode}
                                />

                                <DetailItem
                                    label="Payment method"
                                    value={
                                        data.paymentMethod ||
                                        "DEMO_COUPON"
                                    }
                                />

                                <DetailItem
                                    label="Payment date"
                                    value={formatPaymentDate(
                                        data.paymentDate ||
                                        data.createdAt
                                    )}
                                />

                                <DetailItem
                                    label="Membership start"
                                    value={formatPaymentDate(
                                        data.membershipStartDate
                                    )}
                                />

                                <DetailItem
                                    label="Membership expiry"
                                    value={formatPaymentDate(
                                        data.membershipEndDate
                                    )}
                                />

                            </div>

                            <div className="ap-price-summary">

                                <div>

                                    <span>Original price</span>

                                    <strong>

                                        {formatPaymentMoney(
                                            data.originalPaise
                                        )}

                                    </strong>

                                </div>

                                <div>

                                    <span>Coupon discount</span>

                                    <strong className="ap-green-text">

                                        -{formatPaymentMoney(
                                            data.discountPaise
                                        )}

                                    </strong>

                                </div>

                                <div className="ap-price-total">

                                    <span>Total paid</span>

                                    <strong>

                                        {formatPaymentMoney(
                                            data.paidPaise
                                        )}

                                    </strong>

                                </div>

                            </div>

                        </>

                    )}

                </div>

                <footer className="ap-modal-footer">

                    <button
                        className="ap-secondary"
                        onClick={onClose}
                    >

                        Close

                    </button>

                    <button
                        className="ap-primary"
                        disabled={
                            loading ||
                            downloading === payment.id
                        }
                        onClick={() =>
                            onDownload(payment.id)
                        }
                    >

                        {downloading === payment.id ? (

                            <LoaderCircle
                                size={18}
                                className="ap-spin"
                            />

                        ) : (

                            <Download size={18} />

                        )}

                        Download PDF

                    </button>

                </footer>

            </section>

        </div>

    );

}


function DetailItem({ label, value }) {

    return (

        <div className="ap-detail-item">

            <span>{label}</span>

            <strong>{value ?? "—"}</strong>

        </div>

    );

}


// ==========================================
// MAIN PAYMENT PAGE
// ==========================================

export default function AdminPayments() {

    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("ALL");

    const [page, setPage] = useState(0);

    const [selected, setSelected] = useState(null);

    const [downloading, setDownloading] = useState(null);


    // ======================================
    // LOAD DATA
    // ======================================

    const loadPayments = useCallback(async () => {

        setLoading(true);
        setError("");

        try {

            const data =
                await adminPaymentApi.getPayments();

            const items = Array.isArray(data)
                ? data
                : data?.content;

            if (!Array.isArray(items)) {

                throw new Error(
                    "Unexpected payment response."
                );

            }

            setPayments(items);

        } catch (err) {

            setError(
                err.message ||
                "Unable to load payment history."
            );

            setPayments([]);

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadPayments();

    }, [loadPayments]);


    // ======================================
    // DOWNLOAD PDF
    // ======================================

    async function downloadReceipt(id) {

        if (downloading !== null) return;

        setDownloading(id);
        setMessage("");

        try {

            await adminPaymentApi.downloadReceipt(id);

            setMessage("Receipt download started.");

        } catch (err) {

            setMessage(
                err.message ||
                "Unable to download receipt."
            );

        } finally {

            setDownloading(null);

        }

    }


    // ======================================
    // STATISTICS
    // ======================================

    const stats = useMemo(() => {

        return payments.reduce(

            (result, payment) => {

                result.original += Number(
                    payment.originalPaise || 0
                );

                result.discount += Number(
                    payment.discountPaise || 0
                );

                result.paid += Number(
                    payment.paidPaise || 0
                );

                if (
                    Number(payment.paidPaise) === 0 &&
                    Number(payment.discountPaise) > 0
                ) {

                    result.free += 1;

                }

                return result;

            },

            {
                original: 0,
                discount: 0,
                paid: 0,
                free: 0,
            }

        );

    }, [payments]);

    const statCards = [

        {
            label: "Total transactions",
            value: payments.length,
            icon: Receipt,
            color: "purple",
        },

        {
            label: "Recorded amount paid",
            value: formatPaymentMoney(stats.paid),
            icon: IndianRupee,
            color: "green",
        },

        {
            label: "Total discounts",
            value: formatPaymentMoney(stats.discount),
            icon: TicketPercent,
            color: "orange",
        },

        {
            label: "Free redemptions",
            value: stats.free,
            icon: Wallet,
            color: "blue",
        },

    ];


    // ======================================
    // SEARCH AND FILTER
    // ======================================

    const filteredPayments = useMemo(() => {

        const query = search.trim().toLowerCase();

        return payments.filter(payment => {

            const searchable = [

                payment.id,

                payment.userId,

                payment.memberName,

                payment.email,

                payment.couponCode,

                getTransactionId(payment),

            ].filter(value => value != null)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                searchable.includes(query);

            const isFree =
                Number(payment.paidPaise) === 0 &&
                Number(payment.discountPaise) > 0;

            const matchesFilter =

                filter === "ALL" ||

                (filter === "FREE" && isFree) ||

                (
                    filter === "PAID" &&
                    Number(payment.paidPaise) > 0
                );

            return matchesSearch && matchesFilter;

        });

    }, [payments, search, filter]);

    const totalPages = Math.ceil(
        filteredPayments.length / PAGE_SIZE
    );

    const currentPage = Math.min(
        page,
        Math.max(0, totalPages - 1)
    );

    const visiblePayments = filteredPayments.slice(

        currentPage * PAGE_SIZE,

        (currentPage + 1) * PAGE_SIZE

    );


    // ======================================
    // PAGE UI
    // ======================================

    return (

        <main className="ap-page">

            <header className="ap-page-header">

                <div>

                    <span className="ap-eyebrow">

                        LIBRARY ADMINISTRATION

                    </span>

                    <h1>Payments & Receipts</h1>

                    <p>

                        Monitor membership transactions
                        and manage payment receipts.

                    </p>

                </div>

                <button
                    className="ap-secondary"
                    onClick={loadPayments}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={loading ? "ap-spin" : ""}
                    />

                    Refresh

                </button>

            </header>


            {/* HERO */}

            <section className="ap-hero">

                <div className="ap-hero-content">

                    <span className="ap-hero-tag">

                        <ShieldCheck size={15} />

                        FINANCIAL MANAGEMENT

                    </span>

                    <h2>Manage membership payments.</h2>

                    <p>

                        Track transactions, coupon redemptions
                        and downloadable membership receipts
                        from one place.

                    </p>

                    <div className="ap-hero-total">

                        <span>RECORDED AMOUNT PAID</span>

                        <strong>

                            {loading || error
                                ? "—"
                                : formatPaymentMoney(stats.paid)}

                        </strong>

                    </div>

                </div>

                <div className="ap-hero-art">

                    <CreditCard
                        size={145}
                        strokeWidth={1}
                    />

                    <div className="ap-floating-receipt">

                        <Receipt size={40} />

                        <span>RECEIPT</span>

                        <i />

                        <i />

                        <i />

                    </div>

                </div>

            </section>


            {/* STATS */}

            <section className="ap-stats">

                {statCards.map(item => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="ap-stat"
                            key={item.label}
                        >

                            <div className={
                                `ap-icon ap-${item.color}`
                            }>

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


            {/* DEMO MODE */}

            <section className="ap-demo-banner">

                <div className="ap-icon ap-orange">

                    <ShieldCheck size={25} />

                </div>

                <div>

                    <strong>Demo payment environment</strong>

                    <p>

                        Membership activation currently uses
                        100% discount coupons. Free redemptions
                        are not actual cash revenue.

                    </p>

                </div>

            </section>


            {/* MESSAGE */}

            {message && (

                <div className="ap-message" role="status">

                    <AlertCircle size={19} />

                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >

                        <X size={18} />

                    </button>

                </div>

            )}


            {/* TRANSACTION TABLE */}

            <section className="ap-panel">

                <header className="ap-panel-header">

                    <div>

                        <h3>Transaction history</h3>

                        <p>

                            View membership payment records
                            and receipts.

                        </p>

                    </div>

                    <span className="ap-count">

                        {payments.length} transactions

                    </span>

                </header>


                {/* SEARCH & FILTER */}

                <div className="ap-toolbar">

                    <div className="ap-search">

                        <Search size={19} />

                        <input
                            value={search}
                            placeholder="Search transaction, member ID, coupon..."
                            aria-label="Search payments"
                            onChange={event => {

                                setSearch(event.target.value);
                                setPage(0);

                            }}
                        />

                    </div>

                    <select
                        value={filter}
                        aria-label="Filter payments"
                        onChange={event => {

                            setFilter(event.target.value);
                            setPage(0);

                        }}
                    >

                        <option value="ALL">

                            All transactions

                        </option>

                        <option value="FREE">

                            Free redemptions

                        </option>

                        <option value="PAID">

                            Paid transactions

                        </option>

                    </select>

                </div>


                {loading ? (

                    <div className="ap-empty">

                        <LoaderCircle
                            size={42}
                            className="ap-spin"
                        />

                        <h3>Loading transactions...</h3>

                    </div>

                ) : error ? (

                    <div className="ap-empty">

                        <AlertCircle size={44} />

                        <h3>Unable to load payments</h3>

                        <p>{error}</p>

                        <button
                            className="ap-primary"
                            onClick={loadPayments}
                        >

                            Try again

                        </button>

                    </div>

                ) : visiblePayments.length === 0 ? (

                    <div className="ap-empty">

                        <Receipt size={53} />

                        <h3>No transactions found</h3>

                        <p>

                            Membership payment records
                            will appear here.

                        </p>

                    </div>

                ) : (

                    <div className="ap-table-wrapper">

                        <table className="ap-table">

                            <thead>

                                <tr>

                                    <th>Transaction</th>

                                    <th>Member</th>

                                    <th>Coupon</th>

                                    <th>Original price</th>

                                    <th>Discount</th>

                                    <th>Amount paid</th>

                                    <th>Status</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {visiblePayments.map(payment => (

                                    <tr key={payment.id}>

                                        <td>

                                            <div className="ap-transaction">

                                                <div className="ap-row-icon">

                                                    <Receipt size={19} />

                                                </div>

                                                <div>

                                                    <strong>

                                                        {getTransactionId(
                                                            payment
                                                        )}

                                                    </strong>

                                                    <small>

                                                        {formatPaymentDate(
                                                            payment.createdAt ||
                                                            payment.paymentDate
                                                        )}

                                                    </small>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <strong>

                                                {payment.memberName ||
                                                    `Member #${payment.userId}`}

                                            </strong>

                                            <small>

                                                {payment.email ||
                                                    `ID: ${payment.userId}`}

                                            </small>

                                        </td>

                                        <td>

                                            <span className="ap-coupon">

                                                {payment.couponCode || "—"}

                                            </span>

                                        </td>

                                        <td>

                                            {formatPaymentMoney(
                                                payment.originalPaise
                                            )}

                                        </td>

                                        <td className="ap-green-text">

                                            {formatPaymentMoney(
                                                payment.discountPaise
                                            )}

                                        </td>

                                        <td>

                                            <strong>

                                                {formatPaymentMoney(
                                                    payment.paidPaise
                                                )}

                                            </strong>

                                        </td>

                                        <td>

                                            <PaymentStatus
                                                payment={payment}
                                            />

                                        </td>

                                        <td>

                                            <div className="ap-actions">

                                                <button
                                                    className="ap-icon-button"
                                                    title="View receipt"
                                                    aria-label="View receipt"
                                                    onClick={() =>
                                                        setSelected(payment)
                                                    }
                                                >

                                                    <Eye size={18} />

                                                </button>

                                                <button
                                                    className="ap-icon-button"
                                                    title="Download PDF"
                                                    aria-label="Download PDF"
                                                    disabled={
                                                        downloading !== null
                                                    }
                                                    onClick={() =>
                                                        downloadReceipt(
                                                            payment.id
                                                        )
                                                    }
                                                >

                                                    {downloading === payment.id ? (

                                                        <LoaderCircle
                                                            size={18}
                                                            className="ap-spin"
                                                        />

                                                    ) : (

                                                        <Download size={18} />

                                                    )}

                                                </button>

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

                    <footer className="ap-pagination">

                        <span>

                            Showing {currentPage * PAGE_SIZE + 1}

                            {" "}to{" "}

                            {Math.min(
                                (currentPage + 1) * PAGE_SIZE,
                                filteredPayments.length
                            )}

                            {" "}of{" "}

                            {filteredPayments.length} transactions

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


            {/* DETAILS MODAL */}

            {selected && (

                <ReceiptModal
                    payment={selected}
                    onClose={() => setSelected(null)}
                    onDownload={downloadReceipt}
                    downloading={downloading}
                />

            )}

        </main>

    );

}