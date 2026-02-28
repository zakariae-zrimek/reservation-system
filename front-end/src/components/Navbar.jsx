import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function LinkItem({ to, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                "px-3 py-2 rounded-lg text-sm font-semibold " +
                (isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100")
            }
        >
            {children}
        </NavLink>
    );
}

export default function Navbar({ isAuth, onLogin, onLogout }) {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-extrabold">B</span>
                    </div>
                    <div className="font-extrabold text-slate-900">
                        Book<span className="text-blue-600">It</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <LinkItem to="/">Accueil</LinkItem>


                    {!isAuth ? (
                        <button
                            onClick={() => {
                                navigate("/login");
                            }}
                            className="ml-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Login
                        </button>
                    ) : (
                        <> <LinkItem to="/me/reservations">MyPage</LinkItem>
                            <button
                                onClick={() => {
                                    onLogout();
                                    navigate("/");
                                }}
                                className="ml-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Logout
                            </button>
                        </>

                    )}
                </div>
            </div>
        </div>
    );
}