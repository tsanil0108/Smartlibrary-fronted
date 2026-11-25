import React from "react";
import { Link } from "react-router-dom";

import {
  LibraryBig,
  CreditCard,
  Receipt,
  CalendarDays,
  Heart,
  ChartNoAxesColumn,
  User,
  Headphones,
  ArrowUpRight,
  Zap,
} from "lucide-react";

const actions = [
  {
    label: "Browse Books",
    path: "/member/books",
    icon: LibraryBig,
    color: "purple",
  },
  {
    label: "Buy Membership",
    path: "/member/membership/payment",
    icon: CreditCard,
    color: "orange",
  },
  {
    label: "Payment History",
    path: "/member/payments",
    icon: Receipt,
    color: "green",
  },
  {
    label: "Reservations",
    path: "/member/reservations",
    icon: CalendarDays,
    color: "blue",
  },
  {
    label: "My Wishlist",
    path: "/member/wishlist",
    icon: Heart,
    color: "pink",
  },
  {
    label: "Reading Analytics",
    path: "/member/analytics",
    icon: ChartNoAxesColumn,
    color: "purple",
  },
  {
    label: "My Profile",
    path: "/member/profile",
    icon: User,
    color: "blue",
  },
  {
    label: "Help & Support",
    path: "/member/support",
    icon: Headphones,
    color: "orange",
  },
];

export default function DashboardQuickActions() {
  return (
    <section className="md-panel md-quick-actions">

      <div className="md-panel-header">
        <div>
          <h2>
            <Zap size={21} />
            {" "}Quick Actions
          </h2>

          <p>
            Access your favourite library services.
          </p>
        </div>
      </div>

      <div className="md-quick-grid">

        {actions.map(
          ({ label, path, icon: Icon, color }) => (

            <Link
              key={path}
              to={path}
              className="md-quick-action"
            >

              <div
                className={`md-quick-icon ${color}`}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>

              <span>{label}</span>

              <ArrowUpRight
                size={14}
                className="md-quick-arrow"
              />

            </Link>

          )
        )}

      </div>

    </section>
  );
}