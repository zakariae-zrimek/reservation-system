import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    calendar: "M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18",
    pin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
    users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4",
    check:    "M20 6L9 17l-5-5",
    alert:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    ticket:   "M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z",
    minus:    "M5 12h14",
    plus:     "M12 5v14M5 12h14",
    id:       "M2 9h20M2 15h20M9 9v6M15 9v6M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
};

/* ─── TOAST ──────────────────────────────────────────────── */
function Toast({ text, onClose }) {
    if (!text) return null;
    const isSuccess = text.startsWith("✅");
    const isError   = text.startsWith("❌");
    return (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm mb-6 ${
            isSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                isError   ? "bg-red-50 border-red-200 text-red-800" :
                    "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
            <div className="flex items-center gap-2">
                <Ico path={isSuccess ? IC.check : IC.alert} size={15} />
                <span>{text.replace(/^[✅❌⚠️]\s*/, "")}</span>
            </div>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity text-current">
                <Ico path="M18 6L6 18M6 6l12 12" size={14} />
            </button>
        </div>
    );
}

/* ─── MAIN ───────────────────────────────────────────────── */
export default function ReservePage() {
    const navigate = useNavigate();
    const {id} = useParams();
    const userId = useMemo(() => localStorage.getItem("userId") || "", []);

    const [event,         setEvent]         = useState(null);
    const [numberOfSeats, setNumberOfSeats] = useState(1);
    const [toast,         setToast]         = useState("");
    const [loading,       setLoading]       = useState(false);
    const [fetching,      setFetching]      = useState(true);

    /* ── Fetch event from real API ── */
    useEffect(() => {
        if (!id) {
            setToast("⚠️ Aucun eventId dans l'URL.");
            setFetching(false);
            return;
        }
        const token = localStorage.getItem("token") || "";
        fetch(`http://localhost:5000/api/events/${id}/details`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => setEvent(data))
            .catch(() => setToast("❌ Impossible de charger l'événement."))
            .finally(() => setFetching(false));
    }, [id]);

    const formattedDate = useMemo(() => {
        if (!event?.date) return "";
        return new Date(event.date).toLocaleString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    }, [event?.date]);

    /* ── Submit reservation ── */
    /* ── Submit reservation (AXIOS) ── */
    const submit = (e) => {
        e.preventDefault();
        handleReservation();
    };

    const handleReservation = async () => {
        if (!userId) {
            setToast("⚠️ UserId introuvable. Connecte-toi d'abord.");
            return;
        }

        if (!event?.id) {
            setToast("⚠️ Événement introuvable.");
            return;
        }

        if (!numberOfSeats || Number(numberOfSeats) <= 0) {
            setToast("⚠️ Entre un nombre de places valide.");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token") || "";

            const payload = {
                userId,
                eventId: id,
                numberOfSeats: Number(numberOfSeats),
            };

            const response = await axios.post(
                "http://localhost:5000/api/reservations",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            setToast(`✅ ${response.data?.message || "Réservation confirmée !"}`);

            setTimeout(() => {
                navigate("/me/reservations");
            }, 600);

        } catch (err) {
            const data = err?.response?.data;

            if (data?.message) {
                setToast(`❌ ${data.message}`);
                console.log("Détails backend :", data);
            } else {
                setToast(`❌ ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };


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

                {/* Page header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Réservation
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Réserver un événement
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Choisis le nombre de places et confirme ta réservation.
                    </p>
                </div>

                {/* Loading state */}
                {fetching && (
                    <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
                        <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3" />
                        Chargement de l'événement…
                    </div>
                )}

                {!fetching && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Left: event card ── */}
                        <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
                            {/* Image */}
                            <div className="relative">
                                <img
                                    src={
                                        event?.room?.imageUrl
                                            ? event.room.imageUrl.startsWith("http")
                                                ? event.room.imageUrl
                                                : `http://localhost:5000${event.room.imageUrl}`
                                            : "https://placehold.co/600x300?text=No+Image"
                                    }
                                    alt={event?.room?.name}
                                    className="h-48 w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                {/* Overlay badges */}
                                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                                        <Ico path={IC.users} size={12} />
                                        {event?.room?.capacity} places
                                    </span>
                                    {event?.room?.location && (
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                                            <Ico path={IC.pin} size={12} />
                                            {event.room.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h2 className="text-lg font-extrabold text-slate-900">{event?.name || "—"}</h2>
                                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{event?.description}</p>

                                <div className="mt-4 space-y-2.5">
                                    {formattedDate && (
                                        <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <Ico path={IC.calendar} size={13} />
                                            </div>
                                            <span className="capitalize">{formattedDate}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2.5 text-sm text-slate-600">
                                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <Ico path={IC.building} size={13} />
                                        </div>
                                        {event?.room?.name || "—"}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── Right: form ── */}
                        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6 sm:p-8 flex flex-col">

                            <Toast text={toast} onClose={() => setToast("")} />

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                                    <Ico path={IC.ticket} size={18} />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-slate-900">Votre réservation</div>
                                    <div className="text-xs text-slate-400">Remplis les informations ci-dessous</div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="flex-1 flex flex-col gap-6">

                                {/* Seats selector */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre de places *
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button type="button"
                                                onClick={() => setNumberOfSeats((n) => Math.max(1, Number(n) - 1))}
                                                className="w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm transition-colors">
                                            <Ico path={IC.minus} size={16} />
                                        </button>
                                        <input
                                            type="number" min={1} max={event?.room?.capacity || 999}
                                            value={numberOfSeats}
                                            onChange={(e) => setNumberOfSeats(e.target.value)}
                                            className="w-24 text-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-900 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                        <button type="button"
                                                onClick={() => setNumberOfSeats((n) => Math.min(event?.room?.capacity || 999, Number(n) + 1))}
                                                className="w-11 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm transition-colors">
                                            <Ico path={IC.plus} size={16} />
                                        </button>
                                        <span className="text-sm text-slate-400">
                                            / {event?.room?.capacity ?? "—"} max
                                        </span>
                                    </div>
                                </div>

                                {/* Summary card */}
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                                    <div className="text-sm font-bold text-slate-800 mb-1">Récapitulatif</div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Événement</span>
                                        <span className="font-semibold text-slate-900">{event?.name || "—"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Salle</span>
                                        <span className="font-semibold text-slate-900">{event?.room?.name || "—"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Places</span>
                                        <span className="font-bold text-blue-700">{numberOfSeats}</span>
                                    </div>

                                </div>

                                {/* Submit */}
                                <div className="mt-auto">
                                    <button type="submit" disabled={loading || !event}
                                            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2">
                                        {loading
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <><Ico path={IC.check} size={16} /> Confirmer la réservation</>
                                        }
                                    </button>
                                    <p className="mt-3 text-center text-xs text-slate-400">
                                        En confirmant, tu acceptes les conditions de réservation.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-10 text-center text-xs text-slate-400">
                    EventBook © {new Date().getFullYear()} — Tous droits réservés
                </div>
            </div>
        </div>
    );
}
