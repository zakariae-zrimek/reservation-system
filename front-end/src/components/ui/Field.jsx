import React from "react";
import Icon from "../icons/Icon";

export const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none transition-all";

export default function Field({ label, icon, hint, children }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                {icon && (
                    <span className="text-slate-400">
            <Icon path={icon} size={13} />
          </span>
                )}
                <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            {children}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    );
}