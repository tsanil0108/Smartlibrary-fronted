import React from "react";
import { Link } from "react-router-dom";

import {
  CalendarClock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import {
  formatDashboardDate,
} from "../../../services/dashboardApi";

export default function DashboardUpcomingReturns({
  returns = [],
}) {

  const books = [...returns]
    .sort(
      (a, b) =>
        Number(a.daysRemaining ?? 0) -
        Number(b.daysRemaining ?? 0)
    )
    .slice(0, 4);

  return (
    <section className="md-panel">

      <div className="md-panel-header">

        <div>
          <h3>Upcoming returns</h3>
          <p>Keep track of your book due dates</p>
        </div>

        <CalendarClock
          size={23}
          className="md-purple-text"
        />

      </div>

      {books.length ? (

        <div className="md-return-list">

          {books.map((book) => {

            const days = Number(
              book.daysRemaining ?? 0
            );

            const overdue =
              book.overdue || days < 0;

            return (
              <article
                className="md-return-item"
                key={book.loanId}
              >

                <div className="md-icon md-purple">
                  <BookOpen size={22} />
                </div>

                <div className="md-return-info">

                  <h4>{book.bookTitle}</h4>

                  <p>{book.author}</p>

                  <small>
                    Due{" "}
                    {formatDashboardDate(book.dueDate)}
                  </small>

                </div>

                <span
                  className={`md-return-badge ${
                    overdue
                      ? "md-red"
                      : days <= 3
                        ? "md-orange"
                        : "md-green"
                  }`}
                >
                  {overdue
                    ? days < 0
                      ? `${Math.abs(days)}d overdue`
                      : "Overdue"
                    : days === 0
                      ? "Due today"
                      : `${days} days left`}
                </span>

              </article>
            );
          })}

        </div>

      ) : (

        <div className="md-empty">

          <CheckCircle2 size={40} />

          <h4>You're all caught up!</h4>

          <p>No upcoming book returns.</p>

        </div>

      )}

      <Link
        to="/member/loans"
        className="md-text-link"
      >
        View all my loans
        <ArrowRight size={16} />
      </Link>

    </section>
  );
}