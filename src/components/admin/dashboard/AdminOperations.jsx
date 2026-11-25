import React from "react";
import { Link } from "react-router-dom";

import {
  CalendarClock,
  PackageCheck,
  Headset,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

function OperationRow({
  icon: Icon,
  label,
  value,
  color,
}) {
  return (
    <div className="ad-operation-row">

      <div className={`ad-icon ad-${color}`}>
        <Icon size={21} />
      </div>

      <span>{label}</span>

      <strong>{value ?? "—"}</strong>

    </div>
  );
}

export default function AdminOperations({
  reservations,
  support,
}) {

  const count = (status) =>
    reservations
      ? reservations.filter(
          (item) => item.status === status
        ).length
      : null;

  return (
    <div className="ad-two-columns">

      <section className="ad-panel">

        <div className="ad-panel-header">

          <div>
            <h3>Reservation management</h3>
            <p>Book reservation status</p>
          </div>

          <Link
            to="/admin/reservations"
            className="ad-icon-link"
            aria-label="Manage reservations"
          >
            <ArrowUpRight size={20} />
          </Link>

        </div>

        <OperationRow
          icon={CalendarClock}
          label="Waiting reservations"
          value={count("WAITING")}
          color="orange"
        />

        <OperationRow
          icon={PackageCheck}
          label="Ready for pickup"
          value={count("READY")}
          color="purple"
        />

        <OperationRow
          icon={CheckCircle2}
          label="Fulfilled reservations"
          value={count("FULFILLED")}
          color="green"
        />

      </section>

      <section className="ad-panel">

        <div className="ad-panel-header">

          <div>
            <h3>Support overview</h3>
            <p>Member requests and assistance</p>
          </div>

          <Link
            to="/admin/support"
            className="ad-icon-link"
            aria-label="Manage support tickets"
          >
            <ArrowUpRight size={20} />
          </Link>

        </div>

        <OperationRow
          icon={Headset}
          label="Open tickets"
          value={support?.openTickets}
          color="red"
        />

        <OperationRow
          icon={Clock}
          label="In progress"
          value={support?.inProgressTickets}
          color="orange"
        />

        <OperationRow
          icon={CheckCircle2}
          label="Resolved tickets"
          value={support?.resolvedTickets}
          color="green"
        />

      </section>

    </div>
  );
}