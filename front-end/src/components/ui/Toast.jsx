import React from "react";
import { cn } from "../admin/utils";
import Icon from "../icons/Icon";
import { IC } from "../icons/paths";

export default function Toast({ text, onClose }) {
    if (!text) return null;
    const isSuccess = text.startsWith("✅");
    const isError = text.startsWith("❌");

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm mb-5",
                isSuccess
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : isError
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
            )}
        >
            <div className="flex items-center gap-2">
                <Icon path={isSuccess ? IC.check : IC.alert} size={15} />
                <span>{text.replace(/^[✅❌⚠️]\s*/, "")}</span>
            </div>
            <button
                onClick={onClose}
                className="opacity-50 hover:opacity-100 transition-opacity"
            >
                <Icon path={IC.close} size={13} />
            </button>
        </div>
    );
}