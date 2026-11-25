import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { toPng } from "html-to-image";

import {
  CreditCard,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  CalendarDays,
  Clock,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  QrCode,
  UserRound,
  Mail,
  ArrowRight,
  X,
  Info,
  Wallet,
  Fingerprint,
  LibraryBig,
} from "lucide-react";

import {
  libraryCardApi,
  formatCardDate,
  getRemainingDays,
  getQrImage,
} from "../../services/libraryCardApi";

import logo from "../../assets/images/logo.svg";
import avatar from "../../assets/images/avatar.svg";

import "../../styles/member/LibraryCard.css";

// ==========================================
// STATUS CONFIGURATION
// ==========================================

const CARD_STATUS = {
  ACTIVE: {
    label: "Active",
    type: "success",
  },

  DISABLED: {
    label: "Disabled",
    type: "danger",
  },

  SUSPENDED: {
    label: "Suspended",
    type: "danger",
  },

  INVALID_MEMBER: {
    label: "Invalid member",
    type: "danger",
  },

  NO_MEMBERSHIP: {
    label: "No membership",
    type: "warning",
  },

  MEMBERSHIP_INACTIVE: {
    label: "Membership inactive",
    type: "warning",
  },

  EXPIRED: {
    label: "Expired",
    type: "warning",
  },
};

function getStatus(card) {
  const status = card?.status;

  if (status === "ACTIVE" && card?.valid !== true) {
    return {
      label: "Not valid",
      type: "warning",
    };
  }

  return (
    CARD_STATUS[status] || {
      label: status || "Unknown",
      type: "neutral",
    }
  );
}

// ==========================================
// CARD STATUS BADGE
// ==========================================

function CardStatus({ card }) {
  const status = getStatus(card);

  return (
    <span
      className={`lc-status lc-status-${status.type}`}
    >
      <span />
      {status.label}
    </span>
  );
}

// ==========================================
// FRONT SIDE
// ==========================================

function CardFront({ card }) {
  return (
    <div className="lc-digital-card lc-front">

      <div className="lc-decoration lc-circle-one" />
      <div className="lc-decoration lc-circle-two" />

      <div className="lc-card-top">

        <div className="lc-card-brand">

          <img
            src={logo}
            alt="Smart Library"
          />

          <div>
            <strong>Smart Library</strong>
            <small>MEMBERSHIP CARD</small>
          </div>

        </div>

        <Fingerprint
          size={30}
          className="lc-card-symbol"
        />

      </div>

      <div className="lc-card-member">

        <div className="lc-member-photo">

          <img
            src={avatar}
            alt="Member avatar"
          />

        </div>

        <div className="lc-member-info">

          <span>MEMBER NAME</span>

          <h3>
            {card.memberName || "Library Member"}
          </h3>

          <p>
            {card.membershipPlan || "No membership"}
          </p>

        </div>

      </div>

      <div className="lc-card-number">

        <span>LIBRARY CARD NUMBER</span>

        <strong>
          {card.cardNumber || "—"}
        </strong>

      </div>

      <div className="lc-card-bottom">

        <div className="lc-card-validity">

          <span>VALID UNTIL</span>

          <strong>
            {formatCardDate(
              card.membershipEndDate
            ).toUpperCase()}
          </strong>

        </div>

        <CardStatus card={card} />

      </div>

    </div>
  );
}

// ==========================================
// BACK SIDE
// ==========================================

function CardBack({ card }) {
  const qrImage = getQrImage(card.qrCode);

  return (
    <div className="lc-digital-card lc-back">

      <div className="lc-decoration lc-circle-one" />
      <div className="lc-decoration lc-circle-two" />

      <div className="lc-back-heading">

        <ShieldCheck size={18} />

        <span>
          DIGITAL MEMBERSHIP VERIFICATION
        </span>

      </div>

      <div className="lc-qr-container">

        {qrImage ? (
          <img
            src={qrImage}
            alt="Library membership verification QR code"
          />
        ) : (
          <div className="lc-qr-empty">

            <QrCode size={48} />

            <span>QR unavailable</span>

          </div>
        )}

      </div>

      <strong className="lc-back-number">
        {card.cardNumber || "—"}
      </strong>

      <p className="lc-back-description">
        Present this card to the librarian
        for membership verification.
      </p>

      <div className="lc-back-footer">

        <BookOpen size={15} />

        <span>
          SMART LIBRARY MANAGEMENT SYSTEM
        </span>

      </div>

    </div>
  );
}

// ==========================================
// INFORMATION ROW
// ==========================================

function InformationRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="lc-information-row">

      <div className="lc-information-icon">
        <Icon size={19} />
      </div>

      <div>
        <span>{label}</span>

        <strong>
          {value ?? "—"}
        </strong>
      </div>

    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function LibraryCard() {
  const [card, setCard] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState(null);

  const [downloading, setDownloading] =
    useState(false);

  const [regenerating, setRegenerating] =
    useState(false);

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const cardRef = useRef(null);

  const valid = card?.valid === true;

  const remainingDays = getRemainingDays(
    card?.membershipEndDate
  );

  // ========================================
  // LOAD DIGITAL CARD
  // ========================================

  async function loadCard() {
    setLoading(true);
    setError("");

    try {
      const response =
        await libraryCardApi.getMyCard();

      if (!response?.cardNumber) {
        throw new Error(
          "Invalid library card response."
        );
      }

      setCard(response);

    } catch (err) {
      setError(
        err.message ||
        "Unable to load your library card."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCard();
  }, []);

  // ========================================
  // AUTO DISMISS NOTICE
  // ========================================

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice(null);
    }, 6000);

    return () => clearTimeout(timer);
  }, [notice]);

  // ========================================
  // ESCAPE KEY SUPPORT
  // ========================================

  useEffect(() => {
    if (!confirmOpen) return;

    function handleKey(event) {
      if (
        event.key === "Escape" &&
        !regenerating
      ) {
        setConfirmOpen(false);
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
  }, [confirmOpen, regenerating]);

  // ========================================
  // DOWNLOAD CARD AS PNG
  // ========================================

  async function downloadCard() {
    if (
      !cardRef.current ||
      downloading ||
      regenerating
    ) {
      return;
    }

    setDownloading(true);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const image = await toPng(
        cardRef.current,
        {
          pixelRatio: 3,
          backgroundColor: "#ffffff",
          cacheBust: true,
        }
      );

      const link =
        document.createElement("a");

      link.download =
        `${card.cardNumber}-Library-Card.png`;

      link.href = image;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setNotice({
        type: "success",
        message:
          "Library card download started.",
      });

    } catch (err) {
      setNotice({
        type: "error",
        message:
          err.message ||
          "Unable to download library card.",
      });
    } finally {
      setDownloading(false);
    }
  }

  // ========================================
  // PRINT CARD
  // ========================================

  function printCard() {
    if (!cardRef.current) return;

    window.print();
  }

  // ========================================
  // REGENERATE QR CODE
  // ========================================

  async function regenerateCard() {
    if (regenerating) return;

    setRegenerating(true);

    try {
      const response =
        await libraryCardApi.regenerateCard();

      if (response?.cardNumber) {
        setCard(response);
      } else {
        await loadCard();
      }

      setConfirmOpen(false);

      setNotice({
        type: "success",
        message:
          "QR code regenerated. Download your updated card.",
      });

    } catch (err) {
      setConfirmOpen(false);

      setNotice({
        type: "error",
        message:
          err.message ||
          "Unable to regenerate QR code.",
      });
    } finally {
      setRegenerating(false);
    }
  }

  const busy =
    downloading || regenerating || loading;

  return (
    <div className="lc-page">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <header className="lc-header">

        <div>

          <span className="lc-eyebrow">
            <CreditCard size={16} />
            YOUR DIGITAL IDENTITY
          </span>

          <h1>Digital Library Card</h1>

          <p>
            Your personal gateway to
            the world of knowledge.
          </p>

        </div>

        <button
          type="button"
          className="lc-outline"
          disabled={busy}
          onClick={loadCard}
        >
          <RefreshCw
            size={17}
            className={loading ? "lc-spin" : ""}
          />
          Refresh card
        </button>

      </header>

      {/* =====================================
          HERO BANNER
      ====================================== */}

      <section className="lc-hero">

        <div className="lc-hero-content">

          <span>
            SMART LIBRARY MEMBERSHIP
          </span>

          <h2>
            One card.
            <br />
            <em>Endless knowledge.</em>
          </h2>

          <p>
            Carry your digital membership
            identity wherever you go.
            Access your library with a
            unique verification QR code.
          </p>

        </div>

        <div
          className="lc-hero-art"
          aria-hidden="true"
        >

          <div className="lc-art-card">

            <BookOpen size={37} />

            <div />

            <div />

          </div>

          <div className="lc-art-qr">
            <QrCode size={43} />
          </div>

        </div>

      </section>

      {/* =====================================
          SUCCESS / ERROR MESSAGE
      ====================================== */}

      {notice && (
        <div
          role="status"
          className={`lc-notice lc-notice-${notice.type}`}
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
          LOADING STATE
      ====================================== */}

      {loading ? (
        <div className="lc-empty">

          <LoaderCircle
            size={45}
            className="lc-spin"
          />

          <h3>Loading your digital card...</h3>

          <p>
            Fetching membership information.
          </p>

        </div>

      ) : error ? (

        /* ERROR STATE */

        <div className="lc-empty">

          <AlertCircle size={45} />

          <h3>Unable to load library card</h3>

          <p>{error}</p>

          <button
            type="button"
            className="lc-primary"
            onClick={loadCard}
          >
            Try again
          </button>

        </div>

      ) : card ? (

        <>

          {/* =================================
              MEMBERSHIP STATISTICS
          ================================== */}

          <section className="lc-stats">

            <article className="lc-stat">

              <div className="lc-stat-icon lc-purple">
                <CreditCard size={24} />
              </div>

              <div>
                <span>Card status</span>

                <h3>
                  {getStatus(card).label}
                </h3>
              </div>

            </article>

            <article className="lc-stat">

              <div className="lc-stat-icon lc-green">
                <ShieldCheck size={24} />
              </div>

              <div>
                <span>Membership validity</span>

                <h3>
                  {valid ? "Valid" : "Not valid"}
                </h3>
              </div>

            </article>

            <article className="lc-stat">

              <div className="lc-stat-icon lc-orange">
                <Clock size={24} />
              </div>

              <div>
                <span>Days remaining</span>

                <h3>
                  {remainingDays ?? "—"}
                  {remainingDays !== null && " Days"}
                </h3>
              </div>

            </article>

          </section>

          {/* =================================
              INVALID MEMBERSHIP WARNING
          ================================== */}

          {!valid && (
            <section className="lc-warning">

              <ShieldAlert size={29} />

              <div>

                <h3>
                  Your card is currently not valid
                </h3>

                <p>
                  Check your membership or
                  contact the library for assistance.
                </p>

              </div>

              <Link
                to={
                  ["NO_MEMBERSHIP",
                   "MEMBERSHIP_INACTIVE",
                   "EXPIRED"].includes(card.status)
                    ? "/member/membership/payment"
                    : "/member/support"
                }
              >
                Manage account
                <ArrowRight size={16} />
              </Link>

            </section>
          )}

          {/* =================================
              CARD SECTION HEADER
          ================================== */}

          <div className="lc-section-heading">

            <div>

              <h2>Your membership card</h2>

              <p>
                Front and back view of
                your digital identity.
              </p>

            </div>

            <CardStatus card={card} />

          </div>

          {/* =================================
              DOWNLOADABLE CARD AREA
          ================================== */}

          <section className="lc-card-panel">

            <div
              className="lc-export-area"
              ref={cardRef}
            >

              <div className="lc-card-grid">

                <div className="lc-card-wrapper">

                  <span className="lc-side-label">
                    FRONT SIDE
                  </span>

                  <CardFront card={card} />

                </div>

                <div className="lc-card-wrapper">

                  <span className="lc-side-label">
                    BACK SIDE
                  </span>

                  <CardBack card={card} />

                </div>

              </div>

            </div>

            {/* CARD ACTION BUTTONS */}

            <div className="lc-card-actions">

              <button
                type="button"
                className="lc-primary"
                disabled={busy}
                onClick={downloadCard}
              >

                {downloading ? (
                  <LoaderCircle
                    size={19}
                    className="lc-spin"
                  />
                ) : (
                  <Download size={19} />
                )}

                {downloading
                  ? "Preparing image..."
                  : "Download card"}

              </button>

              <button
                type="button"
                className="lc-outline"
                disabled={busy}
                onClick={printCard}
              >
                <Printer size={19} />
                Print card
              </button>

              <button
                type="button"
                className="lc-outline"
                disabled={busy}
                onClick={() =>
                  setConfirmOpen(true)
                }
              >
                <RefreshCw size={19} />
                Regenerate QR
              </button>

            </div>

            <div className="lc-card-note">

              <Info size={17} />

              <span>
                Keep your QR code private.
                Regenerating it invalidates
                previously downloaded QR codes.
              </span>

            </div>

          </section>

          {/* =================================
              MEMBERSHIP DETAILS
          ================================== */}

          <section className="lc-details-grid">

            <article className="lc-details-panel">

              <div className="lc-panel-heading">

                <div className="lc-panel-icon">
                  <UserRound size={23} />
                </div>

                <div>

                  <h2>Member information</h2>

                  <p>
                    Your registered library identity.
                  </p>

                </div>

              </div>

              <InformationRow
                icon={UserRound}
                label="Full name"
                value={card.memberName}
              />

              <InformationRow
                icon={Mail}
                label="Email address"
                value={card.email}
              />

              <InformationRow
                icon={CreditCard}
                label="Library card number"
                value={card.cardNumber}
              />

              <InformationRow
                icon={CalendarDays}
                label="Card issued on"
                value={formatCardDate(card.createdAt)}
              />

              <Link
                className="lc-panel-link"
                to="/member/profile"
              >
                Manage profile
                <ArrowRight size={16} />
              </Link>

            </article>

            <article className="lc-details-panel">

              <div className="lc-panel-heading">

                <div className="lc-panel-icon lc-orange">
                  <Wallet size={23} />
                </div>

                <div>

                  <h2>Membership information</h2>

                  <p>
                    Your current plan and validity.
                  </p>

                </div>

              </div>

              <InformationRow
                icon={LibraryBig}
                label="Membership plan"
                value={card.membershipPlan}
              />

              <InformationRow
                icon={CalendarDays}
                label="Membership start date"
                value={formatCardDate(
                  card.membershipStartDate
                )}
              />

              <InformationRow
                icon={CalendarDays}
                label="Membership end date"
                value={formatCardDate(
                  card.membershipEndDate
                )}
              />

              <InformationRow
                icon={ShieldCheck}
                label="Membership status"
                value={
                  valid
                    ? "Valid"
                    : "Not valid"
                }
              />

              <Link
                className="lc-panel-link"
                to="/member/membership/payment"
              >
                Manage membership
                <ArrowRight size={16} />
              </Link>

            </article>

          </section>

          {/* =================================
              SECURITY INFORMATION
          ================================== */}

          <section className="lc-security">

            <div className="lc-security-icon">
              <ShieldCheck size={29} />
            </div>

            <div>

              <h3>Secure digital verification</h3>

              <p>
                Your QR code is used to verify
                library membership. The librarian
                may also check your identity
                before providing library services.
              </p>

            </div>

            <Link to="/member/support">
              Need help?
              <ArrowRight size={16} />
            </Link>

          </section>

        </>

      ) : null}

      {/* =====================================
          REGENERATE CONFIRMATION MODAL
      ====================================== */}

      {confirmOpen && (
        <div
          className="lc-modal-overlay"
          onClick={() => {
            if (!regenerating) {
              setConfirmOpen(false);
            }
          }}
        >

          <div
            className="lc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lc-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="lc-modal-close"
              aria-label="Close dialog"
              disabled={regenerating}
              onClick={() =>
                setConfirmOpen(false)
              }
            >
              <X size={21} />
            </button>

            <div className="lc-modal-icon">
              <RefreshCw size={32} />
            </div>

            <h2 id="lc-modal-title">
              Regenerate QR code?
            </h2>

            <p>
              A new verification QR code
              will be generated for your
              library card.
            </p>

            <div className="lc-modal-warning">

              <AlertCircle size={21} />

              <span>
                Your previous QR code will
                no longer be valid. Download
                or print your updated card
                after regeneration.
              </span>

            </div>

            <div className="lc-modal-actions">

              <button
                type="button"
                className="lc-outline"
                autoFocus
                disabled={regenerating}
                onClick={() =>
                  setConfirmOpen(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="lc-primary"
                disabled={regenerating}
                onClick={regenerateCard}
              >

                {regenerating ? (
                  <LoaderCircle
                    size={18}
                    className="lc-spin"
                  />
                ) : (
                  <RefreshCw size={18} />
                )}

                {regenerating
                  ? "Regenerating..."
                  : "Regenerate QR"}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}