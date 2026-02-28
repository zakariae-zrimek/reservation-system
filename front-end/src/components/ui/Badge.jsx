import React from "react";

export default function Badge({ children }) {
    return (
        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
      {children}
    </span>
    );
}