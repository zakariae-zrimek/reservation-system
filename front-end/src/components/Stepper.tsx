function Step({ n, label, active }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold " +
                    (active ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700")
                }
            >
                {n}
            </div>
            <div className="text-xs text-slate-600">{label}</div>
        </div>
    );
}

export default function Stepper() {
    return (
        <div className="mt-7 w-full max-w-xl">
            <div className="relative">
                <div className="absolute left-0 right-0 top-4 h-1 rounded-full bg-blue-200" />
                <div className="absolute left-0 top-4 h-1 rounded-full bg-blue-600" style={{ width: "100%" }} />
                <div className="relative flex items-start justify-between">
                    <Step n={1} label="Créer un compte" active />
                    <Step n={2} label="Réservez votre salle" active />
                    <Step n={3} label="Gérez vos réservations" active />
                </div>
            </div>
        </div>
    );
}