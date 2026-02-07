import React from 'react';
import { LucideIcon } from 'lucide-react';

export const Input: React.FC<{
    label?: string;
    multiline?: boolean;
    icon?: LucideIcon;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>> = ({
    label, multiline, icon: Icon, error, className = '', ...props
}) => (
        <div className={`flex flex-col gap-2 w-full ${className}`}>
            {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>}
            <div className="relative group">
                {multiline ? (
                    <textarea
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:text-slate-900 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder-slate-400 min-h-[120px]"
                        {...props as any}
                    />
                ) : (
                    <input
                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-900 focus:text-slate-900 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder-slate-400 ${Icon ? 'pr-12' : ''}`}
                        {...props as any}
                    />
                )}
                {Icon && !multiline && <Icon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />}
            </div>
            {error && <span className="text-[10px] text-rose-500 font-bold ml-1">{error}</span>}
        </div>
    );
