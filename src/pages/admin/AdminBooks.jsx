import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    BookOpen,
    BookPlus,
    LibraryBig,
    Layers,
    Search,
    Plus,
    Pencil,
    Archive,
    LayoutGrid,
    List,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    X,
    Save,
    LoaderCircle,
    ImageOff,
} from "lucide-react";

import { adminBookApi } from "../../services/adminBookApi";
import { Copies } from "./Copies";

import "../../styles/admin/AdminBooks.css";

const emptyBook = {
    title: "",
    author: "",
    isbn: "",
    categoryId: "",
    description: "",
    coverUrl: "",
    copies: 1,
    shelfLocation: "",
};

// BOOK COVER

function BookCover({ book }) {
    const [failed, setFailed] = useState(false);

    const isbn = book.isbn?.replace(/[\s-]/g, "");

    const src = book.coverUrl ||
        (isbn
            ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`
            : "");

    useEffect(() => {
        setFailed(false);
    }, [src]);

    return (
        <div className="ab-cover">
            {src && !failed ? (
                <img
                    src={src}
                    alt={book.title || "Book cover"}
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : (
                <div className="ab-cover-fallback">
                    <BookOpen size={30} />
                    <span>{book.title || "Book cover"}</span>
                </div>
            )}
        </div>
    );
}

// ADD / EDIT BOOK MODAL

function BookForm({ book, categories, onClose, onSaved }) {
    const [form, setForm] = useState({
        ...emptyBook,
        ...book,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function change(event) {
        const { name, value } = event.target;

        setForm((old) => ({
            ...old,
            [name]: value,
        }));
    }

    async function submit(event) {
        event.preventDefault();

        setError("");
        setSaving(true);

        const payload = {
            title: form.title.trim(),
            author: form.author.trim(),
            isbn: form.isbn?.trim() || null,
            categoryId: Number(form.categoryId),
            description: form.description?.trim() || "",
            coverUrl: form.coverUrl?.trim() || null,
        };

        if (!book.id) {
            payload.copies = Number(form.copies);
            payload.shelfLocation =
                form.shelfLocation?.trim() || "";
        }

        try {
            if (book.id) {
                await adminBookApi.updateBook(
                    book.id,
                    payload
                );
            } else {
                await adminBookApi.createBook(payload);
            }

            onSaved();
        } catch (err) {
            setError(err.message || "Unable to save book.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="ab-overlay">
            <section
                className="ab-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ab-form-title"
            >
                <header className="ab-modal-header">
                    <div className="ab-icon ab-purple">
                        <BookPlus size={25} />
                    </div>

                    <div>
                        <h2 id="ab-form-title">
                            {book.id ? "Edit book" : "Add new book"}
                        </h2>

                        <p>Manage your catalogue information.</p>
                    </div>

                    <button
                        type="button"
                        className="ab-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>
                </header>

                <form onSubmit={submit}>
                    <div className="ab-modal-body">

                        {error && (
                            <div className="ab-message ab-error">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="ab-form-grid">

                            <label>
                                Book title *
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={change}
                                    maxLength={255}
                                    required
                                    placeholder="Enter book title"
                                />
                            </label>

                            <label>
                                Author *
                                <input
                                    name="author"
                                    value={form.author}
                                    onChange={change}
                                    maxLength={180}
                                    required
                                    placeholder="Enter author name"
                                />
                            </label>

                            <label>
                                ISBN
                                <input
                                    name="isbn"
                                    value={form.isbn || ""}
                                    onChange={change}
                                    maxLength={20}
                                    placeholder="ISBN number"
                                />
                            </label>

                            <label>
                                Category *
                                <select
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={change}
                                    required
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {!book.id && (
                                <>
                                    <label>
                                        Initial copies
                                        <input
                                            type="number"
                                            name="copies"
                                            value={form.copies}
                                            onChange={change}
                                            min="0"
                                            max="100"
                                            required
                                        />
                                    </label>

                                    <label>
                                        Shelf location
                                        <input
                                            name="shelfLocation"
                                            value={form.shelfLocation}
                                            onChange={change}
                                            maxLength={60}
                                            placeholder="Example: A-01"
                                        />
                                    </label>
                                </>
                            )}

                            <label className="ab-full">
                                Description
                                <textarea
                                    name="description"
                                    value={form.description || ""}
                                    onChange={change}
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Write about this book..."
                                />
                            </label>

                            <label className="ab-full">
                                Cover image URL
                                <input
                                    type="url"
                                    name="coverUrl"
                                    value={form.coverUrl || ""}
                                    onChange={change}
                                    maxLength={500}
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </label>

                        </div>

                        <div className="ab-cover-preview">
                            <BookCover book={form} />

                            <div>
                                <h4>Book cover preview</h4>
                                <p>
                                    Uses the cover URL or ISBN
                                    when available.
                                </p>
                            </div>
                        </div>

                    </div>

                    <footer className="ab-modal-footer">
                        <button
                            type="button"
                            className="ab-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="ab-primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <LoaderCircle
                                    size={17}
                                    className="ab-spin"
                                />
                            ) : (
                                <Save size={17} />
                            )}

                            {saving ? "Saving..." : "Save book"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

// BOOK ACTION BUTTONS

function BookActions({ book, onEdit, onCopies, onArchive }) {
    return (
        <div className="ab-actions">
            <button
                className="ab-action ab-purple"
                onClick={() => onEdit(book)}
                title="Edit book"
                aria-label={`Edit ${book.title}`}
            >
                <Pencil size={16} />
            </button>

            <button
                className="ab-action ab-blue"
                onClick={() => onCopies(book)}
                title="Manage copies"
                aria-label={`Manage copies of ${book.title}`}
            >
                <Layers size={17} />
            </button>

            <button
                className="ab-action ab-red"
                onClick={() => onArchive(book)}
                title="Archive book"
                aria-label={`Archive ${book.title}`}
            >
                <Archive size={17} />
            </button>
        </div>
    );
}

// MAIN ADMIN BOOK PAGE

export function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(null);

    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [view, setView] = useState("table");

    const [edit, setEdit] = useState(null);
    const [copies, setCopies] = useState(null);
    const [archive, setArchive] = useState(null);
    const [archiving, setArchiving] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [message, setMessage] = useState("");

    const [refresh, setRefresh] = useState(0);

    const pageSize = 10;

    const reload = useCallback(() => {
        setRefresh((value) => value + 1);
    }, []);

    useEffect(() => {
        let active = true;

        adminBookApi.getCategories()
            .then((data) => {
                if (active) {
                    setCategories(data || []);
                    setCategoryError("");
                }
            })
            .catch((err) => {
                if (active) setCategoryError(err.message);
            });

        return () => {
            active = false;
        };
    }, [refresh]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(search);
            setPage(0);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

        adminBookApi.getBooks({
            page,
            size: pageSize,
            q: query,
            category,
            status,
        })
            .then((data) => {
                if (!active) return;

                const pages = Number(data.totalPages || 0);

                if (page > 0 && page >= pages) {
                    setPage(Math.max(0, pages - 1));
                    return;
                }

                setBooks(data.content || []);
                setTotalPages(pages);
                setTotal(data.totalElements ?? data.total ?? null);
            })
            .catch((err) => {
                if (!active) return;

                setError(err.message);
                setBooks([]);
                setTotal(null);
                setTotalPages(0);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [page, query, category, status, refresh]);

    async function confirmArchive() {
        if (!archive || archiving) return;

        setArchiving(true);
        setError("");

        try {
            await adminBookApi.archiveBook(archive.id);

            setArchive(null);
            setMessage("Book archived successfully.");
            reload();
        } catch (err) {
            setError(err.message);
            setArchive(null);
        } finally {
            setArchiving(false);
        }
    }

    const totalCopies = books.reduce(
        (sum, book) => sum + Number(book.totalCopies || 0),
        0
    );

    const availableCopies = books.reduce(
        (sum, book) => sum + Number(book.availableCopies || 0),
        0
    );

    const stats = [
        {
            label: "Matching titles",
            value: total ?? "—",
            icon: LibraryBig,
            color: "purple",
        },
        {
            label: "Copies on this page",
            value: totalCopies,
            icon: Layers,
            color: "blue",
        },
        {
            label: "Available copies on page",
            value: availableCopies,
            icon: CheckCircle2,
            color: "green",
        },
        {
            label: "Unavailable copies on page",
            value: totalCopies - availableCopies,
            icon: BookOpen,
            color: "orange",
        },
    ];

    const actions = {
        onEdit: setEdit,
        onCopies: setCopies,
        onArchive: setArchive,
    };

    return (
        <main className="ab-page">

            {/* HEADER */}

            <header className="ab-page-header">
                <div>
                    <span className="ab-eyebrow">
                        LIBRARY MANAGEMENT
                    </span>

                    <h1>Book Management</h1>

                    <p>
                        Manage your library catalogue and inventory.
                    </p>
                </div>

                <div className="ab-header-actions">
                    <button
                        className="ab-secondary"
                        onClick={reload}
                        disabled={loading}
                        aria-label="Refresh books"
                    >
                        <RefreshCw
                            size={18}
                            className={loading ? "ab-spin" : ""}
                        />
                    </button>

                    <button
                        className="ab-primary"
                        onClick={() => setEdit({ ...emptyBook })}
                    >
                        <Plus size={19} />
                        Add book
                    </button>
                </div>
            </header>

            {/* HERO */}

            <section className="ab-hero">
                <div>
                    <span>CATALOGUE CONTROL</span>

                    <h2>Build a better library.</h2>

                    <p>
                        Organize books, manage physical copies
                        and monitor book availability.
                    </p>

                    <button
                        className="ab-orange-button"
                        onClick={() => setEdit({ ...emptyBook })}
                    >
                        <BookPlus size={19} />
                        Add new book
                    </button>
                </div>
            </section>

            {/* STATS */}

            <section className="ab-stats">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <article
                            className="ab-stat"
                            key={item.label}
                        >
                            <div className={`ab-icon ab-${item.color}`}>
                                <Icon size={24} />
                            </div>

                            <span>{item.label}</span>

                            <strong>
                                {loading ? "—" : item.value}
                            </strong>
                        </article>
                    );
                })}
            </section>

            {message && (
                <div className="ab-message ab-success" role="status">
                    <CheckCircle2 size={19} />
                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {error && (
                <div className="ab-message ab-error" role="alert">
                    <AlertCircle size={19} />
                    {error}
                </div>
            )}

            {categoryError && (
                <div className="ab-message ab-error">
                    Unable to load categories: {categoryError}
                </div>
            )}

            {/* CATALOGUE */}

            <section className="ab-panel">

                <div className="ab-panel-header">
                    <div>
                        <h3>All books</h3>
                        <p>Search and manage catalogue records.</p>
                    </div>

                    <div className="ab-view-switch">
                        <button
                            className={view === "table" ? "active" : ""}
                            onClick={() => setView("table")}
                            aria-label="Table view"
                            aria-pressed={view === "table"}
                        >
                            <List size={19} />
                        </button>

                        <button
                            className={view === "grid" ? "active" : ""}
                            onClick={() => setView("grid")}
                            aria-label="Grid view"
                            aria-pressed={view === "grid"}
                        >
                            <LayoutGrid size={19} />
                        </button>
                    </div>
                </div>

                {/* FILTERS */}

                <div className="ab-filters">

                    <div className="ab-search">
                        <Search size={19} />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, author, ISBN..."
                            aria-label="Search books"
                        />
                    </div>

                    <select
                        value={category}
                        aria-label="Filter category"
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">All categories</option>

                        {categories.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={status}
                        aria-label="Filter availability"
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">All availability</option>
                        <option value="available">Available only</option>
                    </select>

                    <button
                        className="ab-secondary"
                        onClick={() => {
                            setSearch("");
                            setQuery("");
                            setCategory("");
                            setStatus("");
                            setPage(0);
                        }}
                    >
                        Reset
                    </button>

                </div>

                {/* LOADING */}

                {loading ? (
                    <div className="ab-empty">
                        <LoaderCircle
                            size={40}
                            className="ab-spin"
                        />
                        <h3>Loading books...</h3>
                    </div>
                ) : error ? (
                    <div className="ab-empty">
                        <AlertCircle size={40} />
                        <h3>Unable to load books</h3>
                        <button className="ab-primary" onClick={reload}>
                            Try again
                        </button>
                    </div>
                ) : books.length === 0 ? (
                    <div className="ab-empty">
                        <ImageOff size={44} />
                        <h3>No books found</h3>
                        <p>Try another search or add a new book.</p>
                    </div>
                ) : view === "table" ? (

                    /* TABLE VIEW */

                    <div className="ab-table-wrapper">
                        <table className="ab-table">
                            <thead>
                                <tr>
                                    <th>Book details</th>
                                    <th>Category</th>
                                    <th>ISBN</th>
                                    <th>Available / Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {books.map((book) => (
                                    <tr key={book.id}>
                                        <td>
                                            <div className="ab-book-cell">
                                                <BookCover book={book} />

                                                <div>
                                                    <strong>{book.title}</strong>
                                                    <small>{book.author}</small>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{book.categoryName}</td>
                                        <td>{book.isbn || "—"}</td>

                                        <td>
                                            <strong>
                                                {book.availableCopies}
                                                {" / "}
                                                {book.totalCopies}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className={`ab-status ${
                                                book.availableCopies > 0
                                                    ? "ab-green"
                                                    : "ab-orange"
                                            }`}>
                                                {book.availableCopies > 0
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </td>

                                        <td>
                                            <BookActions
                                                book={book}
                                                {...actions}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                ) : (

                    /* GRID VIEW */

                    <div className="ab-book-grid">
                        {books.map((book) => (
                            <article className="ab-book-card" key={book.id}>

                                <BookCover book={book} />

                                <div className="ab-book-content">

                                    <span className="ab-category">
                                        {book.categoryName}
                                    </span>

                                    <h3>{book.title}</h3>

                                    <p>{book.author}</p>

                                    <small>
                                        {book.availableCopies} of{" "}
                                        {book.totalCopies} copies available
                                    </small>

                                    <BookActions
                                        book={book}
                                        {...actions}
                                    />

                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* PAGINATION */}

                {!loading && !error && totalPages > 0 && (
                    <div className="ab-pagination">
                        <span>
                            Showing {page * pageSize + 1}–
                            {page * pageSize + books.length}
                            {total != null ? ` of ${total} books` : ""}
                        </span>

                        <div>
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={19} />
                            </button>

                            <span className="ab-current-page">
                                {page + 1} / {totalPages}
                            </span>

                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                aria-label="Next page"
                            >
                                <ChevronRight size={19} />
                            </button>
                        </div>
                    </div>
                )}

            </section>

            {/* ADD / EDIT MODAL */}

            {edit && (
                <BookForm
                    key={edit.id || "new"}
                    book={edit}
                    categories={categories}
                    onClose={() => setEdit(null)}
                    onSaved={() => {
                        setEdit(null);
                        setMessage("Book saved successfully.");
                        reload();
                    }}
                />
            )}

            {/* PHYSICAL COPIES */}

            {copies && (
                <Copies
                    key={copies.id}
                    book={copies}
                    close={() => {
                        setCopies(null);
                        reload();
                    }}
                />
            )}

            {/* ARCHIVE CONFIRMATION */}

            {archive && (
                <div className="ab-overlay">
                    <section
                        className="ab-modal ab-small-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ab-archive-title"
                    >
                        <div className="ab-modal-body">
                            <div className="ab-icon ab-red">
                                <Archive size={25} />
                            </div>

                            <h2 id="ab-archive-title">Archive book?</h2>

                            <p>
                                Are you sure you want to archive{" "}
                                <strong>{archive.title}</strong>?
                            </p>

                            <p>
                                This will remove the book from the
                                active catalogue.
                            </p>
                        </div>

                        <footer className="ab-modal-footer">
                            <button
                                className="ab-secondary"
                                onClick={() => setArchive(null)}
                                disabled={archiving}
                            >
                                Cancel
                            </button>

                            <button
                                className="ab-danger"
                                onClick={confirmArchive}
                                disabled={archiving}
                            >
                                {archiving ? "Archiving..." : "Archive book"}
                            </button>
                        </footer>
                    </section>
                </div>
            )}

        </main>
    );
}