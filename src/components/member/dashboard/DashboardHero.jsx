import React from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import {
  formatDashboardDate,
} from "../../../services/dashboardApi";

export default function DashboardHero({
  memberName,
  membership,
}) {
  const firstName =
    memberName?.trim().split(/\s+/)[0] || "Reader";

  const active = membership?.valid === true;

  return (
    <section className="md-hero">

      <div className="md-hero-content">

        <span className="md-hero-label">
          <BookOpen size={15} />
          YOUR READING JOURNEY
        </span>

        <h2>Welcome back, {firstName}!</h2>

        <p>
          A new chapter awaits you. Discover amazing
          books, manage your library and keep learning
          something new every day.
        </p>

        <div className="md-hero-actions">

          <Link
            to="/member/books"
            className="md-button md-orange-button"
          >
            Explore books
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/member/membership/payment"
            className="md-hero-secondary"
          >
            {active
              ? "Manage membership"
              : "Activate membership"}
          </Link>

        </div>

        <div className="md-hero-membership">

          <ShieldCheck size={17} />

          <span>
            {active
              ? membership.planName || "Active membership"
              : "No active membership"}
          </span>

          {membership?.endDate && (
            <>
              <CalendarDays size={16} />

              <span>
                Valid until{" "}
                {formatDashboardDate(membership.endDate)}
              </span>
            </>
          )}

        </div>

      </div>

    </section>
  );
}