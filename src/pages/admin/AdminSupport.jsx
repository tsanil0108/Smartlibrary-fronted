import React, {
    useState,
    useEffect,
    useMemo,
} from "react";

import {
    Headset,
    Ticket,
    Inbox,
    Clock,
    CheckCircle2,
    Lock,
    Search,
    RefreshCw,
    Send,
    UserRound,
    MessageSquare,
    AlertCircle,
    LoaderCircle,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    CalendarDays,
    Flag,
    X,
} from "lucide-react";

import {
    adminSupportApi,
    getTicketRows,
    formatSupportDate,
} from "../../services/adminSupportApi";

import "../../styles/admin/AdminSupport.css";

const PAGE_SIZE = 15;

const STATUSES = [
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
];

const PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
];

const CATEGORIES = [
    "BOOK",
    "MEMBERSHIP",
    "PAYMENT",
    "FINE",
    "RESERVATION",
    "LIBRARY_CARD",
    "TECHNICAL",
    "ACCOUNT",
    "OTHER",
];

function label(value) {
    return String(value || "Unknown")
        .replaceAll("_", " ");
}


// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {
    return (
        <span className={`as-status as-status-${status?.toLowerCase()}`}>
            {label(status)}
        </span>
    );
}


// ==========================================
// PRIORITY BADGE
// ==========================================

function PriorityBadge({ priority }) {
    return (
        <span className={`as-priority as-priority-${priority?.toLowerCase()}`}>
            <Flag size={12} />
            {label(priority)}
        </span>
    );
}


// ==========================================
// MEMBER AVATAR
// ==========================================

function Avatar({ name, admin = false }) {

    const initials = (name || "Member")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();

    return (
        <div className={`as-avatar ${admin ? "as-avatar-admin" : ""}`}>
            {admin ? <ShieldCheck size={19} /> : initials}
        </div>
    );
}


// ==========================================
// TICKET CONVERSATION
// ==========================================

function TicketConversation({
    ticketId,
    onUpdated,
    onClose,
}) {

    const [ticket, setTicket] = useState(null);
    const [replies, setReplies] = useState([]);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {

        let cancelled = false;

        async function loadConversation() {

            setLoading(true);
            setError("");

            try {

                const [details, conversation] =
                    await Promise.all([
                        adminSupportApi.getTicket(ticketId),
                        adminSupportApi.getReplies(ticketId),
                    ]);

                if (cancelled) return;

                setTicket(details);
                setReplies(getTicketRows(conversation));

            } catch (err) {

                if (!cancelled) {
                    setError(
                        err.message ||
                        "Unable to load conversation."
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadConversation();

        return () => {
            cancelled = true;
        };

    }, [ticketId, reload]);


    // Refresh after successful server mutation.

    function refreshConversation() {
        setReload(value => value + 1);
        onUpdated();
    }


    // Send admin reply.

    async function handleReply(event) {

        event.preventDefault();

        const text = reply.trim();

        if (
            !text ||
            saving ||
            !ticket ||
            ["CLOSED", "RESOLVED"].includes(ticket.status)
        ) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {

            await adminSupportApi.sendReply(
                ticket.id,
                text
            );

            setReply("");
            setMessage("Reply sent successfully.");

            refreshConversation();

        } catch (err) {

            setError(
                err.message ||
                "Unable to send reply."
            );

        } finally {
            setSaving(false);
        }
    }


    // Update ticket status.

    async function handleStatus(status) {

        if (
            !ticket ||
            saving ||
            status === ticket.status ||
            ticket.status === "CLOSED"
        ) return;

        if (
            status === "CLOSED" &&
            !window.confirm(
                "Close this ticket permanently?"
            )
        ) return;

        if (
            status === "RESOLVED" &&
            !window.confirm(
                "Mark this ticket as resolved?"
            )
        ) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {

            await adminSupportApi.updateStatus(
                ticket.id,
                status
            );

            setMessage("Ticket status updated.");

            refreshConversation();

        } catch (err) {

            setError(
                err.message ||
                "Unable to update status."
            );

        } finally {
            setSaving(false);
        }
    }


    // Update priority.

    async function handlePriority(priority) {

        if (
            !ticket ||
            saving ||
            priority === ticket.priority ||
            ticket.status === "CLOSED"
        ) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {

            await adminSupportApi.updatePriority(
                ticket.id,
                priority
            );

            setMessage("Ticket priority updated.");

            refreshConversation();

        } catch (err) {

            setError(
                err.message ||
                "Unable to update priority."
            );

        } finally {
            setSaving(false);
        }
    }


    if (loading) {
        return (
            <section className="as-panel as-empty">
                <LoaderCircle
                    size={36}
                    className="as-spin"
                />
                <h3>Loading conversation...</h3>
            </section>
        );
    }

    if (!ticket) {
        return (
            <section className="as-panel as-empty">
                <AlertCircle size={36} />
                <h3>Unable to load ticket</h3>
                <p>{error}</p>

                <button
                    className="as-primary"
                    onClick={() =>
                        setReload(value => value + 1)
                    }
                >
                    Try again
                </button>
            </section>
        );
    }

    const closed = ticket.status === "CLOSED";
    const resolved = ticket.status === "RESOLVED";
    const replyDisabled = saving || closed || resolved;

    const sortedReplies = [...replies].sort(
        (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
    );

    return (

        <section className="as-panel as-conversation">

            {/* CONVERSATION HEADER */}

            <header className="as-conversation-header">

                <div className="as-conversation-title">

                    <span className="as-ticket-number">
                        {ticket.ticketNumber || `#${ticket.id}`}
                    </span>

                    <h2>{ticket.subject}</h2>

                    <div className="as-ticket-tags">

                        <StatusBadge status={ticket.status} />

                        <PriorityBadge priority={ticket.priority} />

                        <span className="as-category">
                            {label(ticket.category)}
                        </span>

                    </div>

                </div>

                <button
                    className="as-icon-button"
                    onClick={onClose}
                    disabled={saving}
                    aria-label="Close conversation"
                >
                    <X size={20} />
                </button>

            </header>


            {/* MEMBER INFORMATION */}

            <div className="as-member-card">

                <Avatar name={ticket.memberName} />

                <div>
                    <strong>
                        {ticket.memberName || "Unknown member"}
                    </strong>

                    <small>
                        Member ID: {ticket.userId ?? "—"}
                    </small>
                </div>

                <div className="as-member-date">
                    <CalendarDays size={16} />
                    {formatSupportDate(ticket.createdAt)}
                </div>

            </div>


            {/* TICKET CONTROLS */}

            <div className="as-ticket-controls">

                <div className="as-field">

                    <label htmlFor="as-ticket-status">
                        Ticket status
                    </label>

                    <select
                        id="as-ticket-status"
                        value={ticket.status}
                        disabled={saving || closed}
                        onChange={event =>
                            handleStatus(event.target.value)
                        }
                    >

                        {STATUSES.map(status => (
                            <option
                                key={status}
                                value={status}
                            >
                                {label(status)}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="as-field">

                    <label htmlFor="as-ticket-priority">
                        Priority
                    </label>

                    <select
                        id="as-ticket-priority"
                        value={ticket.priority}
                        disabled={saving || closed}
                        onChange={event =>
                            handlePriority(event.target.value)
                        }
                    >

                        {PRIORITIES.map(priority => (
                            <option
                                key={priority}
                                value={priority}
                            >
                                {priority}
                            </option>
                        ))}

                    </select>

                </div>

            </div>


            {/* MESSAGES */}

            <div className="as-conversation-label">
                <MessageSquare size={17} />
                Ticket conversation
            </div>

            <div className="as-messages">

                {/* ORIGINAL MEMBER COMPLAINT */}

                <div className="as-message">

                    <Avatar name={ticket.memberName} />

                    <div className="as-message-content">

                        <div className="as-message-meta">

                            <strong>
                                {ticket.memberName || "Member"}
                            </strong>

                            <small>
                                {formatSupportDate(ticket.createdAt)}
                            </small>

                        </div>

                        <div className="as-bubble">
                            {ticket.description}
                        </div>

                    </div>

                </div>


                {/* CONVERSATION REPLIES */}

                {sortedReplies.map(item => {

                    const admin =
                        item.senderRole === "ADMIN";

                    return (

                        <div
                            key={item.id}
                            className={`as-message ${admin ? "as-message-admin" : ""}`}
                        >

                            <Avatar
                                name={item.senderName}
                                admin={admin}
                            />

                            <div className="as-message-content">

                                <div className="as-message-meta">

                                    <strong>
                                        {item.senderName ||
                                            (admin ? "Support Admin" : "Member")}
                                    </strong>

                                    {admin && (
                                        <span className="as-admin-tag">
                                            ADMIN
                                        </span>
                                    )}

                                    <small>
                                        {formatSupportDate(item.createdAt)}
                                    </small>

                                </div>

                                <div className="as-bubble">
                                    {item.message}
                                </div>

                            </div>

                        </div>

                    );
                })}

            </div>


            {/* RESPONSE MESSAGES */}

            {error && (
                <div className="as-error" role="alert">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {message && (
                <div className="as-success" role="status">
                    <CheckCircle2 size={18} />
                    {message}
                </div>
            )}


            {/* REPLY FORM */}

            {closed || resolved ? (

                <div className="as-closed-notice">

                    {closed
                        ? <Lock size={21} />
                        : <CheckCircle2 size={21} />}

                    <div>

                        <strong>
                            {closed
                                ? "This ticket is closed"
                                : "This ticket is resolved"}
                        </strong>

                        <p>
                            {closed
                                ? "New replies are disabled."
                                : "Reopen the ticket through an allowed workflow before continuing."}
                        </p>

                    </div>

                </div>

            ) : (

                <form
                    className="as-reply-form"
                    onSubmit={handleReply}
                >

                    <label htmlFor="as-reply">
                        Reply to member
                    </label>

                    <textarea
                        id="as-reply"
                        value={reply}
                        onChange={event =>
                            setReply(event.target.value)
                        }
                        placeholder="Write a helpful response..."
                        rows={5}
                        maxLength={3000}
                        disabled={replyDisabled}
                        required
                    />

                    <div className="as-reply-footer">

                        <small>
                            {reply.length}/3000 characters
                        </small>

                        <button
                            type="submit"
                            className="as-primary"
                            disabled={
                                replyDisabled ||
                                !reply.trim()
                            }
                        >

                            {saving ? (
                                <LoaderCircle
                                    size={17}
                                    className="as-spin"
                                />
                            ) : (
                                <Send size={17} />
                            )}

                            {saving
                                ? "Processing..."
                                : "Send reply"}

                        </button>

                    </div>

                </form>

            )}

        </section>

    );
}


// ==========================================
// MAIN ADMIN SUPPORT PAGE
// ==========================================

export default function AdminSupport() {

    const [tickets, setTickets] = useState([]);
    const [summary, setSummary] = useState(null);

    const [selectedId, setSelectedId] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [paginated, setPaginated] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [summaryError, setSummaryError] = useState("");
    const [reload, setReload] = useState(0);


    // ======================================
    // LOAD SUPPORT TICKETS
    // ======================================

    useEffect(() => {

        let cancelled = false;

        async function loadData() {

            setLoading(true);
            setError("");
            setSummaryError("");

            const [ticketResult, summaryResult] =
                await Promise.allSettled([

                    adminSupportApi.getTickets(
                        page,
                        PAGE_SIZE
                    ),

                    adminSupportApi.getSummary(),

                ]);

            if (cancelled) return;

            if (ticketResult.status === "fulfilled") {

                const response = ticketResult.value;
                const rows = getTicketRows(response);

                const isPaginated =
                    !Array.isArray(response) &&
                    Array.isArray(response?.content);

                const pages = Math.max(
                    1,
                    response?.totalPages ?? 1
                );

                setTickets(rows);
                setPaginated(isPaginated);

                setTotalPages(
                    isPaginated ? pages : 1
                );

                setTotalElements(
                    response?.totalElements ?? rows.length
                );

                if (isPaginated && page >= pages) {
                    setPage(pages - 1);
                }

            } else {

                setTickets([]);

                setError(
                    ticketResult.reason?.message ||
                    "Unable to load support tickets."
                );

            }

            if (summaryResult.status === "fulfilled") {

                setSummary(summaryResult.value);

            } else {

                setSummary(null);

                setSummaryError(
                    "Global ticket summary is unavailable."
                );

            }

            setLoading(false);

        }

        loadData();

        return () => {
            cancelled = true;
        };

    }, [page, reload]);


    // ======================================
    // SEARCH AND FILTER
    // ======================================

    const filteredTickets = useMemo(() => {

        const query = search.trim().toLowerCase();

        return tickets.filter(ticket => {

            const matchesSearch = [
                ticket.ticketNumber,
                ticket.subject,
                ticket.memberName,
                ticket.description,
                ticket.id,
            ]
                .map(value => String(value ?? ""))
                .join(" ")
                .toLowerCase()
                .includes(query);

            return (
                matchesSearch &&

                (
                    statusFilter === "ALL" ||
                    ticket.status === statusFilter
                ) &&

                (
                    priorityFilter === "ALL" ||
                    ticket.priority === priorityFilter
                ) &&

                (
                    categoryFilter === "ALL" ||
                    ticket.category === categoryFilter
                )
            );

        });

    }, [
        tickets,
        search,
        statusFilter,
        priorityFilter,
        categoryFilter,
    ]);


    // ======================================
    // STATISTICS
    // ======================================

    const stats = [

        {
            title: "Total tickets",
            value: summary?.totalTickets,
            icon: Ticket,
            color: "purple",
        },

        {
            title: "Open tickets",
            value: summary?.openTickets,
            icon: Inbox,
            color: "orange",
        },

        {
            title: "In progress",
            value: summary?.inProgressTickets,
            icon: Clock,
            color: "blue",
        },

        {
            title: "Resolved",
            value: summary?.resolvedTickets,
            icon: CheckCircle2,
            color: "green",
        },

        {
            title: "Closed",
            value: summary?.closedTickets,
            icon: Lock,
            color: "gray",
        },

    ];

    const highPriorityCount = tickets.filter(
        ticket =>
            ticket.priority === "HIGH" &&
            ["OPEN", "IN_PROGRESS"].includes(ticket.status)
    ).length;

    function refresh() {
        setReload(value => value + 1);
    }

    function resetFilters() {
        setSearch("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setCategoryFilter("ALL");
    }


    // ======================================
    // MAIN PAGE UI
    // ======================================

    return (

        <main className="as-page">

            {/* HEADER */}

            <header className="as-page-header">

                <div>

                    <span className="as-eyebrow">
                        LIBRARY ADMINISTRATION
                    </span>

                    <h1>Help & Support</h1>

                    <p>
                        Manage member queries and resolve support tickets.
                    </p>

                </div>

                <button
                    className="as-secondary"
                    onClick={refresh}
                    disabled={loading}
                >

                    <RefreshCw
                        size={17}
                        className={loading ? "as-spin" : ""}
                    />

                    Refresh tickets

                </button>

            </header>


            {/* HERO */}

            <section className="as-hero">

                <div className="as-hero-content">

                    <span className="as-hero-tag">
                        <Headset size={15} />
                        MEMBER SUPPORT CENTER
                    </span>

                    <h2>
                        Great support.
                        <br />
                        Better experiences.
                    </h2>

                    <p>
                        Help library members with their questions,
                        resolve concerns and deliver a seamless
                        reading experience.
                    </p>

                </div>

                <div className="as-hero-art">
                    <Headset size={85} />

                    <div className="as-art-badge">
                        <MessageSquare size={28} />
                    </div>
                </div>

            </section>


            {/* STAT CARDS */}

            <section className="as-stats">

                {stats.map(item => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="as-stat-card"
                            key={item.title}
                        >

                            <div className={`as-icon as-${item.color}`}>
                                <Icon size={23} />
                            </div>

                            <span>{item.title}</span>

                            <strong>
                                {loading
                                    ? "—"
                                    : item.value ?? "—"}
                            </strong>

                        </article>

                    );
                })}

            </section>

            {summaryError && (
                <div className="as-error">
                    <AlertCircle size={18} />
                    {summaryError}
                </div>
            )}


            {/* HIGH PRIORITY ALERT */}

            {!loading && !error && highPriorityCount > 0 && (

                <div className="as-priority-alert">

                    <AlertCircle size={23} />

                    <div>

                        <strong>
                            {highPriorityCount} high-priority active
                            ticket(s) on this page
                        </strong>

                        <p>
                            These tickets may require immediate attention.
                        </p>

                    </div>

                    <button
                        className="as-secondary"
                        onClick={() => {
                            setPriorityFilter("HIGH");
                            setStatusFilter("ALL");
                        }}
                    >
                        View high priority
                    </button>

                </div>

            )}


            {/* SUPPORT WORKSPACE */}

            <div className={`as-workspace ${selectedId ? "as-workspace-split" : ""}`}>

                <section className="as-panel as-ticket-panel">

                    <div className="as-panel-header">

                        <div className="as-icon as-purple">
                            <Ticket size={23} />
                        </div>

                        <div>
                            <h3>Support tickets</h3>
                            <p>
                                {totalElements} ticket records
                            </p>
                        </div>

                    </div>


                    {/* FILTERS */}

                    <div className="as-filters">

                        <div className="as-search">

                            <Search size={18} />

                            <input
                                value={search}
                                onChange={event =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search ticket or member..."
                                aria-label="Search tickets"
                            />

                        </div>

                        <div className="as-filter-row">

                            <select
                                value={statusFilter}
                                onChange={event =>
                                    setStatusFilter(event.target.value)
                                }
                                aria-label="Filter ticket status"
                            >

                                <option value="ALL">
                                    All statuses
                                </option>

                                {STATUSES.map(status => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {label(status)}
                                    </option>
                                ))}

                            </select>

                            <select
                                value={priorityFilter}
                                onChange={event =>
                                    setPriorityFilter(event.target.value)
                                }
                                aria-label="Filter priority"
                            >

                                <option value="ALL">
                                    All priorities
                                </option>

                                {PRIORITIES.map(priority => (
                                    <option
                                        key={priority}
                                        value={priority}
                                    >
                                        {priority}
                                    </option>
                                ))}

                            </select>

                            <select
                                value={categoryFilter}
                                onChange={event =>
                                    setCategoryFilter(event.target.value)
                                }
                                aria-label="Filter category"
                            >

                                <option value="ALL">
                                    All categories
                                </option>

                                {CATEGORIES.map(category => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {label(category)}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <button
                            className="as-reset"
                            onClick={resetFilters}
                        >
                            Reset filters
                        </button>

                    </div>

                    {paginated && (
                        <small className="as-scope-note">
                            Search and filters apply to the loaded page.
                        </small>
                    )}


                    {/* TICKET LIST */}

                    {loading ? (

                        <div className="as-empty">

                            <LoaderCircle
                                size={35}
                                className="as-spin"
                            />

                            <h3>Loading tickets...</h3>

                        </div>

                    ) : error ? (

                        <div className="as-empty">

                            <AlertCircle size={35} />

                            <h3>Unable to load tickets</h3>

                            <p>{error}</p>

                            <button
                                className="as-primary"
                                onClick={refresh}
                            >
                                Try again
                            </button>

                        </div>

                    ) : filteredTickets.length === 0 ? (

                        <div className="as-empty">

                            <Inbox size={42} />

                            <h3>No matching tickets</h3>

                            <p>
                                No tickets match the selected filters.
                            </p>

                            <button
                                className="as-secondary"
                                onClick={resetFilters}
                            >
                                Clear filters
                            </button>

                        </div>

                    ) : (

                        <div className="as-ticket-list">

                            {filteredTickets.map(ticket => (

                                <button
                                    type="button"
                                    key={ticket.id}
                                    className={`as-ticket-card ${
                                        selectedId === ticket.id
                                            ? "as-ticket-selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedId(ticket.id)
                                    }
                                    aria-pressed={
                                        selectedId === ticket.id
                                    }
                                >

                                    <div className="as-ticket-top">

                                        <span className="as-ticket-number">
                                            {ticket.ticketNumber ||
                                                `#${ticket.id}`}
                                        </span>

                                        <PriorityBadge
                                            priority={ticket.priority}
                                        />

                                    </div>

                                    <h3>{ticket.subject}</h3>

                                    <p className="as-ticket-description">
                                        {ticket.description}
                                    </p>

                                    <div className="as-ticket-member">

                                        <UserRound size={15} />

                                        {ticket.memberName ||
                                            "Unknown member"}

                                    </div>

                                    <div className="as-ticket-bottom">

                                        <StatusBadge
                                            status={ticket.status}
                                        />

                                        <span className="as-category">
                                            {label(ticket.category)}
                                        </span>

                                    </div>

                                    <small className="as-ticket-date">

                                        <Clock size={13} />

                                        {formatSupportDate(ticket.createdAt)}

                                    </small>

                                </button>

                            ))}

                        </div>

                    )}


                    {/* PAGINATION */}

                    {!loading && !error && paginated && (

                        <div className="as-pagination">

                            <button
                                className="as-icon-button"
                                disabled={page === 0}
                                onClick={() =>
                                    setPage(value => value - 1)
                                }
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={19} />
                            </button>

                            <span>
                                Page {page + 1} of {totalPages}
                            </span>

                            <button
                                className="as-icon-button"
                                disabled={page + 1 >= totalPages}
                                onClick={() =>
                                    setPage(value => value + 1)
                                }
                                aria-label="Next page"
                            >
                                <ChevronRight size={19} />
                            </button>

                        </div>

                    )}

                </section>


                {/* SELECTED TICKET */}

                {selectedId && (

                    <TicketConversation
                        key={selectedId}
                        ticketId={selectedId}
                        onUpdated={refresh}
                        onClose={() => setSelectedId(null)}
                    />

                )}

            </div>


            {/* SUPPORT POLICY */}

            <section className="as-policy">

                <div className="as-icon as-purple">
                    <ShieldCheck size={24} />
                </div>

                <div>

                    <h3>Member support guidelines</h3>

                    <p>
                        Respond professionally, prioritize urgent
                        issues and mark tickets as resolved only
                        after addressing the member's concern.
                        Never request passwords or payment credentials.
                    </p>

                </div>

            </section>

        </main>

    );

}