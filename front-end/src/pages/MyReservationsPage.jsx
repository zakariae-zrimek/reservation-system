import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ─── ICONS ─────────────────────────────────────────────── */
function Ico({ path, size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={path} />
        </svg>
    );
}

const IC = {
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    calendar: "M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18",
    pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
    ticket: "M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    spark: "M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z",
};

/* ─── TOAST ──────────────────────────────────────────────── */
function Toast({ text, onClose }) {
    if (!text) return null;
    const isSuccess = text.startsWith("✅");
    const isError = text.startsWith("❌");
    return (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm mb-6 ${
            isSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                isError ? "bg-red-50 border-red-200 text-red-800" :
                    "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
            <div className="flex items-center gap-2">
                <Ico path={isSuccess ? IC.check : IC.alert} size={15} />
                <span>{text.replace(/^[✅❌⚠️]\s*/, "")}</span>
            </div>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity text-current">
                <Ico path={IC.x} size={14} />
            </button>
        </div>
    );
}

/* ─── HELPERS ───────────────────────────────────────────── */
function extractEventIds(data) {
    if (!Array.isArray(data)) return [];
    if (data.length === 0) return [];
    if (typeof data[0] === "string") return data;
    return data.map(x => x?.eventId || x?.id).filter(Boolean);
}

function formatDate(d) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleString("fr-FR", {
            weekday: "short", day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch {
        return d;
    }
}

export default function MyReservationsPage() {
    const base = "http://localhost:5000";

    const userId = useMemo(() => localStorage.getItem("userId") || "", []);
    const token = useMemo(() => localStorage.getItem("token") || "", []);

    const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

    const [tab, setTab] = useState("reservations"); // reservations | interests | reco
    const [toast, setToast] = useState("");

    // Reservations
    const [reservations, setReservations] = useState([]);
    const [fetchingReservations, setFetchingReservations] = useState(true);
    const [busyReservationId, setBusyReservationId] = useState(null);

    // Interests / Reco
    const [allEvents, setAllEvents] = useState([]);
    const [interestIds, setInterestIds] = useState([]);
    const [recoIds, setRecoIds] = useState([]);
    const [fetchingInterests, setFetchingInterests] = useState(true);
    const [busyEventId, setBusyEventId] = useState(null);

    const loadReservations = async () => {
        if (!userId) {
            setToast("⚠️ UserId introuvable. Connecte-toi d'abord.");
            setFetchingReservations(false);
            return;
        }
        setFetchingReservations(true);
        try {
            const res = await axios.get(`${base}/api/reservations/user/${userId}`, { headers: authHeaders });
            setReservations(Array.isArray(res.data) ? res.data : (res.data?.reservations || []));
        } catch {
            setToast("❌ Impossible de charger tes réservations.");
        } finally {
            setFetchingReservations(false);
        }
    };

    const cancelReservation = async (rid) => {
        setBusyReservationId(rid);
        try {
            const res = await axios.patch(`${base}/api/reservations/${rid}/cancel`, null, { headers: authHeaders });
            setToast(`✅ ${res.data?.message || "Réservation annulée."}`);
            setReservations((prev) =>
                prev.map((r) => (r.id === rid || r._id === rid ? { ...r, status: "cancelled", Status: "cancelled" } : r))
            );
        } catch (e) {
            const msg = e?.response?.data?.message;
            setToast(`❌ ${msg || "Erreur lors de l'annulation."}`);
        } finally {
            setBusyReservationId(null);
        }
    };

    const loadInterestsAndReco = async () => {
        if (!userId) {
            setToast("⚠️ UserId introuvable. Connecte-toi d'abord.");
            setFetchingInterests(false);
            return;
        }
        setFetchingInterests(true);
        try {
            const [interestsRes, recoRes, eventsRes] = await Promise.all([
                axios.get(`${base}/api/interests/users/${userId}`, { headers: authHeaders }),
                axios.get(`${base}/api/interests/users/${userId}/recommendations`, { headers: authHeaders }),
                axios.get(`${base}/api/events`, { headers: authHeaders }), // adapte si nécessaire
            ]);

            setInterestIds(extractEventIds(interestsRes.data));
            setRecoIds(extractEventIds(recoRes.data));
            setAllEvents(Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data?.events || []));
        } catch (e) {
            console.error(e);
            setToast("❌ Impossible de charger tes intérêts / recommandations.");
        } finally {
            setFetchingInterests(false);
        }
    };

    useEffect(() => {
        loadReservations();
        loadInterestsAndReco();
    }, [userId]);

    const eventMap = useMemo(() => {
        const map = new Map();
        (allEvents || []).forEach(ev => map.set(ev.id, ev));
        return map;
    }, [allEvents]);

    const myInterests = useMemo(() => interestIds.map(id => eventMap.get(id)).filter(Boolean), [interestIds, eventMap]);

    const myRecommendations = useMemo(() => {
        const liked = new Set(interestIds);
        return recoIds.filter(id => !liked.has(id)).map(id => eventMap.get(id)).filter(Boolean);
    }, [recoIds, interestIds, eventMap]);

    const removeInterest = async (eventId) => {
        if (!userId) return;
        setBusyEventId(eventId);
        try {
            const res = await axios.delete(`${base}/api/interests`, {
                headers: { "Content-Type": "application/json", ...authHeaders },
                data: { userId, eventId }, // axios DELETE body
            });
            setToast(`✅ ${res.data?.message || "Interest supprimé."}`);
            setInterestIds(prev => prev.filter(id => id !== eventId));
        } catch (e) {
            const msg = e?.response?.data?.message;
            setToast(`❌ ${msg || "Erreur lors de la suppression."}`);
        } finally {
            setBusyEventId(null);
        }
    };

    const addInterest = async (eventId) => {
        if (!userId) return;
        setBusyEventId(eventId);
        try {
            const res = await axios.post(`${base}/api/interests`,
                { userId, eventId },
                { headers: { "Content-Type": "application/json", ...authHeaders } }
            );
            setToast(`✅ ${res.data?.message || "Interest ajouté."}`);
            setInterestIds(prev => (prev.includes(eventId) ? prev : [...prev, eventId]));
        } catch (e) {
            const msg = e?.response?.data?.message;
            setToast(`❌ ${msg || "Erreur lors de l'ajout."}`);
        } finally {
            setBusyEventId(null);
        }
    };

    const EventCard = ({ ev, variant }) => {
        const isLiked = interestIds.includes(ev.id);

        return (
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="text-lg font-extrabold text-slate-900 truncate">
                                {ev.name || "Événement"}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                                ID #{String(ev.id).slice(-6)}
                            </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border ${
                            isLiked ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
              <Ico path={IC.heart} size={12} />
                            {isLiked ? "Intéressé" : "Non suivi"}
            </span>
                    </div>

                    <div className="mt-5 space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Ico path={IC.calendar} size={13} />
                            </div>
                            <span className="capitalize">{formatDate(ev.date)}</span>
                        </div>

                        {(ev.location || ev.room?.location) && (
                            <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <Ico path={IC.pin} size={13} />
                                </div>
                                <span>{ev.location || ev.room?.location}</span>
                            </div>
                        )}

                        {(ev.capacity || ev.room?.capacity) && (
                            <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <Ico path={IC.users} size={13} />
                                </div>
                                <span><b className="text-slate-900">{ev.capacity || ev.room?.capacity}</b> places</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={loadInterestsAndReco}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors"
                        >
                            Rafraîchir
                        </button>

                        {variant === "interests" ? (
                            <button
                                type="button"
                                disabled={busyEventId === ev.id}
                                onClick={() => removeInterest(ev.id)}
                                className="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 hover:shadow-red-300 transition-all flex items-center justify-center gap-2"
                            >
                                {busyEventId === ev.id ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Unfollow</>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={busyEventId === ev.id || isLiked}
                                onClick={() => addInterest(ev.id)}
                                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all flex items-center justify-center gap-2"
                            >
                                {busyEventId === ev.id ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>{isLiked ? "Déjà suivi" : "Suivre"}</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ReservationCard = ({ r }) => {
        const rid = r.id || r._id;
        const status = (r.status || r.Status || "pending").toLowerCase();
        const isCancelled = status === "cancelled";

        return (
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-extrabold text-slate-900">
                                {r.eventName || r.event?.name || "Événement"}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                                Réservation #{String(rid).slice(-6)}
                            </div>
                        </div>

                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                            isCancelled
                                ? "bg-slate-50 text-slate-600 border-slate-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
              {isCancelled ? "Annulée" : "Active"}
            </span>
                    </div>

                    <div className="mt-5 space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Ico path={IC.calendar} size={13} />
                            </div>
                            <span className="capitalize">
                {formatDate(r.eventDate || r.event?.date || r.createdAt)}
              </span>
                        </div>

                        {(r.location || r.roomLocation || r.event?.room?.location) && (
                            <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <Ico path={IC.pin} size={13} />
                                </div>
                                <span>{r.location || r.roomLocation || r.event?.room?.location}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Ico path={IC.ticket} size={13} />
                            </div>
                            <span>
                <b className="text-slate-900">{r.numberOfSeats ?? r.seats ?? "—"}</b> place(s)
              </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={loadReservations}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors"
                        >
                            Rafraîchir
                        </button>

                        <button
                            type="button"
                            disabled={isCancelled || busyReservationId === rid}
                            onClick={() => cancelReservation(rid)}
                            className="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 hover:shadow-red-300 transition-all flex items-center justify-center gap-2"
                        >
                            {busyReservationId === rid ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Annuler</>
                            )}
                        </button>
                    </div>

                    {isCancelled && (
                        <div className="mt-4 text-xs text-slate-400">
                            Cette réservation est déjà annulée.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen bg-white"
             style={{
                 backgroundImage: "radial-gradient(circle at 12px 12px, rgba(37, 99, 235, 0.22) 2px, transparent 2.2px)",
                 backgroundSize: "28px 28px",
             }}>
            <div className="mx-auto max-w-6xl px-4 pt-10 pb-16">

                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Mon espace
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Mes réservations, intérêts & recommandations
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Consulte tes réservations, gère tes favoris, et découvre des événements suggérés.
                    </p>
                </div>

                <Toast text={toast} onClose={() => setToast("")} />

                {/* Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setTab("reservations")}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold border transition-all ${
                            tab === "reservations"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                                : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                    >
                        <Ico path={IC.ticket} size={14} />
                        Réservations ({reservations.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab("interests")}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold border transition-all ${
                            tab === "interests"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                                : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                    >
                        <Ico path={IC.heart} size={14} />
                        Mes intérêts ({myInterests.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab("reco")}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold border transition-all ${
                            tab === "reco"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                                : "bg-white/80 text-slate-700 border-slate-200 hover:bg-white"
                        }`}
                    >
                        <Ico path={IC.spark} size={14} />
                        Recommandations ({myRecommendations.length})
                    </button>
                </div>

                {/* CONTENT */}
                {tab === "reservations" && (
                    <>
                        {fetchingReservations ? (
                            <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                                <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3" />
                                Chargement des réservations…
                            </div>
                        ) : (
                            reservations.length === 0 ? (
                                <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-10 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                                        <Ico path={IC.list} size={20} />
                                    </div>
                                    <div className="text-base font-bold text-slate-900">Aucune réservation</div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Réserve un événement puis reviens ici.
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {reservations
                                        .filter(r => (r.status || r.Status)?.toLowerCase() === "confirmed")
                                        .map(r => (
                                            <ReservationCard key={r.id || r._id} r={r} />
                                        ))
                                    }
                                </div>
                            )
                        )}
                    </>
                )}

                {tab === "interests" && (
                    <>
                        {fetchingInterests ? (
                            <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                                <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3" />
                                Chargement des intérêts…
                            </div>
                        ) : (
                            myInterests.length === 0 ? (
                                <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-10 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                                        <Ico path={IC.list} size={20} />
                                    </div>
                                    <div className="text-base font-bold text-slate-900">Aucun intérêt pour le moment</div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Like des événements depuis la page d’accueil pour les retrouver ici.
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {myInterests.map(ev => <EventCard key={ev.id} ev={ev} variant="interests" />)}
                                </div>
                            )
                        )}
                    </>
                )}

                {tab === "reco" && (
                    <>
                        {fetchingInterests ? (
                            <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                                <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3" />
                                Chargement des recommandations…
                            </div>
                        ) : (
                            myRecommendations.length === 0 ? (
                                <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-10 text-center">
                                    <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                                        <Ico path={IC.list} size={20} />
                                    </div>
                                    <div className="text-base font-bold text-slate-900">Pas de recommandations</div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Ajoute quelques intérêts et reviens pour voir des suggestions.
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {myRecommendations.map(ev => <EventCard key={ev.id} ev={ev} variant="reco" />)}
                                </div>
                            )
                        )}
                    </>
                )}

                <div className="mt-10 text-center text-xs text-slate-400">
                    EventBook © {new Date().getFullYear()} — Tous droits réservés
                </div>
            </div>
        </div>
    );
}