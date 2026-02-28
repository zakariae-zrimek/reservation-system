import React, { useEffect } from "react";
import { cn } from "../admin/utils";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";

export default function Drawer({ open, onClose, title, subtitle, children }) {
    useEffect(() => {
        const fn = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, [open, onClose]);

    return (
        <>
            <div
                onClick={onClose}
                className={cn(
                    "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            />
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-start justify-between px-7 py-6 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                        {/*{subtitle && (*/}
                        {/*    <p className="mt-0.5 text-xs text-slate-400 font-mono">*/}
                        {/*        {subtitle}*/}
                        {/*    </p>*/}
                        {/*)}*/}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500 shrink-0"
                    >
                        <Icon path={IC.close} size={15} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
            </div>
        </>
    );
}