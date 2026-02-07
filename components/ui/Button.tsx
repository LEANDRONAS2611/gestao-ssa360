import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dark' | 'outline';
    icon?: LucideIcon;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    icon: Icon,
    loading,
    ...props
}) => {
    const variants = {
        primary: "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0",
        secondary: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5",
        danger: "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
        ghost: "text-slate-600 hover:bg-slate-100",
        dark: "bg-slate-900 text-white hover:bg-black hover:shadow-xl",
        outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600"
    };

    return (
        <button
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : Icon && <Icon size={18} />}
            {children}
        </button>
    );
};
