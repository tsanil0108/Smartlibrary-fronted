import React from "react";
import { Link } from "react-router-dom";

import {
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import BookCover from "../BookCover";

export default function DashboardRecommendations({
  books = [],
}) {
  return (
    <section className="md-panel">

      <div className="md-panel-header">

        <div>

          <span className="md-section-label">
            <Sparkles size={15} />
            PICKED FOR YOU
          </span>

          <h3>Recommended books</h3>

          <p>Discover your next favourite read</p>

        </div>

        <Link
          to="/member/books"
          className="md-text-link"
        >
          View all
          <ArrowRight size={16} />
        </Link>

      </div>

      {books.length ? (

        <div className="md-recommendation-grid">

          {books.slice(0, 4).map((book) => (

            <Link
              to={`/books/${book.bookId}`}
              className="md-recommended-book"
              key={book.bookId}
            >

              <div className="md-book-cover">

                <BookCover
                  book={{
                    ...book,
                    id: book.bookId,
                  }}
                />

              </div>

              <div className="md-book-info">

                <span className="md-book-category">
                  {book.categoryName || "Library book"}
                </span>

                <h4>{book.title}</h4>

                <p>{book.author}</p>

                <small>
                  {book.recommendationReason ||
                    "Recommended for you"}
                </small>

                <span
                  className={`md-book-availability ${
                    book.availableCopies > 0
                      ? "md-green"
                      : "md-orange"
                  }`}
                >
                  {book.availableCopies > 0
                    ? "Available"
                    : "Currently unavailable"}
                </span>

              </div>

            </Link>

          ))}

        </div>

      ) : (

        <div className="md-empty">

          <BookOpen size={40} />

          <h4>Discover something new</h4>

          <p>
            Explore the library to start your reading
            journey.
          </p>

          <Link
            to="/member/books"
            className="md-button"
          >
            Browse books
            <ArrowRight size={16} />
          </Link>

        </div>

      )}

    </section>
  );
}