import React from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

// ==============================
// AUTHENTICATION
// ==============================

import { AuthProvider } from "./context/Auth";

// ==============================
// LAYOUT
// ==============================

import { Shell } from "./layouts/Shell";

// ==============================
// PUBLIC PAGES
// ==============================

import { Home } from "./pages/public/Home";
import { Catalogue } from "./pages/public/Catalogue";
import { Detail } from "./pages/public/Detail";
import { AuthPage } from "./pages/public/AuthPage";

// ==============================
// MEMBER PAGES
// ==============================

import MemberDashboard from "./pages/member/MemberDashboard";
import BrowseBooks from "./pages/member/BrowseBooks";
import MyLoans from "./pages/member/MyLoans";
import Wishlist from "./pages/member/Wishlist";
import Reservations from "./pages/member/Reservations";
import LibraryCard from "./pages/member/LibraryCard";
import MembershipPayment from "./pages/member/MembershipPayment";
import PaymentHistory from "./pages/member/PaymentHistory";
import Fines from "./pages/member/Fines";
import MyReviews from "./pages/member/MyReviews";
import ReadingAnalytics from "./pages/member/ReadingAnalytics";
import Profile from "./pages/member/Profile";
import ChangePassword from "./pages/member/ChangePassword";
import Support from "./pages/member/Support";

// ==============================
// ADMIN PAGES
// ==============================

import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminBooks } from "./pages/admin/AdminBooks";
import { Members } from "./pages/admin/Members";
import { Categories } from "./pages/admin/Categories";
import { Reports } from "./pages/admin/Reports";

import AdminLoans from "./pages/admin/AdminLoans";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminFines from "./pages/admin/AdminFines";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminLibraryCards from "./pages/admin/AdminLibraryCards";
import Coupons from "./pages/admin/Coupons";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSupport from "./pages/admin/AdminSupport";

// ==============================
// APPLICATION
// ==============================

export default function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* =========================
                        PUBLIC ROUTES
                    ========================== */}

                    <Route element={<Shell />}>

                        <Route
                            index
                            element={<Home />}
                        />

                        <Route
                            path="books"
                            element={<Catalogue />}
                        />

                        <Route
                            path="books/:id"
                            element={<Detail />}
                        />

                        <Route
                            path="login"
                            element={<AuthPage />}
                        />

                        <Route
                            path="register"
                            element={<AuthPage register />}
                        />

                    </Route>

                    {/* =========================
                        MEMBER PROTECTED ROUTES
                    ========================== */}

                    <Route
                        path="member"
                        element={<Shell role="MEMBER" />}
                    >

                        {/* Member Dashboard */}

                        <Route
                            index
                            element={<MemberDashboard />}
                        />

                        {/* Browse Books */}

                        <Route
                            path="books"
                            element={<BrowseBooks />}
                        />

                        {/* My Loans */}

                        <Route
                            path="loans"
                            element={<MyLoans />}
                        />

                        {/* Wishlist */}

                        <Route
                            path="wishlist"
                            element={<Wishlist />}
                        />

                        {/* Reservations */}

                        <Route
                            path="reservations"
                            element={<Reservations />}
                        />

                        {/* Digital Library Card */}

                        <Route
                            path="library-card"
                            element={<LibraryCard />}
                        />

                        {/* Membership Payment */}

                        <Route
                            path="membership/payment"
                            element={<MembershipPayment />}
                        />

                        {/* Payment History */}

                        <Route
                            path="payments"
                            element={<PaymentHistory />}
                        />

                        {/* Fine Management */}

                        <Route
                            path="fines"
                            element={<Fines />}
                        />

                        {/* Reviews & Ratings */}

                        <Route
                            path="reviews"
                            element={<MyReviews />}
                        />

                        {/* Reading Analytics */}

                        <Route
                            path="analytics"
                            element={<ReadingAnalytics />}
                        />

                        {/* My Profile */}

                        <Route
                            path="profile"
                            element={<Profile />}
                        />

                        {/* Change Password */}

                        <Route
                            path="change-password"
                            element={<ChangePassword />}
                        />

                        {/* Member Help & Support */}

                        <Route
                            path="support"
                            element={<Support />}
                        />

                    </Route>

                    {/* =========================
                        ADMIN PROTECTED ROUTES
                    ========================== */}

                    <Route
                        path="admin"
                        element={<Shell role="ADMIN" />}
                    >

                        {/* Admin Dashboard */}

                        <Route
                            index
                            element={<AdminDashboard />}
                        />

                        {/* Book Management */}

                        <Route
                            path="books"
                            element={<AdminBooks />}
                        />

                        {/* Category Management */}

                        <Route
                            path="categories"
                            element={<Categories />}
                        />

                        {/* Member Management */}

                        <Route
                            path="members"
                            element={<Members />}
                        />

                        {/* Payment Management */}

                        <Route
                            path="payments"
                            element={<AdminPayments />}
                        />

                        {/* Circulation Management */}

                        <Route
                            path="loans"
                            element={<AdminLoans />}
                        />

                        {/* Reservation Management */}

                        <Route
                            path="reservations"
                            element={<AdminReservations />}
                        />

                        {/* Library Card Management */}

                        <Route
                            path="library-cards"
                            element={<AdminLibraryCards />}
                        />

                        {/* Fine Management */}

                        <Route
                            path="fines"
                            element={<AdminFines />}
                        />

                        {/* Coupon Management */}

                        <Route
                            path="coupons"
                            element={<Coupons />}
                        />

                        {/* Review Management */}

                        <Route
                            path="reviews"
                            element={<AdminReviews />}
                        />

                        {/* Reports & Analytics */}

                        <Route
                            path="reports"
                            element={<Reports />}
                        />

                        {/* Premium Admin Support */}

                        <Route
                            path="support"
                            element={<AdminSupport />}
                        />

                    </Route>

                    {/* =========================
                        INVALID ROUTE REDIRECT
                    ========================== */}

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    );

}