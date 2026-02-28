import React, { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import RoomsList from "../components/RoomsList";
import { useRooms } from "../hooks/useRooms";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();
    const { rooms, loading, error } = useRooms();

    const apiUrl = "http://localhost:5000";
    const userId = useMemo(() => localStorage.getItem("userId") || "", []);
    const token = useMemo(() => localStorage.getItem("token") || "", []);

    const [likedEventIds, setLikedEventIds] = useState([]);
    const [loadingInterests, setLoadingInterests] = useState(false);

    // ✅ Étape 2 : charger les intérêts du user (si connecté)
    useEffect(() => {
        const loadInterests = async () => {
            if (!userId) {
                setLikedEventIds([]);
                return;
            }

            setLoadingInterests(true);
            try {
                const res = await fetch(`${apiUrl}/api/interests/users/${userId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();

                // data peut être ["E1","E2"] OU [{eventId:"E1"}...]
                const ids = Array.isArray(data)
                    ? (typeof data[0] === "string" ? data : data.map((x) => x.eventId))
                    : [];

                setLikedEventIds(ids);
            } catch (e) {
                console.error("Erreur chargement interests:", e);
                setLikedEventIds([]);
            } finally {
                setLoadingInterests(false);
            }
        };

        loadInterests();
    }, [userId, token]);

    // ✅ Enrichir rooms avec isInterested
    const roomsWithInterest = useMemo(() => {
        if (!rooms?.length) return [];
        const setIds = new Set(likedEventIds);
        return rooms.map((r) => ({
            ...r,
            isInterested: setIds.has(r.id),
        }));
    }, [rooms, likedEventIds]);

    return (
        <div
            className="relative min-h-screen bg-white"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 12px 12px, rgba(37, 99, 235, 0.22) 2px, transparent 2.2px)",
                backgroundSize: "28px 28px",
            }}
        >
            <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">
                <Hero />

                <div className="mt-10 rounded-3xl bg-white/70 backdrop-blur border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            Event Platform
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">Événements à venir</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Découvrez et réservez votre place pour nos prochains événements.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/reserve")}
                                className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all"
                            >
                                Réserver maintenant
                            </button>
                        </div>

                        <div className="mt-6">
                            {loading && (
                                <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
                                    <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                                    Chargement des rooms...
                                </div>
                            )}

                            {/* petit loading interests discret (optionnel) */}
                            {!loading && userId && loadingInterests && (
                                <div className="mb-4 text-xs text-slate-400 flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                                    Chargement de tes intérêts...
                                </div>
                            )}

                            {error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    ⚠️ {error}
                                </div>
                            )}

                            {!loading && !error && (
                                <RoomsList rooms={roomsWithInterest} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center text-xs text-slate-400">
                    EventBook © {new Date().getFullYear()} — Tous droits réservés
                </div>
            </div>
        </div>
    );
}