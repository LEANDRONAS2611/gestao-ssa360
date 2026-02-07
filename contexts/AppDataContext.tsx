
import React, { createContext, useContext, ReactNode } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Service, Expense, Sale, FinancialDocument, CompanyProfile } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

interface AppDataContextData {
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    documents: FinancialDocument[];
    setDocuments: React.Dispatch<React.SetStateAction<FinancialDocument[]>>;
    companyProfile: CompanyProfile;
    setCompanyProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
    syncStatus: 'idle' | 'syncing' | 'error' | 'success';
    supabase: SupabaseClient | null;
}

const AppDataContext = createContext<AppDataContextData>({} as AppDataContextData);

export const useApp = () => useContext(AppDataContext);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const appData = useAppData();

    return (
        <AppDataContext.Provider value={appData}>
            {children}
        </AppDataContext.Provider>
    );
};
