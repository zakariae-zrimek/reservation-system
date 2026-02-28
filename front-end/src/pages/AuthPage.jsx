import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiRegister } from "../api/authApi";

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
    mail:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    lock:   "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
    user:   "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    eye:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
    eyeoff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
    check:  "M20 6L9 17l-5-5",
    alert:  "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    arrow:  "M5 12h14M12 5l7 7-7 7",
};

/* ─── TOAST ─────────────────────────────────────────────── */
function Toast({ text, onClose }) {
    if (!text) return null;
    const isSuccess = text.startsWith("✅");
    const isError   = text.startsWith("❌");
    return (
        <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm mb-5 ${
            isSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                isError   ? "bg-red-50 border-red-200 text-red-800" :
                    "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
            <div className="flex items-center gap-2">
                <Ico path={isSuccess ? IC.check : IC.alert} size={15} />
                <span>{text.replace(/^[✅❌⚠️]\s*/, "")}</span>
            </div>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
                <Ico path="M18 6L6 18M6 6l12 12" size={14} />
            </button>
        </div>
    );
}

/* ─── INPUT FIELD ───────────────────────────────────────── */
function InputField({ label, type = "text", value, onChange, placeholder, icon, suffix }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Ico path={icon} size={15} />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm text-slate-900 placeholder-slate-400
            focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all
            ${icon ? "pl-10" : "pl-4"} ${suffix ? "pr-11" : "pr-4"}`}
                />
                {suffix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
                )}
            </div>
        </div>
    );
}

/* ─── LOGIN FORM ────────────────────────────────────────── */
function LoginForm({ onLogin }) {
    const navigate  = useNavigate();
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [showPwd,  setShowPwd]  = useState(false);
    const [toast,    setToast]    = useState("");
    const [loading,  setLoading]  = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) { setToast("⚠️ Remplis email et mot de passe."); return; }
        setLoading(true);
        try {
            const data = await apiLogin({ email, password });
            // Sauvegarde token / userId
            if (data.token)  localStorage.setItem("token",  data.token);
            if (data.user.id) localStorage.setItem("userId", data.user.id);
            if(data.user.role) localStorage.setItem("role",data.user.role )
            setToast("✅ Connexion réussie !");
            onLogin?.();
            const role = (data?.user?.role || "").toLowerCase();
            const target = role === "admin" ? "/admin" : "/";
            setTimeout(() => navigate(target), 800);


        } catch (err) {
            setToast(`❌ ${err.message || "Email ou mot de passe incorrect."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Toast text={toast} onClose={() => setToast("")} />

            <InputField
                label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@mail.com" icon={IC.mail}
            />

            <InputField
                label="Mot de passe" type={showPwd ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" icon={IC.lock}
                suffix={
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                            className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Ico path={showPwd ? IC.eyeoff : IC.eye} size={15} />
                    </button>
                }
            />

            <div className="pt-1">
                <button type="submit" disabled={loading}
                        className="group w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2">
                    {loading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><span>Se connecter</span><span className="group-hover:translate-x-0.5 transition-transform"><Ico path={IC.arrow} size={15} /></span></>
                    }
                </button>
            </div>
        </form>
    );
}

/* ─── REGISTER FORM ─────────────────────────────────────── */
function RegisterForm({ onSwitchToLogin }) {
    const [name,     setName]     = useState("");
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [showPwd,  setShowPwd]  = useState(false);
    const [toast,    setToast]    = useState("");
    const [loading,  setLoading]  = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            setToast("⚠️ Remplis tous les champs."); return;
        }
        if (password.length < 6) { setToast("⚠️ Mot de passe trop court (min 6 caractères)."); return; }
        setLoading(true);
        try {
            await apiRegister({ name, email, password });
            setToast("✅ Compte créé ! Tu peux maintenant te connecter.");
            setTimeout(() => onSwitchToLogin?.(), 1200);
        } catch (err) {
            setToast(`❌ ${err.message || "Erreur lors de l'inscription."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Toast text={toast} onClose={() => setToast("")} />

            <InputField
                label="Nom complet" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" icon={IC.user}
            />

            <InputField
                label="Email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@mail.com" icon={IC.mail}
            />

            <InputField
                label="Mot de passe" type={showPwd ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères" icon={IC.lock}
                suffix={
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                            className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Ico path={showPwd ? IC.eyeoff : IC.eye} size={15} />
                    </button>
                }
            />

            <div className="pt-1">
                <button type="submit" disabled={loading}
                        className="group w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2">
                    {loading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><span>Créer mon compte</span><span className="group-hover:translate-x-0.5 transition-transform"><Ico path={IC.arrow} size={15} /></span></>
                    }
                </button>
            </div>
        </form>
    );
}

/* ─── AUTH PAGE ─────────────────────────────────────────── */
export default function AuthPage({ onLogin }) {
    const [tab, setTab] = useState("login"); // "login" | "register"

    return (
        <div
            className="relative min-h-screen bg-white flex items-center justify-center px-4 py-12"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 12px 12px, rgba(37, 99, 235, 0.22) 2px, transparent 2.2px)",
                backgroundSize: "28px 28px",
            }}
        >
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-black tracking-tight text-slate-900 mb-1"
                         style={{ letterSpacing: "-0.03em" }}>
                        Event<span className="text-blue-600">Book</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        {tab === "login" ? "Connecte-toi à ton compte" : "Crée ton compte gratuitement"}
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-xl overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        {[
                            { key: "login",    label: "Connexion"  },
                            { key: "register", label: "Inscription" },
                        ].map((t) => (
                            <button key={t.key} type="button" onClick={() => setTab(t.key)}
                                    className={`flex-1 py-4 text-sm font-bold transition-colors ${
                                        tab === t.key
                                            ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                                            : "text-slate-400 hover:text-slate-600"
                                    }`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Forms */}
                    <div className="p-6 sm:p-8">
                        {tab === "login"
                            ? <LoginForm onLogin={onLogin} />
                            : <RegisterForm onSwitchToLogin={() => setTab("login")} />
                        }
                    </div>
                </div>

                {/* Switch link */}
                <p className="mt-5 text-center text-sm text-slate-500">
                    {tab === "login" ? (
                        <>Pas encore de compte ?{" "}
                            <button onClick={() => setTab("register")}
                                    className="font-semibold text-blue-600 hover:underline">
                                S'inscrire
                            </button>
                        </>
                    ) : (
                        <>Déjà un compte ?{" "}
                            <button onClick={() => setTab("login")}
                                    className="font-semibold text-blue-600 hover:underline">
                                Se connecter
                            </button>
                        </>
                    )}
                </p>

                <p className="mt-6 text-center text-xs text-slate-400">
                    EventBook © {new Date().getFullYear()} — Tous droits réservés
                </p>
            </div>
        </div>
    );
}
