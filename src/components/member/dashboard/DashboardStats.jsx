import React from "react";
import { Link } from "react-router-dom";

import {
  BookOpen,
  Heart,
  CalendarClock,
  ShieldCheck,
  Wallet,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import {
  formatDashboardMoney,
} from "../../../services/dashboardApi";

export default function DashboardStats({
  readingStats,
  accountSummary,
  membership,
}) {

  const stats = [
    {
      label: "Active loans",
      value: readingStats?.activeLoans ?? 0,
      icon: BookOpen,
      color: "purple",
      to: "/member/loans",
      description: "Currently borrowed",
    },
    {
      label: "Wishlist",
      value: accountSummary?.wishlistCount ?? 0,
      icon: Heart,
      color: "pink",
      to: "/member/wishlist",
      description: "Saved books",
    },
    {
      label: "Reservations",
      value:
        Number(
          accountSummary?.waitingReservations || 0
        ) +
        Number(
          accountSummary?.readyReservations || 0
        ),
      icon: CalendarClock,
      color: "orange",
      to: "/member/reservations",
      description: `${
        accountSummary?.readyReservations ?? 0
      } ready for pickup`,
    },
    {
      label: "Membership",
      value: membership?.valid
        ? `${Math.max(
            0,
            membership.remaining ?? 0
          )} days`
        : "Inactive",
      icon: ShieldCheck,
      color: "green",
      to: "/member/membership/payment",
      description: "Validity remaining",
    },
    {
      label: "Pending fines",
      value: formatDashboardMoney(
        accountSummary?.pendingFineAmount
      ),
      icon: Wallet,
      color: "blue",
      to: "/member/fines",
      description: `${
        accountSummary?.pendingFineCount ?? 0
      } pending charges`,
    },
    {
      label: "Overdue books",
      value: readingStats?.overdueBooks ?? 0,
      icon: AlertCircle,
      color: "red",
      to: "/member/loans",
      description: "Require attention",
    },
  ];

  return (
    <section className="md-stats">

      {stats.map((stat) => {

        const Icon = stat.icon;

        return (
          <Link
            key={stat.label}
            to={stat.to}
            className="md-stat-card"
          >

            <div className="md-stat-top">

              <div
                className={`md-icon md-${stat.color}`}
              >
                <Icon size={23} />
              </div>

              <ArrowUpRight
                size={17}
                className="md-stat-arrow"
              />

            </div>

            <span className="md-stat-label">
              {stat.label}
            </span>

            <strong>{stat.value}</strong>

            <small>{stat.description}</small>

          </Link>
        );
      })}

    </section>
  );
}