import React, { useState } from "react";

import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  LibraryBig,
  Users,
  ClipboardList,
  ChartNoAxesColumn,
  Tags,
  LogOut,
  User,
  Heart,
  CalendarDays,
  CreditCard,
  Wallet,
  Star,
  Headphones,
  Ticket,
  Receipt,
  KeyRound,
  BadgeIndianRupee,
} from "lucide-react";

import { useAuth } from "../context/Auth";

import logo from "../assets/images/logo.svg";
import avatar from "../assets/images/avatar.svg";

// ==========================================
// ADMIN NAVIGATION
// ==========================================

const adminLinks = [
  {
    path: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/books",
    label: "Books",
    icon: LibraryBig,
  },
  {
    path: "/admin/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    path: "/admin/members",
    label: "Members",
    icon: Users,
  },
  {
    path: "/admin/loans",
    label: "Circulation",
    icon: ClipboardList,
  },
  {
    path: "/admin/reservations",
    label: "Reservations",
    icon: CalendarDays,
  },
  {
    path: "/admin/library-cards",
    label: "Library Cards",
    icon: CreditCard,
  },
  {
    path: "/admin/payments",
    label: "Payments & Receipts",
    icon: Receipt,
  },
  {
    path: "/admin/fines",
    label: "Fine Management",
    icon: Wallet,
  },
  {
    path: "/admin/coupons",
    label: "Coupons",
    icon: Ticket,
  },
  {
    path: "/admin/reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    path: "/admin/reports",
    label: "Reports",
    icon: ChartNoAxesColumn,
  },
  {
    path: "/admin/support",
    label: "Support",
    icon: Headphones,
  },
];

// ==========================================
// MEMBER NAVIGATION
// ==========================================

const memberLinks = [
  {
    path: "/member",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    path: "/member/books",
    label: "Browse Books",
    icon: LibraryBig,
  },
  {
    path: "/member/loans",
    label: "My Loans",
    icon: ClipboardList,
  },
  {
    path: "/member/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    path: "/member/reservations",
    label: "Reservations",
    icon: CalendarDays,
  },
  {
    path: "/member/library-card",
    label: "Library Card",
    icon: CreditCard,
  },
  {
    path: "/member/membership/payment",
    label: "Buy Membership",
    icon: BadgeIndianRupee,
  },
  {
    path: "/member/payments",
    label: "Payment History",
    icon: Receipt,
  },
  {
    path: "/member/fines",
    label: "My Fines",
    icon: Wallet,
  },
  {
    path: "/member/reviews",
    label: "My Reviews",
    icon: Star,
  },
  {
    path: "/member/analytics",
    label: "Reading Analytics",
    icon: ChartNoAxesColumn,
  },
  {
    path: "/member/profile",
    label: "My Profile",
    icon: User,
  },
  {
    path: "/member/change-password",
    label: "Change Password",
    icon: KeyRound,
  },
  {
    path: "/member/support",
    label: "Help & Support",
    icon: Headphones,
  },
];

// ==========================================
// PUBLIC NAVIGATION
// ==========================================

const publicLinks = [
  {
    path: "/",
    label: "Home",
    icon: BookOpen,
  },
  {
    path: "/books",
    label: "Browse Books",
    icon: LibraryBig,
  },
];

// ==========================================
// MAIN SHELL COMPONENT
// ==========================================

export function Shell({ role }) {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const admin = role === "ADMIN";

  const protectedLayout = Boolean(role);

  // ========================================
  // AUTHENTICATION & ROLE PROTECTION
  // ========================================

  if (role && !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return (
      <Navigate
        to={user?.role === "ADMIN" ? "/admin" : "/member"}
        replace
      />
    );
  }

  // ========================================
  // NAVIGATION
  // ========================================

  const links = admin
    ? adminLinks
    : protectedLayout
    ? memberLinks
    : publicLinks;

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin" : "/member";

  function closeMenu() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className={protectedLayout ? "shell" : "public"}>

      {/* HEADER */}

      <header className="top">

        {/* BRAND LOGO */}

        <Link
          className="brand"
          to={protectedLayout ? dashboardPath : "/"}
          onClick={closeMenu}
        >
          <img
            className="brand-logo"
            src={logo}
            alt="Smart Library logo"
          />

          Smart
          <span className="brand-blue">Library</span>
        </Link>

        {/* MOBILE MENU */}

        <button
          type="button"
          className="menu"
          aria-label={
            open ? "Close navigation" : "Open navigation"
          }
          aria-expanded={open}
          onClick={() => setOpen(previous => !previous)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* PUBLIC NAVIGATION */}

        {!protectedLayout && (
          <nav
            className={open ? "nav open" : "nav"}
            aria-label="Public navigation"
          >
            {links.map(({ path, label }) => (
              <NavLink
                end
                to={path}
                key={path}
                onClick={closeMenu}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* ACCOUNT SECTION */}

        <div className="account">

          {user ? (
            <>
              <img
                className="account-avatar"
                src={avatar}
                alt="User avatar"
              />

              <Link
                to={dashboardPath}
                onClick={closeMenu}
                title="Open dashboard"
              >
                {user.name || "My Account"}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
              >
                Sign in
              </Link>

              <Link
                className="button primary"
                to="/register"
                onClick={closeMenu}
              >
                Join Library
              </Link>
            </>
          )}

        </div>

      </header>

      {/* PROTECTED SIDEBAR */}

      {protectedLayout && (
        <aside
          className={open ? "sidebar open" : "sidebar"}
          aria-label={
            admin ? "Admin navigation" : "Member navigation"
          }
        >

          <small>
            {admin ? "ADMIN WORKSPACE" : "MEMBER WORKSPACE"}
          </small>

          {links.map(({ path, label, icon: Icon }) => (
            <NavLink
              end
              to={path}
              key={path}
              onClick={closeMenu}
              title={label}
            >
              <Icon
                size={19}
                strokeWidth={1.9}
                aria-hidden="true"
              />

              <span>{label}</span>
            </NavLink>
          ))}

          {/* SIDEBAR LIBRARY IMAGE */}

          <div
            className="sidebar-photo"
            aria-hidden="true"
          />

        </aside>
      )}

      {/* MAIN PAGE CONTENT */}

      <main className="main">
        <Outlet />
      </main>

      {/* PUBLIC FOOTER */}

      {!protectedLayout && (
        <footer>
          © {new Date().getFullYear()} Smart Library
          · Read more, discover more.
        </footer>
      )}

    </div>
  );
}