import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    Users,
    UserRound,
    UserCheck,
    UserX,
    ShieldCheck,
    Search,
    RefreshCw,
    Eye,
    CreditCard,
    CalendarDays,
    Mail,
    X,
    Save,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    ChevronLeft,
    ChevronRight,
    Ban,
    History,
    Plus,
} from "lucide-react";

import {
    memberAdminApi,
    formatMemberDate,
    getInitials,
} from "../../services/memberAdminApi";

import "../../styles/admin/Members.css";


// ========================================
// MEMBER AVATAR
// ========================================

function MemberAvatar({ member, large = false }) {

    const color = Number(member.id || 0) % 5;

    return (
        <div className={
            `ma-avatar ma-avatar-${color} ${
                large ? "ma-avatar-large" : ""
            }`
        }>
            {getInitials(member.name)}
        </div>
    );
}


// ========================================
// STATUS BADGE
// ========================================

function StatusBadge({ status }) {

    return (
        <span className={
            `ma-status ma-status-${String(
                status || "unknown"
            ).toLowerCase()}`
        }>
            <span className="ma-status-dot" />

            {status || "UNKNOWN"}
        </span>
    );
}


// ========================================
// MEMBER DETAILS MODAL
// ========================================

function MemberDetails({
    member,
    onClose,
    onAssign,
}) {

    const [details, setDetails] = useState(member);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let active = true;

        Promise.all([
            memberAdminApi.getMember(member.id),

            member.role === "MEMBER"
                ? memberAdminApi.getMembershipHistory(member.id)
                : Promise.resolve([]),
        ])
            .then(([user, memberships]) => {

                if (!active) return;

                setDetails(user);
                setHistory(
                    Array.isArray(memberships)
                        ? memberships
                        : []
                );

            })
            .catch(err => {

                if (active) setError(err.message);

            })
            .finally(() => {

                if (active) setLoading(false);

            });

        return () => {
            active = false;
        };

    }, [member.id, member.role]);

    const current = history.find(
        item => item.valid === true
    );

    return (

        <div className="ma-overlay">

            <section
                className="ma-modal ma-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ma-details-title"
            >

                <header className="ma-modal-header">

                    <div className="ma-icon ma-purple">
                        <UserRound size={25} />
                    </div>

                    <div className="ma-modal-heading">

                        <h2 id="ma-details-title">
                            Member details
                        </h2>

                        <p>Account and membership information.</p>

                    </div>

                    <button
                        className="ma-close"
                        onClick={onClose}
                        aria-label="Close details"
                    >
                        <X size={22} />
                    </button>

                </header>

                <div className="ma-modal-body">

                    <div className="ma-profile-banner">

                        <MemberAvatar
                            member={details}
                            large
                        />

                        <div>

                            <h2>{details.name}</h2>

                            <p>{details.email}</p>

                            <StatusBadge status={details.status} />

                        </div>

                    </div>

                    <div className="ma-detail-grid">

                        <div className="ma-detail-item">

                            <UserRound size={18} />

                            <div>
                                <span>Member ID</span>
                                <strong>#{details.id}</strong>
                            </div>

                        </div>

                        <div className="ma-detail-item">

                            <ShieldCheck size={18} />

                            <div>
                                <span>Account role</span>
                                <strong>{details.role}</strong>
                            </div>

                        </div>

                        <div className="ma-detail-item">

                            <Mail size={18} />

                            <div>
                                <span>Email address</span>
                                <strong>{details.email}</strong>
                            </div>

                        </div>

                        <div className="ma-detail-item">

                            <CalendarDays size={18} />

                            <div>
                                <span>Registered on</span>

                                <strong>
                                    {formatMemberDate(details.createdAt)}
                                </strong>
                            </div>

                        </div>

                    </div>

                    {loading ? (

                        <div className="ma-empty">

                            <LoaderCircle
                                size={30}
                                className="ma-spin"
                            />

                            <p>Loading membership information...</p>

                        </div>

                    ) : error ? (

                        <div className="ma-message ma-error">
                            <AlertCircle size={18} />
                            {error}
                        </div>

                    ) : details.role === "MEMBER" && (

                        <>

                            {/* CURRENT MEMBERSHIP */}

                            <section className="ma-membership-card">

                                <div className="ma-membership-top">

                                    <CreditCard size={25} />

                                    <span>CURRENT MEMBERSHIP</span>

                                </div>

                                <h2>
                                    {current?.planName ||
                                        "No active membership"}
                                </h2>

                                {current ? (

                                    <>

                                        <div className="ma-membership-dates">

                                            <div>
                                                <span>Start date</span>

                                                <strong>
                                                    {formatMemberDate(
                                                        current.startDate
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Expiry date</span>

                                                <strong>
                                                    {formatMemberDate(
                                                        current.endDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                        <p>
                                            {current.daysRemaining} days remaining
                                        </p>

                                    </>

                                ) : (

                                    <p>
                                        Assign a membership to enable
                                        eligible borrowing privileges.
                                    </p>

                                )}

                            </section>

                            {/* MEMBERSHIP HISTORY */}

                            <section className="ma-history">

                                <div className="ma-section-heading">

                                    <History size={20} />

                                    <h3>Membership history</h3>

                                </div>

                                {history.length === 0 ? (

                                    <div className="ma-history-empty">
                                        No membership records found.
                                    </div>

                                ) : (

                                    <div className="ma-table-wrapper">

                                        <table className="ma-table ma-history-table">

                                            <thead>

                                                <tr>
                                                    <th>Plan</th>
                                                    <th>Start date</th>
                                                    <th>End date</th>
                                                    <th>Status</th>
                                                </tr>

                                            </thead>

                                            <tbody>

                                                {history.map(item => (

                                                    <tr key={item.id}>

                                                        <td>{item.planName}</td>

                                                        <td>
                                                            {formatMemberDate(
                                                                item.startDate
                                                            )}
                                                        </td>

                                                        <td>
                                                            {formatMemberDate(
                                                                item.endDate
                                                            )}
                                                        </td>

                                                        <td>
                                                            <StatusBadge
                                                                status={item.status}
                                                            />
                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                )}

                            </section>

                        </>

                    )}

                </div>

                <footer className="ma-modal-footer">

                    <button
                        className="ma-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    {details.role === "MEMBER" && (

                        <button
                            className="ma-primary"
                            onClick={() => onAssign(details)}
                        >
                            <CreditCard size={17} />
                            Assign membership
                        </button>

                    )}

                </footer>

            </section>

        </div>

    );
}


// ========================================
// MEMBERSHIP ASSIGNMENT MODAL
// ========================================

function localDate(date) {

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function MembershipForm({
    member,
    onClose,
    onSaved,
}) {

    const [form, setForm] = useState(() => {

        const now = new Date();

        const end = new Date(
            now.getTime() + 30 * 86400000
        );

        return {
            planName: "Monthly Membership",
            startDate: localDate(now),
            endDate: localDate(end),
            status: "ACTIVE",
        };

    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function change(event) {

        const { name, value } = event.target;

        setForm(old => ({
            ...old,
            [name]: value,
        }));

    }

    function selectPlan(name, days) {

        const start = form.startDate;

        if (!start) return;

        const end = new Date(
            `${start}T00:00:00+05:30`
        );

        end.setTime(
            end.getTime() + days * 86400000
        );

        setForm(old => ({
            ...old,
            planName: name,
            endDate: localDate(end),
        }));

    }

    async function submit(event) {

        event.preventDefault();

        setError("");

        if (!form.planName.trim()) {

            setError("Membership plan is required.");
            return;

        }

        if (form.endDate < form.startDate) {

            setError(
                "End date cannot be before start date."
            );

            return;

        }

        setSaving(true);

        try {

            await memberAdminApi.assignMembership(
                member.id,
                {
                    ...form,
                    planName: form.planName.trim(),
                }
            );

            onSaved();

        } catch (err) {

            setError(
                err.message || "Unable to assign membership."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <div className="ma-overlay">

            <section
                className="ma-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ma-membership-title"
            >

                <header className="ma-modal-header">

                    <div className="ma-icon ma-purple">
                        <CreditCard size={25} />
                    </div>

                    <div className="ma-modal-heading">

                        <h2 id="ma-membership-title">
                            Assign membership
                        </h2>

                        <p>Create a new membership period.</p>

                    </div>

                    <button
                        className="ma-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close membership form"
                    >
                        <X size={22} />
                    </button>

                </header>

                <form onSubmit={submit}>

                    <div className="ma-modal-body">

                        <div className="ma-selected-member">

                            <MemberAvatar member={member} />

                            <div>

                                <strong>{member.name}</strong>

                                <p>{member.email}</p>

                            </div>

                        </div>

                        {error && (

                            <div className="ma-message ma-error">
                                <AlertCircle size={18} />
                                {error}
                            </div>

                        )}

                        <div className="ma-plan-options">

                            <button
                                type="button"
                                onClick={() =>
                                    selectPlan(
                                        "Monthly Membership",
                                        30
                                    )
                                }
                            >
                                <CalendarDays size={19} />
                                <strong>Monthly</strong>
                                <span>30 days</span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    selectPlan(
                                        "Quarterly Membership",
                                        90
                                    )
                                }
                            >
                                <CalendarDays size={19} />
                                <strong>Quarterly</strong>
                                <span>90 days</span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    selectPlan(
                                        "Annual Membership",
                                        365
                                    )
                                }
                            >
                                <CalendarDays size={19} />
                                <strong>Annual</strong>
                                <span>365 days</span>
                            </button>

                        </div>

                        <div className="ma-form-grid">

                            <label className="ma-full">

                                Plan name *

                                <input
                                    name="planName"
                                    value={form.planName}
                                    onChange={change}
                                    maxLength={80}
                                    required
                                />

                            </label>

                            <label>

                                Start date *

                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={change}
                                    required
                                />

                            </label>

                            <label>

                                End date *

                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    min={form.startDate}
                                    onChange={change}
                                    required
                                />

                            </label>

                            <label className="ma-full">

                                Membership status

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={change}
                                >

                                    <option value="ACTIVE">
                                        Active
                                    </option>

                                    <option value="SUSPENDED">
                                        Suspended
                                    </option>

                                </select>

                            </label>

                        </div>

                        <div className="ma-warning">

                            <AlertCircle size={19} />

                            <span>
                                Assigning a new membership creates
                                a new period and supersedes older
                                active membership periods.
                                This action does not record a payment.
                            </span>

                        </div>

                    </div>

                    <footer className="ma-modal-footer">

                        <button
                            type="button"
                            className="ma-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="ma-primary"
                            disabled={saving}
                        >

                            {saving ? (

                                <LoaderCircle
                                    size={18}
                                    className="ma-spin"
                                />

                            ) : (

                                <Save size={18} />

                            )}

                            {saving
                                ? "Saving..."
                                : "Assign membership"}

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );
}


// ========================================
// MAIN MEMBERS MANAGEMENT PAGE
// ========================================

export function Members() {

    const [members, setMembers] = useState([]);

    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(null);

    const [statusFilter, setStatusFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [details, setDetails] = useState(null);
    const [membership, setMembership] = useState(null);
    const [selected, setSelected] = useState(null);

    const [updating, setUpdating] = useState(false);
    const [statusError, setStatusError] = useState("");

    const [refresh, setRefresh] = useState(0);

    const pageSize = 10;

    const reload = useCallback(() => {

        setRefresh(value => value + 1);

    }, []);

    // SEARCH DEBOUNCE

    useEffect(() => {

        const timer = setTimeout(() => {

            setQuery(search);
            setPage(0);

        }, 350);

        return () => clearTimeout(timer);

    }, [search]);

    // LOAD MEMBERS

    useEffect(() => {

        let active = true;

        setLoading(true);
        setError("");

        memberAdminApi.getMembers({
            page,
            size: pageSize,
            q: query,
        })
            .then(data => {

                if (!active) return;

                const pages = Number(data.totalPages || 0);

                if (page > 0 && page >= pages) {

                    setPage(Math.max(0, pages - 1));
                    return;

                }

                setMembers(data.content || []);
                setTotalPages(pages);

                setTotal(
                    data.totalElements ??
                    data.total ??
                    null
                );

            })
            .catch(err => {

                if (!active) return;

                setError(err.message);
                setMembers([]);
                setTotal(null);
                setTotalPages(0);

            })
            .finally(() => {

                if (active) setLoading(false);

            });

        return () => {
            active = false;
        };

    }, [page, query, refresh]);

    // UPDATE ACCOUNT STATUS

    async function confirmStatus() {

        if (!selected || updating) return;

        setUpdating(true);
        setStatusError("");

        const nextStatus =
            selected.status === "ACTIVE"
                ? "SUSPENDED"
                : "ACTIVE";

        try {

            await memberAdminApi.updateStatus(
                selected.id,
                nextStatus
            );

            setSelected(null);

            setMessage(
                nextStatus === "ACTIVE"
                    ? "Member account activated successfully."
                    : "Member account suspended successfully."
            );

            reload();

        } catch (err) {

            setStatusError(err.message);

        } finally {

            setUpdating(false);

        }

    }

    // CURRENT PAGE STATISTICS

    const activeMembers = members.filter(
        item =>
            item.role === "MEMBER" &&
            item.status === "ACTIVE"
    ).length;

    const suspendedMembers = members.filter(
        item =>
            item.role === "MEMBER" &&
            item.status === "SUSPENDED"
    ).length;

    const admins = members.filter(
        item => item.role === "ADMIN"
    ).length;

    const filteredMembers = members.filter(item => {

        const matchesStatus =
            !statusFilter ||
            item.status === statusFilter;

        const matchesRole =
            !roleFilter ||
            item.role === roleFilter;

        return matchesStatus && matchesRole;

    });

    const stats = [

        {
            label: "Matching accounts",
            value: total ?? "—",
            icon: Users,
            color: "purple",
        },

        {
            label: "Active members on page",
            value: activeMembers,
            icon: UserCheck,
            color: "green",
        },

        {
            label: "Suspended on page",
            value: suspendedMembers,
            icon: UserX,
            color: "red",
        },

        {
            label: "Administrators on page",
            value: admins,
            icon: ShieldCheck,
            color: "blue",
        },

    ];

    return (

        <main className="ma-page">

            {/* PAGE HEADER */}

            <header className="ma-page-header">

                <div>

                    <span className="ma-eyebrow">
                        LIBRARY ADMINISTRATION
                    </span>

                    <h1>Members Management</h1>

                    <p>
                        Manage member accounts and library memberships.
                    </p>

                </div>

                <button
                    className="ma-secondary"
                    onClick={reload}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={loading ? "ma-spin" : ""}
                    />

                    Refresh

                </button>

            </header>

            {/* HERO */}

            <section className="ma-hero">

                <div className="ma-hero-content">

                    <span>MEMBER ADMINISTRATION</span>

                    <h2>
                        Build a thriving reading community.
                    </h2>

                    <p>
                        Manage accounts, assign memberships and
                        maintain a seamless library experience
                        for every reader.
                    </p>

                    <div className="ma-hero-label">

                        <ShieldCheck size={19} />

                        Secure account management

                    </div>

                </div>

                <div className="ma-hero-decoration">

                    <Users size={155} strokeWidth={0.8} />

                </div>

            </section>

            {/* STATISTICS */}

            <section className="ma-stats">

                {stats.map(item => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="ma-stat"
                            key={item.label}
                        >

                            <div className={`ma-icon ma-${item.color}`}>

                                <Icon size={24} />

                            </div>

                            <span>{item.label}</span>

                            <strong>
                                {loading || error
                                    ? "—"
                                    : item.value}
                            </strong>

                        </article>

                    );

                })}

            </section>

            {/* SUCCESS MESSAGE */}

            {message && (

                <div
                    className="ma-message ma-success"
                    role="status"
                >

                    <CheckCircle2 size={19} />

                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >
                        <X size={18} />
                    </button>

                </div>

            )}

            {/* MEMBERS PANEL */}

            <section className="ma-panel">

                <header className="ma-panel-header">

                    <div>

                        <h3>Registered accounts</h3>

                        <p>
                            View and manage library users.
                        </p>

                    </div>

                    <span className="ma-count">

                        {total ?? "—"} accounts

                    </span>

                </header>

                {/* SEARCH AND FILTERS */}

                <div className="ma-filters">

                    <div className="ma-search">

                        <Search size={19} />

                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search name or email..."
                            aria-label="Search members"
                        />

                        {search && (

                            <button
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>

                        )}

                    </div>

                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        aria-label="Filter role on current page"
                    >

                        <option value="">All roles</option>
                        <option value="MEMBER">Members</option>
                        <option value="ADMIN">Administrators</option>

                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        aria-label="Filter status on current page"
                    >

                        <option value="">All statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>

                    </select>

                    <button
                        className="ma-secondary"
                        onClick={() => {

                            setSearch("");
                            setQuery("");
                            setStatusFilter("");
                            setRoleFilter("");
                            setPage(0);

                        }}
                    >
                        Reset
                    </button>

                </div>

                {(statusFilter || roleFilter) && (

                    <p className="ma-filter-note">
                        Role and status filters apply to the current page.
                    </p>

                )}

                {/* LOADING / ERROR / EMPTY */}

                {loading ? (

                    <div className="ma-empty">

                        <LoaderCircle
                            size={40}
                            className="ma-spin"
                        />

                        <h3>Loading members...</h3>

                    </div>

                ) : error ? (

                    <div className="ma-empty">

                        <AlertCircle size={40} />

                        <h3>Unable to load members</h3>

                        <p>{error}</p>

                        <button
                            className="ma-primary"
                            onClick={reload}
                        >
                            Try again
                        </button>

                    </div>

                ) : filteredMembers.length === 0 ? (

                    <div className="ma-empty">

                        <Users size={46} />

                        <h3>No matching accounts</h3>

                        <p>
                            Try another search or change the filters.
                        </p>

                    </div>

                ) : (

                    /* MEMBERS TABLE */

                    <div className="ma-table-wrapper">

                        <table className="ma-table">

                            <thead>

                                <tr>
                                    <th>Member</th>
                                    <th>Member ID</th>
                                    <th>Role</th>
                                    <th>Account status</th>
                                    <th>Joined date</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredMembers.map(member => (

                                    <tr key={member.id}>

                                        <td>

                                            <div className="ma-member-cell">

                                                <MemberAvatar
                                                    member={member}
                                                />

                                                <div>

                                                    <strong>
                                                        {member.name}
                                                    </strong>

                                                    <small>
                                                        {member.email}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>

                                        <td>#{member.id}</td>

                                        <td>

                                            <span className={
                                                `ma-role ${
                                                    member.role === "ADMIN"
                                                        ? "ma-purple"
                                                        : "ma-blue"
                                                }`
                                            }>

                                                {member.role}

                                            </span>

                                        </td>

                                        <td>

                                            <StatusBadge
                                                status={member.status}
                                            />

                                        </td>

                                        <td>

                                            {formatMemberDate(
                                                member.createdAt
                                            )}

                                        </td>

                                        <td>

                                            <div className="ma-actions">

                                                <button
                                                    className="ma-action ma-blue"
                                                    onClick={() =>
                                                        setDetails(member)
                                                    }
                                                    title="View details"
                                                    aria-label={`View ${member.name}`}
                                                >
                                                    <Eye size={17} />
                                                </button>

                                                {member.role === "MEMBER" && (

                                                    <>

                                                        <button
                                                            className="ma-action ma-purple"
                                                            onClick={() =>
                                                                setMembership(member)
                                                            }
                                                            title="Assign membership"
                                                            aria-label={`Membership for ${member.name}`}
                                                        >
                                                            <CreditCard size={17} />
                                                        </button>

                                                        <button
                                                            className={
                                                                `ma-action ${
                                                                    member.status === "ACTIVE"
                                                                        ? "ma-red"
                                                                        : "ma-green"
                                                                }`
                                                            }
                                                            onClick={() => {

                                                                setSelected(member);
                                                                setStatusError("");

                                                            }}
                                                            title={
                                                                member.status === "ACTIVE"
                                                                    ? "Suspend account"
                                                                    : "Activate account"
                                                            }
                                                            aria-label={`Change status of ${member.name}`}
                                                        >

                                                            {member.status === "ACTIVE"
                                                                ? <Ban size={17} />
                                                                : <UserCheck size={17} />
                                                            }

                                                        </button>

                                                    </>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

                {/* PAGINATION */}

                {!loading && !error && totalPages > 0 && (

                    <div className="ma-pagination">

                        <span>
                            Showing {filteredMembers.length} of{" "}
                            {members.length} accounts on this page
                        </span>

                        <div>

                            <button
                                disabled={page === 0}
                                onClick={() =>
                                    setPage(value => value - 1)
                                }
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={19} />
                            </button>

                            <span className="ma-current-page">
                                {page + 1} / {totalPages}
                            </span>

                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() =>
                                    setPage(value => value + 1)
                                }
                                aria-label="Next page"
                            >
                                <ChevronRight size={19} />
                            </button>

                        </div>

                    </div>

                )}

            </section>

            {/* DETAILS MODAL */}

            {details && (

                <MemberDetails
                    key={details.id}
                    member={details}
                    onClose={() => setDetails(null)}
                    onAssign={member => {

                        setDetails(null);
                        setMembership(member);

                    }}
                />

            )}

            {/* MEMBERSHIP MODAL */}

            {membership && (

                <MembershipForm
                    key={membership.id}
                    member={membership}
                    onClose={() => setMembership(null)}
                    onSaved={() => {

                        setMembership(null);
                        setMessage(
                            "Membership assigned successfully."
                        );

                        reload();

                    }}
                />

            )}

            {/* ACCOUNT STATUS CONFIRMATION */}

            {selected && (

                <div className="ma-overlay">

                    <section
                        className="ma-modal ma-small-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ma-status-title"
                    >

                        <div className="ma-modal-body">

                            <div className={
                                `ma-icon ${
                                    selected.status === "ACTIVE"
                                        ? "ma-red"
                                        : "ma-green"
                                }`
                            }>

                                {selected.status === "ACTIVE"
                                    ? <Ban size={26} />
                                    : <UserCheck size={26} />
                                }

                            </div>

                            <h2 id="ma-status-title">

                                {selected.status === "ACTIVE"
                                    ? "Suspend account?"
                                    : "Activate account?"}

                            </h2>

                            <p className="ma-confirm-text">

                                Are you sure you want to{" "}

                                {selected.status === "ACTIVE"
                                    ? "suspend"
                                    : "activate"}{" "}

                                <strong>{selected.name}</strong>?

                            </p>

                            <div className="ma-warning">

                                <AlertCircle size={19} />

                                <span>

                                    {selected.status === "ACTIVE"
                                        ? "Suspending this account may restrict library access and borrowing."
                                        : "Activating an account does not automatically renew its membership."}

                                </span>

                            </div>

                            {statusError && (

                                <div className="ma-message ma-error">

                                    <AlertCircle size={18} />

                                    {statusError}

                                </div>

                            )}

                        </div>

                        <footer className="ma-modal-footer">

                            <button
                                className="ma-secondary"
                                onClick={() => setSelected(null)}
                                disabled={updating}
                            >
                                Cancel
                            </button>

                            <button
                                className={
                                    selected.status === "ACTIVE"
                                        ? "ma-danger"
                                        : "ma-primary"
                                }
                                onClick={confirmStatus}
                                disabled={updating}
                            >

                                {updating
                                    ? "Updating..."
                                    : selected.status === "ACTIVE"
                                        ? "Suspend account"
                                        : "Activate account"}

                            </button>

                        </footer>

                    </section>

                </div>

            )}

        </main>

    );

}