import React, { useState } from "react";

import {
  BarChart3,
  BookOpen,
  LoaderCircle,
} from "lucide-react";

import "../../styles/member/MonthlyReadingChart.css";

export default function MonthlyReadingChart({
  data = [],
  months = 6,
  onMonthsChange,
  loading = false,
  error = "",
}) {
  const [hovered, setHovered] = useState(null);

  const values = data.map((item) =>
    Math.max(0, Number(item.borrowedBooks) || 0)
  );

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  const highest = Math.max(0, ...values);

  const step = Math.max(1, Math.ceil(highest / 4));

  const maximum = step * 4;

  const width = 620;
  const height = 255;

  const left = 42;
  const right = 16;
  const top = 25;
  const bottom = 40;

  const chartWidth = width - left - right;

  const chartHeight = height - top - bottom;

  const slotWidth =
    chartWidth / Math.max(data.length, 1);

  const barWidth = Math.min(38, slotWidth * 0.58);

  return (
    <section className="mrc-card">

      <header className="mrc-header">

        <div className="mrc-icon">
          <BarChart3 size={23} />
        </div>

        <div className="mrc-heading">
          <h2>Monthly reading activity</h2>
          <p>Track your monthly borrowing habits.</p>
        </div>

        <select
          aria-label="Reading activity period"
          value={months}
          disabled={loading}
          onChange={(event) =>
            onMonthsChange?.(
              Number(event.target.value)
            )
          }
        >
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>

      </header>

      {loading ? (

        <div className="mrc-empty">
          <LoaderCircle
            size={35}
            className="mrc-spin"
          />
          <p>Loading reading activity...</p>
        </div>

      ) : error ? (

        <div className="mrc-empty">
          <p role="alert">{error}</p>
        </div>

      ) : !data.length ? (

        <div className="mrc-empty">
          <BookOpen size={40} />
          <h3>No reading activity yet</h3>
          <p>Your monthly activity will appear here.</p>
        </div>

      ) : (

        <>

          <div className="mrc-summary">

            <div>
              <span>Books borrowed</span>
              <strong>{total}</strong>
            </div>

            <div className="mrc-legend">
              <span />
              Monthly borrowing
            </div>

          </div>

          <div className="mrc-chart-scroll">

            <svg
              className="mrc-chart"
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`${total} books borrowed during the selected period`}
            >

              {/* GRID LINES */}

              {[0, 1, 2, 3, 4].map((index) => {

                const value = maximum - index * step;

                const y =
                  top + index * (chartHeight / 4);

                return (
                  <g key={index}>

                    <line
                      x1={left}
                      x2={width - right}
                      y1={y}
                      y2={y}
                      stroke="#e9e5f0"
                      strokeDasharray="5 5"
                    />

                    <text
                      x={left - 12}
                      y={y + 4}
                      textAnchor="end"
                      className="mrc-axis"
                    >
                      {value}
                    </text>

                  </g>
                );
              })}

              {/* MONTHLY BARS */}

              {data.map((item, index) => {

                const value = values[index];

                const barHeight =
                  (value / maximum) * chartHeight;

                const center =
                  left +
                  index * slotWidth +
                  slotWidth / 2;

                const x = center - barWidth / 2;

                const y =
                  top + chartHeight - barHeight;

                const label = String(
                  item.monthName || item.month || ""
                ).slice(0, 3);

                const active = hovered === index;

                const latest =
                  index === data.length - 1;

                return (
                  <g
                    key={`${item.year}-${item.month}-${index}`}
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
                    tabIndex={0}
                    aria-label={`${label} ${item.year}: ${value} books`}
                  >

                    <rect
                      x={center - slotWidth / 2}
                      y={top}
                      width={slotWidth}
                      height={chartHeight}
                      fill="transparent"
                    />

                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={Math.min(7, barHeight / 2)}
                      fill={
                        active
                          ? "#5025d7"
                          : latest
                            ? "#ff7900"
                            : "#7952ed"
                      }
                    />

                    <text
                      x={center}
                      y={Math.max(15, y - 8)}
                      textAnchor="middle"
                      className="mrc-bar-value"
                    >
                      {value}
                    </text>

                    <text
                      x={center}
                      y={height - 15}
                      textAnchor="middle"
                      className="mrc-axis"
                    >
                      {label}
                    </text>

                    <title>
                      {item.monthName} {item.year}: {value} books
                    </title>

                  </g>
                );
              })}

            </svg>

          </div>

          <div className="mrc-footer">

            <span>
              Average per month
            </span>

            <strong>
              {(total / data.length).toFixed(1)} books
            </strong>

          </div>

        </>

      )}

    </section>
  );
}