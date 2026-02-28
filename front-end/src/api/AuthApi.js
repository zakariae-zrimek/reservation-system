const AUTH_BASE = "http://localhost:5000/api/auth";

export async function apiLogin({ email, password }) {
    const res = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "Erreur de connexion");
        throw new Error(msg);
    }
    return res.json(); // { token, userId, ... }
}

export async function apiRegister({ name, email, password }) {
    const res = await fetch(`${AUTH_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "Erreur d'inscription");
        throw new Error(msg);
    }
    return res.json();
}
