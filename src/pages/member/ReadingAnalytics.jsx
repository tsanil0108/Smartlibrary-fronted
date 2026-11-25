import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  BookOpen,
  LibraryBig,
  BookCheck,
  CheckCircle2,
  Clock,
  CalendarDays,
  TrendingUp,
  BarChart3,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  LoaderCircle,
  Sparkles,
  Heart,
  Bookmark,
  Wallet,
  ReceiptText,
  History,
  BookX,
  Layers,
} from "lucide-react";

import MonthlyReadingChart
  from "../../components/member/MonthlyReadingChart";

import CategoryDonutChart
  from "../../components/member/CategoryDonutChart";

import BookCover
  from "../../components/member/BookCover";

import {
  analyticsApi,
  formatAnalyticsDate,
  formatAnalyticsMoney,
  asAnalyticsList,
} from "../../services/analyticsApi";

import "../../styles/member/ReadingAnalytics.css";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  description,
}) {
  return (
    <article className="ra-stat">

      <div className={`ra-stat-icon ${color}`}>
        <Icon size={23} />
      </div>

      <span>{label}</span>

      <strong>{value ?? "—"}</strong>

      <small>{description}</small>

    </article>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
  color = "ra-purple",
  children,
}) {
  return (
    <div className="ra-section-heading">

      <div className={`ra-stat-icon ${color}`}>
        <Icon size={23} />
      </div>

      <div className="ra-section-title">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {children}

    </div>
  );
}

function EmptyState({
  icon: Icon = BookOpen,
  title,
  description,
  link,
  linkText,
}) {
  return (
    <div className="ra-empty">

      <div className="ra-empty-icon">
        <Icon size={32} />
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      {link && (
        <Link to={link} className="ra-outline">
          {linkText}
          <ArrowRight size={15} />
        </Link>
      )}

    </div>
  );
}

function LoanStatus({ status, overdue }) {
  const value = overdue
    ? "OVERDUE"
    : status || "UNKNOWN";

  return (
    <span
      className={`ra-status ra-status-${value.toLowerCase()}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function ReadingAnalytics() {
  const [dashboard, setDashboard] = useState(null);

  const [monthly, setMonthly] = useState([]);

  const [months, setMonths] = useState(6);

  const [loading, setLoading] = useState(true);

  const [chartLoading, setChartLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [chartError, setChartError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  /* MAIN DASHBOARD */

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const result =
          await analyticsApi.getDashboard();

        if (!result?.readingStats) {
          throw new Error(
            "Invalid dashboard response."
          );
        }

        if (!cancelled) {
          setDashboard(result);
        }

      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
            "Unable to load reading analytics."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };

  }, [reloadKey]);

  /* MONTHLY ACTIVITY */

  useEffect(() => {
    let cancelled = false;

    async function loadMonthly() {
      setChartLoading(true);
      setChartError("");

      try {
        const result =
          await analyticsApi.getMonthlyActivity(months);

        const list = asAnalyticsList(result);

        if (!cancelled) {
          setMonthly(list);
        }

      } catch (err) {
        if (!cancelled) {
          setChartError(
            err.message ||
            "Unable to load monthly activity."
          );
        }

      } finally {
        if (!cancelled) {
          setChartLoading(false);
        }
      }
    }

    loadMonthly();

    return () => {
      cancelled = true;
    };

  }, [months, reloadKey]);

  const stats = dashboard?.readingStats || {};

  const account = dashboard?.accountSummary || {};

  const categories = Array.isArray(
    dashboard?.favouriteCategories
  )
    ? dashboard.favouriteCategories
    : [];

  const recent = Array.isArray(
    dashboard?.recentActivity
  )
    ? dashboard.recentActivity
    : [];

  const upcoming = Array.isArray(
    dashboard?.upcomingReturns
  )
    ? dashboard.upcomingReturns
    : [];

  const recommendations = Array.isArray(
    dashboard?.recommendedBooks
  )
    ? dashboard.recommendedBooks
    : [];

  const returnRate =
    stats.returnRate == null
      ? "—"
      : `${Number(stats.returnRate).toFixed(1)}%`;

  const returnRateNumber = Math.min(
    100,
    Math.max(0, Number(stats.returnRate) || 0)
  );

  return (
    <div className="ra-page">

      {/* PAGE HEADER */}

      <header className="ra-header">

        <div>

          <span className="ra-eyebrow">
            <BarChart3 size={16} />
            READING INSIGHTS
          </span>

          <h1>Reading Analytics</h1>

          <p>
            Explore your reading habits, progress
            and library activity.
          </p>

        </div>

        <button
          type="button"
          className="ra-outline"
          disabled={loading}
          onClick={() =>
            setReloadKey((previous) => previous + 1)
          }
        >
          <RefreshCw
            size={17}
            className={loading ? "ra-spin" : ""}
          />
          Refresh analytics
        </button>

      </header>

      {/* HERO */}

      <section className="ra-hero">

        <div className="ra-hero-content">

          <span>YOUR READING JOURNEY</span>

          <h2>Read more. Grow more.</h2>

          <p>
            {dashboard?.memberName
              ? `${dashboard.memberName}, every book you read opens a new world of possibilities.`
              : "Every book you read opens a new world of possibilities."}
          </p>

          <Link
            to="/member/books"
            className="ra-hero-button"
          >
            Explore more books
            <ArrowRight size={17} />
          </Link>

        </div>

        <div
          className="ra-hero-art"
          aria-hidden="true"
        >

          <div className="ra-art-circle" />

          <div className="ra-art-book ra-book-one">
            <BookOpen size={35} />
          </div>

          <div className="ra-art-book ra-book-two">
            <Layers size={28} />
          </div>

          <div className="ra-art-book ra-book-three">
            <BookCheck size={30} />
          </div>

          <div className="ra-art-trend">
            <TrendingUp size={39} />
          </div>

        </div>

      </section>

      {/* LOADING */}

      {loading ? (

        <section className="ra-panel ra-loading">

          <LoaderCircle
            size={42}
            className="ra-spin"
          />

          <h3>Loading your reading insights...</h3>

          <p>
            Please wait while we fetch your activity.
          </p>

        </section>

      ) : error ? (

        <section className="ra-panel ra-loading">

          <AlertCircle size={42} />

          <h3>Unable to load analytics</h3>

          <p role="alert">{error}</p>

          <button
            type="button"
            className="ra-primary"
            onClick={() =>
              setReloadKey(
                (previous) => previous + 1
              )
            }
          >
            <RefreshCw size={16} />
            Try again
          </button>

        </section>

      ) : (

        <>

          {/* PRIMARY STATISTICS */}

          <section className="ra-stats">

            <StatCard
              icon={BookOpen}
              label="Total borrowed"
              value={stats.totalBorrowed}
              color="ra-purple"
              description="All-time borrowing"
            />

            <StatCard
              icon={CheckCircle2}
              label="Returned books"
              value={stats.returnedBooks}
              color="ra-green"
              description="Successfully returned"
            />

            <StatCard
              icon={LibraryBig}
              label="Active loans"
              value={stats.activeLoans}
              color="ra-orange"
              description="Currently borrowed"
            />

            <StatCard
              icon={TrendingUp}
              label="Return rate"
              value={returnRate}
              color="ra-blue"
              description="Overall return percentage"
            />

          </section>

          {/* SECONDARY STATISTICS */}

          <section className="ra-mini-stats">

            <div>
              <BookCheck size={22} />

              <span>
                Unique books
                <strong>
                  {stats.uniqueBooksBorrowed ?? "—"}
                </strong>
              </span>
            </div>

            <div>
              <Clock size={22} />

              <span>
                Due soon
                <strong>
                  {stats.dueSoonBooks ?? "—"}
                </strong>
              </span>
            </div>

            <div>
              <AlertCircle size={22} />

              <span>
                Overdue books
                <strong>
                  {stats.overdueBooks ?? "—"}
                </strong>
              </span>
            </div>

            <div>
              <BookX size={22} />

              <span>
                Lost books
                <strong>
                  {stats.lostBooks ?? "—"}
                </strong>
              </span>
            </div>

          </section>

          {/* ANALYTICS CHARTS */}

          <section className="ra-chart-grid">

            <MonthlyReadingChart
              data={monthly}
              months={months}
              loading={chartLoading}
              error={chartError}
              onMonthsChange={setMonths}
            />

            <CategoryDonutChart
              data={categories}
            />

          </section>

          {/* UPCOMING RETURNS & RETURN RATE */}

          <section className="ra-middle-grid">

            <div className="ra-panel">

              <SectionHeading
                icon={CalendarDays}
                title="Upcoming returns"
                description="Keep track of your book due dates."
                color="ra-orange"
              >
                <Link
                  to="/member/loans"
                  className="ra-text-link"
                >
                  View loans
                  <ArrowRight size={15} />
                </Link>
              </SectionHeading>

              {!upcoming.length ? (

                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming returns"
                  description="You have no active book returns to display."
                />

              ) : (

                <div className="ra-upcoming-list">

                  {upcoming.map((item) => {

                    const days =
                      Number(item.daysRemaining);

                    const overdue =
                      item.overdue === true ||
                      (
                        item.daysRemaining != null &&
                        days < 0
                      );

                    const dueText = overdue
                      ? (
                          Number.isFinite(days) &&
                          days < 0
                            ? `${Math.abs(days)} days overdue`
                            : "Overdue"
                        )
                      : item.daysRemaining == null
                        ? "Check due date"
                        : days === 0
                          ? "Due today"
                          : `${days} ${days === 1 ? "day" : "days"} left`;

                    return (
                      <article
                        key={item.loanId}
                        className="ra-upcoming-item"
                      >

                        <div className="ra-book-icon">
                          <BookOpen size={24} />
                        </div>

                        <div className="ra-upcoming-info">

                          <Link
                            to={`/books/${item.bookId}`}
                          >
                            {item.bookTitle}
                          </Link>

                          <span>{item.author}</span>

                          <small>
                            Due:{" "}
                            {formatAnalyticsDate(
                              item.dueDate
                            )}
                          </small>

                        </div>

                        <span
                          className={`ra-due ${
                            overdue
                              ? "ra-due-danger"
                              : "ra-due-warning"
                          }`}
                        >
                          {dueText}
                        </span>

                      </article>
                    );
                  })}

                </div>

              )}

            </div>

            {/* RETURN PERFORMANCE */}

            <div className="ra-panel">

              <SectionHeading
                icon={TrendingUp}
                title="Return performance"
                description="Your overall borrowing record."
                color="ra-green"
              />

              <div className="ra-performance">

                <svg
                  viewBox="0 0 180 180"
                  role="img"
                  aria-label={`Return rate ${returnRate}`}
                >

                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="#eeeaf5"
                    strokeWidth="14"
                  />

                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="#6339ef"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${
                      439.823 * returnRateNumber / 100
                    } 439.823`}
                    transform="rotate(-90 90 90)"
                  />

                  <text
                    x="90"
                    y="88"
                    textAnchor="middle"
                    className="ra-ring-value"
                  >
                    {returnRate}
                  </text>

                  <text
                    x="90"
                    y="108"
                    textAnchor="middle"
                    className="ra-ring-label"
                  >
                    Return rate
                  </text>

                </svg>

                <p>
                  {stats.totalBorrowed > 0
                    ? `${stats.returnedBooks ?? 0} of ${stats.totalBorrowed} borrowed books returned.`
                    : "Your return statistics will appear after borrowing books."}
                </p>

              </div>

              <div className="ra-performance-footer">

                <CheckCircle2 size={20} />

                <span>
                  Return books before their due date
                  to maintain a good borrowing record.
                </span>

              </div>

            </div>

          </section>

          {/* ACCOUNT SUMMARY */}

          <section className="ra-panel">

            <SectionHeading
              icon={Wallet}
              title="Your library account"
              description="A quick overview of your account activity."
            />

            <div className="ra-account-grid">

              <Link
                to="/member/wishlist"
                className="ra-account-card"
              >
                <div className="ra-stat-icon ra-pink">
                  <Heart size={22} />
                </div>

                <span>Wishlist books</span>

                <strong>
                  {account.wishlistCount ?? "—"}
                </strong>

                <ArrowRight size={16} />
              </Link>

              <Link
                to="/member/reservations"
                className="ra-account-card"
              >
                <div className="ra-stat-icon ra-purple">
                  <Bookmark size={22} />
                </div>

                <span>Waiting reservations</span>

                <strong>
                  {account.waitingReservations ?? "—"}
                </strong>

                <ArrowRight size={16} />
              </Link>

              <Link
                to="/member/reservations"
                className="ra-account-card"
              >
                <div className="ra-stat-icon ra-green">
                  <BookCheck size={22} />
                </div>

                <span>Ready reservations</span>

                <strong>
                  {account.readyReservations ?? "—"}
                </strong>

                <ArrowRight size={16} />
              </Link>

              <Link
                to="/member/fines"
                className="ra-account-card"
              >
                <div className="ra-stat-icon ra-orange">
                  <Wallet size={22} />
                </div>

                <span>Pending fines</span>

                <strong>
                  {account.pendingFineAmount == null
                    ? "—"
                    : formatAnalyticsMoney(
                        account.pendingFineAmount
                      )}
                </strong>

                <small>
                  {account.pendingFineCount ?? 0} fines
                </small>

                <ArrowRight size={16} />
              </Link>

              <Link
                to="/member/payments"
                className="ra-account-card"
              >
                <div className="ra-stat-icon ra-blue">
                  <ReceiptText size={22} />
                </div>

                <span>Transactions</span>

                <strong>
                  {account.paymentCount ?? "—"}
                </strong>

                <ArrowRight size={16} />
              </Link>

            </div>

          </section>

          {/* READING HISTORY */}

          <section className="ra-panel">

            <SectionHeading
              icon={History}
              title="Recent reading activity"
              description="Your latest borrowing and return records."
            >
              <Link
                to="/member/loans"
                className="ra-text-link"
              >
                Full history
                <ArrowRight size={15} />
              </Link>
            </SectionHeading>

            {!recent.length ? (

              <EmptyState
                icon={History}
                title="No reading history"
                description="Your borrowed books will appear here."
                link="/member/books"
                linkText="Browse books"
              />

            ) : (

              <div className="ra-table-scroll">

                <table className="ra-table">

                  <thead>
                    <tr>
                      <th>Book details</th>
                      <th>Borrowed on</th>
                      <th>Due date</th>
                      <th>Returned on</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {recent.map((item) => (

                      <tr key={item.loanId}>

                        <td>

                          <div className="ra-table-book">

                            <div className="ra-book-icon">
                              <BookOpen size={21} />
                            </div>

                            <div>

                              <Link
                                to={`/books/${item.bookId}`}
                              >
                                {item.bookTitle}
                              </Link>

                              <span>{item.author}</span>

                            </div>

                          </div>

                        </td>

                        <td>
                          {formatAnalyticsDate(
                            item.issueDate
                          )}
                        </td>

                        <td>
                          {formatAnalyticsDate(
                            item.dueDate
                          )}
                        </td>

                        <td>
                          {formatAnalyticsDate(
                            item.returnedAt
                          )}
                        </td>

                        <td>
                          <LoanStatus
                            status={item.status}
                            overdue={item.overdue}
                          />
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>

          {/* PERSONALIZED RECOMMENDATIONS */}

          <section className="ra-panel">

            <SectionHeading
              icon={Sparkles}
              title="Recommended for you"
              description="Discover books selected from your reading interests."
              color="ra-orange"
            >
              <Link
                to="/member/books"
                className="ra-text-link"
              >
                Explore all
                <ArrowRight size={15} />
              </Link>
            </SectionHeading>

            {!recommendations.length ? (

              <EmptyState
                icon={Sparkles}
                title="Discover your next book"
                description="More recommendations will appear as suitable books become available."
                link="/member/books"
                linkText="Explore catalogue"
              />

            ) : (

              <div className="ra-recommendations">

                {recommendations.map((book) => {

                  const available =
                    Number(book.availableCopies) > 0;

                  return (
                    <article
                      key={book.bookId}
                      className="ra-recommendation"
                    >

                      <Link
                        to={`/books/${book.bookId}`}
                        className="ra-cover-link"
                      >
                        <BookCover
                          book={{
                            ...book,
                            id: book.bookId,
                          }}
                        />
                      </Link>

                      <div className="ra-recommendation-body">

                        <span className="ra-category">
                          {book.categoryName || "Library"}
                        </span>

                        <Link
                          to={`/books/${book.bookId}`}
                          className="ra-book-title"
                        >
                          {book.title}
                        </Link>

                        <p>{book.author}</p>

                        <div className="ra-reason">
                          <Sparkles size={14} />

                          <span>
                            {book.recommendationReason ||
                              "Recommended reading"}
                          </span>
                        </div>

                        <span
                          className={`ra-availability ${
                            available
                              ? "ra-available"
                              : "ra-unavailable"
                          }`}
                        >
                          <span />

                          {available
                            ? `${book.availableCopies} available`
                            : "Currently unavailable"}
                        </span>

                        <Link
                          to={`/books/${book.bookId}`}
                          className="ra-book-button"
                        >
                          View book
                          <ArrowRight size={15} />
                        </Link>

                      </div>

                    </article>
                  );
                })}

              </div>

            )}

          </section>

        </>

      )}

    </div>
  );
}