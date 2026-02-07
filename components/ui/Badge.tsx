import React from 'react';

export const Badge: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toLowerCase();
    const styles: Record<string, string> = {
        pago: "bg-emerald-100 text-emerald-700",
        pendente: "bg-amber-100 text-amber-700",
        atrasado: "bg-rose-100 text-rose-700",
        default: "bg-slate-100 text-slate-700"
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[s] || styles.default}`}>
            {status}
        </span>
    );
};
