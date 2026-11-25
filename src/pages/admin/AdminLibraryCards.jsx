import React, {
    useState,
    useRef,
    useEffect,
} from "react";

import {
    IdCard,
    ScanLine,
    QrCode,
    ShieldCheck,
    ShieldAlert,
    ShieldOff,
    CheckCircle2,
    XCircle,
    UserRound,
    CalendarDays,
    CreditCard,
    Search,
    RefreshCw,
    LoaderCircle,
    AlertCircle,
    LibraryBig,
    Settings,
    X,
    Clock3,
    Camera,
    Power,
} from "lucide-react";

import {
    adminLibraryCardApi,
    formatCardDate,
    getCardStatusLabel,
} from "../../services/adminLibraryCardApi";

import "../../styles/admin/AdminLibraryCards.css";


// ==========================================
// FEATURE CARDS
// ==========================================

const features = [

    {
        title: "QR verification",
        description: "Verify digital QR tokens",
        icon: ScanLine,
        color: "purple",
    },

    {
        title: "Card verification",
        description: "Search by card number",
        icon: IdCard,
        color: "blue",
    },

    {
        title: "Membership validity",
        description: "Check access eligibility",
        icon: ShieldCheck,
        color: "green",
    },

    {
        title: "Card controls",
        description: "Enable or disable cards",
        icon: Settings,
        color: "orange",
    },

];


// ==========================================
// DETAIL ITEM
// ==========================================

function DetailItem({ icon: Icon, label, value }) {

    return (

        <div className="alc-detail-item">

            <div className="alc-detail-icon">

                <Icon size={19} />

            </div>

            <div>

                <span>{label}</span>

                <strong>{value ?? "—"}</strong>

            </div>

        </div>

    );

}


// ==========================================
// CONFIRMATION MODAL
// ==========================================

function ConfirmStatusModal({
    card,
    active,
    saving,
    error,
    onClose,
    onConfirm,
}) {

    return (

        <div className="alc-overlay">

            <section
                className="alc-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="alc-modal-title"
            >

                <header className="alc-modal-header">

                    <div className={
                        `alc-icon ${
                            active
                                ? "alc-green"
                                : "alc-orange"
                        }`
                    }>

                        {active ? (

                            <ShieldCheck size={25} />

                        ) : (

                            <ShieldOff size={25} />

                        )}

                    </div>

                    <div className="alc-modal-heading">

                        <h2 id="alc-modal-title">

                            {active
                                ? "Enable library card"
                                : "Disable library card"}

                        </h2>

                        <p>Confirm card status change</p>

                    </div>

                    <button
                        className="alc-icon-button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >

                        <X size={20} />

                    </button>

                </header>

                <div className="alc-modal-body">

                    <div className="alc-confirm-card">

                        <IdCard size={34} />

                        <strong>{card.cardNumber}</strong>

                        <span>

                            {card.memberName ||
                                `Member #${card.userId}`}

                        </span>

                    </div>

                    <div className="alc-warning">

                        <AlertCircle size={20} />

                        <p>

                            {active
                                ? "Enabling this card restores card access, subject to membership validity and account status."
                                : "Disabling this card prevents successful card verification. It does not cancel the member's membership or automatically block borrowing."}

                        </p>

                    </div>

                    {error && (

                        <div
                            className="alc-error"
                            role="alert"
                        >

                            <AlertCircle size={18} />

                            {error}

                        </div>

                    )}

                </div>

                <footer className="alc-modal-footer">

                    <button
                        className="alc-secondary"
                        onClick={onClose}
                        disabled={saving}
                    >

                        Cancel

                    </button>

                    <button
                        className={
                            active
                                ? "alc-primary"
                                : "alc-danger"
                        }
                        disabled={saving}
                        onClick={onConfirm}
                    >

                        {saving ? (

                            <LoaderCircle
                                size={18}
                                className="alc-spin"
                            />

                        ) : (

                            <Power size={18} />

                        )}

                        {saving
                            ? "Updating..."
                            : active
                                ? "Enable card"
                                : "Disable card"}

                    </button>

                </footer>

            </section>

        </div>

    );

}


// ==========================================
// VERIFICATION RESULT
// ==========================================

function VerificationResult({
    result,
    onChangeStatus,
    statusSaving,
}) {

    const valid = result.valid === true;

    const status = result.status;

    const hasCard = Boolean(
        result.cardNumber &&
        result.userId != null
    );

    const canChangeStatus =
        hasCard &&
        (
            status === "ACTIVE" ||
            status === "DISABLED"
        );

    return (

        <section className="alc-panel alc-result">

            <div className={
                `alc-result-banner ${
                    valid
                        ? "alc-result-valid"
                        : "alc-result-invalid"
                }`
            }>

                <div className="alc-result-icon">

                    {valid ? (

                        <CheckCircle2 size={35} />

                    ) : (

                        <ShieldAlert size={35} />

                    )}

                </div>

                <div>

                    <h3>

                        {valid
                            ? "Valid library card"
                            : "Card verification unsuccessful"}

                    </h3>

                    <p>

                        {result.message ||
                            (
                                valid
                                    ? "Library card is currently valid."
                                    : "This card could not be validated."
                            )}

                    </p>

                </div>

            </div>

            {hasCard && (

                <>

                    {/* DIGITAL CARD */}

                    <div className="alc-digital-card">

                        <div className="alc-card-top">

                            <div className="alc-card-brand">

                                <LibraryBig size={27} />

                                <div>

                                    <strong>SMART LIBRARY</strong>

                                    <small>

                                        DIGITAL MEMBERSHIP CARD

                                    </small>

                                </div>

                            </div>

                            <span className="alc-card-badge">

                                {getCardStatusLabel(status)}

                            </span>

                        </div>

                        <div className="alc-card-number">

                            <span>LIBRARY CARD NUMBER</span>

                            <strong>{result.cardNumber}</strong>

                        </div>

                        <div className="alc-card-bottom">

                            <div>

                                <span>MEMBER NAME</span>

                                <strong>

                                    {result.memberName || "—"}

                                </strong>

                            </div>

                            <div>

                                <span>VALID UNTIL</span>

                                <strong>

                                    {formatCardDate(
                                        result.membershipEndDate
                                    )}

                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* MEMBER DETAILS */}

                    <div className="alc-detail-grid">

                        <DetailItem
                            icon={UserRound}
                            label="Member name"
                            value={result.memberName}
                        />

                        <DetailItem
                            icon={IdCard}
                            label="Member ID"
                            value={`#${result.userId}`}
                        />

                        <DetailItem
                            icon={CreditCard}
                            label="Membership plan"
                            value={result.membershipPlan}
                        />

                        <DetailItem
                            icon={CalendarDays}
                            label="Membership expiry"
                            value={formatCardDate(
                                result.membershipEndDate
                            )}
                        />

                        <DetailItem
                            icon={ShieldCheck}
                            label="Card status"
                            value={getCardStatusLabel(status)}
                        />

                        <DetailItem
                            icon={Clock3}
                            label="Verification result"
                            value={valid ? "Valid" : "Invalid"}
                        />

                    </div>


                    {/* CARD MANAGEMENT */}

                    <div className="alc-management">

                        <div>

                            <h3>Card access controls</h3>

                            <p>

                                Manage this member's digital
                                library card access.

                            </p>

                        </div>

                        {canChangeStatus ? (

                            <button
                                className={
                                    status === "DISABLED"
                                        ? "alc-primary"
                                        : "alc-danger-outline"
                                }
                                disabled={statusSaving}
                                onClick={() =>
                                    onChangeStatus(
                                        status === "DISABLED"
                                    )
                                }
                            >

                                {status === "DISABLED" ? (

                                    <ShieldCheck size={18} />

                                ) : (

                                    <ShieldOff size={18} />

                                )}

                                {status === "DISABLED"
                                    ? "Enable card"
                                    : "Disable card"}

                            </button>

                        ) : (

                            <span className="alc-muted">

                                Resolve membership or account
                                status before changing card access.

                            </span>

                        )}

                    </div>

                </>

            )}

        </section>

    );

}


// ==========================================
// MAIN PAGE
// ==========================================

export default function AdminLibraryCards() {

    const [mode, setMode] = useState("card");

    const [value, setValue] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [confirmation, setConfirmation] = useState(null);

    const [statusSaving, setStatusSaving] = useState(false);

    const [statusError, setStatusError] = useState("");

    const [cameraOpen, setCameraOpen] = useState(false);

    const [cameraError, setCameraError] = useState("");

    const videoRef = useRef(null);

    const streamRef = useRef(null);

    const lastVerificationRef = useRef(null);

    const cameraSupported =
        typeof window !== "undefined" &&
        "BarcodeDetector" in window &&
        Boolean(navigator.mediaDevices?.getUserMedia);


    // ======================================
    // CAMERA CLEANUP
    // ======================================

    useEffect(() => {

        if (!cameraOpen) return;

        let cancelled = false;

        let timer;

        let stream;

        async function startCamera() {

            try {

                const detector =
                    new window.BarcodeDetector({
                        formats: ["qr_code"],
                    });

                stream = await navigator.mediaDevices
                    .getUserMedia({

                        video: {
                            facingMode: {
                                ideal: "environment",
                            },
                        },

                        audio: false,

                    });

                if (cancelled) {

                    stream.getTracks().forEach(
                        track => track.stop()
                    );

                    return;

                }

                streamRef.current = stream;

                if (!videoRef.current) return;

                videoRef.current.srcObject = stream;

                await videoRef.current.play();

                async function scan() {

                    if (
                        cancelled ||
                        !videoRef.current
                    ) return;

                    try {

                        const codes = await detector.detect(
                            videoRef.current
                        );

                        if (cancelled) return;

                        if (codes.length > 0) {

                            const token =
                                codes[0].rawValue;

                            if (token) {

                                setMode("qr");
                                setValue(token);
                                setCameraOpen(false);
                                setCameraError("");

                                return;

                            }

                        }

                    } catch {

                        // Retry if the video frame
                        // is not ready yet.

                    }

                    if (!cancelled) {

                        timer = setTimeout(scan, 250);

                    }

                }

                scan();

            } catch (err) {

                if (!cancelled) {

                    setCameraError(
                        err.message ||
                        "Unable to access camera."
                    );

                    setCameraOpen(false);

                }

            }

        }

        startCamera();

        return () => {

            cancelled = true;

            clearTimeout(timer);

            stream?.getTracks().forEach(
                track => track.stop()
            );

            streamRef.current = null;

        };

    }, [cameraOpen]);


    // ======================================
    // VERIFY LIBRARY CARD
    // ======================================

    async function handleVerify(event) {

        event.preventDefault();

        if (loading || statusSaving) return;

        const input = value.trim();

        if (!input) {

            setError(
                "Please enter a card number or QR token."
            );

            return;

        }

        setLoading(true);
        setError("");
        setMessage("");
        setResult(null);
        setCameraOpen(false);

        try {

            const data = mode === "card"

                ? await adminLibraryCardApi
                    .verifyCardNumber(input)

                : await adminLibraryCardApi
                    .verifyQrCode(input);

            if (
                !data ||
                typeof data.valid !== "boolean"
            ) {

                throw new Error(
                    "Unexpected verification response."
                );

            }

            lastVerificationRef.current = {

                mode,

                value: input,

            };

            setResult(data);

        } catch (err) {

            setError(
                err.message ||
                "Unable to verify library card."
            );

        } finally {

            setLoading(false);

        }

    }


    // ======================================
    // CHANGE VERIFICATION METHOD
    // ======================================

    function changeMode(nextMode) {

        if (loading || statusSaving) return;

        setMode(nextMode);
        setValue("");
        setError("");
        setResult(null);
        setMessage("");
        setCameraOpen(false);
        setCameraError("");

        lastVerificationRef.current = null;

    }


    // ======================================
    // RESET
    // ======================================

    function resetVerification() {

        setValue("");
        setResult(null);
        setError("");
        setMessage("");
        setCameraOpen(false);
        setCameraError("");

        lastVerificationRef.current = null;

    }


    // ======================================
    // CARD STATUS UPDATE
    // ======================================

    function requestStatusChange(active) {

        setStatusError("");

        setConfirmation({ active });

    }

    async function confirmStatusChange() {

        if (
            statusSaving ||
            !confirmation ||
            result?.userId == null
        ) return;

        setStatusSaving(true);
        setStatusError("");
        setMessage("");

        const active = confirmation.active;

        try {

            await adminLibraryCardApi.updateCardStatus(
                result.userId,
                active
            );

            setConfirmation(null);

            setMessage(
                active
                    ? "Library card enabled successfully."
                    : "Library card disabled successfully."
            );

            // Always verify again after status update.
            // Do not assume enabling means valid membership.

            const previous =
                lastVerificationRef.current;

            setResult(null);

            try {

                const updated =
                    previous?.mode === "qr"

                        ? await adminLibraryCardApi
                            .verifyQrCode(previous.value)

                        : await adminLibraryCardApi
                            .verifyCardNumber(
                                result.cardNumber
                            );

                if (
                    !updated ||
                    typeof updated.valid !== "boolean"
                ) {

                    throw new Error(
                        "Unexpected verification response."
                    );

                }

                setResult(updated);

            } catch {

                setError(
                    "Card status was updated, but verification could not be refreshed. Please verify the card again."
                );

            }

        } catch (err) {

            setStatusError(
                err.message ||
                "Unable to update card status."
            );

        } finally {

            setStatusSaving(false);

        }

    }


    // ======================================
    // PAGE UI
    // ======================================

    return (

        <main className="alc-page">

            {/* HEADER */}

            <header className="alc-page-header">

                <div>

                    <span className="alc-eyebrow">

                        LIBRARY ADMINISTRATION

                    </span>

                    <h1>Library Card Management</h1>

                    <p>

                        Verify digital library cards and
                        manage member access.

                    </p>

                </div>

                <button
                    className="alc-secondary"
                    onClick={resetVerification}
                    disabled={loading || statusSaving}
                >

                    <RefreshCw size={18} />

                    Reset

                </button>

            </header>


            {/* HERO */}

            <section className="alc-hero">

                <div className="alc-hero-content">

                    <span className="alc-hero-tag">

                        <ShieldCheck size={15} />

                        DIGITAL IDENTITY MANAGEMENT

                    </span>

                    <h2>

                        Secure access.
                        <br />

                        Smarter library.

                    </h2>

                    <p>

                        Verify membership validity and
                        digital library cards instantly
                        with secure verification tools.

                    </p>

                    <div className="alc-hero-security">

                        <ShieldCheck size={19} />

                        Secure card verification

                    </div>

                </div>

                <div className="alc-hero-art">

                    <div className="alc-art-card">

                        <div className="alc-art-top">

                            <LibraryBig size={25} />

                            SMART LIBRARY

                        </div>

                        <div className="alc-art-body">

                            <div>

                                <UserRound size={43} />

                                <i />

                                <i />

                            </div>

                            <QrCode size={75} />

                        </div>

                    </div>

                    <div className="alc-art-shield">

                        <ShieldCheck size={35} />

                    </div>

                </div>

            </section>


            {/* FEATURES */}

            <section className="alc-features">

                {features.map(item => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="alc-feature"
                            key={item.title}
                        >

                            <div className={
                                `alc-icon alc-${item.color}`
                            }>

                                <Icon size={25} />

                            </div>

                            <strong>{item.title}</strong>

                            <p>{item.description}</p>

                        </article>

                    );

                })}

            </section>


            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="alc-success-message"
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


            {/* MAIN CONTENT */}

            <div className="alc-content-grid">

                {/* VERIFICATION PANEL */}

                <section className="alc-panel">

                    <header className="alc-panel-header">

                        <div className="alc-icon alc-purple">

                            <ScanLine size={25} />

                        </div>

                        <div>

                            <h3>Verify library card</h3>

                            <p>

                                Select your preferred
                                verification method.

                            </p>

                        </div>

                    </header>


                    {/* VERIFICATION TABS */}

                    <div className="alc-tabs">

                        <button
                            className={
                                mode === "card"
                                    ? "alc-tab alc-tab-active"
                                    : "alc-tab"
                            }
                            onClick={() => changeMode("card")}
                            disabled={loading || statusSaving}
                        >

                            <IdCard size={19} />

                            Card number

                        </button>

                        <button
                            className={
                                mode === "qr"
                                    ? "alc-tab alc-tab-active"
                                    : "alc-tab"
                            }
                            onClick={() => changeMode("qr")}
                            disabled={loading || statusSaving}
                        >

                            <QrCode size={19} />

                            QR token

                        </button>

                    </div>


                    {/* FORM */}

                    <form
                        className="alc-form"
                        onSubmit={handleVerify}
                    >

                        <div className="alc-field">

                            <label htmlFor="alc-value">

                                {mode === "card"
                                    ? "Library card number"
                                    : "QR code token"}

                            </label>

                            <div className="alc-input">

                                {mode === "card" ? (

                                    <IdCard size={20} />

                                ) : (

                                    <QrCode size={20} />

                                )}

                                <input
                                    id="alc-value"
                                    value={value}
                                    onChange={event => {

                                        setValue(
                                            event.target.value
                                        );

                                        setResult(null);
                                        setError("");
                                        setMessage("");

                                    }}
                                    placeholder={
                                        mode === "card"
                                            ? "e.g. SLM-000003"
                                            : "Paste scanned QR token"
                                    }
                                    disabled={
                                        loading ||
                                        statusSaving
                                    }
                                    autoComplete="off"
                                    spellCheck={false}
                                    required
                                />

                            </div>

                            <small>

                                {mode === "card"
                                    ? "Enter the card number printed on the member's digital library card."
                                    : "Scan the QR code using a supported camera or paste the decoded QR token."}

                            </small>

                        </div>


                        {/* CAMERA SCANNER */}

                        {mode === "qr" && (

                            <div className="alc-camera-section">

                                {cameraSupported ? (

                                    <button
                                        type="button"
                                        className="alc-secondary"
                                        disabled={
                                            loading ||
                                            statusSaving
                                        }
                                        onClick={() => {

                                            setCameraError("");

                                            setCameraOpen(
                                                current => !current
                                            );

                                        }}
                                    >

                                        <Camera size={18} />

                                        {cameraOpen
                                            ? "Close camera"
                                            : "Scan using camera"}

                                    </button>

                                ) : (

                                    <div className="alc-info">

                                        <Camera size={19} />

                                        <p>

                                            Native QR scanning is
                                            unavailable in this
                                            browser. Use a QR scanner
                                            and paste the decoded token.

                                        </p>

                                    </div>

                                )}

                                {cameraOpen && (

                                    <div className="alc-camera">

                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                        />

                                        <div className="alc-scan-frame">

                                            <span />

                                        </div>

                                        <p>

                                            Position QR code
                                            inside the frame.

                                        </p>

                                    </div>

                                )}

                                {cameraError && (

                                    <div className="alc-error">

                                        <AlertCircle size={18} />

                                        {cameraError}

                                    </div>

                                )}

                            </div>

                        )}


                        {error && (

                            <div
                                className="alc-error"
                                role="alert"
                            >

                                <AlertCircle size={19} />

                                {error}

                            </div>

                        )}


                        <button
                            type="submit"
                            className="alc-primary alc-full-button"
                            disabled={
                                loading ||
                                statusSaving ||
                                !value.trim()
                            }
                        >

                            {loading ? (

                                <LoaderCircle
                                    size={19}
                                    className="alc-spin"
                                />

                            ) : (

                                <ShieldCheck size={19} />

                            )}

                            {loading
                                ? "Verifying card..."
                                : "Verify library card"}

                        </button>

                    </form>


                    {/* SECURITY INFORMATION */}

                    <div className="alc-security-note">

                        <ShieldCheck size={22} />

                        <div>

                            <strong>Secure verification</strong>

                            <p>

                                Card validity is checked
                                against membership and account
                                records on the server. Verify
                                the member's identity separately.

                            </p>

                        </div>

                    </div>

                </section>


                {/* RESULT PANEL */}

                {result ? (

                    <VerificationResult
                        result={result}
                        onChangeStatus={requestStatusChange}
                        statusSaving={statusSaving}
                    />

                ) : (

                    <section className="alc-panel alc-empty">

                        <div className="alc-empty-icon">

                            {loading || statusSaving ? (

                                <LoaderCircle
                                    size={48}
                                    className="alc-spin"
                                />

                            ) : (

                                <ScanLine size={52} />

                            )}

                        </div>

                        <h3>

                            {loading || statusSaving
                                ? "Checking library card..."
                                : "Ready for verification"}

                        </h3>

                        <p>

                            {loading || statusSaving
                                ? "Please wait while the server checks card details."
                                : "Enter a library card number or scan a QR token to view membership details and card validity."}

                        </p>

                    </section>

                )}

            </div>


            {/* VERIFICATION GUIDE */}

            <section className="alc-panel">

                <header className="alc-panel-header">

                    <div className="alc-icon alc-blue">

                        <ShieldCheck size={25} />

                    </div>

                    <div>

                        <h3>Verification status guide</h3>

                        <p>

                            Understand library card
                            verification results.

                        </p>

                    </div>

                </header>

                <div className="alc-guide-grid">

                    {[

                        {
                            status: "ACTIVE",
                            title: "Active card",
                            description:
                                "Card and membership are currently valid.",
                            icon: CheckCircle2,
                            color: "green",
                        },

                        {
                            status: "DISABLED",
                            title: "Disabled card",
                            description:
                                "Card access has been disabled by an administrator.",
                            icon: ShieldOff,
                            color: "orange",
                        },

                        {
                            status: "MEMBERSHIP_INACTIVE",
                            title: "Inactive membership",
                            description:
                                "Membership is expired or otherwise inactive.",
                            icon: Clock3,
                            color: "orange",
                        },

                        {
                            status: "SUSPENDED",
                            title: "Suspended member",
                            description:
                                "The member's account is suspended.",
                            icon: XCircle,
                            color: "red",
                        },

                        {
                            status: "NO_MEMBERSHIP",
                            title: "No membership",
                            description:
                                "The member does not have a membership record.",
                            icon: CreditCard,
                            color: "blue",
                        },

                        {
                            status: "INVALID_MEMBER",
                            title: "Invalid member",
                            description:
                                "The card is not associated with an eligible member.",
                            icon: UserRound,
                            color: "red",
                        },

                    ].map(item => {

                        const Icon = item.icon;

                        return (

                            <article
                                className="alc-guide-item"
                                key={item.status}
                            >

                                <div className={
                                    `alc-icon alc-${item.color}`
                                }>

                                    <Icon size={22} />

                                </div>

                                <div>

                                    <strong>{item.title}</strong>

                                    <p>{item.description}</p>

                                </div>

                            </article>

                        );

                    })}

                </div>

            </section>


            {/* CONFIRMATION MODAL */}

            {confirmation && result && (

                <ConfirmStatusModal
                    card={result}
                    active={confirmation.active}
                    saving={statusSaving}
                    error={statusError}
                    onClose={() => {

                        if (!statusSaving) {

                            setConfirmation(null);

                        }

                    }}
                    onConfirm={confirmStatusChange}
                />

            )}

        </main>

    );

}