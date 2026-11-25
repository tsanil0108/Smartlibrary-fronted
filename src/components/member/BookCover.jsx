import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import "../../styles/member/BookCover.css";

export default function BookCover({ book }) {
  const isbn = String(book.isbn || "")
    .replace(/[^0-9Xx]/g, "");

  const imageUrl =
    book.coverUrl ||
    book.imageUrl ||
    (isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`
      : "");

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const colors = [
    "purple",
    "blue",
    "green",
    "orange",
    "navy",
  ];

  const index =
    Math.abs(Number(book.bookId || book.id) || 0) %
    colors.length;

  return (
    <div className="bc-cover-container">
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={`${book.title} book cover`}
          className="bc-cover-image"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`bc-fallback bc-cover-${colors[index]}`}
        >
          <BookOpen size={32} />

          <div className="bc-cover-line" />

          <h3>{book.title}</h3>

          <span>{book.author}</span>

          <small>SMART LIBRARY</small>
        </div>
      )}
    </div>
  );
}