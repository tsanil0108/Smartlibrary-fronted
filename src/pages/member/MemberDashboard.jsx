import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CalendarDays,
  Wallet,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/Auth";

import {
  dashboardApi,
  formatDashboardMoney,
} from "../../services/dashboardApi";

import DashboardHero from "../../components/member/dashboard/DashboardHero";
import DashboardStats from "../../components/member/dashboard/DashboardStats";
import DashboardLibraryCard from "../../components/member/dashboard/DashboardLibraryCard";
import DashboardQuickActions from "../../components/member/dashboard/DashboardQuickActions";
import DashboardReadingChart from "../../components/member/dashboard/DashboardReadingChart";
import DashboardUpcomingReturns from "../../components/member/dashboard/DashboardUpcomingReturns";
import DashboardRecommendations from "../../components/member/dashboard/DashboardRecommendations";
import DashboardRecentActivity from "../../components/member/dashboard/DashboardRecentActivity";

import "../../styles/member/MemberDashboard.css";

export default function MemberDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [libraryCard, setLibraryCard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cardError, setCardError] = useState("");

  const loadCard = useCallback(async () => {
    setCardError("");

    try {
      const data = await dashboardApi.getLibraryCard();

      setLibraryCard(data);
    } catch (err) {
      setLibraryCard(null);

      setCardError(
        err.message || "Unable to load library card."
      );
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResult, cardResult] =
        await Promise.allSettled([
          dashboardApi.getDashboard(),
          dashboardApi.getLibraryCard(),
        ]);

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
      } else {
        setError(
          dashboardResult.reason?.message ||
            "Unable to load dashboard."
        );
      }

      if (cardResult.status === "fulfilled") {
        setLibraryCard(cardResult.value);
        setCardError("");
      } else {
        setLibraryCard(null);

        setCardError(
          cardResult.reason?.message ||
            "Unable to load library card."
        );
      }
    } catch (err) {
      setError(
        err.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  if (loading && !dashboard) {
    return (
      <div className="md-loading">
        <div className="md-loading-icon">
          <LoaderCircle
            size={40}
            className="md-spin"
          />
        </div>

        <h2>Preparing your dashboard</h2>

        <p>Fetching your library information...</p>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="md-loading">
        <AlertCircle size={45} />

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button
          type="button"
          className="md-button"
          onClick={loadDashboard}
        >
          <RefreshCw size={17} />
          Try again
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const membership = dashboard.membership;
  const readingStats = dashboard.readingStats;
  const accountSummary = dashboard.accountSummary;

  const pendingFine = Number(
    accountSummary?.pendingFineAmount || 0
  );

  const readyReservations = Number(
    accountSummary?.readyReservations || 0
  );

  return (
    <div className="md-page">

      {/* PAGE HEADER */}

      <header className="md-page-header">
        <div>
          <span className="md-section-label">
            <LayoutDashboard size={16} />
            MEMBER WORKSPACE
          </span>

          <h1>Member Dashboard</h1>

          <p>
            Here's what's happening with your library
            account today.
          </p>
        </div>

        <div className="md-header-actions">
          <span className="md-today">
            <CalendarDays size={17} />
            {today}
          </span>

          <button
            type="button"
            className="md-refresh"
            onClick={loadDashboard}
            disabled={loading}
            aria-label="Refresh dashboard"
          >
            <RefreshCw
              size={19}
              className={loading ? "md-spin" : ""}
            />
          </button>
        </div>
      </header>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="md-alert md-red" role="alert">
          <AlertCircle size={21} />
          <span>{error}</span>
        </div>
      )}

      {/* HERO SECTION */}

      <DashboardHero
        memberName={dashboard.memberName || user?.name}
        membership={membership}
      />

      {/* INACTIVE MEMBERSHIP */}

      {!membership?.valid && (
        <div className="md-alert md-orange">
          <ShieldAlert size={23} />

          <div>
            <strong>Your membership is not active</strong>

            <p>
              Activate your membership to borrow books
              and access member benefits.
            </p>
          </div>

          <Link to="/member/membership/payment">
            Activate now
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* MEMBERSHIP EXPIRY */}

      {membership?.valid &&
        Number(membership.remaining) <= 7 && (
          <div className="md-alert md-orange">
            <CalendarDays size={23} />

            <div>
              <strong>Membership expiring soon</strong>

              <p>
                Your membership has{" "}
                {membership.remaining} days remaining.
              </p>
            </div>

            <Link to="/member/membership/payment">
              Renew membership
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

      {/* STATISTICS */}

      <DashboardStats
        readingStats={readingStats}
        accountSummary={accountSummary}
        membership={membership}
      />

      {/* PENDING FINES */}

      {pendingFine > 0 && (
        <div className="md-alert md-red">
          <Wallet size={23} />

          <div>
            <strong>
              Pending fine:{" "}
              {formatDashboardMoney(pendingFine)}
            </strong>

            <p>
              Contact the library to settle your
              outstanding charges.
            </p>
          </div>

          <Link to="/member/fines">
            View fines
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* READY RESERVATIONS */}

      {readyReservations > 0 && (
        <div className="md-alert md-green">
          <CalendarDays size={23} />

          <div>
            <strong>
              {readyReservations} reservation(s)
              ready for pickup
            </strong>

            <p>
              Check your reservations before the hold
              period expires.
            </p>
          </div>

          <Link to="/member/reservations">
            View reservations
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* LIBRARY CARD & CHART */}

      <div className="md-two-columns">
        <DashboardLibraryCard
          card={libraryCard}
          error={cardError}
          onRetry={loadCard}
        />

        <DashboardReadingChart
          activity={dashboard.monthlyActivity || []}
          readingStats={readingStats}
        />
      </div>

      {/* QUICK ACTIONS */}

      <DashboardQuickActions />

      {/* UPCOMING RETURNS & ACTIVITY */}

      <div className="md-two-columns">
        <DashboardUpcomingReturns
          returns={dashboard.upcomingReturns || []}
        />

        <DashboardRecentActivity
          activity={dashboard.recentActivity || []}
        />
      </div>

      {/* RECOMMENDED BOOKS */}

      <DashboardRecommendations
        books={dashboard.recommendedBooks || []}
      />

      {/* FOOTER */}

      <footer className="md-footer">
        <span>
          Smart Library Management System
        </span>

        <Link to="/member/support">
          Need help? Contact support
        </Link>
      </footer>

    </div>
  );
}