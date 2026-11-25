import React, { useState } from "react";

import {
  PieChart,
  BookOpen,
} from "lucide-react";

import "../../styles/member/CategoryDonutChart.css";

const COLORS = [
  "#6339ef",
  "#ff7900",
  "#26a69a",
  "#a78bfa",
  "#3b82f6",
  "#ec4899",
  "#eab308",
  "#64748b",
];

export default function CategoryDonutChart({
  data = [],
}) {
  const [hovered, setHovered] = useState(null);

  const categories = data
    .map((item) => ({
      ...item,
      count: Math.max(
        0,
        Number(item.borrowedBooks) || 0
      ),
    }))
    .filter((item) => item.count > 0);

  const total = categories.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const radius = 68;

  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  const segments = categories.map((item, index) => {

    const percentage = total
      ? (item.count / total) * 100
      : 0;

    const length =
      (percentage / 100) * circumference;

    const segment = {
      ...item,
      percentage,
      length,
      offset: accumulated,
      color: COLORS[index % COLORS.length],
    };

    accumulated += length;

    return segment;
  });

  const selected =
    hovered !== null ? segments[hovered] : null;

  return (
    <section className="cdc-card">

      <header className="cdc-header">

        <div className="cdc-icon">
          <PieChart size={23} />
        </div>

        <div>
          <h2>Favourite categories</h2>
          <p>Discover what you enjoy reading.</p>
        </div>

      </header>

      {!total ? (

        <div className="cdc-empty">

          <BookOpen size={40} />

          <h3>No categories yet</h3>

          <p>
            Borrow books to discover your favourite
            reading categories.
          </p>

        </div>

      ) : (

        <>

          <div className="cdc-chart-wrapper">

            <svg
              viewBox="0 0 200 200"
              className="cdc-chart"
              role="img"
              aria-label="Reading category distribution"
            >

              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#eeeaf4"
                strokeWidth="24"
              />

              {segments.map((segment, index) => (

                <circle
                  key={`${segment.categoryId}-${index}`}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={
                    hovered === index ? 30 : 24
                  }
                  strokeDasharray={
                    `${segment.length} ${
                      Math.max(
                        0,
                        circumference - segment.length
                      )
                    }`
                  }
                  strokeDashoffset={-segment.offset}
                  transform="rotate(-90 100 100)"
                  opacity={
                    hovered === null ||
                    hovered === index
                      ? 1
                      : 0.3
                  }
                  onMouseEnter={() =>
                    setHovered(index)
                  }
                  onMouseLeave={() =>
                    setHovered(null)
                  }
                >

                  <title>
                    {segment.categoryName}:{" "}
                    {segment.count} books
                  </title>

                </circle>

              ))}

              <text
                x="100"
                y="96"
                textAnchor="middle"
                className="cdc-total"
              >
                {selected ? selected.count : total}
              </text>

              <text
                x="100"
                y="115"
                textAnchor="middle"
                className="cdc-total-label"
              >
                {selected
                  ? `${selected.percentage.toFixed(1)}%`
                  : "Books borrowed"}
              </text>

            </svg>

          </div>

          <div className="cdc-legend">

            {segments.map((segment, index) => (

              <button
                key={`${segment.categoryId}-${index}`}
                type="button"
                className={`cdc-legend-row ${
                  hovered === index
                    ? "cdc-selected"
                    : ""
                }`}
                onMouseEnter={() =>
                  setHovered(index)
                }
                onMouseLeave={() =>
                  setHovered(null)
                }
                onFocus={() =>
                  setHovered(index)
                }
                onBlur={() =>
                  setHovered(null)
                }
                onClick={() =>
                  setHovered((previous) =>
                    previous === index
                      ? null
                      : index
                  )
                }
              >

                <span
                  className="cdc-dot"
                  style={{
                    background: segment.color,
                  }}
                />

                <span className="cdc-name">
                  {segment.categoryName || "Other"}
                </span>

                <span className="cdc-count">
                  {segment.count}
                </span>

                <strong>
                  {segment.percentage.toFixed(1)}%
                </strong>

              </button>

            ))}

          </div>

        </>

      )}

    </section>
  );
}