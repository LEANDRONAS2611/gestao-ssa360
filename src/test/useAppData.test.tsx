
import { renderHook, act } from '@testing-library/react';
import { useAppData } from '../../hooks/useAppData';
import { Sale, Expense } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('useAppData Hook', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('should initialize with empty data', () => {
        const { result } = renderHook(() => useAppData());
        expect(result.current.sales).toEqual([]);
        expect(result.current.expenses).toEqual([]);
        expect(result.current.services).toEqual([]);
    });

    it('should add a sale and persist to localStorage', () => {
        const { result } = renderHook(() => useAppData());

        const newSale: Sale = {
            id: '1',
            clientName: 'Test Client',
            date: '2023-01-01',
            items: [],
            total: 100,
            paymentMethod: 'PIX',
            status: 'Concluído'
        };

        act(() => {
            result.current.setSales([newSale]);
        });

        expect(result.current.sales).toHaveLength(1);
        expect(result.current.sales[0]).toEqual(newSale);
        expect(window.localStorage.getItem('ga_sales')).toContain('Test Client');
    });

    it('should add an expense and persist to localStorage', () => {
        const { result } = renderHook(() => useAppData());

        const newExpense: Expense = {
            id: '1',
            description: 'Test Expense',
            category: 'Office',
            value: 50,
            date: '2023-01-01',
            status: 'Pago'
        };

        act(() => {
            result.current.setExpenses([newExpense]);
        });

        expect(result.current.expenses).toHaveLength(1);
        expect(result.current.expenses[0]).toEqual(newExpense);
        expect(window.localStorage.getItem('ga_expenses')).toContain('Test Expense');
    });
});
