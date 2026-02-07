import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PeriodType } from '../../types';

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
