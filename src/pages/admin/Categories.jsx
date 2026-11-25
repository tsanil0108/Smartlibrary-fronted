import React, {
    useState,
    useEffect,
    useCallback,
} from "react";

import {
    FolderOpen,
    FolderPlus,
    BookOpen,
    LibraryBig,
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    Layers,
    Code2,
    FlaskConical,
    History,
    Globe,
    BriefcaseBusiness,
    GraduationCap,
    BookMarked,
    Palette,
    Heart,
} from "lucide-react";

import { categoryApi } from "../../services/categoryApi";

import "../../styles/admin/Categories.css";

const colors = [
    "purple",
    "blue",
    "green",
    "orange",
    "pink",
    "teal",
];

function getCategoryIcon(name = "") {

    const value = name.toLowerCase();

    if (/programming|computer|technology|coding/.test(value))
        return Code2;

    if (/science|physics|chemistry/.test(value))
        return FlaskConical;

    if (/history/.test(value))
        return History;

    if (/geography|travel/.test(value))
        return Globe;

    if (/business|finance|management/.test(value))
        return BriefcaseBusiness;

    if (/education|academic/.test(value))
        return GraduationCap;

    if (/fiction|novel|literature/.test(value))
        return BookMarked;

    if (/art|design/.test(value))
        return Palette;

    if (/health|medical/.test(value))
        return Heart;

    return FolderOpen;
}

// ADD / EDIT CATEGORY MODAL

function CategoryForm({
    category,
    onClose,
    onSaved,
}) {

    const [name, setName] = useState(category.name || "");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function submit(event) {

        event.preventDefault();

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        setSaving(true);
        setError("");

        try {

            const payload = {
                name: name.trim(),
            };

            if (category.id) {

                await categoryApi.updateCategory(
                    category.id,
                    payload
                );

            } else {

                await categoryApi.createCategory(payload);

            }

            onSaved(
                category.id
                    ? "Category updated successfully."
                    : "Category created successfully."
            );

        } catch (err) {

            setError(
                err.message || "Unable to save category."
            );

        } finally {

            setSaving(false);

        }
    }

    return (

        <div className="ct-overlay">

            <section
                className="ct-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ct-form-title"
            >

                <header className="ct-modal-header">

                    <div className="ct-icon ct-purple">
                        <FolderPlus size={25} />
                    </div>

                    <div>

                        <h2 id="ct-form-title">
                            {category.id
                                ? "Edit category"
                                : "Add new category"}
                        </h2>

                        <p>
                            Organize your library catalogue.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="ct-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <X size={21} />
                    </button>

                </header>

                <form onSubmit={submit}>

                    <div className="ct-modal-body">

                        {error && (

                            <div className="ct-message ct-error">
                                <AlertCircle size={18} />
                                {error}
                            </div>

                        )}

                        <label className="ct-field">

                            Category name *

                            <input
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Example: Programming"
                                required
                                maxLength={100}
                                disabled={saving}
                                autoFocus
                            />

                        </label>

                        <div className="ct-form-preview">

                            <div className="ct-icon ct-purple">
                                <FolderOpen size={25} />
                            </div>

                            <div>

                                <strong>
                                    {name.trim() || "Category name"}
                                </strong>

                                <p>Category preview</p>

                            </div>

                        </div>

                    </div>

                    <footer className="ct-modal-footer">

                        <button
                            type="button"
                            className="ct-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="ct-primary"
                            disabled={saving}
                        >

                            {saving ? (

                                <LoaderCircle
                                    size={17}
                                    className="ct-spin"
                                />

                            ) : (

                                <Save size={17} />

                            )}

                            {saving ? "Saving..." : "Save category"}

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );
}

// MAIN CATEGORY MANAGEMENT PAGE

export function Categories() {

    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("asc");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [form, setForm] = useState(null);

    const [selected, setSelected] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const loadCategories = useCallback(async () => {

        setLoading(true);
        setError("");

        try {

            const data = await categoryApi.getCategories();

            setCategories(
                Array.isArray(data)
                    ? data
                    : data?.content || []
            );

        } catch (err) {

            setError(
                err.message || "Unable to load categories."
            );

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadCategories();

    }, [loadCategories]);

    async function confirmDelete() {

        if (!selected || deleting) return;

        setDeleting(true);
        setDeleteError("");

        try {

            await categoryApi.deleteCategory(selected.id);

            setSelected(null);

            setMessage("Category deleted successfully.");

            await loadCategories();

        } catch (err) {

            setDeleteError(
                err.message || "Unable to delete category."
            );

        } finally {

            setDeleting(false);

        }
    }

    const filtered = categories

        .filter((item) =>
            item.name
                ?.toLowerCase()
                .includes(search.trim().toLowerCase())
        )

        .sort((a, b) => {

            return sort === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);

        });

    const stats = [

        {
            label: "Total categories",
            value: categories.length,
            icon: FolderOpen,
            color: "purple",
        },

        {
            label: "Matching categories",
            value: filtered.length,
            icon: Layers,
            color: "blue",
        },

        {
            label: "Catalogue organization",
            value: categories.length ? "Ready" : "Empty",
            icon: LibraryBig,
            color: "green",
        },

    ];

    return (

        <main className="ct-page">

            {/* PAGE HEADER */}

            <header className="ct-page-header">

                <div>

                    <span className="ct-eyebrow">
                        LIBRARY MANAGEMENT
                    </span>

                    <h1>Category Management</h1>

                    <p>
                        Organize and manage your book categories.
                    </p>

                </div>

                <div className="ct-header-actions">

                    <button
                        className="ct-secondary"
                        onClick={loadCategories}
                        disabled={loading}
                        aria-label="Refresh categories"
                    >

                        <RefreshCw
                            size={18}
                            className={loading ? "ct-spin" : ""}
                        />

                    </button>

                    <button
                        className="ct-primary"
                        onClick={() => setForm({ name: "" })}
                    >
                        <Plus size={19} />
                        Add category
                    </button>

                </div>

            </header>

            {/* HERO */}

            <section className="ct-hero">

                <div className="ct-hero-content">

                    <span>CATALOGUE ORGANIZATION</span>

                    <h2>
                        Every book has its place.
                    </h2>

                    <p>
                        Create meaningful categories and make
                        your library easier to explore.
                    </p>

                    <button
                        className="ct-orange-button"
                        onClick={() => setForm({ name: "" })}
                    >
                        <FolderPlus size={19} />
                        Create category
                    </button>

                </div>

                <div className="ct-hero-decoration">
                    <FolderOpen size={150} strokeWidth={0.8} />
                </div>

            </section>

            {/* STATISTICS */}

            <section className="ct-stats">

                {stats.map((item) => {

                    const Icon = item.icon;

                    return (

                        <article
                            className="ct-stat"
                            key={item.label}
                        >

                            <div className={`ct-icon ct-${item.color}`}>
                                <Icon size={24} />
                            </div>

                            <div>

                                <span>{item.label}</span>

                                <strong>
                                    {loading || error
                                        ? "—"
                                        : item.value}
                                </strong>

                            </div>

                        </article>

                    );

                })}

            </section>

            {/* SUCCESS MESSAGE */}

            {message && (

                <div className="ct-message ct-success" role="status">

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

            {/* CATEGORY PANEL */}

            <section className="ct-panel">

                <header className="ct-panel-header">

                    <div>

                        <h3>All categories</h3>

                        <p>
                            Manage the categories in your library.
                        </p>

                    </div>

                    <span className="ct-count">
                        {filtered.length} categories
                    </span>

                </header>

                {/* SEARCH AND SORT */}

                <div className="ct-filters">

                    <div className="ct-search">

                        <Search size={19} />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search categories..."
                            aria-label="Search categories"
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
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label="Sort categories"
                    >

                        <option value="asc">
                            Name: A to Z
                        </option>

                        <option value="desc">
                            Name: Z to A
                        </option>

                    </select>

                </div>

                {/* LOADING STATE */}

                {loading ? (

                    <div className="ct-empty">

                        <LoaderCircle
                            size={40}
                            className="ct-spin"
                        />

                        <h3>Loading categories...</h3>

                    </div>

                ) : error ? (

                    <div className="ct-empty">

                        <AlertCircle size={40} />

                        <h3>Unable to load categories</h3>

                        <p>{error}</p>

                        <button
                            className="ct-primary"
                            onClick={loadCategories}
                        >
                            Try again
                        </button>

                    </div>

                ) : filtered.length === 0 ? (

                    <div className="ct-empty">

                        <FolderOpen size={48} />

                        <h3>No categories found</h3>

                        <p>
                            {search
                                ? "Try a different search."
                                : "Create your first library category."}
                        </p>

                        <button
                            className="ct-primary"
                            onClick={() => setForm({ name: "" })}
                        >
                            <Plus size={18} />
                            Add category
                        </button>

                    </div>

                ) : (

                    /* CATEGORY GRID */

                    <div className="ct-grid">

                        {filtered.map((category) => {

                            const Icon = getCategoryIcon(category.name);

                            const color =
                                colors[
                                    Math.abs(Number(category.id) || 0)
                                    % colors.length
                                ];

                            return (

                                <article
                                    className="ct-card"
                                    key={category.id}
                                >

                                    <div className="ct-card-top">

                                        <div className={`ct-category-icon ct-${color}`}>
                                            <Icon size={29} />
                                        </div>

                                        <span className="ct-category-id">
                                            #{category.id}
                                        </span>

                                    </div>

                                    <div className="ct-card-content">

                                        <h3>{category.name}</h3>

                                        <div className="ct-card-description">

                                            <BookOpen size={15} />

                                            <span>
                                                Library category
                                            </span>

                                        </div>

                                    </div>

                                    <div className="ct-card-footer">

                                        <button
                                            className="ct-edit"
                                            onClick={() => setForm(category)}
                                        >
                                            <Pencil size={15} />
                                            Edit
                                        </button>

                                        <button
                                            className="ct-delete"
                                            onClick={() => {
                                                setSelected(category);
                                                setDeleteError("");
                                            }}
                                        >
                                            <Trash2 size={15} />
                                            Delete
                                        </button>

                                    </div>

                                </article>

                            );

                        })}

                        {/* ADD NEW CATEGORY CARD */}

                        <button
                            className="ct-add-card"
                            onClick={() => setForm({ name: "" })}
                        >

                            <div className="ct-add-icon">
                                <Plus size={30} />
                            </div>

                            <strong>Add new category</strong>

                            <span>
                                Expand your library catalogue
                            </span>

                        </button>

                    </div>

                )}

            </section>

            {/* ADD / EDIT MODAL */}

            {form && (

                <CategoryForm
                    key={form.id || "new"}
                    category={form}
                    onClose={() => setForm(null)}
                    onSaved={(text) => {

                        setForm(null);
                        setMessage(text);
                        loadCategories();

                    }}
                />

            )}

            {/* DELETE CONFIRMATION */}

            {selected && (

                <div className="ct-overlay">

                    <section
                        className="ct-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ct-delete-title"
                    >

                        <div className="ct-modal-body">

                            <div className="ct-icon ct-red">
                                <Trash2 size={25} />
                            </div>

                            <h2 id="ct-delete-title">
                                Delete category?
                            </h2>

                            <p className="ct-delete-text">

                                Are you sure you want to delete{" "}

                                <strong>{selected.name}</strong>?

                                This action cannot be undone.

                            </p>

                            <div className="ct-warning">

                                <AlertCircle size={19} />

                                <span>
                                    Categories associated with existing
                                    books may not be eligible for deletion.
                                </span>

                            </div>

                            {deleteError && (

                                <div className="ct-message ct-error">
                                    <AlertCircle size={18} />
                                    {deleteError}
                                </div>

                            )}

                        </div>

                        <footer className="ct-modal-footer">

                            <button
                                className="ct-secondary"
                                onClick={() => setSelected(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="ct-danger"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >

                                {deleting ? (

                                    <LoaderCircle
                                        size={17}
                                        className="ct-spin"
                                    />

                                ) : (

                                    <Trash2 size={17} />

                                )}

                                {deleting
                                    ? "Deleting..."
                                    : "Delete category"}

                            </button>

                        </footer>

                    </section>

                </div>

            )}

        </main>

    );

}