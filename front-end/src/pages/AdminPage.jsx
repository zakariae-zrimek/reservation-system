import React, { useState } from "react";
import { API_BASE } from "../components/admin/constants";
import Icon from "../components/icons/Icon.jsx";
import {IC} from "../components/icons/paths.js";
import Sidebar from "../components/sidebar/Sidebar.jsx";
import RoomsTab from "../components/rooms/RoomsTab.jsx";
import EventsTab from "../components/events/EventsTab.jsx";


export default function AdminPage() {
    const [active, setActive] = useState("rooms");

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm text-white">
                        <Icon path={IC.rooms} size={15} />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Dashboard Admin</span>
                </div>
                {/*<span className="text-xs text-slate-400 font-mono">{API_BASE}</span>*/}
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-6 items-stretch">
                <Sidebar active={active} onChange={setActive} />
                <main className="flex-1 min-w-0">
                    {active === "rooms" && <RoomsTab />}
                    {active === "events" && <EventsTab />}
                </main>
            </div>
        </div>
    );
}