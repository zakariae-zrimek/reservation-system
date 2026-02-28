import React, { useState } from "react";
import { API_BASE } from "../admin/constants";
import { cn } from "../admin/utils";
import Toast from "../ui/Toast";
import Field, { inputCls } from "../ui/Field";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";

export default function AddRoomForm({ onSuccess}) {
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState(50);
    const [location, setLocation] = useState("");
    const [type, setType] = useState("club");
    const [imageFile, setImageFile] = useState(null);
    const [toast, setToast] = useState("");
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setName("");
        setCapacity(50);
        setLocation("");
        setType("club");
        setImageFile(null);
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !location.trim() || !type.trim() || !capacity) {
            setToast("⚠️ Remplis tous les champs obligatoires.");
            return;
        }
        if (!imageFile) {
            setToast("⚠️ Choisis une image.");
            return;
        }

        setLoading(true);
        const fd = new FormData();
        fd.append("name", name);
        fd.append("capacity", String(capacity));
        fd.append("location", location);
        fd.append("type", type);
        fd.append("image", imageFile);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/api/rooms`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // ⚠️ Ne mets PAS Content-Type si tu envoies FormData (fd)
                },
                body: fd,
            });

            if (!res.ok) throw new Error(await res.text().catch(() => ""));

            setToast("✅ Room ajoutée avec succès !");
            reset();
            onSuccess?.();

        } catch {
            setToast("❌ Erreur lors de l'ajout. Vérifiez l'API.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Toast text={toast} onClose={() => setToast("")} />

            <Field label="Nom de la room *" icon={IC.rooms}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                    placeholder="Ex: Salle Fitness A"
                />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Capacité *" icon={IC.users}>
                    <input
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={inputCls}
                    />
                </Field>

                <Field label="Type *" icon={IC.tag}>
                    <input
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={inputCls}
                        placeholder="club"
                    />
                </Field>
            </div>

            <Field label="Localisation *" icon={IC.pin}>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputCls}
                    placeholder="Ex: Rabat, Bloc B"
                />
            </Field>

            <Field label="Image *" icon={IC.upload} hint='Clé FormData envoyée: "image"'>
                <label
                    htmlFor="room-img"
                    className={cn(
                        inputCls,
                        "cursor-pointer flex items-center gap-2",
                        imageFile
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "text-slate-400"
                    )}
                >
                    <Icon path={IC.upload} size={15} />
                    {imageFile ? imageFile.name : "Choisir une image…"}
                    <input
                        type="file"
                        accept="image/*"
                        id="room-img"
                        className="sr-only"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                </label>
            </Field>

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
                            <Icon path={IC.plus} size={15} /> Ajouter la Room
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}