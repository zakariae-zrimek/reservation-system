import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export function useRooms() {
    const [rooms,   setRooms]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/events/details`)
            .then((res) => {
                if (!res.ok) throw new Error("Erreur chargement rooms");

                return res.json();
            })
            .then((data) => setRooms(
                Array.isArray(data) ? data : [])
            )
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return { rooms, loading, error };
}