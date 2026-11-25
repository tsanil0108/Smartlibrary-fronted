import React from "react";
import { Link } from "react-router-dom";

import {
  CreditCard,
  LibraryBig,
  ArrowUpRight,
  ShieldCheck,
  QrCode,
  RefreshCw,
} from "lucide-react";

import {
  formatDashboardDate,
} from "../../../services/dashboardApi";

export default function DashboardLibraryCard({
  card,
  error,
  onRetry,
}) {
  return (
    <section className="md-panel">

      <div className="md-panel-header">

        <div>
          <h3>Digital Library Card</h3>
          <p>Your personal library identity</p>
        </div>

        <Link
          to="/member/library-card"
          className="md-icon-link"
          aria-label="Open library card"
        >
          <ArrowUpRight size={20} />
        </Link>

      </div>

      {card ? (

        <div className="md-digital-card">

          <div className="md-card-top">

            <div>
              <LibraryBig size={23} />
              <span>SMART LIBRARY</span>
            </div>

            <CreditCard size={25} />

          </div>

          <span className="md-card-caption">
            DIGITAL MEMBERSHIP CARD
          </span>

          <div className="md-card-main">

            <div className="md-card-member">

              <h3>{card.memberName}</h3>

              <p>{card.cardNumber}</p>

              <small>
                {card.membershipPlan || "Library member"}
              </small>

            </div>

            {card.qrCode && (
              <div className="md-card-qr">

                <img
                  src={card.qrCode}
                  alt="Library card verification QR code"
                />

              </div>
            )}

          </div>

          <div className="md-card-bottom">

            <div>

              <small>VALID UNTIL</small>

              <strong>
                {formatDashboardDate(
                  card.membershipEndDate
                )}
              </strong>

            </div>

            <span
              className={`md-card-status ${
                card.valid ? "valid" : "invalid"
              }`}
            >
              <ShieldCheck size={14} />

              {card.valid ? "Active" : "Inactive"}

            </span>

          </div>

        </div>

      ) : (

        <div className="md-card-empty">

          <QrCode size={42} />

          <p>
            {error
              ? "Unable to load your library card."
              : "Library card unavailable."}
          </p>

          <button
            type="button"
            className="md-outline-button"
            onClick={onRetry}
          >
            <RefreshCw size={15} />
            Retry
          </button>

        </div>

      )}

      <Link
        to="/member/library-card"
        className="md-text-link"
      >
        View full library card
        <ArrowUpRight size={15} />
      </Link>

    </section>
  );
}