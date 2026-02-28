import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CalendarIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function PinIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function ArrowRight() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}

function HeartIcon({ filled }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

export default function RoomCard({ room, onSelect, onToast }) {
    const apiUrl = "http://localhost:5000";
    const navigate = useNavigate();

    const [liked, setLiked] = useState(!!room?.isInterested);
    const [liking, setLiking] = useState(false);

    // ✅ sync quand Home met à jour room.isInterested
    useEffect(() => {
        setLiked(!!room?.isInterested);
    }, [room?.isInterested]);

    // ✅ LIKE / UNLIKE
    const handleToggleInterest = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token") || "";

        if (!userId) {
            onToast?.("⚠️ Connecte-toi pour gérer tes intérêts.");
            return;
        }

        if (liking) return;
        setLiking(true);

        try {
            const method = liked ? "DELETE" : "POST";

            const res = await fetch(`${apiUrl}/api/interests`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    userId,
                    eventId: room.id,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || `HTTP ${res.status}`);
            }

            setLiked(!liked);

            if (method === "POST") onToast?.(`✅ ${data.message || "Interest ajouté."}`);
            else onToast?.(`✅ ${data.message || "Interest supprimé."}`);
        } catch (err) {
            onToast?.(`❌ ${err.message}`);
        } finally {
            setLiking(false);
        }
    };

    return (
        <button
            onClick={() => onSelect?.(room)}
            type="button"
            className="group w-full text-left rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 overflow-hidden"
        >
            <div className="flex gap-0 sm:gap-0">

                {/* Image */}
                <div
                    className="relative shrink-0 w-36 sm:w-48"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reserve/${room.id}`);
                    }}
                >
                    <img
                        src={apiUrl + room.room.imageUrl}
                        alt={room.name}
                        className="h-full w-full object-cover"
                        style={{ minHeight: "130px" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />

                    {/* ❤️ Like/Unlike */}
                    <button
                        type="button"
                        onClick={handleToggleInterest}
                        disabled={liking}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-xl border shadow-md flex items-center justify-center transition-all
              ${liked
                            ? "bg-rose-600 border-rose-200 text-white"
                            : "bg-white/90 backdrop-blur border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600"}
              ${liking ? "opacity-70" : ""}`}
                        title={liked ? "Retirer des intérêts" : "Ajouter aux intérêts"}
                    >
                        {liking ? (
                            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        ) : (
                            <HeartIcon filled={liked} />
                        )}
                    </button>

                    {/* Price badge */}
                    {room.price && (
                        <div className="absolute top-3 left-3 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                            {room.price} €
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                                {room.name}
                            </h3>
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <UsersIcon />
                                {room.capacity}
              </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {room.description}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                            {room.date && (
                                <span className="flex items-center gap-1.5">
                  <CalendarIcon />
                                    {new Date(room.date).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                </span>
                            )}
                            {room.location && (
                                <span className="flex items-center gap-1.5">
                  <PinIcon />
                                    {room.location}
                </span>
                            )}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-2.5 transition-all">
              Réserver
              <ArrowRight />
            </span>
                    </div>
                </div>

            </div>
        </button>
    );
}