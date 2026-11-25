import React from "react";
import { Link } from "react-router-dom";

import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  History,
} from "lucide-react";

import {
  formatDashboardDate,
} from "../../../services/dashboardApi";

function activityConfig(item) {

  if (item.status === "RETURNED") {
    return {
      icon: CheckCircle2,
      color: "green",
      label: "Book returned",
      date: item.returnedAt,
    };
  }

  if (item.status === "LOST") {
    return {
      icon: AlertCircle,
      color: "red",
      label: "Book marked lost",
      date: item.returnedAt || item.issueDate,
    };
  }

  if (item.overdue) {
    return {
      icon: Clock,
      color: "orange",
      label: "Book overdue",
      date: item.dueDate,
    };
  }

  return {
    icon: BookOpen,
    color: "purple",
    label: "Book borrowed",
    date: item.issueDate,
  };
}

export default function DashboardRecentActivity({
  activity = [],
}) {
  return (
    <section className="md-panel">

      <div className="md-panel-header">

        <div>
          <h3>Recent activity</h3>
          <p>Your latest borrowing records</p>
        </div>

        <History
          size={22}
          className="md-purple-text"
        />

      </div>

      {activity.length ? (

        <div className="md-activity-list">

          {activity.slice(0, 5).map((item) => {

            const config = activityConfig(item);
            const Icon = config.icon;

            return (
              <article
                className="md-activity-item"
                key={item.loanId}
              >

                <div
                  className={`md-icon md-${config.color}`}
                >
                  <Icon size={20} />
                </div>

                <div className="md-activity-info">

                  <strong>{config.label}</strong>

                  <p>{item.bookTitle}</p>

                </div>

                <time>
                  {formatDashboardDate(config.date)}
                </time>

              </article>
            );
          })}

        </div>

      ) : (

        <div className="md-empty">

          <History size={38} />

          <p>No recent borrowing activity.</p>

        </div>

      )}

      <Link
        to="/member/loans"
        className="md-text-link"
      >
        View borrowing history
        <ArrowRight size={16} />
      </Link>

    </section>
  );
}