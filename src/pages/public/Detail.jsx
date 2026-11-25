import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useData } from "../../components/useData";
import { State } from "../../components/State";
import { Cover } from "../../components/Cover";

import BookExtras from "../../components/member/BookExtras";
import BookReviews from "../../components/member/BookReviews";

import { useAuth } from "../../context/Auth";
import { api } from "../../services/api";

export function Detail() {
  const { id } = useParams();

  const r = useData("/books/" + id);

  const { user } = useAuth();

  const nav = useNavigate();

  const [msg, M] = useState("");
  const [busy, B] = useState(false);

  const [reviewRefresh, setReviewRefresh] = useState(0);

  const b = r.data;

  async function handleBorrow() {
    if (!user) {
      nav("/login");
      return;
    }

    if (busy || !b?.available) return;

    B(true);
    M("");

    try {
      const loan = await api("/loans", "POST", {
        bookId: b.id,
      });

      M(
        "Borrowed successfully. Due " + loan.dueDate
      );

      r.reload();

      // Refresh review eligibility after borrowing
      setReviewRefresh((previous) => previous + 1);

    } catch (e) {
      M(e.message || "Unable to borrow book.");
    } finally {
      B(false);
    }
  }

  return (
    <State {...r}>
      {b && (
        <>
          {/* BOOK DETAILS */}

          <div className="detail panel">

            <Cover book={b} />

            <div>

              <small>{b.categoryName}</small>

              <h1>{b.title}</h1>

              <p>{b.author}</p>

              <p>{b.description}</p>

              <p>
                ISBN: {b.isbn || "—"}
              </p>

              <p>
                {b.availableCopies} of {b.totalCopies} copies available
              </p>

              {/* BORROW BOOK */}

              {user?.role !== "ADMIN" && (
                <button
                  type="button"
                  className="primary"
                  disabled={!b.available || busy}
                  onClick={handleBorrow}
                >
                  {busy
                    ? "Borrowing..."
                    : !b.available
                      ? "Currently unavailable"
                      : "Borrow book"}
                </button>
              )}

              <p role="status">{msg}</p>

            </div>

          </div>

          {/* WISHLIST & RESERVATION */}

          <BookExtras book={b} />

          {/* REVIEWS & RATINGS */}

          <BookReviews
            key={`${b.id}-${reviewRefresh}`}
            book={b}
          />

        </>
      )}
    </State>
  );
}