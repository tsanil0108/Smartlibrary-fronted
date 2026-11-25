import React from "react";
import { Link } from "react-router-dom";

import {
  BookPlus,
  UsersRound,
  Tags,
  BookOpen,
  CalendarClock,
  CreditCard,
  Wallet,
  TicketPercent,
  Star,
  Headset,
  ChartNoAxesCombined,
} from "lucide-react";

const actions = [
  {
    label: "Manage books",
    icon: BookPlus,
    to: "/admin/books",
    color: "purple",
  },
  {
    label: "Members",
    icon: UsersRound,
    to: "/admin/members",
    color: "blue",
  },
  {
    label: "Categories",
    icon: Tags,
    to: "/admin/categories",
    color: "orange",
  },
  {
    label: "Circulation",
    icon: BookOpen,
    to: "/admin/loans",
    color: "green",
  },
  {
    label: "Reservations",
    icon: CalendarClock,
    to: "/admin/reservations",
    color: "purple",
  },
  {
    label: "Library cards",
    icon: CreditCard,
    to: "/admin/library-cards",
    color: "blue",
  },
  {
    label: "Manage fines",
    icon: Wallet,
    to: "/admin/fines",
    color: "red",
  },
  {
    label: "Coupons",
    icon: TicketPercent,
    to: "/admin/coupons",
    color: "orange",
  },
  {
    label: "Book reviews",
    icon: Star,
    to: "/admin/reviews",
    color: "pink",
  },
  {
    label: "Support tickets",
    icon: Headset,
    to: "/admin/support",
    color: "green",
  },
  {
    label: "Reports",
    icon: ChartNoAxesCombined,
    to: "/admin/reports",
    color: "purple",
  },
];

export default function AdminQuickActions() {
  return (
    <section className="ad-panel">

      <div className="ad-panel-header">

        <div>
          <h3>Quick management</h3>
          <p>Access your library management tools</p>
        </div>

      </div>

      <div className="ad-quick-grid">

        {actions.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.to}
              className="ad-quick-action"
            >

              <div
                className={`ad-icon ad-${item.color}`}
              >
                <Icon size={25} />
              </div>

              <span>{item.label}</span>

            </Link>
          );
        })}

      </div>

    </section>
  );
}