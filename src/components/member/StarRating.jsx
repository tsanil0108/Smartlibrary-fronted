import React, { useState } from "react";
import { Star } from "lucide-react";

import "../../styles/member/StarRating.css";

export default function StarRating({
  value = 0,
  onChange,
  size = 20,
  disabled = false,
  showValue = false,
}) {
  const [hover, setHover] = useState(0);

  const interactive =
    typeof onChange === "function" && !disabled;

  const rating = Math.max(
    0,
    Math.min(5, Number(value) || 0)
  );

  const displayed = hover || rating;

  return (
    <div
      className="sr-rating"
      onMouseLeave={() => setHover(0)}
      role={interactive ? "group" : "img"}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((number) => {
        const percentage = Math.max(
          0,
          Math.min(100, (displayed - number + 1) * 100)
        );

        const star = (
          <span
            className="sr-star"
            style={{ width: size, height: size }}
          >
            <Star size={size} className="sr-empty" />

            <span
              className="sr-filled"
              style={{ width: `${percentage}%` }}
            >
              <Star
                size={size}
                fill="currentColor"
              />
            </span>
          </span>
        );

        return interactive ? (
          <button
            key={number}
            type="button"
            className="sr-button"
            aria-label={`Rate ${number} out of 5`}
            aria-pressed={rating === number}
            onMouseEnter={() => setHover(number)}
            onClick={() => onChange(number)}
          >
            {star}
          </button>
        ) : (
          <span key={number}>{star}</span>
        );
      })}

      {showValue && (
        <strong className="sr-value">
          {rating.toFixed(1)}
        </strong>
      )}
    </div>
  );
}