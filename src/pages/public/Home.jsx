import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  BookOpen,
  Search,
  ArrowRight,
  LibraryBig,
  Clock,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  FlaskConical,
  Code2,
  Landmark,
  CheckCircle2,
  Bookmark,
  ArrowUpRight,
  Users,
} from "lucide-react";

import { Catalogue } from "../public/Catalogue";

import "../../styles/public/Home.css";

const features = [
  {
    icon: BookOpen,
    title: "Discover new worlds",
    description:
      "Explore books across different genres and find your next favourite read.",
    color: "purple",
  },
  {
    icon: Clock,
    title: "Borrow with ease",
    description:
      "Manage your borrowed books, track due dates and renew your loans.",
    color: "orange",
  },
  {
    icon: ShieldCheck,
    title: "Your personal library",
    description:
      "Manage your membership, wishlist and reading journey in one place.",
    color: "green",
  },
];

const categories = [
  {
    icon: BookOpen,
    title: "Fiction",
    color: "purple",
  },
  {
    icon: FlaskConical,
    title: "Science",
    color: "green",
  },
  {
    icon: Code2,
    title: "Technology",
    color: "blue",
  },
  {
    icon: Landmark,
    title: "History",
    color: "orange",
  },
  {
    icon: GraduationCap,
    title: "Education",
    color: "pink",
  },
];

export function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/books?search=${encodeURIComponent(query)}`
        : "/books"
    );
  }

  return (
    <div className="sl-home">

      {/* HERO SECTION */}

      <section className="sl-hero">

        <div className="sl-hero-glow" />
        <div className="sl-hero-grid" />

        <div className="sl-hero-content">

          <div className="sl-hero-badge">
            <Sparkles size={15} />
            YOUR DIGITAL LIBRARY
          </div>

          <h1>
            Every great story
            <br />
            begins with
            <br />
            <span>a great book.</span>
          </h1>

          <p className="sl-hero-description">
            Discover inspiring stories, expand your knowledge
            and build your reading journey with a smarter
            digital library experience.
          </p>

          <form
            className="sl-search"
            onSubmit={handleSearch}
          >
            <Search size={21} />

            <input
              type="search"
              placeholder="Search books, authors..."
              aria-label="Search books"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <button type="submit">
              Search
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="sl-hero-actions">

            <Link
              to="/books"
              className="sl-button sl-button-primary"
            >
              Explore collection
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/register"
              className="sl-button sl-button-outline"
            >
              Become a member
            </Link>

          </div>

          <div className="sl-hero-benefits">
            <span>
              <CheckCircle2 size={16} />
              Easy borrowing
            </span>

            <span>
              <CheckCircle2 size={16} />
              Digital membership
            </span>
          </div>

        </div>

        <div className="sl-hero-visual">

          <div className="sl-image-frame">

            <div
              className="home-banner-photo sl-hero-photo"
              role="img"
              aria-label="Books in a beautiful library"
            />

            <div className="sl-image-overlay" />

            <div className="sl-image-caption">
              <span>READ. LEARN. GROW.</span>
              <h3>A world of knowledge awaits.</h3>
            </div>

          </div>

          <div className="sl-floating-card sl-floating-top">

            <div className="sl-floating-icon">
              <BookOpen size={23} />
            </div>

            <div>
              <strong>Discover books</strong>
              <small>Your next adventure</small>
            </div>

          </div>

          <div className="sl-floating-card sl-floating-bottom">

            <div className="sl-floating-icon orange">
              <Bookmark size={22} />
            </div>

            <div>
              <strong>Read your way</strong>
              <small>Anytime, anywhere</small>
            </div>

          </div>

          <div className="sl-visual-decoration">
            <Sparkles size={30} />
          </div>

        </div>

      </section>

      {/* BENEFITS STRIP */}

      <section className="sl-benefit-strip">

        <div className="sl-benefit-item">
          <LibraryBig size={28} />

          <div>
            <strong>Digital catalogue</strong>
            <span>Discover your favourite books</span>
          </div>
        </div>

        <div className="sl-benefit-item">
          <Users size={28} />

          <div>
            <strong>Easy membership</strong>
            <span>Join our reading community</span>
          </div>
        </div>

        <div className="sl-benefit-item">
          <Clock size={28} />

          <div>
            <strong>Smart borrowing</strong>
            <span>Manage your loans online</span>
          </div>
        </div>

        <div className="sl-benefit-item">
          <ShieldCheck size={28} />

          <div>
            <strong>Personal account</strong>
            <span>Your reading journey</span>
          </div>
        </div>

      </section>

      {/* CATEGORIES */}

      <section className="sl-section">

        <div className="sl-section-header">

          <div>
            <span className="sl-section-label">
              FIND YOUR INTEREST
            </span>

            <h2>Explore by category</h2>

            <p>
              Find something you love, whatever your interests.
            </p>
          </div>

          <Link to="/books" className="sl-text-link">
            View all categories
            <ArrowRight size={18} />
          </Link>

        </div>

        <div className="sl-category-grid">

          {categories.map(({ icon: Icon, title, color }) => (
            <Link
              key={title}
              to={`/books?category=${encodeURIComponent(title)}`}
              className={`sl-category-card sl-color-${color}`}
            >

              <div className="sl-category-icon">
                <Icon size={29} strokeWidth={1.8} />
              </div>

              <h3>{title}</h3>

              <span>
                Explore books
                <ArrowUpRight size={15} />
              </span>

            </Link>
          ))}

        </div>

      </section>

      {/* LIVE BOOK CATALOGUE */}

      <section className="sl-catalogue-section">

        <div className="sl-section-header">

          <div>
            <span className="sl-section-label">
              YOUR NEXT GREAT READ
            </span>

            <h2>Discover our collection</h2>

            <p>
              Explore available books from our library catalogue.
            </p>
          </div>

          <Link to="/books" className="sl-text-link">
            Browse all books
            <ArrowRight size={18} />
          </Link>

        </div>

        <Catalogue compact />

      </section>

      {/* FEATURES */}

      <section className="sl-section sl-features-section">

        <div className="sl-centered-heading">

          <span className="sl-section-label">
            BUILT FOR BOOK LOVERS
          </span>

          <h2>A smarter way to read.</h2>

          <p>
            Everything you need to enjoy a seamless
            library experience.
          </p>

        </div>

        <div className="sl-features-grid">

          {features.map(
            ({ icon: Icon, title, description, color }) => (
              <article
                key={title}
                className={`sl-feature-card sl-color-${color}`}
              >

                <div className="sl-feature-icon">
                  <Icon size={27} strokeWidth={1.8} />
                </div>

                <h3>{title}</h3>

                <p>{description}</p>

              </article>
            )
          )}

        </div>

      </section>

      {/* MEMBERSHIP BANNER */}

      <section className="sl-membership">

        <div className="sl-membership-decoration">
          <LibraryBig size={240} strokeWidth={0.8} />
        </div>

        <div className="sl-membership-content">

          <span className="sl-membership-badge">
            <Sparkles size={15} />
            PREMIUM MEMBERSHIP
          </span>

          <h2>
            Your reading journey
            <br />
            starts here.
          </h2>

          <p>
            Become a Smart Library member and enjoy
            convenient borrowing, personalised reading
            tools and access to our book collection.
          </p>

          <div className="sl-membership-benefits">
            <span>
              <CheckCircle2 size={17} />
              Borrow library books
            </span>

            <span>
              <CheckCircle2 size={17} />
              Personal reading dashboard
            </span>

            <span>
              <CheckCircle2 size={17} />
              Wishlist and reservations
            </span>
          </div>

        </div>

        <div className="sl-price-card">

          <span className="sl-price-label">
            PREMIUM MONTHLY
          </span>

          <div className="sl-price">
            ₹299
            <small>/ 30 days</small>
          </div>

          <p>Start your library membership today.</p>

          <Link
            to="/register"
            className="sl-button sl-price-button"
          >
            Join Smart Library
            <ArrowRight size={19} />
          </Link>

          <span className="sl-price-note">
            Already a member?
            <Link to="/login"> Sign in</Link>
          </span>

        </div>

      </section>

      {/* BOTTOM CTA */}

      <section className="sl-bottom-cta">

        <div className="sl-bottom-icon">
          <BookOpen size={30} />
        </div>

        <div>
          <h3>One more chapter?</h3>

          <p>
            Your next favourite book is waiting for you.
          </p>
        </div>

        <Link
          to="/books"
          className="sl-button sl-button-primary"
        >
          Start exploring
          <ArrowRight size={18} />
        </Link>

      </section>

    </div>
  );
}