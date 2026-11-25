
import React from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  ChartNoAxesCombined,
} from "lucide-react";

export default function DashboardReadingChart({
  activity = [],
  readingStats,
}) {
  const data = activity.slice(-6);

  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.borrowedBooks || 0),
    0
  );

  const max = Math.max(
    4,
    Math.ceil(
      Math.max(
        0,
        ...data.map(
          (item) => Number(item.borrowedBooks || 0)
        )
      ) / 4
    ) * 4
  );

  const step = 310 / Math.max(data.length, 1);

  return (
    <section className="md-panel md-chart-panel">

      <div className="md-panel-header">

        <div>
          <h3>Reading activity</h3>
          <p>Books borrowed in the last 6 months</p>
        </div>

        <Link
          to="/member/analytics"
          className="md-icon-link"
          aria-label="View reading analytics"
        >
          <ArrowUpRight size={20} />
        </Link>

      </div>

      <div className="md-chart-summary">

        <div>
          <strong>{total}</strong>
          <span>Books borrowed</span>
        </div>

        <div className="md-chart-rate">

          <ChartNoAxesCombined size={18} />

          <span>
            {Number(
              readingStats?.returnRate || 0
            ).toFixed(1)}% return rate
          </span>

        </div>

      </div>

      {data.length ? (

        <svg
          viewBox="0 0 360 205"
          className="md-reading-chart"
          role="img"
          aria-label="Monthly book borrowing activity"
        >

          {[0, 1, 2, 3, 4].map((index) => {
            const y = 165 - index * 36;

            return (
              <g key={index}>

                <line
                  x1="35"
                  y1={y}
                  x2="350"
                  y2={y}
                  stroke="#ece9f3"
                  strokeDasharray="4 4"
                />

                <text
                  x="25"
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#918da2"
                >
                  {(max / 4) * index}
                </text>

              </g>
            );
          })}

          {data.map((item, index) => {

            const value = Number(
              item.borrowedBooks || 0
            );

            const height = (value / max) * 144;

            const width = Math.min(
              30,
              step * 0.55
            );

            const x =
              38 +
              index * step +
              (step - width) / 2;

            const month = (
              item.monthName ||
              String(item.month || "")
            ).slice(0, 3);

            return (
              <g key={`${item.year}-${item.month}`}>

                <rect
                  x={x}
                  y={165 - height}
                  width={width}
                  height={height}
                  rx="5"
                  fill={
                    index === data.length - 1
                      ? "#ff7900"
                      : "#8058f4"
                  }
                >
                  <title>
                    {month}: {value} books
                  </title>
                </rect>

                <text
                  x={x + width / 2}
                  y={Math.max(12, 157 - height)}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#625d73"
                >
                  {value}
                </text>

                <text
                  x={x + width / 2}
                  y="188"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#77758a"
                >
                  {month}
                </text>

              </g>
            );
          })}

        </svg>

      ) : (

        <div className="md-empty">

          <ChartNoAxesCombined size={36} />

          <p>No reading activity yet.</p>

        </div>

      )}

    </section>
  );
}