import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  X,
  MessageSquare,
  Send,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

// Corrected import
import StarRating from "./StarRating";

import { reviewApi } from "../../services/reviewApi";

import "../../styles/member/ReviewModal.css";

const LABELS = [
  "Select your rating",
  "Poor",
  "Fair",
  "Good",
  "Very good",
  "Excellent",
];

export default function ReviewModal({
  book,
  review = null,
  onClose,
  onSaved,
}) {
  const [rating, setRating] = useState(
    review?.rating || 0
  );

  const [comment, setComment] = useState(
    review?.comment || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dialogRef = useRef(null);

  const editing = Boolean(review?.id);

  const bookId = book?.id || review?.bookId;

  const title =
    book?.title ||
    review?.bookTitle ||
    "Selected book";

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }

    if (comment.trim().length > 1000) {
      setError("Review cannot exceed 1000 characters.");
      return;
    }

    if (!editing && !bookId) {
      setError("Book information is missing.");
      return;
    }

    setSaving(true);

    try {
      const data = {
        rating,
        comment: comment.trim(),
      };

      const result = editing
        ? await reviewApi.updateReview(review.id, data)
        : await reviewApi.createReview(bookId, data);

      onSaved?.(result);
      onClose?.();

    } catch (err) {
      setError(
        err.message || "Unable to save your review."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="rm-dialog"
      aria-labelledby="rm-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose?.();
      }}
    >
      <div className="rm-header">

        <div className="rm-heading-icon">
          <MessageSquare size={25} />
        </div>

        <div className="rm-heading">
          <h2 id="rm-title">
            {editing ? "Edit review" : "Write a review"}
          </h2>

          <p>{title}</p>
        </div>

        <button
          type="button"
          className="rm-close"
          aria-label="Close review"
          disabled={saving}
          onClick={onClose}
        >
          <X size={22} />
        </button>

      </div>

      <form
        className="rm-form"
        onSubmit={handleSubmit}
      >

        {error && (
          <div className="rm-error" role="alert">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <div className="rm-rating-box">

          <h3>How was your reading experience?</h3>

          <StarRating
            value={rating}
            onChange={setRating}
            size={36}
            disabled={saving}
          />

          <strong>{LABELS[rating]}</strong>

          <span>{rating} out of 5 stars</span>

        </div>

        <div className="rm-field">

          <label htmlFor="rm-comment">
            Your review
          </label>

          <textarea
            id="rm-comment"
            rows={5}
            maxLength={1000}
            value={comment}
            disabled={saving}
            placeholder="What did you like about this book? Share your reading experience..."
            onChange={(event) =>
              setComment(event.target.value)
            }
          />

          <div className="rm-character-count">
            <span>Share an honest review.</span>
            <span>{comment.length}/1000</span>
          </div>

        </div>

        <div className="rm-note">

          <ShieldCheck size={21} />

          <p>
            Your review will be associated with your
            library account and may be visible to
            other readers.
          </p>

        </div>

        <div className="rm-actions">

          <button
            type="button"
            className="rm-outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rm-primary"
            disabled={saving || !rating}
          >
            {saving ? (
              <LoaderCircle
                size={18}
                className="rm-spin"
              />
            ) : (
              <Send size={17} />
            )}

            {saving
              ? "Saving..."
              : editing
                ? "Update review"
                : "Publish review"}
          </button>

        </div>

      </form>
    </dialog>
  );
}