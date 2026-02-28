import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ReservePage from "./pages/ReservePage";
import AdminPage from "./pages/AdminPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import MyReservationsPage from "./pages/MyReservationsPage.jsx";

export default function App() {
    const [isAuth, setIsAuth] = useState(
        () => !!localStorage.getItem("token")
    );

    const handleLogin = () => setIsAuth(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsAuth(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar isAuth={isAuth} onLogin={handleLogin} onLogout={handleLogout} />

            <Routes>
                <Route path="/"       element={<HomePage />} />
                <Route path="/login"  element={
                    isAuth
                        ? <Navigate to="/reserve" replace />
                        : <AuthPage onLogin={handleLogin} />
                } />
                <Route path="/reserve/:id" element={
                    isAuth
                        ? <ReservePage />
                        : <Navigate to="/login" replace />
                } />
                <Route path="/admin"  element={<AdminPage />} />
                <Route path="/me/reservations" element={<MyReservationsPage />} />
            </Routes>
        </div>
    );
}