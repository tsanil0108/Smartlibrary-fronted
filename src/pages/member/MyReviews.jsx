import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Star,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  EyeOff,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  X,
  LibraryBig,
} from "lucide-react";

import StarRating from "../../components/member/StarRating";
import ReviewModal from "../../components/member/ReviewModal";

import {
  reviewApi,
  reviewList,
  formatReviewDate,
} from "../../services/reviewApi";

import "../../styles/member/MyReviews.css";

function ReviewStatus({ status }) {
  const published = status === "PUBLISHED";

  return (
    <span
      className={`mr-status ${
        published ? "mr-published" : "mr-hidden"
      }`}
    >
      {published ? (
        <CheckCircle2 size={13} />
      ) : (
        <EyeOff size={13} />
      )}

      {status === "PUBLISHED"
        ? "Published"
        : status === "HIDDEN"
          ? "Hidden"
          : status || "Unknown"}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="mr-stat">

      <div className={`mr-stat-icon ${color}`}>
        <Icon size={23} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function loadReviews() {
    setLoading(true);
    setError("");

    try {
      const data = await reviewApi.getMyReviews();
      setReviews(reviewList(data));

    } catch (err) {
      setError(
        err.message || "Unable to load your reviews."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;

    const average = total
      ? reviews.reduce(
          (sum, item) =>
            sum + (Number(item.rating) || 0),
          0
        ) / total
      : 0;

    return {
      total,
      average: average.toFixed(1),
      published: reviews.filter(
        (item) => item.status === "PUBLISHED"
      ).length,
      hidden: reviews.filter(
        (item) => item.status === "HIDDEN"
      ).length,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews
      .filter((item) => {
        const matchesSearch = [
          item.bookTitle,
          item.comment,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesStatus =
          filter === "ALL" ||
          item.status === filter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "HIGHEST") {
          return Number(b.rating) - Number(a.rating);
        }

        if (sort === "LOWEST") {
          return Number(a.rating) - Number(b.rating);
        }

        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [reviews, search, filter, sort]);

  async function handleDelete(review) {
    const confirmed = window.confirm(
      `Delete your review for "${review.bookTitle}"?`
    );

    if (!confirmed) return;

    setDeleting(review.id);
    setError("");
    setNotice("");

    try {
      await reviewApi.deleteReview(review.id);

      setReviews((previous) =>
        previous.filter(
          (item) => item.id !== review.id
        )
      );

      setNotice("Review deleted successfully.");

    } catch (err) {
      setError(
        err.message || "Unable to delete review."
      );
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mr-page">

      {/* PAGE HEADER */}

      <header className="mr-header">

        <div>
          <span className="mr-eyebrow">
            <Star size={16} />
            READING EXPERIENCE
          </span>

          <h1>My Reviews</h1>

          <p>
            Manage your ratings and share your
            reading experiences.
          </p>
        </div>

        <Link
          to="/member/books"
          className="mr-primary"
        >
          <LibraryBig size={18} />
          Browse books
        </Link>

      </header>

      {/* HERO */}

      <section className="mr-hero">

        <div className="mr-hero-content">

          <span>YOUR VOICE MATTERS</span>

          <h2>Every book has a story.</h2>

          <p>
            Share yours. Your reviews help other
            readers discover great books and make
            better reading choices.
          </p>

          <Link
            to="/member/loans"
            className="mr-hero-link"
          >
            Review a borrowed book
            <ArrowRight size={17} />
          </Link>

        </div>

        <div className="mr-hero-art" aria-hidden="true">

          <div className="mr-art-circle" />

          <div className="mr-art-book">
            <BookOpen size={86} />
          </div>

          <div className="mr-art-star">
            <Star size={38} fill="currentColor" />
          </div>

          <div className="mr-art-message">
            <MessageSquare size={30} />
          </div>

        </div>

      </section>

      {/* SUMMARY */}

      <section className="mr-stats">

        <StatCard
          icon={MessageSquare}
          label="Total reviews"
          value={loading ? "—" : stats.total}
          color="mr-purple"
        />

        <StatCard
          icon={Star}
          label="Average rating"
          value={
            loading || !stats.total
              ? "—"
              : `${stats.average}/5`
          }
          color="mr-orange"
        />

        <StatCard
          icon={CheckCircle2}
          label="Published reviews"
          value={loading ? "—" : stats.published}
          color="mr-green"
        />

        <StatCard
          icon={EyeOff}
          label="Hidden reviews"
          value={loading ? "—" : stats.hidden}
          color="mr-blue"
        />

      </section>

      {notice && (
        <div className="mr-notice" role="status">

          <CheckCircle2 size={20} />

          {notice}

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>

        </div>
      )}

      {error && (
        <div className="mr-error" role="alert">

          <AlertCircle size={20} />

          {error}

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* REVIEW PANEL */}

      <section className="mr-panel">

        <div className="mr-panel-heading">

          <div className="mr-stat-icon mr-purple">
            <MessageSquare size={23} />
          </div>

          <div>
            <h2>My book reviews</h2>
            <p>
              View and manage your submitted reviews.
            </p>
          </div>

          <button
            type="button"
            className="mr-outline"
            disabled={loading || deleting !== null}
            onClick={loadReviews}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {/* FILTERS */}

        <div className="mr-toolbar">

          <div className="mr-search">

            <Search size={19} />

            <input
              value={search}
              aria-label="Search reviews"
              placeholder="Search your reviews..."
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

          <select
            value={filter}
            aria-label="Review status"
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="ALL">All reviews</option>
            <option value="PUBLISHED">Published</option>
            <option value="HIDDEN">Hidden</option>
          </select>

          <select
            value={sort}
            aria-label="Sort reviews"
            onChange={(event) =>
              setSort(event.target.value)
            }
          >
            <option value="NEWEST">Newest first</option>
            <option value="HIGHEST">Highest rating</option>
            <option value="LOWEST">Lowest rating</option>
          </select>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="mr-empty">

            <LoaderCircle
              size={43}
              className="mr-spin"
            />

            <h3>Loading reviews...</h3>

            <p>Fetching your reading experiences.</p>

          </div>

        ) : error && !reviews.length ? (

          <div className="mr-empty">

            <AlertCircle size={43} />

            <h3>Unable to load reviews</h3>

            <button
              type="button"
              className="mr-primary"
              onClick={loadReviews}
            >
              Try again
            </button>

          </div>

        ) : !filtered.length ? (

          <div className="mr-empty">

            <div className="mr-empty-icon">
              <MessageSquare size={42} />
            </div>

            <h3>
              {reviews.length
                ? "No matching reviews"
                : "Your story starts here"}
            </h3>

            <p>
              {reviews.length
                ? "Try changing your search or filters."
                : "Review a book you have borrowed and help other readers discover something new."}
            </p>

            {reviews.length ? (
              <button
                type="button"
                className="mr-outline"
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/member/loans"
                className="mr-primary"
              >
                <BookOpen size={18} />
                View my borrowed books
              </Link>
            )}

          </div>

        ) : (

          <div className="mr-review-list">

            <span className="mr-result-count">
              Showing {filtered.length} reviews
            </span>

            {filtered.map((review) => (

              <article
                key={review.id}
                className="mr-review-card"
              >

                <Link
                  to={`/books/${review.bookId}`}
                  className="mr-book-art"
                  aria-label={`View ${review.bookTitle}`}
                >

                  <BookOpen size={30} />

                  <span>
                    {review.bookTitle || "Library book"}
                  </span>

                </Link>

                <div className="mr-review-content">

                  <div className="mr-review-top">

                    <Link
                      to={`/books/${review.bookId}`}
                      className="mr-book-title"
                    >
                      {review.bookTitle}
                    </Link>

                    <ReviewStatus
                      status={review.status}
                    />

                  </div>

                  <div className="mr-rating-row">

                    <StarRating
                      value={review.rating}
                      showValue
                      size={18}
                    />

                    {review.verifiedBorrower && (
                      <span className="mr-verified">
                        <ShieldCheck size={15} />
                        Verified borrower
                      </span>
                    )}

                  </div>

                  <p className="mr-comment">
                    {review.comment ||
                      "Rating submitted without a comment."}
                  </p>

                  <div className="mr-review-footer">

                    <div className="mr-date">

                      <span>
                        Reviewed{" "}
                        {formatReviewDate(review.createdAt)}
                      </span>

                      {review.updatedAt &&
                        review.updatedAt !== review.createdAt && (
                          <span>
                            Edited{" "}
                            {formatReviewDate(review.updatedAt)}
                          </span>
                        )}

                    </div>

                    <div className="mr-actions">

                      <button
                        type="button"
                        className="mr-edit"
                        disabled={deleting !== null}
                        onClick={() => setEditing(review)}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="mr-delete"
                        disabled={deleting !== null}
                        onClick={() => handleDelete(review)}
                      >
                        {deleting === review.id ? (
                          <LoaderCircle
                            size={16}
                            className="mr-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}

                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* RATING DISTRIBUTION */}

      {!loading && reviews.length > 0 && (

        <section className="mr-distribution">

          <div className="mr-panel-heading">

            <div className="mr-stat-icon mr-orange">
              <Star size={23} />
            </div>

            <div>
              <h2>Your rating breakdown</h2>
              <p>Overview of the ratings you have given.</p>
            </div>

          </div>

          <div className="mr-distribution-grid">

            <div className="mr-average">

              <strong>{stats.average}</strong>

              <StarRating
                value={Number(stats.average)}
                size={22}
              />

              <span>
                Based on {stats.total} reviews
              </span>

            </div>

            <div className="mr-bars">

              {[5, 4, 3, 2, 1].map((rating) => {

                const count = reviews.filter(
                  (item) => Number(item.rating) === rating
                ).length;

                const percent =
                  (count / reviews.length) * 100;

                return (
                  <div
                    key={rating}
                    className="mr-bar-row"
                  >

                    <span>{rating}</span>

                    <Star
                      size={14}
                      fill="#f5a623"
                      color="#f5a623"
                    />

                    <div className="mr-bar-track">
                      <div
                        className="mr-bar-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <span>{count}</span>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

      )}

      {/* EDIT REVIEW MODAL */}

      {editing && (
        <ReviewModal
          key={editing.id}
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setNotice("Review updated successfully.");
            loadReviews();
          }}
        />
      )}

    </div>
  );
}