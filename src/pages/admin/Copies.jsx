import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    Layers,
    X,
    Plus,
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    PackageX,
    LoaderCircle,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import { adminBookApi } from "../../services/adminBookApi";

import "../../styles/admin/Copies.css";

const statuses = [
    "AVAILABLE",
    "BORROWED",
    "DAMAGED",
    "LOST",
];

export function Copies({ book, close }) {
    const [copies, setCopies] = useState([]);
    const [count, setCount] = useState(1);
    const [shelf, setShelf] = useState("");
    const [filter, setFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updating, setUpdating] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadCopies = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await adminBookApi.getCopies(book.id);

            setCopies(data || []);
        } catch (err) {
            setError(err.message || "Unable to load copies.");
        } finally {
            setLoading(false);
        }
    }, [book.id]);

    useEffect(() => {
        loadCopies();
    }, [loadCopies]);

    async function addCopies(event) {
        event.preventDefault();

        if (saving || updating !== null) return;

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await adminBookApi.addCopies(book.id, {
                count: Number(count),
                shelfLocation: shelf.trim(),
            });

            setCount(1);
            setShelf("");

            setMessage("New copies added successfully.");

            await loadCopies();
        } catch (err) {
            setError(err.message || "Unable to add copies.");
        } finally {
            setSaving(false);
        }
    }

    async function changeStatus(copy, status) {
        if (
            saving ||
            updating !== null ||
            copy.status === "BORROWED" ||
            status === "BORROWED" ||
            copy.status === status
        ) {
            return;
        }

        if (
            !window.confirm(
                `Change ${copy.accessionNo} status to ${status}?`
            )
        ) {
            return;
        }

        setUpdating(copy.id);
        setError("");
        setMessage("");

        try {
            const updated =
                await adminBookApi.updateCopyStatus(
                    copy.id,
                    status
                );

            setCopies((old) =>
                old.map((item) =>
                    item.id === copy.id
                        ? updated
                        : item
                )
            );

            setMessage("Copy status updated successfully.");
        } catch (err) {
            setError(err.message || "Unable to update status.");
        } finally {
            setUpdating(null);
        }
    }

    const available = copies.filter(
        (item) => item.status === "AVAILABLE"
    ).length;

    const borrowed = copies.filter(
        (item) => item.status === "BORROWED"
    ).length;

    const damaged = copies.filter(
        (item) => item.status === "DAMAGED"
    ).length;

    const lost = copies.filter(
        (item) => item.status === "LOST"
    ).length;

    const filteredCopies = filter
        ? copies.filter((item) => item.status === filter)
        : copies;

    const busy = saving || updating !== null;

    const stats = [
        {
            label: "Total copies",
            value: copies.length,
            icon: Layers,
            color: "purple",
        },
        {
            label: "Available",
            value: available,
            icon: CheckCircle2,
            color: "green",
        },
        {
            label: "Borrowed",
            value: borrowed,
            icon: BookOpen,
            color: "blue",
        },
        {
            label: "Damaged",
            value: damaged,
            icon: AlertTriangle,
            color: "orange",
        },
        {
            label: "Lost",
            value: lost,
            icon: PackageX,
            color: "red",
        },
    ];

    return (
        <div className="ac-overlay">

            <section
                className="ac-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ac-title"
            >

                {/* HEADER */}

                <header className="ac-header">

                    <div className="ac-icon ac-purple">
                        <Layers size={26} />
                    </div>

                    <div className="ac-heading">

                        <span>INVENTORY MANAGEMENT</span>

                        <h2 id="ac-title">Physical copies</h2>

                        <p>
                            {book.title} · {book.author}
                        </p>

                    </div>

                    <button
                        type="button"
                        className="ac-close"
                        onClick={close}
                        disabled={busy}
                        aria-label="Close copies"
                    >
                        <X size={23} />
                    </button>

                </header>

                <div className="ac-body">

                    {/* STATS */}

                    <div className="ac-stats">

                        {stats.map((item) => {

                            const Icon = item.icon;

                            return (
                                <div
                                    className="ac-stat"
                                    key={item.label}
                                >

                                    <div className={`ac-icon ac-${item.color}`}>
                                        <Icon size={21} />
                                    </div>

                                    <strong>
                                        {loading || error
                                            ? "—"
                                            : item.value}
                                    </strong>

                                    <span>{item.label}</span>

                                </div>
                            );
                        })}

                    </div>

                    {/* MESSAGES */}

                    {message && (
                        <div className="ac-message ac-green" role="status">
                            <CheckCircle2 size={19} />
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="ac-message ac-red" role="alert">
                            <AlertCircle size={19} />
                            {error}
                        </div>
                    )}

                    {/* ADD COPIES */}

                    <section className="ac-add-section">

                        <div className="ac-section-header">

                            <div>
                                <h3>Add physical copies</h3>

                                <p>
                                    Increase inventory for this book.
                                </p>
                            </div>

                        </div>

                        <form
                            className="ac-form"
                            onSubmit={addCopies}
                        >

                            <label>

                                Number of copies

                                <input
                                    type="number"
                                    value={count}
                                    onChange={(e) =>
                                        setCount(e.target.value)
                                    }
                                    min="1"
                                    max="100"
                                    required
                                    disabled={busy}
                                />

                            </label>

                            <label>

                                Shelf location

                                <input
                                    value={shelf}
                                    onChange={(e) =>
                                        setShelf(e.target.value)
                                    }
                                    placeholder="Example: A-01"
                                    maxLength={60}
                                    disabled={busy}
                                />

                            </label>

                            <button
                                className="ac-primary"
                                type="submit"
                                disabled={busy || loading}
                            >

                                {saving ? (
                                    <LoaderCircle
                                        size={18}
                                        className="ac-spin"
                                    />
                                ) : (
                                    <Plus size={18} />
                                )}

                                {saving ? "Adding..." : "Add copies"}

                            </button>

                        </form>

                    </section>

                    {/* INVENTORY TABLE */}

                    <section className="ac-inventory">

                        <div className="ac-section-header">

                            <div>

                                <h3>Copy inventory</h3>

                                <p>
                                    Manage individual physical copies.
                                </p>

                            </div>

                            <div className="ac-filter">

                                <select
                                    value={filter}
                                    onChange={(e) =>
                                        setFilter(e.target.value)
                                    }
                                    aria-label="Filter copy status"
                                >

                                    <option value="">All statuses</option>

                                    {statuses.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    ))}

                                </select>

                                <button
                                    type="button"
                                    className="ac-refresh"
                                    onClick={loadCopies}
                                    disabled={loading || busy}
                                    aria-label="Refresh copies"
                                >
                                    <RefreshCw
                                        size={18}
                                        className={loading ? "ac-spin" : ""}
                                    />
                                </button>

                            </div>

                        </div>

                        {loading ? (

                            <div className="ac-empty">

                                <LoaderCircle
                                    size={36}
                                    className="ac-spin"
                                />

                                <p>Loading physical copies...</p>

                            </div>

                        ) : filteredCopies.length === 0 ? (

                            <div className="ac-empty">

                                <Layers size={42} />

                                <h3>No copies found</h3>

                                <p>
                                    {error
                                        ? "Unable to retrieve inventory."
                                        : "Add copies or change the status filter."}
                                </p>

                            </div>

                        ) : (

                            <div className="ac-table-wrapper">

                                <table className="ac-table">

                                    <thead>

                                        <tr>
                                            <th>Accession number</th>
                                            <th>Shelf location</th>
                                            <th>Current status</th>
                                            <th>Update status</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {filteredCopies.map((copy) => (

                                            <tr key={copy.id}>

                                                <td>

                                                    <div className="ac-copy-id">

                                                        <div className="ac-icon ac-purple">
                                                            <BookOpen size={19} />
                                                        </div>

                                                        <strong>
                                                            {copy.accessionNo}
                                                        </strong>

                                                    </div>

                                                </td>

                                                <td>
                                                    {copy.shelfLocation || "—"}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `ac-status ac-status-${copy.status.toLowerCase()}`
                                                        }
                                                    >
                                                        {copy.status}
                                                    </span>

                                                </td>

                                                <td>

                                                    <select
                                                        value={copy.status}
                                                        disabled={
                                                            copy.status === "BORROWED" ||
                                                            busy
                                                        }
                                                        onChange={(e) =>
                                                            changeStatus(
                                                                copy,
                                                                e.target.value
                                                            )
                                                        }
                                                        aria-label={
                                                            `Status of ${copy.accessionNo}`
                                                        }
                                                    >

                                                        {statuses.map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                                disabled={
                                                                    status === "BORROWED"
                                                                }
                                                            >
                                                                {status}
                                                            </option>
                                                        ))}

                                                    </select>

                                                    {updating === copy.id && (
                                                        <LoaderCircle
                                                            size={15}
                                                            className="ac-spin"
                                                        />
                                                    )}

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                    <div className="ac-info">

                        <AlertCircle size={19} />

                        <p>
                            Borrowed copies cannot be manually updated.
                            Process the book return through circulation
                            management first.
                        </p>

                    </div>

                </div>

                <footer className="ac-footer">

                    <span>
                        Book ID: #{book.id}
                    </span>

                    <button
                        className="ac-primary"
                        onClick={close}
                        disabled={busy}
                    >
                        Done
                    </button>

                </footer>

            </section>

        </div>
    );
}