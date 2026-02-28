import React from "react";
import RoomCard from "./RoomCard";

export default function RoomsList({ rooms, onSelectRoom }) {
    return (
        <div className="space-y-5">
            {rooms.map((r) => (
                <RoomCard key={r.id} room={r} onSelect={onSelectRoom} />
            ))}
        </div>
    );
}