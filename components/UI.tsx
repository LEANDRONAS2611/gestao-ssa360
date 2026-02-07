import React from 'react';
import { LucideIcon, ChevronLeft, ChevronRight, Calendar, Layers } from 'lucide-react';
import { PeriodType } from '../types';

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

// Component for monthly navigation in ExpensesView
export const MonthSelector: React.FC<{ 
  currentDate: Date; 
  onChange: (d: Date) => void;
}> = ({ currentDate, onChange }) => {
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
    <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button onClick={handlePrev} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border-r border-slate-100">
        <ChevronLeft size={16} />
      </button>
      <div className="px-5 py-2 text-[10px] font-black text-slate-700 min-w-[140px] text-center">
        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
      </div>
      <button onClick={handleNext} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border-l border-slate-100">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export const TimeRangeSelector: React.FC<{ 
  currentDate: Date; 
  period: PeriodType; 
  onDateChange: (d: Date) => void;
  onPeriodChange: (p: PeriodType) => void;
}> = ({ currentDate, period, onDateChange, onPeriodChange }) => {
  
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (period === 'month') d.setMonth(d.getMonth() - 1);
    else if (period === 'quarter') d.setMonth(d.getMonth() - 3);
    else if (period === 'semester') d.setMonth(d.getMonth() - 6);
    else if (period === 'year') d.setFullYear(d.getFullYear() - 1);
    onDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (period === 'month') d.setMonth(d.getMonth() + 1);
    else if (period === 'quarter') d.setMonth(d.getMonth() + 3);
    else if (period === 'semester') d.setMonth(d.getMonth() + 6);
    else if (period === 'year') d.setFullYear(d.getFullYear() + 1);
    onDateChange(d);
  };

  const getLabel = () => {
    if (period === 'all') return 'TODO O PERÍODO';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (period === 'month') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
    }
    if (period === 'quarter') {
      const q = Math.floor(month / 3) + 1;
      return `${q}º TRIMESTRE / ${year}`;
    }
    if (period === 'semester') {
      const s = month < 6 ? '1º' : '2º';
      return `${s} SEMESTRE / ${year}`;
    }
    if (period === 'year') {
      return `ANO DE ${year}`;
    }
    return '';
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        {[
          { id: 'month', label: 'Mês' },
          { id: 'quarter', label: 'Trim' },
          { id: 'semester', label: 'Sem' },
          { id: 'year', label: 'Ano' },
          { id: 'all', label: 'Tudo' }
        ].map((p) => (
          <button 
            key={p.id}
            onClick={() => onPeriodChange(p.id as PeriodType)}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${period === p.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period !== 'all' && (
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <button onClick={handlePrev} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border-r border-slate-100">
            <ChevronLeft size={16} />
          </button>
          <div className="px-5 py-2 text-[10px] font-black text-slate-700 min-w-[140px] text-center flex items-center justify-center gap-2">
            {getLabel()}
          </div>
          <button onClick={handleNext} className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border-l border-slate-100">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
