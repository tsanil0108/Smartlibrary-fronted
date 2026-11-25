import React, { useEffect, useState } from "react";
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
} from "lucide-react";

import {
  membershipApi,
  formatCurrency,
  formatMembershipDate,
} from "../../services/membershipApi";

import "../../styles/member/MembershipPayment.css";

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

export default function MembershipPayment() {
  const [membership, setMembership] = useState(null);
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [applying, setApplying] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const busy = applying || processing;

  async function loadMembership() {
    setLoading(true);
    setLoadError("");

    try {
      const data = await membershipApi.getDashboard();
      setMembership(data?.membership ?? null);
    } catch (err) {
      setLoadError(
        err.message || "Unable to load membership details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembership();
  }, []);

  function handleCodeChange(event) {
    setCode(event.target.value.toUpperCase());
    setQuote(null);
    setError("");
    setSuccess(false);
  }

  async function handleApplyCoupon(event) {
    event.preventDefault();

    if (busy) return;

    if (!code.trim()) {
      setError("Please enter a coupon code.");
      return;
    }

    setApplying(true);
    setError("");
    setQuote(null);
    setSuccess(false);

    try {
      const response = await membershipApi.applyCoupon(code);

      if (!response || response.payablePaise == null) {
        throw new Error("Invalid coupon response.");
      }

      setQuote(response);
    } catch (err) {
      setError(err.message || "Unable to apply coupon.");
    } finally {
      setApplying(false);
    }
  }

  async function handleActivate() {
    if (
      busy ||
      success ||
      !quote ||
      Number(quote.payablePaise) !== 0
    ) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      await membershipApi.activateMembership(code);

      setSuccess(true);
      await loadMembership();
    } catch (err) {
      setError(
        err.message || "Membership activation failed."
      );
    } finally {
      setProcessing(false);
    }
  }

  const originalPrice = quote?.originalPaise ?? 29900;
  const discount = quote?.discountPaise ?? 0;
  const payable = quote?.payablePaise ?? originalPrice;

  const discountPercent =
    originalPrice > 0
      ? Math.round((discount / originalPrice) * 100)
      : 0;

  return (
    <div className="mp-page">

      {/* Page Heading */}

      <header className="mp-page-header">
        <div>
          <div className="mp-eyebrow">
            <Crown size={15} />
            MEMBERSHIP CENTER
          </div>

          <h1>My Membership</h1>

          <p>
            Manage your library membership and unlock
            more reading opportunities.
          </p>
        </div>

        <Link
          to="/member/payments"
          className="mp-outline-btn"
        >
          <ReceiptText size={18} />
          Payment history
        </Link>
      </header>

      {/* Welcome Banner */}

      <section className="mp-hero">
        <div className="mp-hero-content">

          <span className="mp-hero-label">
            <Sparkles size={15} />
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h2>
            A world of knowledge,
            <span> just one membership away.</span>
          </h2>

          <p>
            Discover new books, build your reading habits
            and enjoy all the benefits of Smart Library.
          </p>

          <div className="mp-hero-footer">
            <ShieldCheck size={17} />
            Your membership. Your reading journey.
          </div>
        </div>
      </section>

      {/* Current Membership */}

      <section className="mp-current-section">
        <div className="mp-section-heading">
          <h2>Current membership</h2>

          <button
            type="button"
            className="mp-refresh-btn"
            onClick={loadMembership}
            disabled={loading || busy}
          >
            <RefreshCw
              size={16}
              className={loading ? "mp-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loadError && (
          <div className="mp-alert mp-alert-error">
            <AlertCircle size={19} />
            {loadError}
          </div>
        )}

        <div className="mp-stats-grid">

          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-purple">
              <Crown size={23} />
            </div>

            <div>
              <span>Current plan</span>
              <h3>
                {loading
                  ? "Loading..."
                  : loadError
                  ? "Unavailable"
                  : membership?.planName || "No membership"}
              </h3>
            </div>
          </div>

          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-green">
              <ShieldCheck size={23} />
            </div>

            <div>
              <span>Membership status</span>

              <h3
                className={
                  membership?.valid && !loadError
                    ? "mp-text-green"
                    : ""
                }
              >
                {loading
                  ? "Loading..."
                  : loadError
                  ? "Unavailable"
                  : membership?.status || "Not active"}
              </h3>
            </div>
          </div>

          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-orange">
              <CalendarDays size={23} />
            </div>

            <div>
              <span>Valid until</span>
              <h3>
                {loading || loadError
                  ? "—"
                  : formatMembershipDate(
                      membership?.endDate
                    )}
              </h3>
            </div>
          </div>

          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-blue">
              <Clock3 size={23} />
            </div>

            <div>
              <span>Days remaining</span>
              <h3>
                {loading || loadError
                  ? "—"
                  : `${membership?.remaining ?? 0} days`}
              </h3>
            </div>
          </div>

        </div>
      </section>

      {/* Membership Plan and Checkout */}

      <section className="mp-checkout-grid">

        <article className="mp-plan-card">

          <div className="mp-plan-top">
            <div className="mp-plan-icon">
              <Crown size={30} />
            </div>

            <span className="mp-popular-tag">
              <Sparkles size={13} />
              RECOMMENDED
            </span>
          </div>

          <h2>Premium Monthly</h2>

          <p className="mp-plan-description">
            Everything you need for a better
            library experience.
          </p>

          <div className="mp-plan-price">
            <strong>
              {formatCurrency(originalPrice)}
            </strong>
            <span>/ 30 days</span>
          </div>

          <div className="mp-plan-divider" />

          <h3>What's included</h3>

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

          <div className="mp-plan-bottom">
            <BookOpen size={21} />

            <div>
              <strong>Read without limits</strong>
              <p>
                Explore the catalogue throughout
                your active membership.
              </p>
            </div>
          </div>

        </article>

        <article className="mp-order-card">

          <div className="mp-order-heading">
            <div className="mp-order-icon">
              <CreditCard size={23} />
            </div>

            <div>
              <h2>Order summary</h2>
              <p>Review your membership purchase.</p>
            </div>
          </div>

          <div className="mp-selected-plan">
            <div>
              <strong>Premium Monthly</strong>
              <span>30-day membership</span>
            </div>

            <strong>
              {formatCurrency(originalPrice)}
            </strong>
          </div>

          <form
            className="mp-coupon-form"
            onSubmit={handleApplyCoupon}
          >
            <label htmlFor="membership-coupon">
              <TicketPercent size={18} />
              Have a coupon code?
            </label>

            <div className="mp-coupon-input">
              <input
                id="membership-coupon"
                type="text"
                placeholder="Enter coupon code"
                value={code}
                onChange={handleCodeChange}
                maxLength={40}
                disabled={busy}
                autoComplete="off"
                required
              />

              <button
                type="submit"
                disabled={busy || !code.trim()}
              >
                {applying ? (
                  <LoaderCircle
                    size={18}
                    className="mp-spin"
                  />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
          </form>

          {quote && (
            <div className="mp-alert mp-alert-success">
              <CheckCircle2 size={20} />

              <div>
                <strong>Coupon applied!</strong>
                <span>
                  You received a {discountPercent}% discount.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div
              className="mp-alert mp-alert-error"
              role="alert"
            >
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="mp-price-breakdown">

            <div className="mp-price-row">
              <span>Membership price</span>
              <strong>
                {formatCurrency(originalPrice)}
              </strong>
            </div>

            <div className="mp-price-row">
              <span>Coupon discount</span>
              <strong className="mp-text-green">
                − {formatCurrency(discount)}
              </strong>
            </div>

            <div className="mp-price-divider" />

            <div className="mp-total-row">
              <div>
                <strong>Total payable</strong>
                <span>Final membership amount</span>
              </div>

              <h2>{formatCurrency(payable)}</h2>
            </div>

          </div>

          {quote &&
            Number(quote.payablePaise) !== 0 && (
              <div className="mp-alert mp-alert-warning">
                <AlertCircle size={19} />
                Demo checkout requires a 100% discount
                coupon.
              </div>
            )}

          {!success && (
            <button
              type="button"
              className="mp-activate-btn"
              onClick={handleActivate}
              disabled={
                busy ||
                !quote ||
                Number(quote.payablePaise) !== 0
              }
            >
              {processing ? (
                <>
                  <LoaderCircle
                    size={20}
                    className="mp-spin"
                  />
                  Activating membership...
                </>
              ) : (
                <>
                  Activate membership
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}

          {success && (
            <div
              className="mp-success-box"
              role="status"
            >
              <CheckCircle2 size={40} />

              <h3>Membership activated!</h3>

              <p>
                Your coupon redemption was successful.
              </p>

              <Link to="/member/payments">
                <ReceiptText size={17} />
                View payment history
              </Link>
            </div>
          )}

          <div className="mp-secure-note">
            <LockKeyhole size={16} />
            Demo checkout. No real money is collected.
          </div>

        </article>
      </section>

      {/* Information Footer */}

      <section className="mp-help-banner">
        <div className="mp-help-icon">
          <ShieldCheck size={26} />
        </div>

        <div>
          <h3>Need help with your membership?</h3>

          <p>
            Contact library support for coupon,
            membership or account-related questions.
          </p>
        </div>

        <Link
          to="/member/support"
          className="mp-outline-btn"
        >
          Contact support
          <ArrowRight size={17} />
        </Link>
      </section>

    </div>
  );
}