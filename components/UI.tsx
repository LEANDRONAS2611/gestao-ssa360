
import React from 'react';
import { LucideIcon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden ${className}`}>
    {children}
  </div>
);

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

export const MonthSelector: React.FC<{ currentDate: Date; onChange: (d: Date) => void }> = ({ currentDate, onChange }) => {
  const handlePrev = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    onChange(d);
  };
  const handleNext = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    onChange(d);
  };

  return (
    <div className="flex items-center bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-200/30">
      <button onClick={handlePrev} className="p-3 hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
        <ChevronLeft size={18} />
      </button>
      <div className="px-6 py-2 text-[11px] font-black text-slate-700 min-w-[160px] text-center flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
      </div>
      <button onClick={handleNext} className="p-3 hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
