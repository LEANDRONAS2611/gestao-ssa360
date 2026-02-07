
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextData {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(state => state.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast = { id, message, type };
        setToasts(state => [...state, toast]);
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-full
              ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : ''}
              ${toast.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
              ${toast.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' : ''}
            `}
                    >
                        {toast.type === 'success' && <CheckCircle size={16} />}
                        {toast.type === 'error' && <AlertCircle size={16} />}
                        {toast.type === 'info' && <Info size={16} />}
                        {toast.type === 'warning' && <AlertTriangle size={16} />}
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
