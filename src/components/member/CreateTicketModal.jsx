import React, { useState } from "react";

import {
  X,
  MessageSquarePlus,
  Send,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import {
  supportApi,
  ticketCategories,
} from "../../services/supportApi";

import "../../styles/member/CreateTicketModal.css";

export default function CreateTicketModal({
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "BOOK",
    priority: "MEDIUM",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy) return;

    setError("");

    if (form.subject.trim().length < 5) {
      setError("Subject must contain at least 5 characters.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError("Please describe your issue in more detail.");
      return;
    }

    setBusy(true);

    try {
      const result = await supportApi.createTicket({
        ...form,
        subject: form.subject.trim(),
        description: form.description.trim(),
      });

      onCreated?.(result);
      onClose?.();

    } catch (err) {
      setError(
        err.message || "Unable to create support ticket."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="ctm-overlay"
      onClick={() => !busy && onClose()}
    >
      <section
        className="ctm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ctm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ctm-header">
          <div className="ctm-icon">
            <MessageSquarePlus size={27} />
          </div>

          <div>
            <h2 id="ctm-title">Create support ticket</h2>
            <p>Tell us how we can help you.</p>
          </div>

          <button
            type="button"
            className="ctm-close"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>

        {error && (
          <div className="ctm-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form
          className="ctm-form"
          onSubmit={handleSubmit}
        >
          <label>
            Subject

            <input
              name="subject"
              value={form.subject}
              onChange={update}
              placeholder="Enter a short subject"
              minLength={5}
              maxLength={150}
              required
              autoFocus
            />

            <small>
              {form.subject.length}/150 characters
            </small>
          </label>

          <div className="ctm-grid">
            <label>
              Category

              <select
                name="category"
                value={form.category}
                onChange={update}
              >
                {ticketCategories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Priority

              <select
                name="priority"
                value={form.priority}
                onChange={update}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
          </div>

          <label>
            Describe your issue

            <textarea
              name="description"
              value={form.description}
              onChange={update}
              placeholder="Explain your issue in detail..."
              rows={6}
              minLength={10}
              maxLength={3000}
              required
            />

            <small>
              {form.description.length}/3000 characters
            </small>
          </label>

          <div className="ctm-info">
            Do not include passwords, OTPs or sensitive
            payment information in your ticket.
          </div>

          <footer className="ctm-footer">
            <button
              type="button"
              className="ctm-cancel"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="ctm-submit"
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle
                  size={18}
                  className="ctm-spin"
                />
              ) : (
                <Send size={17} />
              )}

              {busy ? "Submitting..." : "Submit ticket"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}