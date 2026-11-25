import React from "react";

import {
  Heart,
  BookOpen,
  CalendarClock,
  ArrowUpRight,
  LoaderCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";

import BookCover from "./BookCover";

import "../../styles/member/BookCard.css";

export default function BookCard({
  book,
  wishlisted = false,
  wishlistBusy = false,
  actionBusy = false,
  onToggleWishlist,
  onOpenBook,
  onReserve,
}) {
  const available =
    Number(book.availableCopies ?? 0) > 0 ||
    (
      book.availableCopies == null &&
      book.available === true
    );

  const category =
    book.categoryName ||
    book.category?.name ||
    (
      typeof book.category === "string"
        ? book.category
        : ""
    ) ||
    "Library collection";

  return (
    <article className="bcard">

      <div className="bcard-visual">

        <span className="bcard-category">
          {category}
        </span>

        <button
          type="button"
          className={`bcard-heart ${
            wishlisted ? "bcard-heart-active" : ""
          }`}
          title={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-label={
            wishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={wishlisted}
          disabled={wishlistBusy}
          onClick={() => onToggleWishlist(book)}
        >
          {wishlistBusy ? (
            <LoaderCircle
              size={19}
              className="bcard-spin"
            />
          ) : (
            <Heart
              size={20}
              fill={wishlisted ? "currentColor" : "none"}
            />
          )}
        </button>

        <BookCover book={book} />

      </div>

      <div className="bcard-content">

        <div
          className={`bcard-availability ${
            available
              ? "bcard-available"
              : "bcard-unavailable"
          }`}
        >
          {available ? (
            <CheckCircle2 size={14} />
          ) : (
            <Circle size={12} />
          )}

          {available ? "Available" : "Unavailable"}
        </div>

        <h3 title={book.title}>
          {book.title}
        </h3>

        <p className="bcard-author">
          {book.author || "Unknown author"}
        </p>

        <div className="bcard-meta">
          <BookOpen size={15} />

          {book.availableCopies != null
            ? `${book.availableCopies} copies available`
            : available
            ? "Available to borrow"
            : "Currently unavailable"}
        </div>

        <div className="bcard-actions">

          <button
            type="button"
            className={`bcard-main-btn ${
              available
                ? "bcard-borrow-btn"
                : "bcard-reserve-btn"
            }`}
            disabled={actionBusy}
            onClick={() =>
              available
                ? onOpenBook(book)
                : onReserve(book)
            }
          >
            {actionBusy ? (
              <LoaderCircle
                size={17}
                className="bcard-spin"
              />
            ) : available ? (
              <BookOpen size={17} />
            ) : (
              <CalendarClock size={17} />
            )}

            {available ? "Borrow now" : "Reserve book"}
          </button>

          <button
            type="button"
            className="bcard-details-btn"
            title="View book details"
            aria-label="View book details"
            onClick={() => onOpenBook(book)}
          >
            <ArrowUpRight size={20} />
          </button>

        </div>

      </div>
    </article>
  );
}