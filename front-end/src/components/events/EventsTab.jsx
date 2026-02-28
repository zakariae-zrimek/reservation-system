

import React, { useEffect, useState } from "react";
import Toast from "../ui/Toast";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";
import {API_BASE} from "../admin/constants.js";

export default function EventsTab() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/events`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch {
            setToast("⚠️ Impossible de charger les events.");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div>
            <Toast text={toast} onClose={() => setToast("")} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Événements</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {events.length} événement{events.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <button
                    onClick={fetchEvents}
                    type="button"
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
                >
                    <Icon path={IC.refresh} size={15} />
                </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        {["Événement", "Date", "Capacité", "Room ID"].map((h) => (
                            <th
                                key={h}
                                className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                    {loading && (
                        <tr>
                            <td colSpan={4} className="px-6 py-14 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                    <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                                    Chargement...
                                </div>
                            </td>
                        </tr>
                    )}

                    {!loading && events.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-16 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Icon path={IC.events} size={22} />
                                </div>
                                <p className="text-sm font-medium text-slate-600">Aucun événement</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Créez un événement depuis la liste des rooms
                                </p>
                            </td>
                        </tr>
                    )}

                    {events.map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <Icon path={IC.events} size={14} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{ev.name}</div>
                                        <div className="text-xs text-slate-400 line-clamp-1">{ev.description}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Icon path={IC.calendar} size={13} />
                                    {ev.date
                                        ? new Date(ev.date).toLocaleString("fr-FR", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })
                                        : "—"}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Icon path={IC.users} size={13} /> {ev.capacity}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {ev.roomId}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}