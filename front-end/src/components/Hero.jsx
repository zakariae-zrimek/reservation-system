import React from "react";
import Stepper from "./Stepper";
import { useNavigate } from "react-router-dom";

export default function Hero() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center text-center">
            <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
                Event<span className="text-blue-600">Book</span>
            </div>

            <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900">
                Réservez vos <span className="text-blue-600">événements</span> en toute simplicité.
            </h1>

            <p className="mt-3 max-w-xl text-sm sm:text-base text-slate-600">
                Conférences, workshops, concerts ou événements professionnels —
                trouvez votre événement et réservez votre place en quelques clics.
            </p>

            <Stepper />

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <button
                    onClick={() => navigate("/login")}
                    className="w-48 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                    Se connecter
                </button>

                <button
                    onClick={() => navigate("/reserve")}
                    className="w-48 rounded-xl border border-blue-600 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
                >
                    Réserver un événement
                </button>
            </div>
        </div>
    );
}