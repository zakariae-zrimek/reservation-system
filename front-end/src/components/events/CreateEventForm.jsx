import React, { useEffect, useState } from "react";
import { API_BASE } from "../admin/constants";
import { cn } from "../admin/utils";
import Toast from "../ui/Toast";
import Field, { inputCls } from "../ui/Field";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";

export default function CreateEventForm({ room, onCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [capacity, setCapacity] = useState(room?.capacity || 1);
    const [toast, setToast] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName("");
        setDescription("");
        setDate("");
        setCapacity(room?.capacity || 1);
        setToast("");
    }, [room?.id]);

    const submit = async (e) => {
        e.preventDefault();
        if (!room?.id) {
            setToast("⚠️ Room introuvable.");
            return;
        }
        if (!name.trim() || !description.trim() || !date || !capacity) {
            setToast("⚠️ Remplis tous les champs.");
            return;
        }

        setLoading(true);
        const payload = {
            name,
            description,
            date: new Date(date).toISOString(),
            capacity: Number(capacity),
            roomId: room.id,
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text().catch(() => ""));
            setToast("✅ Événement créé avec succès !");
            onCreated?.();
        } catch {
            setToast("❌ Erreur création event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Toast text={toast} onClose={() => setToast("")} />

            {room && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 text-white">
                        <Icon path={IC.rooms} size={14} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-indigo-900">{room.name}</div>
                        <div className="text-xs text-indigo-400 font-mono">{room.id}</div>
                    </div>
                </div>
            )}

            <Field label="Nom de l'événement *" icon={IC.events}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder="Conférence IA 2026"
                />
            </Field>

            <Field label="Description *">
        <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={cn(inputCls, "resize-none")}
            placeholder="Décrivez l'événement…"
        />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Date & Heure *" icon={IC.calendar}>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputCls}
                    />
                </Field>

                <Field label="Capacité *" icon={IC.users} hint="Défaut: capacité de la room">
                    <input
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={inputCls}
                    />
                </Field>
            </div>

            <div className="pt-3 border-t border-slate-100">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Icon path={IC.plus} size={15} /> Créer l'Événement
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}