import React from "react";
import { Link } from "react-router-dom";

import {
  LibraryBig,
  UsersRound,
  BookOpen,
  CalendarClock,
  Wallet,
  Headset,
  ArrowUpRight,
} from "lucide-react";

import {
  formatAdminMoney,
} from "../../../services/adminDashboardApi";

export default function AdminDashboardStats({ data }) {

  const reservationCount = data.reservations
    ? data.reservations.filter(
        (item) =>
          item.status === "WAITING" ||
          item.status === "READY"
      ).length
    : null;

  const stats = [
    {
      title: "Total books",
      value: data.totalBooks,
      icon: LibraryBig,
      color: "purple",
      description: "Books in catalogue",
      to: "/admin/books",
    },
    {
      title: "Total members",
      value: data.totalMembers,
      icon: UsersRound,
      color: "blue",
      description: "Registered members",
      to: "/admin/members",
    },
    {
      title: "Active loans",
      value: data.activeLoans,
      icon: BookOpen,
      color: "green",
      description: "Currently borrowed",
      to: "/admin/loans",
    },
    {
      title: "Reservations",
      value: reservationCount,
      icon: CalendarClock,
      color: "orange",
      description: "Waiting and ready",
      to: "/admin/reservations",
    },
    {
      title: "Pending fines",
      value: formatAdminMoney(
        data.fines?.pendingAmount
      ),
      icon: Wallet,
      color: "red",
      description: "Outstanding charges",
      to: "/admin/fines",
    },
    {
      title: "Open tickets",
      value: data.support?.openTickets,
      icon: Headset,
      color: "pink",
      description: "Require attention",
      to: "/admin/support",
    },
  ];

  return (
    <section className="ad-stats">

      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.title}
            to={item.to}
            className="ad-stat-card"
          >

            <div className="ad-stat-top">

              <div
                className={`ad-icon ad-${item.color}`}
              >
                <Icon size={25} />
              </div>

              <ArrowUpRight
                size={18}
                className="ad-muted"
              />

            </div>

            <span>{item.title}</span>

            <strong>{item.value ?? "—"}</strong>

            <small>{item.description}</small>

          </Link>
        );
      })}

    </section>
  );
}