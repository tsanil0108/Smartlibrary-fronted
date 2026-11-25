import React from "react";
import { Link } from "react-router-dom";

import {
  ShieldCheck,
  ArrowRight,
  BookPlus,
  ChartNoAxesCombined,
} from "lucide-react";

export default function AdminDashboardHero({ name }) {
  const firstName =
    name?.trim().split(/\s+/)[0] || "Admin";

  return (
    <section className="ad-hero">

      <div className="ad-hero-content">

        <span className="ad-hero-label">
          <ShieldCheck size={16} />
          ADMIN CONTROL CENTER
        </span>

        <h2>Welcome back, {firstName}!</h2>

        <p>
          Manage your library, monitor circulation,
          track members and keep your library
          operations running smoothly.
        </p>

        <div className="ad-hero-actions">

          <Link
            to="/admin/books"
            className="ad-button ad-orange-button"
          >
            <BookPlus size={18} />
            Manage books
          </Link>

          <Link
            to="/admin/reports"
            className="ad-button ad-outline-button"
          >
            <ChartNoAxesCombined size={18} />
            View reports
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>

    </section>
  );
}