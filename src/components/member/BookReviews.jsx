import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Star,
  MessageSquare,
  ShieldCheck,
  Pencil,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../../context/Auth";

// CORRECTED COMPONENT IMPORTS

import StarRating from "./StarRating";
import ReviewModal from "./ReviewModal";

import {
  reviewApi,
  reviewList,
  formatReviewDate,
} from "../../services/reviewApi";

import "../../styles/member/BookReviews.css";

// ==========================================
// MEMBER INITIALS
// ==========================================

function initials(name) {
  return (
    String(name || "Member")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "M"
  );
}

// ==========================================
// BOOK REVIEWS COMPONENT
// ==========================================

export default function BookReviews({ book }) {

  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [myReview, setMyReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [eligibilityError, setEligibilityError] =
    useState("");

  const [modal, setModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const bookId = book?.id;

  const member = user?.role === "MEMBER";

  // ========================================
  // LOAD REVIEWS AND RATINGS
  // ========================================

  async function loadReviews() {

    if (!bookId) return;

    setLoading(true);
    setError("");
    setEligibilityError("");
    setEligibility(null);
    setMyReview(null);

    try {

      const [reviewData, ratingData] =
        await Promise.all([
          reviewApi.getBookReviews(bookId),
          reviewApi.getRatingSummary(bookId),
        ]);

      setReviews(reviewList(reviewData));

      setSummary(ratingData);

      // CHECK MEMBER REVIEW ELIGIBILITY

      if (member) {

        try {

          const result =
            await reviewApi.getEligibility(bookId);

          setEligibility(result);

          // GET EXISTING MEMBER REVIEW

          if (result?.alreadyReviewed) {

            const data =
              await reviewApi.getMyReviews();

            const mine = reviewList(data).find(
              (item) =>
                String(item.bookId) === String(bookId)
            );

            setMyReview(mine || null);

          }

        } catch (err) {

          setEligibilityError(
            err.message ||
            "Unable to check review eligibility."
          );

        }

      }

    } catch (err) {

      setError(
        err.message ||
        "Unable to load book reviews."
      );

    } finally {

      setLoading(false);

    }

  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {

    setVisibleCount(5);
    setModal(false);

    loadReviews();

  }, [bookId, user?.id, member]);

  if (!bookId) return null;

  // ========================================
  // RATING SUMMARY
  // ========================================

  const average =
    Number(summary?.averageRating) || 0;

  const total =
    Number(summary?.totalReviews) || 0;

  const distribution = Array.isArray(
    summary?.distribution
  )
    ? summary.distribution
    : [];

  // ========================================
  // MAIN UI
  // ========================================

  return (

    <section className="br-section">

      {/* SECTION HEADER */}

      <div className="br-heading">

        <div className="br-heading-icon">

          <Star size={25} />

        </div>

        <div>

          <h2>Reviews & ratings</h2>

          <p>
            Discover what other readers think.
          </p>

        </div>

      </div>

      {/* LOADING STATE */}

      {loading ? (

        <div className="br-empty">

          <LoaderCircle
            size={32}
            className="br-spin"
          />

          <p>Loading book reviews...</p>

        </div>

      ) : error ? (

        /* ERROR STATE */

        <div className="br-empty">

          <AlertCircle size={32} />

          <p>{error}</p>

          <button
            type="button"
            className="br-outline"
            onClick={loadReviews}
          >
            Try again
          </button>

        </div>

      ) : (

        <>

          {/* =================================
              RATING SUMMARY
          ================================== */}

          <div className="br-summary">

            <div className="br-average">

              <strong>
                {total ? average.toFixed(1) : "—"}
              </strong>

              <StarRating
                value={average}
                size={23}
              />

              <span>
                {total} ratings
              </span>

            </div>

            {/* RATING DISTRIBUTION */}

            <div className="br-distribution">

              {[5, 4, 3, 2, 1].map((rating) => {

                const item = distribution.find(
                  (entry) =>
                    Number(entry.rating) === rating
                );

                const count =
                  Number(item?.count) || 0;

                const percentage = total
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        (count / total) * 100
                      )
                    )
                  : 0;

                return (

                  <div
                    key={rating}
                    className="br-bar-row"
                  >

                    <span>{rating}</span>

                    <Star
                      size={14}
                      fill="#f5a623"
                      color="#f5a623"
                    />

                    <div className="br-bar-track">

                      <div
                        className="br-bar-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    <span>{count}</span>

                  </div>

                );

              })}

            </div>

          </div>

          {/* =================================
              WRITE REVIEW SECTION
          ================================== */}

          <div className="br-write">

            <div className="br-write-icon">

              <MessageSquare size={23} />

            </div>

            <div className="br-write-text">

              <h3>
                Share your reading experience
              </h3>

              <p>

                {!user
                  ? "Sign in to review books you have borrowed."

                  : !member
                    ? "Reviews are available to library members."

                    : eligibilityError
                      ? eligibilityError

                      : eligibility?.alreadyReviewed
                        ? "You have already reviewed this book."

                        : eligibility?.canReview
                          ? "Tell other readers what you think."

                          : eligibility?.message ||
                            "Borrow this book to become eligible to review it."}

              </p>

            </div>

            {/* LOGIN BUTTON */}

            {!user ? (

              <Link
                to="/login"
                className="br-primary"
              >
                Sign in
              </Link>

            ) : member &&
              eligibility?.alreadyReviewed &&
              myReview ? (

              /* EDIT REVIEW BUTTON */

              <button
                type="button"
                className="br-primary"
                onClick={() => setModal(true)}
              >

                <Pencil size={16} />

                Edit review

              </button>

            ) : member &&
              eligibility?.alreadyReviewed ? (

              /* MY REVIEWS LINK */

              <Link
                to="/member/reviews"
                className="br-outline"
              >
                My reviews
              </Link>

            ) : member &&
              eligibility?.canReview ? (

              /* WRITE REVIEW BUTTON */

              <button
                type="button"
                className="br-primary"
                onClick={() => setModal(true)}
              >

                <Pencil size={16} />

                Write review

              </button>

            ) : null}

          </div>

          {/* =================================
              PUBLIC REVIEWS
          ================================== */}

          {!reviews.length ? (

            <div className="br-empty">

              <MessageSquare size={35} />

              <h3>No reviews yet</h3>

              <p>
                Reading experiences will appear here
                when members review this book.
              </p>

            </div>

          ) : (

            <div className="br-list">

              {reviews
                .slice(0, visibleCount)
                .map((review) => (

                  <article
                    key={review.id}
                    className="br-review"
                  >

                    {/* MEMBER AVATAR */}

                    <div className="br-avatar">

                      {initials(review.memberName)}

                    </div>

                    {/* REVIEW CONTENT */}

                    <div className="br-review-content">

                      <div className="br-review-top">

                        <strong>

                          {review.memberName ||
                            "Library member"}

                        </strong>

                        <span>

                          {formatReviewDate(
                            review.createdAt
                          )}

                        </span>

                      </div>

                      {/* REVIEW STARS */}

                      <div className="br-rating-row">

                        <StarRating
                          value={review.rating}
                          size={17}
                        />

                        {review.verifiedBorrower && (

                          <span className="br-verified">

                            <ShieldCheck size={14} />

                            Verified borrower

                          </span>

                        )}

                      </div>

                      {/* REVIEW COMMENT */}

                      <p>

                        {review.comment ||
                          "Rating submitted without a comment."}

                      </p>

                    </div>

                  </article>

                ))}

              {/* LOAD MORE REVIEWS */}

              {visibleCount < reviews.length && (

                <button
                  type="button"
                  className="br-outline br-load-more"
                  onClick={() =>
                    setVisibleCount(
                      (previous) => previous + 5
                    )
                  }
                >

                  Show more reviews

                </button>

              )}

            </div>

          )}

        </>

      )}

      {/* =====================================
          CREATE / EDIT REVIEW MODAL
      ====================================== */}

      {modal && (

        <ReviewModal
          book={book}
          review={myReview}
          onClose={() => setModal(false)}
          onSaved={loadReviews}
        />

      )}

    </section>

  );

}