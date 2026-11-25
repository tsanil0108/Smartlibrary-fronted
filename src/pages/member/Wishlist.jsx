import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Heart,
  BookOpen,
  Clock,
  Search,
  Plus,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";

import BookCard from "../../components/member/BookCard";

import { wishlistApi } from "../../services/wishlistApi";
import { bookApi } from "../../services/bookApi";

import "../../styles/member/Wishlist.css";

function isAvailable(book) {
  return Number(book.availableCopies ?? 0) > 0 ||
    (
      book.availableCopies == null &&
      book.available === true
    );
}

export default function Wishlist() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [removing, setRemoving] = useState(null);
  const [reserving, setReserving] = useState(null);

  async function loadWishlist() {
    setLoading(true);
    setError("");

    try {
      const data = await wishlistApi.getWishlist();

      const records = Array.isArray(data)
        ? data
        : data?.content;

      if (!Array.isArray(records)) {
        throw new Error("Invalid wishlist response.");
      }

      setBooks(records);
    } catch (err) {
      setError(
        err.message || "Unable to load wishlist."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => setNotice(null),
      4000
    );

    return () => clearTimeout(timer);
  }, [notice]);

  const availableCount = books.filter(
    isAvailable
  ).length;

  const stats = [
    {
      label: "Saved books",
      value: books.length,
      icon: Heart,
      color: "purple",
    },
    {
      label: "Available now",
      value: availableCount,
      icon: BookOpen,
      color: "green",
    },
    {
      label: "Unavailable",
      value: books.length - availableCount,
      icon: Clock,
      color: "orange",
    },
  ];

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch = [
        book.title,
        book.author,
        book.isbn,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

      const available = isAvailable(book);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "AVAILABLE" && available) ||
        (filter === "UNAVAILABLE" && !available);

      return matchesSearch && matchesFilter;
    });
  }, [books, search, filter]);

  async function removeBook(book) {
    if (removing !== null) return;

    const bookId = book.bookId;

    setRemoving(bookId);

    try {
      await wishlistApi.removeBook(bookId);

      setBooks((previous) =>
        previous.filter(
          (item) => item.bookId !== bookId
        )
      );

      setNotice({
        type: "success",
        message: "Book removed from your wishlist.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message,
      });
    } finally {
      setRemoving(null);
    }
  }

  async function reserveBook(book) {
    if (reserving !== null) return;

    setReserving(book.bookId);

    try {
      await bookApi.reserveBook(book.bookId);

      setNotice({
        type: "success",
        message: "Book reserved successfully.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message,
      });
    } finally {
      setReserving(null);
    }
  }

  function openBook(book) {
    navigate(`/books/${book.bookId}`);
  }

  return (
    <div className="wl-page">

      <header className="wl-header">

        <div>
          <span className="wl-eyebrow">
            <Heart size={15} />
            PERSONAL COLLECTION
          </span>

          <h1>My Wishlist</h1>

          <p>
            Save your favourite books and plan
            your next reading adventure.
          </p>
        </div>

        <Link
          to="/member/books"
          className="wl-primary"
        >
          <Plus size={18} />
          Explore books
        </Link>

      </header>

      <section className="wl-hero">

        <div className="wl-hero-content">
          <span>YOUR READING BUCKET LIST</span>

          <h2>
            Save today.
            <br />
            <em>Read tomorrow.</em>
          </h2>

          <p>
            Keep the books you love in one place
            and discover your next great read.
          </p>
        </div>

        <div className="wl-hero-art" aria-hidden="true">

          <div className="wl-art-circle" />

          <div className="wl-art-book">
            <BookOpen size={65} />
          </div>

          <div className="wl-art-heart">
            <Heart size={43} fill="currentColor" />
          </div>

        </div>

      </section>

      <section className="wl-stats">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="wl-stat-card"
              key={stat.label}
            >
              <div className={`wl-stat-icon wl-${stat.color}`}>
                <Icon size={24} />
              </div>

              <div>
                <span>{stat.label}</span>

                <h2>
                  {loading
                    ? "..."
                    : error
                    ? "—"
                    : stat.value}
                </h2>
              </div>
            </article>
          );
        })}

      </section>

      {notice && (
        <div
          role="status"
          className={`wl-notice wl-${notice.type}`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}

          <span>{notice.message}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice(null)}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="wl-collection">

        <div className="wl-section-heading">

          <div>
            <h2>Your saved books</h2>

            <p>
              Your personal reading collection.
            </p>
          </div>

          <button
            type="button"
            className="wl-refresh"
            disabled={loading}
            onClick={loadWishlist}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        <div className="wl-filters">

          <div className="wl-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search saved books..."
              aria-label="Search wishlist"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={filter}
            aria-label="Filter wishlist"
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="ALL">
              All saved books
            </option>

            <option value="AVAILABLE">
              Available now
            </option>

            <option value="UNAVAILABLE">
              Unavailable
            </option>
          </select>

        </div>

        {loading ? (
          <div className="wl-empty">
            <LoaderCircle
              size={40}
              className="wl-spin"
            />

            <h3>Loading your wishlist...</h3>
          </div>
        ) : error ? (
          <div className="wl-empty">
            <AlertCircle size={45} />

            <h3>Unable to load wishlist</h3>

            <p>{error}</p>

            <button
              type="button"
              className="wl-primary"
              onClick={loadWishlist}
            >
              Try again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="wl-empty">

            <div className="wl-empty-icon">
              <Heart size={50} />

              <span>
                <BookOpen size={22} />
              </span>
            </div>

            <h3>Your wishlist is waiting</h3>

            <p>
              Found a book you love? Tap the heart
              icon on any book to save it here.
            </p>

            <Link
              to="/member/books"
              className="wl-primary"
            >
              Discover books
              <ArrowRight size={17} />
            </Link>

          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="wl-empty">
            <Search size={45} />

            <h3>No matching books</h3>

            <p>
              Try another search or change your filter.
            </p>

            <button
              type="button"
              className="wl-primary"
              onClick={() => {
                setSearch("");
                setFilter("ALL");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="wl-book-grid">

            {filteredBooks.map((book) => (
              <BookCard
                key={book.bookId}
                book={book}
                wishlisted={true}
                wishlistBusy={removing === book.bookId}
                actionBusy={reserving === book.bookId}
                onToggleWishlist={removeBook}
                onOpenBook={openBook}
                onReserve={reserveBook}
              />
            ))}

          </div>
        )}

      </section>

    </div>
  );
}