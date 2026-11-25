import React from "react";
import { Link } from "react-router-dom";

import {
  Wallet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  TicketPercent,
} from "lucide-react";

import {
  formatAdminMoney,
} from "../../../services/adminDashboardApi";

export default function AdminFinanceOverview({
  fines,
}) {

  const items = [
    {
      label: "Collected fines",
      value: fines?.paidAmount,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Pending fines",
      value: fines?.pendingAmount,
      icon: Clock,
      color: "orange",
    },
    {
      label: "Waived fines",
      value: fines?.waivedAmount,
      icon: ShieldCheck,
      color: "purple",
    },
  ];

  return (
    <section className="ad-panel">

      <div className="ad-panel-header">

        <div>
          <h3>Financial overview</h3>
          <p>Library fines and collections</p>
        </div>

        <Link
          to="/admin/fines"
          className="ad-icon-link"
          aria-label="Manage fines"
        >
          <ArrowUpRight size={20} />
        </Link>

      </div>

      <div className="ad-finance-total">

        <div>

          <span>Total assessed fines</span>

          <h2>
            {formatAdminMoney(fines?.totalAmount)}
          </h2>

          <small>All recorded fine charges</small>

        </div>

        <Wallet size={44} />

      </div>

      <div className="ad-finance-list">

        {items.map((item) => {

          const Icon = item.icon;

          return (
            <div
              className="ad-finance-row"
              key={item.label}
            >

              <div
                className={`ad-icon ad-${item.color}`}
              >
                <Icon size={20} />
              </div>

              <span>{item.label}</span>

              <strong>
                {formatAdminMoney(item.value)}
              </strong>

            </div>
          );
        })}

      </div>

      <Link
        to="/admin/coupons"
        className="ad-coupon-link"
      >
        <TicketPercent size={21} />

        <div>
          <strong>Membership coupons</strong>
          <small>Manage membership offers</small>
        </div>

        <ArrowUpRight size={17} />
      </Link>

    </section>
  );
}