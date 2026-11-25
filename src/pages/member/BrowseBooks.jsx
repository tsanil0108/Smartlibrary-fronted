import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
    Search,
    BookOpen,
    Heart,
    Bookmark,
    LibraryBig,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from "lucide-react";

import { api } from "../../services/api";

import "../../styles/member/BrowseBooks.css";

export default function BrowseBooks() {

    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [availableOnly, setAvailableOnly] = useState(false);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [reload, setReload] = useState(0);

    // LOAD CATEGORIES AND WISHLIST

    useEffect(() => {

        api("/categories")
            .then(data => {
                setCategories(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );
            })
            .catch(err => setError(err.message));

        api("/member/wishlist")
            .then(data => {
                setWishlist(
                    Array.isArray(data)
                        ? data
                        : data?.content || []
                );
            })
            .catch(err => setError(err.message));

    }, []);

    // LOAD BOOKS

    useEffect(() => {

        let cancelled = false;

        setLoading(true);

        const timer = setTimeout(async () => {

            try {

                const params = new URLSearchParams({
                    page: String(page),
                    size: "12",
                });

                if (search.trim()) {
                    params.set("q", search.trim());
                }

                if (category) {
                    params.set("category", category);
                }

                if (availableOnly) {
                    params.set("onlyAvailable", "true");
                }

                const data = await api(
                    `/books?${params.toString()}`
                );

                if (cancelled) return;

                const rows = Array.isArray(data)
                    ? data
                    : data?.content || [];

                setBooks(rows);

                setTotalPages(
                    Math.max(1, data?.totalPages ?? 1)
                );

                setTotalBooks(
                    data?.totalElements ??
                    data?.total ??
                    rows.length
                );

            } catch (err) {

                if (!cancelled) {
                    setError(err.message);
                    setBooks([]);
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }
            }

        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };

    }, [
        page,
        search,
        category,
        availableOnly,
        reload,
    ]);

    function isWishlisted(bookId) {
        return wishlist.some(
            item => String(item.bookId) === String(bookId)
        );
    }

    // WISHLIST ACTION

    async function toggleWishlist(bookId) {

        if (busy !== null) return;

        setBusy(bookId);
        setError("");
        setMessage("");

        try {

            if (isWishlisted(bookId)) {

                await api(
                    `/member/wishlist/${bookId}`,
                    "DELETE"
                );

                setWishlist(previous =>
                    previous.filter(
                        item => String(item.bookId) !== String(bookId)
                    )
                );

                setMessage("Book removed from wishlist.");

            } else {

                await api(
                    `/member/wishlist/${bookId}`,
                    "POST"
                );

                setWishlist(previous => [
                    ...previous,
                    { bookId },
                ]);

                setMessage("Book added to wishlist.");
            }

        } catch (err) {

            setError(err.message);

        } finally {

            setBusy(null);
        }
    }

    // RESERVE BOOK

    async function reserveBook(bookId) {

        if (busy !== null) return;

        setBusy(bookId);
        setError("");
        setMessage("");

        try {

            await api(
                `/member/reservations/${bookId}`,
                "POST"
            );

            setMessage("Book reserved successfully.");

        } catch (err) {

            setError(err.message);

        } finally {

            setBusy(null);
        }
    }

    function getCover(book) {

        if (book.coverUrl) {
            return book.coverUrl;
        }

        if (book.isbn) {
            return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-M.jpg?default=false`;
        }

        return null;
    }

    return (
        <main className="bb-page">

            {/* PAGE HEADER */}

            <header className="bb-header">

                <div>
                    <span>EXPLORE OUR COLLECTION</span>

                    <h1>Browse Books</h1>

                    <p>
                        Discover your next favourite book.
                    </p>
                </div>

                <button
                    className="bb-refresh"
                    disabled={loading}
                    onClick={() => {
                        setError("");
                        setReload(value => value + 1);
                    }}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>

            </header>

            {/* HERO BANNER */}

            <section className="bb-hero">

                <div>

                    <span className="bb-hero-tag">
                        <LibraryBig size={16} />
                        SMART LIBRARY
                    </span>

                    <h2>
                        A world of knowledge,
                        <br />
                        waiting for you.
                    </h2>

                    <p>
                        Explore our library collection,
                        discover new authors and find
                        your next great read.
                    </p>

                    <Link
                        to="/member/wishlist"
                        className="bb-hero-button"
                    >
                        <Heart size={17} />
                        My Wishlist
                        <ArrowRight size={17} />
                    </Link>

                </div>

            </section>

            {/* SEARCH AND FILTERS */}

            <section className="bb-filters">

                <div className="bb-search">

                    <Search size={20} />

                    <input
                        type="search"
                        placeholder="Search title, author or ISBN..."
                        value={search}
                        onChange={event => {
                            setSearch(event.target.value);
                            setPage(0);
                        }}
                    />

                </div>

                <select
                    value={category}
                    onChange={event => {
                        setCategory(event.target.value);
                        setPage(0);
                    }}
                >

                    <option value="">
                        All Categories
                    </option>

                    {categories.map(item => (

                        <option
                            key={item.id}
                            value={item.name}
                        >
                            {item.name}
                        </option>

                    ))}

                </select>

                <label className="bb-checkbox">

                    <input
                        type="checkbox"
                        checked={availableOnly}
                        onChange={event => {
                            setAvailableOnly(
                                event.target.checked
                            );
                            setPage(0);
                        }}
                    />

                    Available only

                </label>

            </section>

            {/* MESSAGES */}

            {error && (
                <div className="bb-error">
                    {error}
                </div>
            )}

            {message && (
                <div className="bb-success">
                    {message}
                </div>
            )}

            {/* RESULTS HEADER */}

            <div className="bb-results">

                <div>
                    <h2>Library Collection</h2>

                    <p>{totalBooks} books found</p>
                </div>

            </div>

            {/* LOADING */}

            {loading ? (

                <div className="bb-empty">
                    <BookOpen size={45} />
                    <h3>Loading books...</h3>
                </div>

            ) : books.length === 0 ? (

                <div className="bb-empty">

                    <BookOpen size={45} />

                    <h3>No books found</h3>

                    <p>
                        Try another search or category.
                    </p>

                    <button
                        className="bb-primary"
                        onClick={() => {
                            setSearch("");
                            setCategory("");
                            setAvailableOnly(false);
                            setPage(0);
                        }}
                    >
                        Clear Filters
                    </button>

                </div>

            ) : (

                <section className="bb-grid">

                    {books.map(book => {

                        const available =
                            Number(book.availableCopies || 0) > 0;

                        const saved = isWishlisted(book.id);

                        const cover = getCover(book);

                        return (

                            <article
                                className="bb-card"
                                key={book.id}
                            >

                                {/* BOOK COVER */}

                                <div className="bb-cover">

                                    <div className="bb-placeholder">
                                        <BookOpen size={45} />
                                        <span>{book.title}</span>
                                    </div>

                                    {cover && (

                                        <img
                                            src={cover}
                                            alt={book.title}
                                            loading="lazy"
                                            onError={event => {
                                                event.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />

                                    )}

                                    <span
                                        className={`bb-status ${
                                            available
                                                ? "bb-available"
                                                : "bb-unavailable"
                                        }`}
                                    >
                                        {available
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>

                                    <button
                                        className={`bb-heart ${
                                            saved ? "bb-saved" : ""
                                        }`}
                                        aria-label={
                                            saved
                                                ? "Remove from wishlist"
                                                : "Add to wishlist"
                                        }
                                        disabled={busy !== null}
                                        onClick={() =>
                                            toggleWishlist(book.id)
                                        }
                                    >
                                        <Heart
                                            size={19}
                                            fill={
                                                saved
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    </button>

                                </div>

                                {/* BOOK INFORMATION */}

                                <div className="bb-card-body">

                                    <span className="bb-category">

                                        {book.categoryName ||
                                            book.category?.name ||
                                            (
                                                typeof book.category === "string"
                                                    ? book.category
                                                    : "General"
                                            )}

                                    </span>

                                    <h3 title={book.title}>
                                        {book.title}
                                    </h3>

                                    <p>
                                        {book.author || "Unknown author"}
                                    </p>

                                    <div className="bb-copies">

                                        <BookOpen size={15} />

                                        {book.availableCopies ?? 0}
                                        {" "}copies available

                                    </div>

                                    <div className="bb-actions">

                                        <Link
                                            className="bb-primary"
                                            to={`/books/${book.id}`}
                                        >
                                            View Details
                                            <ArrowRight size={15} />
                                        </Link>

                                        {!available && (

                                            <button
                                                className="bb-reserve"
                                                title="Reserve book"
                                                aria-label="Reserve book"
                                                disabled={busy !== null}
                                                onClick={() =>
                                                    reserveBook(book.id)
                                                }
                                            >
                                                <Bookmark size={18} />
                                            </button>

                                        )}

                                    </div>

                                </div>

                            </article>

                        );
                    })}

                </section>

            )}

            {/* PAGINATION */}

            {!loading && totalPages > 1 && (

                <div className="bb-pagination">

                    <button
                        disabled={page === 0}
                        onClick={() =>
                            setPage(value => value - 1)
                        }
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>

                    <span>
                        Page {page + 1} of {totalPages}
                    </span>

                    <button
                        disabled={page + 1 >= totalPages}
                        onClick={() =>
                            setPage(value => value + 1)
                        }
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>

                </div>

            )}

        </main>
    );
}