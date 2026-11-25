import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  LayoutDashboard,
  RefreshCw,
  CalendarDays,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/Auth";

import {
  adminDashboardApi,
} from "../../services/adminDashboardApi";

import AdminDashboardHero from "../../components/admin/dashboard/AdminDashboardHero";

import AdminDashboardStats from "../../components/admin/dashboard/AdminDashboardStats";

import AdminCirculationChart from "../../components/admin/dashboard/AdminCirculationChart";

import AdminFinanceOverview from "../../components/admin/dashboard/AdminFinanceOverview";

import AdminQuickActions from "../../components/admin/dashboard/AdminQuickActions";

import AdminRecentLoans from "../../components/admin/dashboard/AdminRecentLoans";

import AdminOperations from "../../components/admin/dashboard/AdminOperations";

import "../../styles/admin/AdminDashboard.css";

export default function AdminDashboard() {

  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {

    setLoading(true);
    setError("");

    try {

      const result =
        await adminDashboardApi.getDashboard();

      setData(result);

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

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }
  );

  if (loading && !data) {
    return (
      <div className="ad-loading">

        <LoaderCircle
          size={45}
          className="ad-spin"
        />

        <h2>Preparing admin dashboard</h2>

        <p>Fetching library information...</p>

      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="ad-loading">

        <AlertCircle size={45} />

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

        <button
          type="button"
          className="ad-button"
          onClick={loadDashboard}
        >
          <RefreshCw size={18} />
          Try again
        </button>

      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="ad-page">

      {/* PAGE HEADER */}

      <header className="ad-page-header">

        <div>

          <span className="ad-section-label">
            <LayoutDashboard size={16} />
            ADMIN WORKSPACE
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor and manage your library operations.
          </p>

        </div>

        <div className="ad-header-actions">

          <span className="ad-date">
            <CalendarDays size={17} />
            {today}
          </span>

          <button
            type="button"
            className="ad-refresh"
            onClick={loadDashboard}
            disabled={loading}
            aria-label="Refresh dashboard"
          >

            <RefreshCw
              size={19}
              className={loading ? "ad-spin" : ""}
            />

          </button>

        </div>

      </header>

      {/* API ERROR */}

      {error && (
        <div className="ad-warning" role="alert">
          <AlertCircle size={21} />
          <span>{error}</span>
        </div>
      )}

      {data.errors?.length > 0 && (

        <div className="ad-warning" role="alert">

          <AlertCircle size={22} />

          <div>

            <strong>
              Some dashboard data is unavailable.
            </strong>

            <p>
              Failed sections:{" "}
              {data.errors
                .map((item) => item.section)
                .join(", ")}
            </p>

            <details>
              <summary>View error details</summary>

              {data.errors.map((item) => (
                <p key={item.section}>
                  {item.section}: {item.message}
                </p>
              ))}

            </details>

          </div>

        </div>

      )}

      {/* HERO */}

      <AdminDashboardHero name={user?.name} />

      {/* STATISTICS */}

      <AdminDashboardStats data={data} />

      {/* CHARTS AND FINANCE */}

      <div className="ad-two-columns">

        <AdminCirculationChart
          loans={data.recentLoans}
        />

        <AdminFinanceOverview
          fines={data.fines}
        />

      </div>

      {/* QUICK MANAGEMENT */}

      <AdminQuickActions />

      {/* RESERVATIONS AND SUPPORT */}

      <AdminOperations
        reservations={data.reservations}
        support={data.support}
      />

      {/* RECENT LOANS */}

      <AdminRecentLoans
        loans={data.recentLoans}
      />

      <footer className="ad-footer">
        Smart Library Management System
        · Administration Workspace
      </footer>

    </div>
  );
}