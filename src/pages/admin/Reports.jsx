import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    BarChart3,
    BookOpen,
    Users,
    ArrowLeftRight,
    Clock,
    AlertTriangle,
    IndianRupee,
    CalendarDays,
    Download,
    RefreshCw,
    TrendingUp,
    CheckCircle2,
    Bookmark,
    Headset,
    ArrowUpRight,
    LoaderCircle,
    FileSpreadsheet,
    Inbox,
} from "lucide-react";

import {
    adminReportApi,
    getTotal,
    dateKey,
    isOverdue,
    formatReportMoney,
    formatReportDate,
    downloadReportCsv,
} from "../../services/adminReportApi";

import "../../styles/admin/Reports.css";

const COLORS = {
    purple: "#6339ef",
    green: "#16a34a",
    orange: "#f97316",
    blue: "#2563eb",
    red: "#dc2626",
    gray: "#a8a5b8",
};

function bookTitle(loan) {
    return loan.bookTitle
        || loan.book?.title
        || loan.copy?.book?.title
        || "Unknown book";
}

function memberName(loan) {
    return loan.memberName
        || loan.userName
        || loan.user?.name
        || loan.member?.name
        || "Unknown member";
}

function issueDate(loan) {
    return loan.issueDate
        || loan.borrowedAt
        || loan.issuedAt;
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
    title,
    value,
    icon: Icon,
    color,
    description,
}) {

    return (
        <article className="rp-stat">

            <div className={`rp-icon rp-${color}`}>
                <Icon size={23} />
            </div>

            <span>{title}</span>

            <strong>{value ?? "—"}</strong>

            <small>{description}</small>

        </article>
    );
}

// ==========================================
// REPORT PANEL
// ==========================================

function ReportPanel({
    title,
    description,
    icon: Icon,
    children,
    link,
}) {

    return (
        <section className="rp-panel">

            <header className="rp-panel-header">

                <div className="rp-icon rp-purple">
                    <Icon size={22} />
                </div>

                <div className="rp-panel-title">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>

                {link && (
                    <Link
                        className="rp-panel-link"
                        to={link}
                        aria-label={`View ${title}`}
                    >
                        <ArrowUpRight size={19} />
                    </Link>
                )}

            </header>

            {children}

        </section>
    );
}

// ==========================================
// HORIZONTAL BAR CHART
// ==========================================

function BarChart({ items, money = false }) {

    const max = Math.max(
        1,
        ...items.map(item => Number(item.value || 0))
    );

    return (
        <div className="rp-bars">

            {items.map(item => {

                const value = Number(item.value || 0);

                return (
                    <div
                        className="rp-bar-item"
                        key={item.label}
                    >

                        <div className="rp-bar-label">

                            <span>
                                <i style={{
                                    background: item.color,
                                }} />

                                {item.label}
                            </span>

                            <strong>
                                {item.value == null
                                    ? "—"
                                    : money
                                        ? formatReportMoney(value)
                                        : value.toLocaleString("en-IN")}
                            </strong>

                        </div>

                        <div className="rp-bar-track">

                            <div
                                className="rp-bar-fill"
                                style={{
                                    width: `${Math.max(0, value) / max * 100}%`,
                                    background: item.color,
                                }}
                            />

                        </div>

                    </div>
                );
            })}

        </div>
    );
}

// ==========================================
// FINE DONUT CHART
// ==========================================

function FineChart({ fines }) {

    if (!fines) {
        return (
            <div className="rp-empty">
                Fine report unavailable.
            </div>
        );
    }

    const items = [
        {
            label: "Paid fines",
            value: fines.paidAmount,
            color: COLORS.green,
        },
        {
            label: "Pending fines",
            value: fines.pendingAmount,
            color: COLORS.orange,
        },
        {
            label: "Waived fines",
            value: fines.waivedAmount,
            color: COLORS.gray,
        },
    ];

    const total = items.reduce(
        (sum, item) =>
            sum + Math.max(0, Number(item.value || 0)),
        0
    );

    const circumference = 2 * Math.PI * 65;

    let offset = 0;

    const segments = items.map(item => {

        const length = total > 0
            ? Math.max(0, Number(item.value || 0))
                / total * circumference
            : 0;

        const segment = {
            ...item,
            length,
            offset,
        };

        offset += length;

        return segment;
    });

    return (
        <div className="rp-fine-chart">

            <div className="rp-donut">

                <svg
                    viewBox="0 0 180 180"
                    role="img"
                    aria-label="Fine amount distribution"
                >

                    <circle
                        cx="90"
                        cy="90"
                        r="65"
                        fill="none"
                        stroke="#eeebf5"
                        strokeWidth="20"
                    />

                    {segments.map(item => (
                        <circle
                            key={item.label}
                            cx="90"
                            cy="90"
                            r="65"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={
                                `${item.length} ${circumference}`
                            }
                            strokeDashoffset={-item.offset}
                            transform="rotate(-90 90 90)"
                        />
                    ))}

                </svg>

                <div className="rp-donut-center">

                    <small>Total fines</small>

                    <strong>
                        {formatReportMoney(fines.totalAmount)}
                    </strong>

                </div>

            </div>

            <BarChart items={items} money />

        </div>
    );
}

// ==========================================
// MONTHLY BORROWING CHART
// ==========================================

function MonthlyChart({ loans, endDate }) {

    const months = useMemo(() => {

        const end = endDate || dateKey();

        const [year, month] = end
            .split("-")
            .map(Number);

        const result = [];

        for (let index = 5; index >= 0; index--) {

            const date = new Date(
                Date.UTC(year, month - 1 - index, 1)
            );

            const key = date.toISOString().slice(0, 7);

            const count = loans.filter(loan => {

                const issued = issueDate(loan);

                return issued &&
                    dateKey(issued).slice(0, 7) === key;

            }).length;

            result.push({
                key,
                label: date.toLocaleDateString("en-IN", {
                    month: "short",
                    timeZone: "UTC",
                }),
                count,
            });
        }

        return result;

    }, [loans, endDate]);

    const max = Math.max(
        4,
        Math.ceil(
            Math.max(...months.map(item => item.count)) / 4
        ) * 4
    );

    return (
        <div className="rp-monthly-chart">

            <svg
                viewBox="0 0 440 245"
                role="img"
                aria-label="Monthly borrowing chart"
            >

                {[0, 1, 2, 3, 4].map(index => {

                    const y = 20 + index * 45;

                    return (
                        <g key={index}>

                            <line
                                x1="40"
                                x2="430"
                                y1={y}
                                y2={y}
                                stroke="#eeebf5"
                                strokeDasharray="4 4"
                            />

                            <text
                                x="29"
                                y={y + 4}
                                textAnchor="end"
                                fontSize="11"
                                fill="#918da2"
                            >
                                {max - index * max / 4}
                            </text>

                        </g>
                    );
                })}

                {months.map((month, index) => {

                    const height = month.count / max * 180;
                    const x = 53 + index * 64;

                    return (
                        <g key={month.key}>

                            <rect
                                x={x}
                                y="20"
                                width="34"
                                height="180"
                                rx="7"
                                fill="#f5f2fc"
                            />

                            <rect
                                x={x}
                                y={200 - height}
                                width="34"
                                height={height}
                                rx="7"
                                fill={
                                    index === 5
                                        ? COLORS.orange
                                        : COLORS.purple
                                }
                            >
                                <title>
                                    {month.label}: {month.count} loans
                                </title>
                            </rect>

                            <text
                                x={x + 17}
                                y={Math.max(13, 191 - height)}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill="#17143d"
                            >
                                {month.count}
                            </text>

                            <text
                                x={x + 17}
                                y="225"
                                textAnchor="middle"
                                fontSize="12"
                                fill="#77758a"
                            >
                                {month.label}
                            </text>

                        </g>
                    );
                })}

            </svg>

            <div className="rp-chart-note">
                <span />
                Borrowed books by issue month
            </div>

        </div>
    );
}

// ==========================================
// MAIN REPORTS PAGE
// ==========================================

export function Reports() {

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reload, setReload] = useState(0);

    const [period, setPeriod] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [exportType, setExportType] =
        useState("SUMMARY");

    const [updatedAt, setUpdatedAt] = useState(null);

    // ======================================
    // LOAD REPORT DATA
    // ======================================

    useEffect(() => {

        let cancelled = false;

        async function loadReports() {

            setLoading(true);
            setError("");

            try {

                const result =
                    await adminReportApi.getReportData();

                if (cancelled) return;

                setData(result);
                setUpdatedAt(new Date());

            } catch (err) {

                if (!cancelled) {
                    setError(
                        err.message ||
                        "Unable to load reports."
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadReports();

        return () => {
            cancelled = true;
        };

    }, [reload]);

    // ======================================
    // DATE FILTER
    // ======================================

    function changePeriod(value) {

        setPeriod(value);

        const today = dateKey();

        if (value === "ALL") {

            setFromDate("");
            setToDate("");

        } else if (value === "CUSTOM") {

            setToDate(today);

        } else {

            const date = new Date(
                `${today}T12:00:00+05:30`
            );

            date.setUTCDate(
                date.getUTCDate() - Number(value) + 1
            );

            setFromDate(dateKey(date));
            setToDate(today);
        }
    }

    const invalidDates = Boolean(
        fromDate &&
        toDate &&
        fromDate > toDate
    );

    const allLoans = data?.loans?.rows || [];

    const filteredLoans = useMemo(() => {

        if (invalidDates) return [];

        return allLoans.filter(loan => {

            if (!fromDate && !toDate) return true;

            const issued = issueDate(loan);

            if (!issued) return false;

            const key = dateKey(issued);

            if (!key) return false;

            return (
                (!fromDate || key >= fromDate) &&
                (!toDate || key <= toDate)
            );
        });

    }, [
        allLoans,
        fromDate,
        toDate,
        invalidDates,
    ]);

    // ======================================
    // CALCULATE REPORTS
    // ======================================

    const loansAvailable = Boolean(data?.loans);

    const activeLoans = filteredLoans.filter(
        loan => loan.status === "ACTIVE"
    );

    const overdueLoans = activeLoans.filter(isOverdue);

    const returnedLoans = filteredLoans.filter(
        loan => loan.status === "RETURNED"
    );

    const lostLoans = filteredLoans.filter(
        loan => loan.status === "LOST"
    );

    const otherLoans = filteredLoans.filter(
        loan => ![
            "ACTIVE",
            "RETURNED",
            "LOST",
        ].includes(loan.status)
    );

    const returnRate = filteredLoans.length
        ? returnedLoans.length
            / filteredLoans.length * 100
        : 0;

    const reservations =
        data?.reservations?.rows || [];

    const reservationStats = [
        {
            label: "Waiting",
            status: "WAITING",
            color: COLORS.orange,
        },
        {
            label: "Ready for pickup",
            status: "READY",
            color: COLORS.blue,
        },
        {
            label: "Fulfilled",
            status: "FULFILLED",
            color: COLORS.green,
        },
        {
            label: "Cancelled",
            status: "CANCELLED",
            color: COLORS.red,
        },
        {
            label: "Expired",
            status: "EXPIRED",
            color: COLORS.gray,
        },
    ].map(item => ({
        ...item,
        value: data?.reservations
            ? reservations.filter(
                row => row.status === item.status
            ).length
            : null,
    }));

    const supportStats = [
        {
            label: "Open tickets",
            value: data?.support?.openTickets,
            color: COLORS.orange,
        },
        {
            label: "In progress",
            value: data?.support?.inProgressTickets,
            color: COLORS.blue,
        },
        {
            label: "Resolved",
            value: data?.support?.resolvedTickets,
            color: COLORS.green,
        },
        {
            label: "Closed",
            value: data?.support?.closedTickets,
            color: COLORS.gray,
        },
    ];

    const circulationStats = [
        {
            label: "Active — not overdue",
            value: activeLoans.length - overdueLoans.length,
            color: COLORS.purple,
        },
        {
            label: "Overdue",
            value: overdueLoans.length,
            color: COLORS.red,
        },
        {
            label: "Returned",
            value: returnedLoans.length,
            color: COLORS.green,
        },
        {
            label: "Lost",
            value: lostLoans.length,
            color: COLORS.orange,
        },
        {
            label: "Other",
            value: otherLoans.length,
            color: COLORS.gray,
        },
    ];

    // ======================================
    // MOST BORROWED BOOKS
    // ======================================

    const popularBooks = useMemo(() => {

        const counts = new Map();

        filteredLoans.forEach(loan => {

            const title = bookTitle(loan);

            const key = loan.bookId
                || loan.book?.id
                || loan.copy?.book?.id
                || title;

            const current = counts.get(key) || {
                title,
                count: 0,
            };

            current.count += 1;

            counts.set(key, current);
        });

        return [...counts.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

    }, [filteredLoans]);

    const overduePreview = [...overdueLoans]
        .sort((a, b) =>
            String(a.dueDate)
                .localeCompare(String(b.dueDate))
        )
        .slice(0, 8);

    const loanScope = data?.loans?.complete
        ? "Selected loan period"
        : "Loaded loan records only";

    const loanValue = value =>
        loansAvailable && !invalidDates
            ? value
            : null;

    // ======================================
    // STAT CARDS
    // ======================================

    const stats = [
        {
            title: "Total books",
            value: getTotal(data?.books),
            icon: BookOpen,
            color: "purple",
            description: "Catalogue records",
        },
        {
            title: "Total users",
            value: getTotal(data?.members),
            icon: Users,
            color: "blue",
            description: "Registered user records",
        },
        {
            title: "Total loans",
            value: loanValue(filteredLoans.length),
            icon: ArrowLeftRight,
            color: "purple",
            description: loanScope,
        },
        {
            title: "Active loans",
            value: loanValue(activeLoans.length),
            icon: Clock,
            color: "orange",
            description: loanScope,
        },
        {
            title: "Overdue loans",
            value: loanValue(overdueLoans.length),
            icon: AlertTriangle,
            color: "red",
            description: loanScope,
        },
        {
            title: "Fines collected",
            value: formatReportMoney(
                data?.fines?.paidAmount
            ),
            icon: IndianRupee,
            color: "green",
            description: "All-time paid fines",
        },
    ];

    // ======================================
    // CSV EXPORT
    // ======================================

    function exportReport() {

        if (!data || invalidDates || loading) return;

        let rows = [];
        let filename = "";

        if (exportType === "LOANS") {

            if (!loansAvailable) return;

            filename = "library-loan-report";

            rows = [
                [
                    "Loan ID",
                    "Book",
                    "Member",
                    "Issue Date",
                    "Due Date",
                    "Status",
                    "Overdue",
                ],
                ...filteredLoans.map(loan => [
                    loan.id,
                    bookTitle(loan),
                    memberName(loan),
                    formatReportDate(issueDate(loan)),
                    formatReportDate(loan.dueDate),
                    loan.status,
                    isOverdue(loan) ? "Yes" : "No",
                ]),
            ];

        } else if (exportType === "OVERDUE") {

            if (!loansAvailable) return;

            filename = "library-overdue-report";

            rows = [
                [
                    "Loan ID",
                    "Book",
                    "Member",
                    "Due Date",
                ],
                ...overdueLoans.map(loan => [
                    loan.id,
                    bookTitle(loan),
                    memberName(loan),
                    formatReportDate(loan.dueDate),
                ]),
            ];

        } else if (exportType === "FINES") {

            if (!data.fines) return;

            filename = "library-fine-summary";

            rows = [
                ["Metric", "Value"],
                ["Total fines", data.fines.totalFines],
                ["Pending fines", data.fines.pendingFines],
                ["Paid fines", data.fines.paidFines],
                ["Waived fines", data.fines.waivedFines],
                ["Total amount INR", data.fines.totalAmount],
                ["Pending amount INR", data.fines.pendingAmount],
                ["Paid amount INR", data.fines.paidAmount],
                ["Waived amount INR", data.fines.waivedAmount],
            ];

        } else {

            filename = "library-performance-summary";

            rows = [
                ["Metric", "Value", "Scope"],
                ["Generated on", dateKey(), "Report date"],
                ["From date", fromDate || "All time", "Loans"],
                ["To date", toDate || "All time", "Loans"],
                ["Loan data complete", data.loans?.complete ?? "Unavailable", "Loans"],
                ...stats.map(item => [
                    item.title,
                    item.value ?? "Unavailable",
                    item.description,
                ]),
                [
                    "Return rate",
                    loansAvailable
                        ? `${returnRate.toFixed(1)}%`
                        : "Unavailable",
                    loanScope,
                ],
                ...reservationStats.map(item => [
                    `Reservations - ${item.label}`,
                    item.value ?? "Unavailable",
                    "Loaded reservation records",
                ]),
                ...supportStats.map(item => [
                    item.label,
                    item.value ?? "Unavailable",
                    "All-time support",
                ]),
            ];
        }

        downloadReportCsv(
            `${filename}-${dateKey()}.csv`,
            rows
        );
    }

    const exportDisabled =
        loading ||
        !data ||
        invalidDates ||
        (
            ["LOANS", "OVERDUE"].includes(exportType) &&
            !loansAvailable
        ) ||
        (
            exportType === "FINES" &&
            !data?.fines
        );

    // ======================================
    // PAGE UI
    // ======================================

    return (
        <main className="rp-page">

            {/* PAGE HEADER */}

            <header className="rp-page-header">

                <div>
                    <span className="rp-eyebrow">
                        LIBRARY ADMINISTRATION
                    </span>

                    <h1>Reports & Analytics</h1>

                    <p>
                        Monitor library performance and
                        operational insights.
                    </p>
                </div>

                <button
                    className="rp-secondary"
                    onClick={() =>
                        setReload(value => value + 1)
                    }
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "rp-spin" : ""}
                    />
                    Refresh reports
                </button>

            </header>

            {/* HERO */}

            <section className="rp-hero">

                <div className="rp-hero-content">

                    <span className="rp-hero-tag">
                        <TrendingUp size={15} />
                        PERFORMANCE OVERVIEW
                    </span>

                    <h2>
                        Turn library data
                        <br />
                        into powerful insights.
                    </h2>

                    <p>
                        Understand circulation trends,
                        monitor overdue books and track
                        your library's financial performance.
                    </p>

                </div>

                <div className="rp-hero-art">
                    <BarChart3 size={88} />

                    <span>
                        <TrendingUp size={30} />
                    </span>
                </div>

            </section>

            {/* REPORT FILTERS */}

            <section className="rp-toolbar">

                <div className="rp-toolbar-title">

                    <div className="rp-icon rp-purple">
                        <CalendarDays size={22} />
                    </div>

                    <div>
                        <h3>Report period</h3>
                        <p>Date filters apply to loan reports.</p>
                    </div>

                </div>

                <div className="rp-filter-controls">

                    <div className="rp-field">

                        <label htmlFor="rp-period">
                            Period
                        </label>

                        <select
                            id="rp-period"
                            value={period}
                            onChange={event =>
                                changePeriod(event.target.value)
                            }
                        >
                            <option value="ALL">All time</option>
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 365 days</option>
                            <option value="CUSTOM">Custom range</option>
                        </select>

                    </div>

                    <div className="rp-field">

                        <label htmlFor="rp-from">
                            From date
                        </label>

                        <input
                            id="rp-from"
                            type="date"
                            value={fromDate}
                            onChange={event => {
                                setPeriod("CUSTOM");
                                setFromDate(event.target.value);
                            }}
                        />

                    </div>

                    <div className="rp-field">

                        <label htmlFor="rp-to">
                            To date
                        </label>

                        <input
                            id="rp-to"
                            type="date"
                            value={toDate}
                            onChange={event => {
                                setPeriod("CUSTOM");
                                setToDate(event.target.value);
                            }}
                        />

                    </div>

                </div>

            </section>

            {invalidDates && (
                <div className="rp-alert">
                    <AlertTriangle size={19} />
                    From date cannot be after the to date.
                </div>
            )}

            {/* LOADING AND ERROR */}

            {loading && (
                <section className="rp-panel rp-empty">
                    <LoaderCircle
                        size={36}
                        className="rp-spin"
                    />
                    <h3>Preparing your reports...</h3>
                    <p>Fetching library performance data.</p>
                </section>
            )}

            {error && (
                <div className="rp-alert">
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {!loading && data && (

                <>

                    {/* PARTIAL DATA WARNING */}

                    {data.errors.length > 0 && (
                        <div className="rp-alert">

                            <AlertTriangle size={21} />

                            <div>
                                <strong>
                                    Some report sections are unavailable.
                                </strong>

                                {data.errors.map(item => (
                                    <p key={item.section}>
                                        {item.section}: {item.message}
                                    </p>
                                ))}
                            </div>

                        </div>
                    )}

                    {(
                        data.loans?.complete === false ||
                        data.reservations?.complete === false
                    ) && (
                        <div className="rp-alert">

                            <AlertTriangle size={20} />

                            Reports contain partial records.
                            Counts and exports may not represent
                            the entire library.

                        </div>
                    )}

                    {/* STATS */}

                    <section className="rp-stats">

                        {stats.map(item => (
                            <StatCard
                                key={item.title}
                                {...item}
                            />
                        ))}

                    </section>

                    {/* OVERDUE ALERT */}

                    {!invalidDates &&
                        overdueLoans.length > 0 && (

                        <div className="rp-overdue-alert">

                            <AlertTriangle size={25} />

                            <div>

                                <strong>
                                    {overdueLoans.length} overdue loans
                                    require attention
                                </strong>

                                <p>
                                    Based on the selected loan records.
                                </p>

                            </div>

                            <Link
                                className="rp-secondary"
                                to="/admin/loans"
                            >
                                Manage loans
                                <ArrowUpRight size={16} />
                            </Link>

                        </div>
                    )}

                    {/* CIRCULATION ANALYTICS */}

                    <div className="rp-grid">

                        <ReportPanel
                            title="Monthly borrowing"
                            description="Six months ending in selected end month"
                            icon={BarChart3}
                            link="/admin/loans"
                        >

                            {loansAvailable && !invalidDates
                                ? (
                                    <MonthlyChart
                                        loans={filteredLoans}
                                        endDate={toDate}
                                    />
                                )
                                : (
                                    <div className="rp-empty">
                                        Loan report unavailable.
                                    </div>
                                )
                            }

                        </ReportPanel>

                        <ReportPanel
                            title="Circulation overview"
                            description={loanScope}
                            icon={ArrowLeftRight}
                            link="/admin/loans"
                        >

                            {loansAvailable && !invalidDates
                                ? (
                                    <>
                                        <BarChart
                                            items={circulationStats}
                                        />

                                        <div className="rp-return-rate">

                                            <CheckCircle2 size={23} />

                                            <div>
                                                <span>Return rate</span>

                                                <strong>
                                                    {filteredLoans.length
                                                        ? `${returnRate.toFixed(1)}%`
                                                        : "—"}
                                                </strong>
                                            </div>

                                        </div>
                                    </>
                                )
                                : (
                                    <div className="rp-empty">
                                        Circulation report unavailable.
                                    </div>
                                )
                            }

                        </ReportPanel>

                    </div>

                    {/* FINANCE AND POPULAR BOOKS */}

                    <div className="rp-grid">

                        <ReportPanel
                            title="Fine collection"
                            description="All-time financial summary"
                            icon={IndianRupee}
                            link="/admin/fines"
                        >

                            <FineChart fines={data.fines} />

                        </ReportPanel>

                        <ReportPanel
                            title="Most borrowed books"
                            description="Top 5 in selected loan records"
                            icon={BookOpen}
                            link="/admin/books"
                        >

                            {popularBooks.length > 0 ? (

                                <div className="rp-popular-books">

                                    {popularBooks.map((book, index) => (

                                        <div
                                            className="rp-popular-row"
                                            key={`${book.title}-${index}`}
                                        >

                                            <div className="rp-rank">
                                                {String(index + 1)
                                                    .padStart(2, "0")}
                                            </div>

                                            <div className="rp-popular-info">

                                                <strong>{book.title}</strong>

                                                <div className="rp-bar-track">

                                                    <div
                                                        className="rp-bar-fill"
                                                        style={{
                                                            width: `${
                                                                book.count /
                                                                popularBooks[0].count *
                                                                100
                                                            }%`,
                                                            background: COLORS.purple,
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                            <span>
                                                {book.count} loans
                                            </span>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <div className="rp-empty">
                                    <BookOpen size={35} />
                                    No borrowing records available.
                                </div>

                            )}

                        </ReportPanel>

                    </div>

                    {/* RESERVATIONS AND SUPPORT */}

                    <div className="rp-grid">

                        <ReportPanel
                            title="Reservation analytics"
                            description={
                                data.reservations?.complete
                                    ? "All-time reservation status"
                                    : "Loaded reservation records"
                            }
                            icon={Bookmark}
                            link="/admin/reservations"
                        >

                            <BarChart items={reservationStats} />

                        </ReportPanel>

                        <ReportPanel
                            title="Support analytics"
                            description="All-time support ticket status"
                            icon={Headset}
                            link="/admin/support"
                        >

                            <BarChart items={supportStats} />

                        </ReportPanel>

                    </div>

                    {/* OVERDUE REPORT TABLE */}

                    <ReportPanel
                        title="Overdue loan report"
                        description="Up to 8 earliest due dates from selected records"
                        icon={AlertTriangle}
                        link="/admin/loans"
                    >

                        {!loansAvailable || invalidDates ? (

                            <div className="rp-empty">
                                Overdue report unavailable.
                            </div>

                        ) : overduePreview.length === 0 ? (

                            <div className="rp-empty">

                                <CheckCircle2 size={40} />

                                <h3>No overdue loans found</h3>

                                <p>
                                    No overdue loans in the selected records.
                                </p>

                            </div>

                        ) : (

                            <div className="rp-table-wrapper">

                                <table className="rp-table">

                                    <thead>
                                        <tr>
                                            <th>Loan ID</th>
                                            <th>Book title</th>
                                            <th>Member</th>
                                            <th>Due date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {overduePreview.map(loan => (

                                            <tr key={loan.id}>

                                                <td>#{loan.id}</td>

                                                <td>
                                                    <strong>
                                                        {bookTitle(loan)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {memberName(loan)}
                                                </td>

                                                <td>
                                                    {formatReportDate(
                                                        loan.dueDate
                                                    )}
                                                </td>

                                                <td>
                                                    <span className="rp-status">
                                                        OVERDUE
                                                    </span>
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </ReportPanel>

                    {/* EXPORT REPORT */}

                    <section className="rp-export">

                        <div className="rp-export-icon">
                            <FileSpreadsheet size={32} />
                        </div>

                        <div className="rp-export-info">

                            <h3>Download library reports</h3>

                            <p>
                                Export available report data
                                as an Excel-compatible CSV file.
                            </p>

                            <small>
                                Loan exports follow the selected date range.
                                Fine summaries are all-time.
                            </small>

                        </div>

                        <div className="rp-export-actions">

                            <select
                                value={exportType}
                                onChange={event =>
                                    setExportType(event.target.value)
                                }
                                aria-label="Report type"
                            >
                                <option value="SUMMARY">
                                    Performance summary
                                </option>

                                <option value="LOANS">
                                    Loan report
                                </option>

                                <option value="OVERDUE">
                                    Overdue report
                                </option>

                                <option value="FINES">
                                    Fine summary
                                </option>
                            </select>

                            <button
                                className="rp-primary"
                                onClick={exportReport}
                                disabled={exportDisabled}
                            >
                                <Download size={18} />
                                Export CSV
                            </button>

                        </div>

                    </section>

                    {/* FOOTER */}

                    <footer className="rp-footer">

                        <span>
                            Smart Library Management System
                        </span>

                        <span>
                            Last refreshed: {
                                updatedAt
                                    ? updatedAt.toLocaleString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                    })
                                    : "—"
                            }
                        </span>

                    </footer>

                </>

            )}

            {!loading && !data && !error && (
                <div className="rp-panel rp-empty">
                    <Inbox size={40} />
                    No reports available.
                </div>
            )}

        </main>
    );
}