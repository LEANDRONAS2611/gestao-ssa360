import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden ${className}`}>
        {children}
    </div>
);
