import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Crown,
  BookOpen,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TicketPercent,
  Clock3,
  Sparkles,
  ReceiptText,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  LockKeyhole,
  X,
  Smartphone,
  Landmark,
} from "lucide-react";

import {
  membershipApi,
  formatCurrency,
  formatMembershipDate,
} from "../../services/membershipApi";

import {
  loadRazorpayScript,
  openRazorpayCheckout,
} from "../../services/RazorpayCheckout";

import "../../styles/member/MembershipPayment.css";

// ==========================================
// MEMBERSHIP BENEFITS
// ==========================================

const benefits = [
  "Borrow up to 3 books at a time",
  "14-day book borrowing period",
  "Book renewal facility",
  "Book reservations and wishlist",
  "Digital library membership card",
  "Personal reading analytics",
  "Automatic email reminders",
  "Library help and support",
];

const PENDING_ORDER_KEY = "slm_pending_payment_order";

// ==========================================
// MEMBERSHIP PAYMENT PAGE
// ==========================================

export default function MembershipPayment() {

  const [membership, setMembership] = useState(null);

  const [baseQuote, setBaseQuote] = useState(null);

  const [quote, setQuote] = useState(null);

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [applying, setApplying] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [checking, setChecking] = useState(false);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [success, setSuccess] = useState(null);

  const [pendingOrder, setPendingOrder] = useState(null);

  const [pendingVerification, setPendingVerification] =
    useState(null);

  const actionLock = useRef(false);

  const busy =
    applying || processing || checking;

  const currentQuote = quote || baseQuote;

  const originalPrice =
    currentQuote?.originalPaise ?? 29900;

  const discount =
    currentQuote?.discountPaise ?? 0;

  const payable =
    currentQuote?.payablePaise ?? originalPrice;

  const membershipDays =
    currentQuote?.membershipDays ?? 30;

  const planName =
    currentQuote?.planName || "Premium Monthly";

  const isActive =
    membership?.valid === true;

  const isFree =
    currentQuote?.freeRedemption === true &&
    payable === 0;

  const couponApplied =
    Boolean(quote?.couponCode);

  const couponNeedsApply =
    Boolean(code.trim()) &&
    code.trim() !== quote?.couponCode;

  const onlineAvailable =
    currentQuote?.onlinePaymentAvailable === true;

  // ==========================================
  // LOAD MEMBERSHIP AND BASE PRICE
  // ==========================================

  async function loadMembership() {

    setLoading(true);

    setLoadError("");

    try {

      const [dashboard, pricing] =
        await Promise.all([

          membershipApi.getDashboard(),

          membershipApi.getQuote(),
        ]);

      setMembership(
        dashboard?.membership ?? null
      );

      setBaseQuote(pricing);

      const savedOrderId =
        sessionStorage.getItem(PENDING_ORDER_KEY);

      if (savedOrderId) {

        try {

          const savedOrder =
            await membershipApi.getOrder(savedOrderId);

          if (savedOrder?.status === "SUCCESS") {

            sessionStorage.removeItem(
              PENDING_ORDER_KEY
            );

            setPendingOrder(null);

            const latest =
              await membershipApi.getDashboard();

            setMembership(
              latest?.membership ?? null
            );

          } else {

            setPendingOrder(savedOrder);
          }

        } catch {

          setNotice(
            "A previous payment order could not be checked. " +
            "Check Payment History before paying again."
          );

          setPendingOrder({
            orderId: savedOrderId,
            status: "UNKNOWN",
          });
        }
      }

    } catch (err) {

      setLoadError(
        err.message ||
        "Unable to load membership details."
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    loadMembership();

  }, []);

  // ==========================================
  // UPDATE COUPON INPUT
  // ==========================================

  function handleCodeChange(event) {

    setCode(
      event.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "")
    );

    setQuote(null);

    setError("");

    setSuccess(null);
  }

  // ==========================================
  // APPLY COUPON
  // ==========================================

  async function handleApplyCoupon(event) {

    event.preventDefault();

    if (busy || pendingOrder || actionLock.current) {
      return;
    }

    if (!code.trim()) {

      setError("Please enter a coupon code.");

      return;
    }

    actionLock.current = true;

    setApplying(true);

    setError("");

    setNotice("");

    setSuccess(null);

    setQuote(null);

    try {

      const response =
        await membershipApi.applyCoupon(code);

      setQuote(response);

      setCode(response.couponCode || code);

    } catch (err) {

      setError(
        err.message || "Unable to apply coupon."
      );

    } finally {

      setApplying(false);

      actionLock.current = false;
    }
  }

  // ==========================================
  // REMOVE COUPON
  // ==========================================

  function handleRemoveCoupon() {

    setCode("");

    setQuote(null);

    setError("");

    setSuccess(null);
  }

  // ==========================================
  // REFRESH MEMBERSHIP AFTER SUCCESS
  // ==========================================

  async function completeSuccess(result) {

    setSuccess(result);

    setError("");

    setNotice("");

    setPendingOrder(null);

    setPendingVerification(null);

    setCode("");

    setQuote(null);

    sessionStorage.removeItem(
      PENDING_ORDER_KEY
    );

    try {

      const dashboard =
        await membershipApi.getDashboard();

      setMembership(
        dashboard?.membership ?? null
      );

    } catch {

      setNotice(
        "Payment completed. Refresh the page " +
        "to see updated membership details."
      );
    }
  }

  // ==========================================
  // CHECK PENDING PAYMENT STATUS
  // ==========================================

  async function handleCheckStatus() {

    if (!pendingOrder?.orderId ||
        actionLock.current) {
      return;
    }

    actionLock.current = true;

    setChecking(true);

    setError("");

    setNotice("");

    try {

      // Retry verification when the original
      // Razorpay callback is still available.

      if (pendingVerification) {

        try {

          const verified =
            await membershipApi.verifyPayment(
              pendingVerification
            );

          if (verified?.status === "SUCCESS") {

            await completeSuccess(verified);

            return;
          }

        } catch {
          // Continue with server order status.
        }
      }

      const order =
        await membershipApi.getOrder(
          pendingOrder.orderId
        );

      setPendingOrder(order);

      if (order.status === "SUCCESS") {

        await completeSuccess({

          status: "SUCCESS",

          orderId: order.orderId,

          paidPaise: order.payablePaise,

          message:
            "Payment confirmed. Membership activated.",
        });

        return;
      }

      setNotice(
        `Current order status: ${order.status}. ` +
        "If money was debited, do not pay again. " +
        "Wait for verification or contact support."
      );

    } catch (err) {

      setError(
        err.message || "Unable to check payment status."
      );

    } finally {

      setChecking(false);

      actionLock.current = false;
    }
  }

  // ==========================================
  // OPEN EXISTING OR NEW PAYMENT ORDER
  // ==========================================

  async function checkoutOrder(order) {

    const checkout =
      await openRazorpayCheckout(order);

    if (checkout.status === "DISMISSED") {

      setNotice(
        "Checkout closed. Check your payment status " +
        "before retrying the existing order."
      );

      return;
    }

    setPendingVerification(checkout.payload);

    try {

      const verified =
        await membershipApi.verifyPayment(
          checkout.payload
        );

      if (verified?.status !== "SUCCESS") {

        throw new Error(
          "Payment confirmation is pending."
        );
      }

      await completeSuccess(verified);

    } catch {

      setNotice(
        "Payment was submitted but confirmation is pending. " +
        "Do not pay again. Use Check Payment Status."
      );
    }
  }

  // ==========================================
  // START MEMBERSHIP CHECKOUT
  // ==========================================

  async function handlePayment() {

    if (
      actionLock.current ||
      busy ||
      loading ||
      !currentQuote ||
      pendingOrder ||
      couponNeedsApply
    ) {
      return;
    }

    actionLock.current = true;

    setProcessing(true);

    setError("");

    setNotice("");

    setSuccess(null);

    try {

      // ======================================
      // 100% COUPON REDEMPTION
      // ======================================

      if (isFree) {

        const result =
          await membershipApi.redeemCoupon(
            currentQuote.couponCode
          );

        if (result?.status !== "SUCCESS") {

          throw new Error(
            "Membership activation is pending."
          );
        }

        await completeSuccess(result);

        return;
      }

      // ======================================
      // REAL ONLINE PAYMENT
      // ======================================

      if (!onlineAvailable) {

        throw new Error(
          "Online payment is currently unavailable."
        );
      }

      // Load SDK before creating a gateway order.

      await loadRazorpayScript();

      const order =
        await membershipApi.createOrder(
          currentQuote.couponCode || null
        );

      // Save the order before opening checkout.

      setPendingOrder(order);

      sessionStorage.setItem(

        PENDING_ORDER_KEY,

        String(order.orderId)
      );

      // Do not silently charge a changed amount.

      if (
        order.payablePaise !== payable ||
        order.currency !== currentQuote.currency ||
        order.membershipDays !== membershipDays ||
        order.planName !== planName
      ) {

        setNotice(
          "The checkout price or plan has changed. " +
          "Contact support before continuing."
        );

        return;
      }

      await checkoutOrder(order);

    } catch (err) {

      setError(
        err.message ||
        "Unable to complete payment. Check your payment history."
      );

    } finally {

      setProcessing(false);

      actionLock.current = false;
    }
  }

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {

    return (

      <div className="mp-page">

        <div className="mp-loading">

          <LoaderCircle
            size={34}
            className="mp-spin"
          />

          <h3>Loading membership...</h3>

          <p>Preparing your membership details.</p>

        </div>

      </div>
    );
  }

  // ==========================================
  // LOAD ERROR STATE
  // ==========================================

  if (loadError) {

    return (

      <div className="mp-page">

        <div className="mp-loading">

          <AlertCircle size={36} />

          <h3>Unable to load membership</h3>

          <p>{loadError}</p>

          <button
            className="mp-primary-btn"
            onClick={loadMembership}
          >

            <RefreshCw size={17} />

            Try Again

          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (

    <div className="mp-page">

      {/* PAGE HEADER */}

      <div className="mp-page-header">

        <div>

          <span className="mp-eyebrow">
            MEMBER SERVICES
          </span>

          <h1>Library Membership</h1>

          <p>
            Choose your membership and unlock
            exclusive library benefits.
          </p>

        </div>

        <Link
          to="/member/payments"
          className="mp-history-link"
        >

          <ReceiptText size={18} />

          Payment History

          <ArrowRight size={16} />

        </Link>

      </div>

      {/* HERO BANNER */}

      <section className="mp-hero">

        <div className="mp-hero-content">

          <span className="mp-hero-badge">

            <Sparkles size={15} />

            YOUR NEXT CHAPTER STARTS HERE

          </span>

          <h2>
            Read More.
            <br />
            Discover More.
          </h2>

          <p>
            Get access to library borrowing,
            digital membership and personalized
            reading experiences.
          </p>

          <div className="mp-hero-features">

            <span>
              <BookOpen size={17} />
              Library Access
            </span>

            <span>
              <ShieldCheck size={17} />
              Secure Membership
            </span>

          </div>

        </div>

        <div className="mp-hero-art">

          <div className="mp-hero-ring">

            <div className="mp-hero-icon">

              <Crown size={65} strokeWidth={1.5} />

            </div>

          </div>

        </div>

      </section>

      {/* CURRENT MEMBERSHIP */}

      <section className="mp-current-card">

        <div className="mp-current-main">

          <div className="mp-current-icon">

            <Crown size={25} />

          </div>

          <div>

            <span className="mp-muted-label">
              Current Membership
            </span>

            <h3>

              {isActive
                ? membership.planName
                : "No Active Membership"}

            </h3>

          </div>

        </div>

        <div className="mp-current-detail">

          <span className="mp-muted-label">
            Status
          </span>

          <span
            className={
              `mp-status ${
                isActive
                  ? "mp-status-active"
                  : "mp-status-inactive"
              }`
            }
          >

            <span className="mp-status-dot" />

            {isActive
              ? "Active"
              : membership?.status === "SUSPENDED"
                ? "Suspended"
                : "Inactive"}

          </span>

        </div>

        <div className="mp-current-detail">

          <span className="mp-muted-label">
            Valid Until
          </span>

          <strong>

            {formatMembershipDate(
              membership?.endDate
            )}

          </strong>

        </div>

        <div className="mp-current-detail">

          <span className="mp-muted-label">
            Remaining
          </span>

          <strong>

            {isActive
              ? `${membership?.daysRemaining ??
                  membership?.remaining ?? 0} days`
              : "—"}

          </strong>

        </div>

      </section>

      {/* SUCCESS MESSAGE */}

      {success && (

        <div className="mp-alert mp-alert-success">

          <CheckCircle2 size={24} />

          <div>

            <strong>
              Membership activated successfully!
            </strong>

            <p>
              {success.transactionId
                ? `Transaction ID: ${success.transactionId}`
                : "Your payment has been confirmed."}
            </p>

            <Link to="/member/payments">
              View Payment History
            </Link>

          </div>

        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (

        <div className="mp-alert mp-alert-error">

          <AlertCircle size={21} />

          <div>{error}</div>

          <button
            className="mp-icon-btn"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >

            <X size={18} />

          </button>

        </div>
      )}

      {/* PAYMENT NOTICE */}

      {notice && (

        <div className="mp-alert mp-alert-warning">

          <Clock3 size={21} />

          <div>{notice}</div>

        </div>
      )}

      {/* PENDING PAYMENT */}

      {pendingOrder && (

        <section className="mp-pending-card">

          <div className="mp-pending-info">

            <Clock3 size={24} />

            <div>

              <h3>Existing Payment Order</h3>

              <p>
                Order: {pendingOrder.orderReference ||
                  pendingOrder.orderId}
              </p>

              <p>
                Status: {pendingOrder.status}
              </p>

            </div>

          </div>

          <div className="mp-pending-actions">

            <button
              className="mp-outline-btn"
              onClick={handleCheckStatus}
              disabled={busy}
            >

              <RefreshCw
                size={17}
                className={checking ? "mp-spin" : ""}
              />

              {checking
                ? "Checking..."
                : "Check Payment Status"}

            </button>

            <Link
              to="/member/support"
              className="mp-outline-btn"
            >

              Contact Support

            </Link>

          </div>

        </section>
      )}

      {/* MEMBERSHIP CHECKOUT GRID */}

      <div className="mp-checkout-grid">

        {/* PLAN CARD */}

        <section className="mp-card mp-plan-card">

          <div className="mp-card-header">

            <div className="mp-plan-icon">

              <Crown size={26} />

            </div>

            <span className="mp-popular-badge">

              <Sparkles size={13} />

              RECOMMENDED

            </span>

          </div>

          <h2>{planName}</h2>

          <p className="mp-plan-description">
            Everything you need for a better
            library experience.
          </p>

          <div className="mp-plan-price">

            <strong>

              {formatCurrency(originalPrice)}

            </strong>

            <span>
              / {membershipDays} days
            </span>

          </div>

          <div className="mp-plan-duration">

            <CalendarDays size={17} />

            {membershipDays}-day membership validity

          </div>

          <div className="mp-divider" />

          <h3 className="mp-benefit-title">
            What's included
          </h3>

          <div className="mp-benefits">

            {benefits.map((benefit) => (

              <div
                className="mp-benefit"
                key={benefit}
              >

                <CheckCircle2 size={19} />

                <span>{benefit}</span>

              </div>

            ))}

          </div>

          {isActive && (

            <div className="mp-renewal-note">

              <CalendarDays size={19} />

              <p>
                Renewing adds {membershipDays} days
                to your existing valid membership.
              </p>

            </div>
          )}

        </section>

        {/* CHECKOUT CARD */}

        <section className="mp-card mp-order-card">

          <div className="mp-order-heading">

            <div className="mp-order-icon">

              <CreditCard size={24} />

            </div>

            <div>

              <h2>Order Summary</h2>

              <p>Complete your membership purchase.</p>

            </div>

          </div>

          {/* OPTIONAL COUPON */}

          <div className="mp-coupon-section">

            <div className="mp-coupon-heading">

              <TicketPercent size={20} />

              <strong>Have a coupon?</strong>

              <span>Optional</span>

            </div>

            <form
              className="mp-coupon-form"
              onSubmit={handleApplyCoupon}
            >

              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="Enter coupon code"
                maxLength={40}
                disabled={busy || Boolean(pendingOrder)}
                aria-label="Coupon code"
              />

              <button
                type="submit"
                className="mp-apply-btn"
                disabled={
                  busy ||
                  Boolean(pendingOrder) ||
                  !code.trim() ||
                  couponApplied
                }
              >

                {applying ? (

                  <LoaderCircle
                    size={17}
                    className="mp-spin"
                  />

                ) : "Apply"}

              </button>

            </form>

            {couponApplied && (

              <div className="mp-coupon-applied">

                <CheckCircle2 size={18} />

                <div>

                  <strong>{quote.couponCode}</strong>

                  <span>
                    {quote.discountPercent}% discount applied
                  </span>

                </div>

                <button
                  type="button"
                  className="mp-icon-btn"
                  onClick={handleRemoveCoupon}
                  disabled={busy || Boolean(pendingOrder)}
                  aria-label="Remove coupon"
                >

                  <X size={18} />

                </button>

              </div>
            )}

          </div>

          {/* PRICE BREAKDOWN */}

          <div className="mp-price-breakdown">

            <div className="mp-price-row">

              <span>Membership price</span>

              <strong>
                {formatCurrency(originalPrice)}
              </strong>

            </div>

            <div className="mp-price-row">

              <span>Coupon discount</span>

              <strong className="mp-discount">

                −{formatCurrency(discount)}

              </strong>

            </div>

            <div className="mp-price-row">

              <span>Membership duration</span>

              <strong>{membershipDays} days</strong>

            </div>

          </div>

          <div className="mp-total-box">

            <div>

              <span>Total payable</span>

              <strong>
                {formatCurrency(payable)}
              </strong>

            </div>

            {discount > 0 && (

              <span className="mp-savings-badge">

                Save {formatCurrency(discount)}

              </span>
            )}

          </div>

          {/* PAYMENT METHOD */}

          {!isFree && (

            <div className="mp-payment-methods">

              <span>Supported payment methods</span>

              <div className="mp-method-list">

                <div>

                  <Smartphone size={19} />

                  UPI

                </div>

                <div>

                  <CreditCard size={19} />

                  Cards

                </div>

                <div>

                  <Landmark size={19} />

                  Net Banking

                </div>

              </div>

            </div>
          )}

          {/* FREE COUPON NOTE */}

          {isFree && (

            <div className="mp-free-note">

              <CheckCircle2 size={21} />

              <div>

                <strong>100% discount applied!</strong>

                <p>
                  No online payment required.
                  Activate your membership directly.
                </p>

              </div>

            </div>
          )}

          {/* ONLINE PAYMENT AVAILABILITY */}

          {!isFree && !onlineAvailable && (

            <div className="mp-alert mp-alert-warning">

              <AlertCircle size={19} />

              <div>
                Online payment is currently unavailable.
              </div>

            </div>
          )}

          {couponNeedsApply && (

            <p className="mp-input-hint">

              Apply the coupon or clear the input
              before continuing.

            </p>
          )}

          {/* PAY BUTTON */}

          <button
            type="button"
            className="mp-pay-btn"
            onClick={handlePayment}
            disabled={
              busy ||
              !currentQuote ||
              Boolean(pendingOrder) ||
              couponNeedsApply ||
              (!isFree && !onlineAvailable)
            }
          >

            {processing ? (

              <>

                <LoaderCircle
                  size={21}
                  className="mp-spin"
                />

                Processing...

              </>

            ) : (

              <>

                {isFree
                  ? <Crown size={21} />
                  : <LockKeyhole size={20} />}

                {isFree

                  ? "Activate Membership"

                  : `Pay ${formatCurrency(payable)}`}

                <ArrowRight size={19} />

              </>

            )}

          </button>

          {/* SECURE PAYMENT */}

          <div className="mp-secure-note">

            <ShieldCheck size={21} />

            <div>

              <strong>Secure checkout</strong>

              <p>

                {isFree

                  ? "Coupon verified by Smart Library."

                  : "Online payments processed securely through Razorpay."}

              </p>

            </div>

          </div>

        </section>

      </div>

      {/* FOOTER */}

      <div className="mp-footer">

        <ShieldCheck size={18} />

        <span>
          Your membership activates only after
          successful server-side verification.
        </span>

        <Link to="/member/support">

          Need help?

          <ArrowRight size={15} />

        </Link>

      </div>

    </div>
  );
}