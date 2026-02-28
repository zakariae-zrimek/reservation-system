import React, { useEffect, useState } from "react";
import { API_BASE } from "../admin/constants";
import { cn } from "../admin/utils";
import Toast from "../ui/Toast";
import Drawer from "../ui/Drawer";
import Badge from "../ui/Badge";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";
import AddRoomForm from "./AddRoomForm";
import CreateEventForm from "../events/CreateEventForm";

export default function RoomsTab() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [eventRoom, setEventRoom] = useState(null);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setRooms(Array.isArray(data) ? data : []);
        } catch {
            setToast("⚠️ Impossible de charger les rooms.");
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div>
            <Toast text={toast} onClose={() => setToast("")} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Rooms</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {rooms.length} salle{rooms.length !== 1 ? "s" : ""} enregistrée
                        {rooms.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchRooms}
                        type="button"
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <Icon path={IC.refresh} size={15} />
                    </button>

                    <button
                        onClick={() => setShowAddRoom(true)}
                        type="button"
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all"
                    >
                        <Icon path={IC.plus} size={15} />
                        Ajouter une Room
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        {["Room", "Capacité", "Localisation", "Type", ""].map((h) => (
                            <th
                                key={h}
                                className={cn(
                                    "text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4",
                                    h === "" ? "text-right" : "text-left"
                                )}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                    {loading && (
                        <tr>
                            <td colSpan={5} className="px-6 py-14 text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-400">
                                    <span className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                                    Chargement...
                                </div>
                            </td>
                        </tr>
                    )}

                    {!loading && rooms.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Icon path={IC.rooms} size={22} />
                                </div>
                                <p className="text-sm font-medium text-slate-600">Aucune room</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Cliquez sur "Ajouter une Room" pour commencer
                                </p>
                            </td>
                        </tr>
                    )}

                    {rooms.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <Icon path={IC.rooms} size={14} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{r.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{r.id}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Icon path={IC.users} size={13} /> {r.capacity}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Icon path={IC.pin} size={13} /> {r.location}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <Badge>{r.type}</Badge>
                            </td>

                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => setEventRoom(r)}
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors"
                                >
                                    <Icon path={IC.plus} size={12} /> Créer Event
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Drawer
                open={showAddRoom}
                onClose={() => setShowAddRoom(false)}
                title="Nouvelle Room"
                subtitle={`POST ${API_BASE}/api/rooms  ·  form-data`}
            >
                <AddRoomForm
                    onSuccess={() => {
                        setShowAddRoom(false);
                        fetchRooms();
                    }}
                />
            </Drawer>

            <Drawer
                open={!!eventRoom}
                onClose={() => setEventRoom(null)}
                title="Créer un Événement"
                subtitle={`POST ${API_BASE}/api/events  ·  application/json`}
            >
                <CreateEventForm room={eventRoom} onCreated={() => setEventRoom(null)} />
            </Drawer>
        </div>
    );
}