import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Headset,
  Plus,
  Ticket,
  Clock,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Search,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  CircleHelp,
  X,
} from "lucide-react";

import {
  supportApi,
  ticketList,
  formatTicketDate,
  categoryLabel,
} from "../../services/supportApi";

import TicketStatus, {
  TicketPriority,
} from "../../components/member/TicketStatus";

import CreateTicketModal
  from "../../components/member/CreateTicketModal";

import TicketConversation
  from "../../components/member/TicketConversation";

import "../../styles/member/Support.css";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  return (
    <article className="sp-stat">
      <div className={`sp-stat-icon ${color}`}>
        <Icon size={23} />
      </div>

      <span>{label}</span>

      <strong>{value ?? "—"}</strong>
    </article>
  );
}

const faqs = [
  {
    question: "How do I create a support ticket?",
    answer:
      "Click Create new ticket, select a category and describe your issue. Submit the ticket to contact the library team.",
  },
  {
    question: "How can I track my ticket?",
    answer:
      "Open any ticket from your support history to view its current status and replies from the library team.",
  },
  {
    question: "Can I reopen a resolved ticket?",
    answer:
      "Yes. Open a resolved ticket and select Reopen ticket. Permanently closed tickets cannot be reopened.",
  },
  {
    question: "Will I receive an email notification?",
    answer:
      "Email updates may be sent when the library's email notification service is enabled and configured.",
  },
];

export default function Support({ admin = false }) {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [priority, setPriority] = useState("ALL");

  const [page, setPage] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [openFaq, setOpenFaq] = useState(null);

  const pageSize = 8;

  async function fetchAllTickets() {
    const size = 100;
    let currentPage = 0;
    let result = [];

    while (true) {
      const response = await supportApi.getTickets(
        currentPage,
        size,
        admin
      );

      const items = ticketList(response);

      result = [...result, ...items];

      if (
        Array.isArray(response) ||
        response.last === true ||
        items.length < size ||
        (
          response.totalPages != null &&
          currentPage + 1 >= response.totalPages
        )
      ) {
        break;
      }

      currentPage += 1;
    }

    return result;
  }

  async function loadTickets() {
    setLoading(true);
    setError("");

    try {
      const [list, stats] = await Promise.all([
        fetchAllTickets(),
        supportApi.getSummary(admin),
      ]);

      setTickets(list);
      setSummary(stats);

    } catch (err) {
      setError(
        err.message || "Unable to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [admin]);

  useEffect(() => {
    setPage(0);
  }, [search, status, priority]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets
      .filter((ticket) => {
        const matchesSearch = [
          ticket.ticketNumber,
          ticket.subject,
          ticket.description,
          ticket.memberName,
          categoryLabel(ticket.category),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesStatus =
          status === "ALL" ||
          ticket.status === status;

        const matchesPriority =
          priority === "ALL" ||
          ticket.priority === priority;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
  }, [tickets, search, status, priority]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages - 1);

  const visibleTickets = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  function handleCreated() {
    setNotice("Support ticket created successfully.");
    setShowCreate(false);
    setPage(0);
    loadTickets();
  }

  return (
    <div className="sp-page">
      <header className="sp-header">
        <div>
          <span className="sp-eyebrow">
            <Headset size={16} />
            LIBRARY SUPPORT CENTER
          </span>

          <h1>
            {admin
              ? "Support Management"
              : "Help & Support"}
          </h1>

          <p>
            {admin
              ? "Manage member requests and support conversations."
              : "Get assistance and track your support requests."}
          </p>
        </div>

        {!admin && (
          <button
            type="button"
            className="sp-primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={19} />
            Create new ticket
          </button>
        )}
      </header>

      <section className="sp-hero">
        <div className="sp-hero-content">
          <span>WE ARE HERE FOR YOU</span>

          <h2>
            {admin
              ? "Deliver better support."
              : "How can we help?"}
          </h2>

          <p>
            {admin
              ? "Review support requests, respond to members and resolve library issues."
              : "Need help with books, membership, payments or your library account? Connect with our support team."}
          </p>

          {!admin && (
            <button
              type="button"
              className="sp-hero-button"
              onClick={() => setShowCreate(true)}
            >
              <MessageCircle size={18} />
              Contact support
              <ArrowRight size={17} />
            </button>
          )}
        </div>

        <div className="sp-hero-art" aria-hidden="true">
          <div className="sp-art-circle" />

          <div className="sp-art-headset">
            <Headset size={110} strokeWidth={1.5} />
          </div>

          <div className="sp-art-message">
            <MessageCircle size={30} />
          </div>

          <div className="sp-art-mail">
            <Mail size={27} />
          </div>
        </div>
      </section>

      <section className="sp-stats">
        <StatCard
          icon={Ticket}
          label="Total tickets"
          value={summary?.totalTickets}
          color="sp-purple"
        />

        <StatCard
          icon={Clock}
          label="Open"
          value={summary?.openTickets}
          color="sp-orange"
        />

        <StatCard
          icon={LoaderCircle}
          label="In progress"
          value={summary?.inProgressTickets}
          color="sp-blue"
        />

        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={summary?.resolvedTickets}
          color="sp-green"
        />

        <StatCard
          icon={LockKeyhole}
          label="Closed"
          value={summary?.closedTickets}
          color="sp-gray"
        />
      </section>

      {notice && (
        <div className="sp-notice" role="status">
          <CheckCircle2 size={20} />

          {notice}

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="sp-error" role="alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <section className="sp-panel">
        <div className="sp-panel-heading">
          <div className="sp-stat-icon sp-purple">
            <Ticket size={24} />
          </div>

          <div className="sp-panel-title">
            <h2>
              {admin ? "All support tickets" : "My support tickets"}
            </h2>

            <p>View and manage support conversations.</p>
          </div>

          <button
            type="button"
            className="sp-outline"
            onClick={loadTickets}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "sp-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="sp-toolbar">
          <div className="sp-search">
            <Search size={19} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search tickets..."
              aria-label="Search tickets"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            aria-label="Filter ticket status"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            aria-label="Filter priority"
          >
            <option value="ALL">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="sp-empty">
            <LoaderCircle
              size={42}
              className="sp-spin"
            />

            <h3>Loading support tickets...</h3>

            <p>Please wait while we fetch your requests.</p>
          </div>
        ) : error && !tickets.length ? (
          <div className="sp-empty">
            <AlertCircle size={42} />

            <h3>Unable to load tickets</h3>

            <button
              type="button"
              className="sp-primary"
              onClick={loadTickets}
            >
              Try again
            </button>
          </div>
        ) : !visibleTickets.length ? (
          <div className="sp-empty">
            <div className="sp-empty-icon">
              <Headset size={44} />
            </div>

            <h3>
              {tickets.length
                ? "No matching tickets"
                : "No support tickets yet"}
            </h3>

            <p>
              {tickets.length
                ? "Try changing your search or filters."
                : "Your support requests will appear here."}
            </p>

            {tickets.length ? (
              <button
                type="button"
                className="sp-outline"
                onClick={() => {
                  setSearch("");
                  setStatus("ALL");
                  setPriority("ALL");
                }}
              >
                Clear filters
              </button>
            ) : !admin ? (
              <button
                type="button"
                className="sp-primary"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={17} />
                Create first ticket
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="sp-ticket-list">
              {visibleTickets.map((ticket) => (
                <button
                  type="button"
                  className="sp-ticket"
                  key={ticket.id}
                  onClick={() =>
                    setSelectedTicket(ticket.id)
                  }
                >
                  <div className="sp-ticket-icon">
                    <MessageCircle size={25} />
                  </div>

                  <div className="sp-ticket-info">
                    <small>{ticket.ticketNumber}</small>

                    <h3>{ticket.subject}</h3>

                    <div className="sp-ticket-meta">
                      <span>
                        {categoryLabel(ticket.category)}
                      </span>

                      <span>
                        {formatTicketDate(ticket.createdAt)}
                      </span>

                      {admin && (
                        <span>{ticket.memberName}</span>
                      )}
                    </div>
                  </div>

                  <div className="sp-ticket-badges">
                    <TicketPriority
                      priority={ticket.priority}
                    />

                    <TicketStatus
                      status={ticket.status}
                    />
                  </div>

                  <ArrowRight
                    size={18}
                    className="sp-ticket-arrow"
                  />
                </button>
              ))}
            </div>

            <footer className="sp-pagination">
              <span>
                Showing {currentPage * pageSize + 1}–
                {Math.min(
                  (currentPage + 1) * pageSize,
                  filtered.length
                )} of {filtered.length} tickets
              </span>

              <div>
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                <span>
                  {currentPage + 1} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {!admin && (
        <section className="sp-panel sp-faq">
          <div className="sp-panel-heading">
            <div className="sp-stat-icon sp-orange">
              <CircleHelp size={25} />
            </div>

            <div className="sp-panel-title">
              <h2>Frequently asked questions</h2>
              <p>Quick answers to common questions.</p>
            </div>
          </div>

          {faqs.map((faq, index) => (
            <article className="sp-faq-item" key={index}>
              <button
                type="button"
                aria-expanded={openFaq === index}
                onClick={() =>
                  setOpenFaq(
                    openFaq === index ? null : index
                  )
                }
              >
                {faq.question}

                <Plus
                  size={19}
                  className={
                    openFaq === index
                      ? "sp-faq-active"
                      : ""
                  }
                />
              </button>

              {openFaq === index && (
                <p>{faq.answer}</p>
              )}
            </article>
          ))}
        </section>
      )}

      {showCreate && !admin && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedTicket !== null && (
        <TicketConversation
          key={`${admin}-${selectedTicket}`}
          ticketId={selectedTicket}
          admin={admin}
          onClose={() => setSelectedTicket(null)}
          onChanged={loadTickets}
        />
      )}
    </div>
  );
}