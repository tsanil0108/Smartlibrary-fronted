import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  UserRound,
  Mail,
  ShieldCheck,
  CreditCard,
  CalendarDays,
  IdCard,
  Pencil,
  Save,
  X,
  LockKeyhole,
  KeyRound,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  BookOpen,
  Headphones,
  Clock,
} from "lucide-react";

import { useAuth } from "../../context/Auth";

import {
  profileApi,
  formatProfileDate,
  getInitials,
} from "../../services/profileApi";

import "../../styles/member/Profile.css";

// ==========================================
// INFORMATION FIELD
// ==========================================

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="pf-info-field">

      <div className="pf-info-icon">
        <Icon size={21} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value ?? "—"}</strong>
      </div>

    </div>
  );
}

// ==========================================
// ACCOUNT STATUS
// ==========================================

function AccountStatus({ status }) {
  return (
    <span
      className={`pf-status ${
        status === "ACTIVE"
          ? "pf-status-active"
          : "pf-status-inactive"
      }`}
    >
      <span />
      {status || "Unknown"}
    </span>
  );
}

// ==========================================
// MAIN PROFILE PAGE
// ==========================================

export default function Profile() {
  const { user, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);

  const [membershipError, setMembershipError] =
    useState("");

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ========================================
  // LOAD PROFILE & MEMBERSHIP
  // ========================================

  async function loadProfile() {
    setLoading(true);
    setError("");
    setNotice("");
    setMembershipError("");

    try {
      const [profileResult, dashboardResult] =
        await Promise.allSettled([
          profileApi.getProfile(),
          profileApi.getDashboard(),
        ]);

      if (profileResult.status === "rejected") {
        throw profileResult.reason;
      }

      const data = profileResult.value;

      if (!data || data.id == null) {
        throw new Error("Invalid profile response.");
      }

      setProfile(data);
      setName(data.name || "");
      setEditing(false);

      if (dashboardResult.status === "fulfilled") {
        setMembership(
          dashboardResult.value?.membership || null
        );
      } else {
        setMembership(null);
        setMembershipError(
          "Unable to load membership information."
        );
      }

    } catch (err) {
      setError(
        err.message || "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // ========================================
  // UPDATE PROFILE
  // ========================================

  async function handleSave(event) {
    event.preventDefault();

    setError("");
    setNotice("");

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    if (cleanName.length > 100) {
      setError(
        "Full name cannot exceed 100 characters."
      );
      return;
    }

    if (cleanName === profile.name) {
      setEditing(false);
      return;
    }

    setSaving(true);

    try {
      const updated =
        await profileApi.updateProfile(cleanName);

      const nextProfile = {
        ...profile,
        ...updated,
        name: updated?.name || cleanName,
      };

      setProfile(nextProfile);
      setName(nextProfile.name);
      setEditing(false);

      // Update existing Auth context and header name.
      // Preserve the current JWT.

      const accessToken =
        sessionStorage.getItem("token");

      if (accessToken && user) {
        login({
          accessToken,
          user: {
            ...user,
            name: nextProfile.name,
          },
        });
      }

      setNotice("Profile updated successfully.");

    } catch (err) {
      setError(
        err.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setName(profile?.name || "");
    setEditing(false);
    setError("");
    setNotice("");
  }

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="pf-page">
        <div className="pf-empty">

          <LoaderCircle
            size={42}
            className="pf-spin"
          />

          <h3>Loading your profile...</h3>

          <p>
            Fetching your account information.
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================

  if (!profile) {
    return (
      <div className="pf-page">
        <div className="pf-empty">

          <AlertCircle size={42} />

          <h3>Unable to load profile</h3>

          <p>{error}</p>

          <button
            type="button"
            className="pf-primary"
            onClick={loadProfile}
          >
            <RefreshCw size={17} />
            Try again
          </button>

        </div>
      </div>
    );
  }

  const membershipActive =
    membership?.valid === true;

  return (
    <div className="pf-page">

      {/* PAGE HEADER */}

      <header className="pf-header">

        <div>

          <span className="pf-eyebrow">
            <UserRound size={16} />
            MY ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information
            and account settings.
          </p>

        </div>

        <button
          type="button"
          className="pf-outline"
          onClick={loadProfile}
          disabled={saving}
        >
          <RefreshCw size={17} />
          Refresh profile
        </button>

      </header>

      {/* PROFILE HERO */}

      <section className="pf-hero">

        <div className="pf-hero-decoration" />

        <div className="pf-hero-top">

          <div className="pf-avatar">

            {getInitials(profile.name)}

            {profile.status === "ACTIVE" && (
              <span className="pf-avatar-online" />
            )}

          </div>

          <div className="pf-hero-info">

            <span className="pf-hero-label">
              YOUR LIBRARY ACCOUNT
            </span>

            <h2>{profile.name}</h2>

            <p>
              <Mail size={16} />
              {profile.email}
            </p>

            <div className="pf-hero-badges">

              <AccountStatus
                status={profile.status}
              />

              <span className="pf-role-badge">
                <BookOpen size={13} />
                {profile.role || "MEMBER"}
              </span>

            </div>

          </div>

          <button
            type="button"
            className="pf-hero-edit"
            disabled={saving}
            onClick={() => {
              setEditing(true);
              setError("");
              setNotice("");

              requestAnimationFrame(() => {
                document
                  .getElementById("pf-full-name")
                  ?.focus();
              });
            }}
          >
            <Pencil size={17} />
            Edit profile
          </button>

        </div>

        <div className="pf-hero-bottom">

          <div>

            <span>Member ID</span>

            <strong>
              #{String(profile.id).padStart(6, "0")}
            </strong>

          </div>

          <div>

            <span>Membership plan</span>

            <strong>
              {membershipError
                ? "Unavailable"
                : membership?.planName ||
                  "No membership"}
            </strong>

          </div>

          <div>

            <span>Membership validity</span>

            <strong>
              {membershipError
                ? "Unavailable"
                : membershipActive
                  ? `${membership.remaining ?? 0} days remaining`
                  : "Not active"}
            </strong>

          </div>

        </div>

      </section>

      {/* ACCOUNT SUMMARY */}

      <section className="pf-summary">

        <InfoField
          icon={IdCard}
          label="Member ID"
          value={`#${String(profile.id).padStart(
            6,
            "0"
          )}`}
        />

        <InfoField
          icon={ShieldCheck}
          label="Account status"
          value={profile.status}
        />

        <InfoField
          icon={CreditCard}
          label="Membership"
          value={
            membershipError
              ? "Unavailable"
              : membershipActive
                ? "Active"
                : "Inactive"
          }
        />

        <InfoField
          icon={CalendarDays}
          label="Membership expires"
          value={formatProfileDate(
            membership?.endDate
          )}
        />

      </section>

      {/* NOTIFICATIONS */}

      {notice && (
        <div
          className="pf-message pf-success"
          role="status"
        >
          <CheckCircle2 size={20} />
          {notice}

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div
          className="pf-message pf-error"
          role="alert"
        >
          <AlertCircle size={20} />
          {error}

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* MAIN CONTENT GRID */}

      <div className="pf-content-grid">

        <section className="pf-panel">

          <div className="pf-panel-header">

            <div className="pf-panel-icon">
              <UserRound size={24} />
            </div>

            <div>

              <h2>Personal information</h2>

              <p>
                View and update your profile details.
              </p>

            </div>

            {!editing && (
              <button
                type="button"
                className="pf-edit-button"
                onClick={() => setEditing(true)}
              >
                <Pencil size={15} />
                Edit
              </button>
            )}

          </div>

          <form
            className="pf-form"
            onSubmit={handleSave}
          >

            <div className="pf-field">

              <label htmlFor="pf-full-name">
                Full name
              </label>

              <div className="pf-input-wrap">

                <UserRound size={19} />

                <input
                  id="pf-full-name"
                  type="text"
                  value={name}
                  readOnly={!editing}
                  disabled={saving}
                  maxLength={100}
                  required
                  autoComplete="name"
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                />

              </div>

            </div>

            <div className="pf-field">

              <label htmlFor="pf-email">
                Email address
              </label>

              <div className="pf-input-wrap pf-locked">

                <Mail size={19} />

                <input
                  id="pf-email"
                  type="email"
                  value={profile.email || ""}
                  readOnly
                />

                <LockKeyhole size={16} />

              </div>

              <small>
                Email changes are not supported
                from this page.
              </small>

            </div>

            <div className="pf-form-grid">

              <div className="pf-field">

                <label htmlFor="pf-role">
                  Account role
                </label>

                <div className="pf-input-wrap pf-locked">

                  <ShieldCheck size={18} />

                  <input
                    id="pf-role"
                    value={profile.role || ""}
                    readOnly
                  />

                </div>

              </div>

              <div className="pf-field">

                <label htmlFor="pf-status">
                  Account status
                </label>

                <div className="pf-input-wrap pf-locked">

                  <CheckCircle2 size={18} />

                  <input
                    id="pf-status"
                    value={profile.status || ""}
                    readOnly
                  />

                </div>

              </div>

            </div>

            {editing ? (

              <div className="pf-form-actions">

                <button
                  type="button"
                  className="pf-outline"
                  disabled={saving}
                  onClick={cancelEditing}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="pf-primary"
                  disabled={saving}
                >

                  {saving ? (
                    <LoaderCircle
                      size={17}
                      className="pf-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving
                    ? "Saving changes..."
                    : "Save changes"}

                </button>

              </div>

            ) : (

              <div className="pf-form-note">
                <ShieldCheck size={18} />
                Your personal information is
                associated with your library account.
              </div>

            )}

          </form>

        </section>

        {/* MEMBERSHIP PANEL */}

        <section className="pf-panel">

          <div className="pf-panel-header">

            <div className="pf-panel-icon pf-orange">
              <CreditCard size={24} />
            </div>

            <div>

              <h2>My membership</h2>

              <p>Current membership details.</p>

            </div>

          </div>

          {membershipError ? (

            <div className="pf-membership-empty">

              <AlertCircle size={35} />

              <p>{membershipError}</p>

              <button
                type="button"
                className="pf-outline"
                onClick={loadProfile}
              >
                Try again
              </button>

            </div>

          ) : membership ? (

            <>

              <div className="pf-membership-card">

                <span>LIBRARY MEMBERSHIP</span>

                <h3>
                  {membership.planName ||
                    "Library membership"}
                </h3>

                <span
                  className={`pf-membership-status ${
                    membershipActive
                      ? "pf-membership-active"
                      : ""
                  }`}
                >
                  {membershipActive
                    ? "Active membership"
                    : membership.status ||
                      "Inactive"}
                </span>

              </div>

              <div className="pf-membership-details">

                <div>
                  <span>Start date</span>
                  <strong>
                    {formatProfileDate(
                      membership.startDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Expiry date</span>
                  <strong>
                    {formatProfileDate(
                      membership.endDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Remaining validity</span>
                  <strong>
                    {membershipActive
                      ? `${membership.remaining ?? 0} days`
                      : "Not active"}
                  </strong>
                </div>

              </div>

            </>

          ) : (

            <div className="pf-membership-empty">

              <CreditCard size={38} />

              <h3>No membership found</h3>

              <p>
                Activate a membership to access
                borrowing benefits.
              </p>

            </div>

          )}

          <Link
            to="/member/membership/payment"
            className="pf-primary pf-full"
          >
            {membershipActive
              ? "Manage membership"
              : "View membership plans"}

            <ArrowRight size={17} />
          </Link>

        </section>

      </div>

      {/* ACCOUNT SECURITY */}

      <section className="pf-panel pf-security">

        <div className="pf-panel-header">

          <div className="pf-panel-icon pf-green">
            <ShieldCheck size={24} />
          </div>

          <div>

            <h2>Account security</h2>

            <p>
              Manage your password and account access.
            </p>

          </div>

        </div>

        <Link
          to="/member/change-password"
          className="pf-security-row"
        >

          <div className="pf-security-icon">
            <KeyRound size={22} />
          </div>

          <div className="pf-security-text">

            <strong>Change password</strong>

            <span>
              Update your password to keep
              your account secure.
            </span>

          </div>

          <ChevronRight size={21} />

        </Link>

        <div className="pf-security-tip">

          <LockKeyhole size={19} />

          <p>
            Use a strong, unique password and never
            share your login credentials with anyone.
          </p>

        </div>

      </section>

      {/* QUICK ACCOUNT LINKS */}

      <section className="pf-quick-links">

        {[
          {
            icon: IdCard,
            title: "Digital library card",
            description: "View your membership card",
            path: "/member/library-card",
          },
          {
            icon: Clock,
            title: "Payment history",
            description: "View membership transactions",
            path: "/member/payments",
          },
          {
            icon: Headphones,
            title: "Help & support",
            description: "Get assistance with your account",
            path: "/member/support",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="pf-quick-card"
            >

              <div className="pf-panel-icon">
                <Icon size={22} />
              </div>

              <div>

                <strong>{item.title}</strong>

                <span>{item.description}</span>

              </div>

              <ChevronRight size={19} />

            </Link>
          );
        })}

      </section>

    </div>
  );
}