
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Service, Expense, Sale, FinancialDocument, CompanyProfile } from '../types';

const INITIAL_COMPANY_PROFILE: CompanyProfile = {
    name: 'SSA360 SOLUÇÕES CAPTAÇÃO DE IMAGEM',
    cnpj: '57.502.430/0001-29',
    phone: '(71) 98765-4321',
    email: 'contato@ssa360.com.br',
    address: 'Conjunto São Judas Tadeu, nº 114, Bl41, Pernambués - Salvador/BA',
    ownerName: 'Leandro Nascimento'
};

export const useAppData = () => {
    const [services, setServices] = useState<Service[]>(() => JSON.parse(localStorage.getItem('ga_services') || '[]'));
    const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('ga_expenses') || '[]'));
    const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('ga_sales') || '[]'));
    const [documents, setDocuments] = useState<FinancialDocument[]>(() => JSON.parse(localStorage.getItem('ga_docs') || '[]'));
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
        const saved = localStorage.getItem('ga_company_profile');
        return saved ? JSON.parse(saved) : INITIAL_COMPANY_PROFILE;
    });

    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const isInitialMount = useRef(true);

    // Initialize Supabase
    useEffect(() => {
        if (companyProfile.cloudConfig?.supabaseUrl && companyProfile.cloudConfig?.supabaseKey) {
            try {
                const client = createClient(
                    companyProfile.cloudConfig.supabaseUrl,
                    companyProfile.cloudConfig.supabaseKey
                );
                setSupabase(client);
            } catch (err) {
                console.error("Error initializing Supabase:", err);
            }
        } else {
            setSupabase(null);
        }
    }, [companyProfile.cloudConfig?.supabaseUrl, companyProfile.cloudConfig?.supabaseKey]);

    // Sync to Cloud
    const syncToCloud = useCallback(async () => {
        if (!supabase || !companyProfile.cloudConfig?.projectId) return;

        setSyncStatus('syncing');
        const fullData = { services, expenses, sales, documents, companyProfile };

        try {
            const { error } = await supabase
                .from('app_data')
                .upsert({
                    id: companyProfile.cloudConfig.projectId,
                    data: fullData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) throw error;
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (err) {
            console.error("Error syncing to cloud:", err);
            setSyncStatus('error');
        }
    }, [supabase, services, expenses, sales, documents, companyProfile]);

    // Fetch from Cloud
    useEffect(() => {
        const fetchCloudData = async () => {
            if (!supabase || !companyProfile.cloudConfig?.projectId) return;

            setSyncStatus('syncing');
            try {
                const { data, error } = await supabase
                    .from('app_data')
                    .select('data')
                    .eq('id', companyProfile.cloudConfig.projectId)
                    .maybeSingle();

                if (data?.data && !error) {
                    const cloud = data.data;
                    if (cloud.services) setServices(cloud.services);
                    if (cloud.expenses) setExpenses(cloud.expenses);
                    if (cloud.sales) setSales(cloud.sales);
                    if (cloud.documents) setDocuments(cloud.documents);
                    if (cloud.companyProfile) setCompanyProfile(cloud.companyProfile);
                    setSyncStatus('success');
                } else {
                    setSyncStatus('idle');
                }
            } catch (err) {
                console.error("Error fetching cloud data:", err);
                setSyncStatus('error');
            }
        };

        if (supabase) {
            fetchCloudData();
        }
    }, [supabase, companyProfile.cloudConfig?.projectId]);

    // Auto-save and Sync
    useEffect(() => {
        localStorage.setItem('ga_services', JSON.stringify(services));
        localStorage.setItem('ga_expenses', JSON.stringify(expenses));
        localStorage.setItem('ga_sales', JSON.stringify(sales));
        localStorage.setItem('ga_docs', JSON.stringify(documents));
        localStorage.setItem('ga_company_profile', JSON.stringify(companyProfile));

        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            syncToCloud();
        }, 3000);

        return () => clearTimeout(timeout);
    }, [services, expenses, sales, documents, companyProfile, syncToCloud]);

    return {
        services, setServices,
        expenses, setExpenses,
        sales, setSales,
        documents, setDocuments,
        companyProfile, setCompanyProfile,
        syncStatus,
        supabase
    };
};
