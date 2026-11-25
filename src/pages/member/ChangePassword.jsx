import React, {
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  AlertCircle,
  LoaderCircle,
  Info,
  Headphones,
  Check,
} from "lucide-react";

import { profileApi } from "../../services/profileApi";

import "../../styles/member/ChangePassword.css";

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// ==========================================
// PASSWORD FIELD
// ==========================================

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  disabled,
  invalid,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="cp-field">

      <label htmlFor={id}>
        {label}
      </label>

      <div
        className={`cp-input-wrap ${
          invalid ? "cp-input-invalid" : ""
        }`}
      >

        <LockKeyhole size={19} />

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(invalid)}
          required
        />

        <button
          type="button"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          onClick={() => setVisible(!visible)}
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>

      </div>

    </div>
  );
}

// ==========================================
// PASSWORD STRENGTH
// ==========================================

function getPasswordChecks(password) {
  return [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase and lowercase letters",
      valid:
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /\d/.test(password),
    },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9\s]/.test(password),
    },
  ];
}

// ==========================================
// MAIN CHANGE PASSWORD PAGE
// ==========================================

export default function ChangePassword() {
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const checks = useMemo(
    () => getPasswordChecks(form.newPassword),
    [form.newPassword]
  );

  const strength = form.newPassword
    ? checks.filter((check) => check.valid).length
    : 0;

  const strengthLabels = [
    "Enter a password",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  const strengthColors = [
    "#e9e6ef",
    "#dc2626",
    "#f59e0b",
    "#6339ef",
    "#16815b",
  ];

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;

  const passwordMismatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;

  const passwordBytes =
    new TextEncoder().encode(
      form.newPassword
    ).length;

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess(false);
  }

  // ========================================
  // SUBMIT PASSWORD CHANGE
  // ========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (passwordBytes > 72) {
      setError(
        "New password must not exceed 72 UTF-8 bytes."
      );
      return;
    }

    if (
      form.newPassword === form.currentPassword
    ) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    if (
      form.newPassword !== form.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      await profileApi.changePassword(form);

      setForm({ ...EMPTY_FORM });
      setSuccess(true);

    } catch (err) {
      setError(
        err.message ||
        "Unable to change your password."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cp-page">

      {/* BACK LINK */}

      <Link
        to="/member/profile"
        className="cp-back"
      >
        <ArrowLeft size={18} />
        Back to my profile
      </Link>

      {/* PAGE HEADER */}

      <header className="cp-header">

        <span className="cp-eyebrow">
          <ShieldCheck size={16} />
          ACCOUNT SECURITY
        </span>

        <h1>Change Password</h1>

        <p>
          Update your password and protect
          your library account.
        </p>

      </header>

      {/* SECURITY HERO */}

      <section className="cp-hero">

        <div className="cp-hero-content">

          <span>PROTECT YOUR ACCOUNT</span>

          <h2>Your security matters.</h2>

          <p>
            A strong and unique password helps
            prevent unauthorized access to your
            library account and personal information.
          </p>

        </div>

        <div
          className="cp-hero-art"
          aria-hidden="true"
        >

          <div className="cp-art-ring" />

          <div className="cp-art-shield">
            <ShieldCheck size={90} />
          </div>

          <div className="cp-art-lock">
            <LockKeyhole size={30} />
          </div>

        </div>

      </section>

      <div className="cp-content-grid">

        {/* PASSWORD FORM */}

        <section className="cp-panel">

          <div className="cp-panel-heading">

            <div className="cp-panel-icon">
              <KeyRound size={25} />
            </div>

            <div>

              <h2>Update your password</h2>

              <p>
                Enter your current and new password.
              </p>

            </div>

          </div>

          {success ? (

            <div
              className="cp-success-state"
              role="status"
            >

              <div className="cp-success-icon">
                <CheckCircle2 size={48} />
              </div>

              <h2>Password updated!</h2>

              <p>
                Your password has been changed
                successfully. Use your new password
                the next time you sign in.
              </p>

              <Link
                to="/member/profile"
                className="cp-primary"
              >
                Back to profile
                <ArrowRight size={18} />
              </Link>

            </div>

          ) : (

            <form
              className="cp-form"
              onSubmit={handleSubmit}
            >

              {error && (
                <div
                  className="cp-error"
                  role="alert"
                >
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <PasswordField
                id="cp-current"
                label="Current password"
                value={form.currentPassword}
                placeholder="Enter current password"
                autoComplete="current-password"
                disabled={saving}
                onChange={(value) =>
                  updateField(
                    "currentPassword",
                    value
                  )
                }
              />

              <div className="cp-divider" />

              <PasswordField
                id="cp-new"
                label="New password"
                value={form.newPassword}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={saving}
                invalid={passwordBytes > 72}
                onChange={(value) =>
                  updateField(
                    "newPassword",
                    value
                  )
                }
              />

              {/* STRENGTH INDICATOR */}

              <div className="cp-strength">

                <div className="cp-strength-bars">

                  {[1, 2, 3, 4].map((index) => (
                    <span
                      key={index}
                      style={{
                        background:
                          index <= strength
                            ? strengthColors[strength]
                            : "#e9e6ef",
                      }}
                    />
                  ))}

                </div>

                <div className="cp-strength-label">

                  <span>Password strength</span>

                  <strong
                    style={{
                      color: strength
                        ? strengthColors[strength]
                        : "#77758a",
                    }}
                  >
                    {strengthLabels[strength]}
                  </strong>

                </div>

              </div>

              {passwordBytes > 72 && (
                <p className="cp-invalid-text">
                  Password exceeds the 72-byte limit.
                </p>
              )}

              <PasswordField
                id="cp-confirm"
                label="Confirm new password"
                value={form.confirmPassword}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                disabled={saving}
                invalid={passwordMismatch}
                onChange={(value) =>
                  updateField(
                    "confirmPassword",
                    value
                  )
                }
              />

              {passwordsMatch && (
                <div className="cp-match">

                  <CheckCircle2 size={16} />

                  Passwords match

                </div>
              )}

              {passwordMismatch && (
                <div className="cp-invalid-text">

                  <AlertCircle size={16} />

                  Passwords do not match

                </div>
              )}

              {/* PASSWORD RECOMMENDATIONS */}

              <div className="cp-requirements">

                <h3>Password recommendations</h3>

                {checks.map((check) => (

                  <div
                    key={check.label}
                    className={
                      check.valid
                        ? "cp-check cp-check-valid"
                        : "cp-check"
                    }
                  >

                    {check.valid ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <Circle size={17} />
                    )}

                    <span>{check.label}</span>

                  </div>

                ))}

                <p>
                  At least 8 characters are required.
                  Other checks help improve strength.
                </p>

              </div>

              {/* SUBMIT */}

              <div className="cp-form-actions">

                <Link
                  to="/member/profile"
                  className="cp-outline"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="cp-primary"
                  disabled={
                    saving ||
                    !form.currentPassword ||
                    form.newPassword.length < 8 ||
                    !passwordsMatch ||
                    passwordBytes > 72
                  }
                >

                  {saving ? (
                    <LoaderCircle
                      size={18}
                      className="cp-spin"
                    />
                  ) : (
                    <ShieldCheck size={18} />
                  )}

                  {saving
                    ? "Updating password..."
                    : "Update password"}

                </button>

              </div>

            </form>

          )}

        </section>

        {/* SECURITY INFORMATION */}

        <aside className="cp-side">

          <section className="cp-panel">

            <div className="cp-panel-heading">

              <div className="cp-panel-icon cp-green">
                <ShieldCheck size={25} />
              </div>

              <div>

                <h2>Security tips</h2>

                <p>Keep your account protected.</p>

              </div>

            </div>

            {[
              {
                title: "Use a unique password",
                description:
                  "Avoid using the same password across different websites.",
              },
              {
                title: "Avoid personal information",
                description:
                  "Do not use your name, birthday or phone number.",
              },
              {
                title: "Never share your password",
                description:
                  "Keep your login credentials private.",
              },
              {
                title: "Use a longer password",
                description:
                  "A unique passphrase is a good option.",
              },
            ].map((tip) => (

              <div
                className="cp-tip"
                key={tip.title}
              >

                <div className="cp-tip-icon">
                  <Check size={17} />
                </div>

                <div>

                  <strong>{tip.title}</strong>

                  <p>{tip.description}</p>

                </div>

              </div>

            ))}

          </section>

          <section className="cp-security-note">

            <ShieldAlert size={25} />

            <div>

              <h3>Important security information</h3>

              <p>
                Changing your password may not
                automatically end existing login
                sessions.
              </p>

            </div>

          </section>

          <section className="cp-panel cp-help">

            <div className="cp-help-icon">
              <Headphones size={30} />
            </div>

            <h2>Need assistance?</h2>

            <p>
              Having trouble updating your password?
              Contact the library support team.
            </p>

            <Link
              to="/member/support"
              className="cp-outline"
            >
              Contact support
              <ArrowRight size={17} />
            </Link>

          </section>

        </aside>

      </div>

      <div className="cp-footer-note">

        <Info size={17} />

        Password changes are processed by the
        library authentication service.

      </div>

    </div>
  );
}