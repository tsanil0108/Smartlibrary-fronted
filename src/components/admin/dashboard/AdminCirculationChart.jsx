import React from "react";
import { Link } from "react-router-dom";

import {
  ChartPie,
  ArrowUpRight,
} from "lucide-react";

export default function AdminCirculationChart({
  loans = [],
}) {

  const groups = [
    {
      label: "Active",
      value: loans.filter(
        (item) => item.status === "ACTIVE"
      ).length,
      color: "#6339ef",
    },
    {
      label: "Returned",
      value: loans.filter(
        (item) => item.status === "RETURNED"
      ).length,
      color: "#16a34a",
    },
    {
      label: "Lost",
      value: loans.filter(
        (item) => item.status === "LOST"
      ).length,
      color: "#ff7900",
    },
    {
      label: "Other",
      value: loans.filter(
        (item) =>
          !["ACTIVE", "RETURNED", "LOST"].includes(
            item.status
          )
      ).length,
      color: "#94a3b8",
    },
  ];

  const total = loans.length;

  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <section className="ad-panel">

      <div className="ad-panel-header">

        <div>
          <h3>Circulation overview</h3>
          <p>Status of latest borrowing records</p>
        </div>

        <Link
          to="/admin/loans"
          className="ad-icon-link"
          aria-label="View circulation"
        >
          <ArrowUpRight size={20} />
        </Link>

      </div>

      {total > 0 ? (

        <div className="ad-donut-layout">

          <svg
            viewBox="0 0 200 200"
            className="ad-donut"
            role="img"
            aria-label="Recent loan status distribution"
          >

            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#f0edf7"
              strokeWidth="23"
            />

            {groups.map((group) => {

              const length =
                (group.value / total) * circumference;

              const currentOffset = offset;

              offset += length;

              return (
                <circle
                  key={group.label}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={group.color}
                  strokeWidth="23"
                  strokeDasharray={
                    `${length} ${circumference - length}`
                  }
                  strokeDashoffset={-currentOffset}
                  transform="rotate(-90 100 100)"
                />
              );
            })}

            <text
              x="100"
              y="98"
              textAnchor="middle"
              fontSize="32"
              fontWeight="800"
              fill="#17143d"
            >
              {total}
            </text>

            <text
              x="100"
              y="119"
              textAnchor="middle"
              fontSize="11"
              fill="#77758a"
            >
              Recent loans
            </text>

          </svg>

          <div className="ad-chart-legend">

            {groups.map((group) => (
              <div
                key={group.label}
                className="ad-legend-row"
              >

                <span
                  className="ad-legend-dot"
                  style={{
                    background: group.color,
                  }}
                />

                <span>{group.label}</span>

                <strong>{group.value}</strong>

              </div>
            ))}

          </div>

        </div>

      ) : (

        <div className="ad-empty">
          <ChartPie size={42} />
          <p>No recent circulation data available.</p>
        </div>

      )}

      <Link
        to="/admin/reports"
        className="ad-text-link"
      >
        View detailed reports
        <ArrowUpRight size={16} />
      </Link>

    </section>
  );
}