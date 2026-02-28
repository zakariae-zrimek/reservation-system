import React from "react";
import { cn } from "../admin/utils";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";

export default function Sidebar({ active, onChange }) {
    const nav = [
        { key: "rooms", label: "Rooms", icon: IC.rooms },
        { key: "events", label: "Événements", icon: IC.events },
    ];

    return (
        <aside className="w-full sm:w-56 shrink-0 self-stretch">
            <div className="rounded-2xl bg-slate-900 p-4 h-full">
                <div className="flex items-center gap-2.5 mb-5 px-1">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white">
                        <Icon path={IC.rooms} size={16} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Admin</div>
                        <div className="text-xs text-slate-400">Gestion Rooms & Events</div>
                    </div>
                </div>

                <nav className="space-y-1">
                    {nav.map((it) => (
                        <button
                            key={it.key}
                            type="button"
                            onClick={() => onChange(it.key)}
                            className={cn(
                                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                                active === it.key
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon path={it.icon} size={15} />
                            {it.label}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}