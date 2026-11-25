import React from "react";
import { Link } from "react-router-dom";

import {
  BookOpen,
  ArrowRight,
  History,
} from "lucide-react";

import {
  formatAdminDate,
} from "../../../services/adminDashboardApi";

function getStatus(loan) {
  if (loan.status === "RETURNED") {
    return {
      label: "Returned",
      color: "green",
    };
  }

  if (loan.status === "LOST") {
    return {
      label: "Lost",
      color: "red",
    };
  }

  if (loan.status === "ACTIVE") {
    return loan.overdue
      ? { label: "Overdue", color: "red" }
      : { label: "Active", color: "purple" };
  }

  return {
    label: loan.status || "Unknown",
    color: "orange",
  };
}

export default function AdminRecentLoans({
  loans = [],
}) {
  return (
    <section className="ad-panel">

      <div className="ad-panel-header">

        <div>
          <h3>Recent borrowing activity</h3>
          <p>Latest library circulation records</p>
        </div>

        <Link
          to="/admin/loans"
          className="ad-text-link"
        >
          View all
          <ArrowRight size={16} />
        </Link>

      </div>

      {loans.length > 0 ? (

        <div className="ad-table-wrapper">

          <table className="ad-table">

            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Issued date</th>
                <th>Due date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {loans.map((loan) => {

                const status = getStatus(loan);

                return (
                  <tr key={loan.id ?? loan.loanId}>

                    <td>

                      <div className="ad-table-book">

                        <div className="ad-icon ad-purple">
                          <BookOpen size={20} />
                        </div>

                        <div>
                          <strong>
                            {loan.bookTitle ||
                              loan.book?.title ||
                              "Library book"}
                          </strong>

                          <small>
                            Loan #{loan.id ?? loan.loanId}
                          </small>
                        </div>

                      </div>

                    </td>

                    <td>
                      {loan.memberName ||
                        loan.userName ||
                        loan.user?.name ||
                        (loan.userId
                          ? `Member #${loan.userId}`
                          : "—")}
                    </td>

                    <td>
                      {formatAdminDate(
                        loan.issueDate ||
                          loan.borrowedAt ||
                          loan.issuedAt
                      )}
                    </td>

                    <td>
                      {formatAdminDate(loan.dueDate)}
                    </td>

                    <td>

                      <span
                        className={
                          `ad-status ad-${status.color}`
                        }
                      >
                        {status.label}
                      </span>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      ) : (

        <div className="ad-empty">

          <History size={42} />

          <h4>No borrowing records available</h4>

          <p>
            Recent library activity will appear here.
          </p>

        </div>

      )}

    </section>
  );
}