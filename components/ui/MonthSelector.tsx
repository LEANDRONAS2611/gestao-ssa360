import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
