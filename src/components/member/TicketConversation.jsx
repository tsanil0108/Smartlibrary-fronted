import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  X,
  Send,
  Headset,
  UserRound,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  LockKeyhole,
  RotateCcw,
  MessageSquare,
} from "lucide-react";

import {
  supportApi,
  ticketList,
  formatTicketDate,
  categoryLabel,
} from "../../services/supportApi";

import TicketStatus, {
  TicketPriority,
} from "./TicketStatus";

import "../../styles/member/TicketConversation.css";

export default function TicketConversation({
  ticketId,
  admin = false,
  onClose,
  onChanged,
}) {
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  async function loadConversation() {
    setLoading(true);
    setError("");

    try {
      const [details, messages] = await Promise.all([
        supportApi.getTicket(ticketId, admin),
        supportApi.getReplies(ticketId, admin),
      ]);

      setTicket(details);

      setReplies(
        ticketList(messages).sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        )
      );

    } catch (err) {
      setError(
        err.message || "Unable to load conversation."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversation();
  }, [ticketId, admin]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [replies, loading]);

  async function handleReply(event) {
    event.preventDefault();

    if (!message.trim() || busy) return;

    setBusy(true);
    setError("");

    try {
      await supportApi.sendReply(
        ticketId,
        message,
        admin
      );

      setMessage("");

      await loadConversation();

      onChanged?.();

    } catch (err) {
      setError(err.message || "Unable to send reply.");
    } finally {
      setBusy(false);
    }
  }

  async function changeTicket(action) {
    if (busy) return;

    const confirmed = window.confirm(
      action === "close"
        ? "Close this support ticket? Closed tickets cannot be reopened."
        : "Reopen this resolved ticket?"
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      if (action === "close") {
        await supportApi.closeTicket(ticketId);
      } else {
        await supportApi.reopenTicket(ticketId);
      }

      await loadConversation();

      onChanged?.();

    } catch (err) {
      setError(err.message || "Unable to update ticket.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdminUpdate(type, value) {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      if (type === "status") {
        await supportApi.updateStatus(ticketId, value);
      } else {
        await supportApi.updatePriority(ticketId, value);
      }

      await loadConversation();
      onChanged?.();

    } catch (err) {
      setError(err.message || "Unable to update ticket.");
    } finally {
      setBusy(false);
    }
  }

  const canReply =
    ticket?.status === "OPEN" ||
    ticket?.status === "IN_PROGRESS";

  return (
    <div
      className="tc-overlay"
      onClick={() => !busy && onClose()}
    >
      <section
        className="tc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ticket conversation"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="tc-header">
          <div className="tc-header-icon">
            <Headset size={26} />
          </div>

          <div className="tc-heading">
            <span>
              {ticket?.ticketNumber || "Support ticket"}
            </span>

            <h2>
              {ticket?.subject || "Ticket conversation"}
            </h2>
          </div>

          <button
            type="button"
            className="tc-icon-button"
            disabled={loading || busy}
            onClick={loadConversation}
            aria-label="Refresh conversation"
          >
            <RefreshCw size={19} />
          </button>

          <button
            type="button"
            className="tc-icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close conversation"
          >
            <X size={22} />
          </button>
        </header>

        {ticket && (
          <div className="tc-meta">
            <TicketStatus status={ticket.status} />

            <TicketPriority priority={ticket.priority} />

            <span>{categoryLabel(ticket.category)}</span>
          </div>
        )}

        {error && (
          <div className="tc-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="tc-loading">
            <LoaderCircle
              size={36}
              className="tc-spin"
            />

            <p>Loading conversation...</p>
          </div>
        ) : ticket ? (
          <>
            {admin && ticket.status !== "CLOSED" && (
              <div className="tc-admin-controls">
                <label>
                  Status

                  <select
                    value={ticket.status}
                    disabled={busy}
                    onChange={(event) =>
                      handleAdminUpdate(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">
                      In progress
                    </option>
                    <option value="RESOLVED">
                      Resolved
                    </option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </label>

                <label>
                  Priority

                  <select
                    value={ticket.priority}
                    disabled={busy}
                    onChange={(event) =>
                      handleAdminUpdate(
                        "priority",
                        event.target.value
                      )
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>
            )}

            <div className="tc-messages">
              <div className="tc-original">
                <div className="tc-original-title">
                  <MessageSquare size={17} />
                  Original request
                </div>

                <strong>
                  {ticket.memberName || "Member"}
                </strong>

                <p>{ticket.description}</p>

                <small>
                  {formatTicketDate(ticket.createdAt)}
                </small>
              </div>

              {!replies.length && (
                <div className="tc-no-replies">
                  No replies yet. New messages will
                  appear here.
                </div>
              )}

              {replies.map((reply) => {
                const fromAdmin =
                  reply.senderRole === "ADMIN";

                const ownMessage = admin
                  ? fromAdmin
                  : !fromAdmin;

                return (
                  <article
                    key={reply.id}
                    className={`tc-message ${
                      ownMessage
                        ? "tc-own"
                        : "tc-other"
                    }`}
                  >
                    <div className="tc-avatar">
                      {fromAdmin ? (
                        <Headset size={20} />
                      ) : (
                        <UserRound size={20} />
                      )}
                    </div>

                    <div className="tc-bubble">
                      <strong>
                        {fromAdmin
                          ? "Library Support"
                          : reply.senderName || "Member"}
                      </strong>

                      <p>{reply.message}</p>

                      <small>
                        {formatTicketDate(reply.createdAt)}
                      </small>
                    </div>
                  </article>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {canReply ? (
              <form
                className="tc-reply"
                onSubmit={handleReply}
              >
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Write your reply..."
                  rows={2}
                  maxLength={3000}
                  required
                />

                <button
                  type="submit"
                  disabled={busy || !message.trim()}
                  aria-label="Send reply"
                >
                  {busy ? (
                    <LoaderCircle
                      size={21}
                      className="tc-spin"
                    />
                  ) : (
                    <Send size={21} />
                  )}
                </button>
              </form>
            ) : (
              <div className="tc-locked">
                <LockKeyhole size={18} />

                {ticket.status === "RESOLVED"
                  ? "This ticket has been resolved."
                  : "This conversation is closed."}
              </div>
            )}

            {!admin && ticket.status !== "CLOSED" && (
              <footer className="tc-footer">
                {ticket.status === "RESOLVED" && (
                  <button
                    type="button"
                    className="tc-reopen"
                    disabled={busy}
                    onClick={() => changeTicket("reopen")}
                  >
                    <RotateCcw size={16} />
                    Reopen ticket
                  </button>
                )}

                <button
                  type="button"
                  className="tc-close-ticket"
                  disabled={busy}
                  onClick={() => changeTicket("close")}
                >
                  <LockKeyhole size={16} />
                  Close ticket
                </button>
              </footer>
            )}
          </>
        ) : (
          <div className="tc-loading">
            <AlertCircle size={34} />

            <p>Unable to load ticket.</p>

            <button
              type="button"
              onClick={loadConversation}
            >
              Try again
            </button>
          </div>
        )}
      </section>
    </div>
  );
}