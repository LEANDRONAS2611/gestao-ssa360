
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ServicesView } from './views/ServicesView';
import { SalesView } from './views/SalesView';
import { ProposalView } from './views/ProposalView';
import { ContractView } from './views/ContractView';
import { ExpensesView } from './views/ExpensesView';
import { FinancialView } from './views/FinancialView';
import { SettingsView } from './views/SettingsView';
import { ViewType, Service, Expense, Sale, CompanyProfile } from './types';
import { ChevronRight, Home, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>(ViewType.DASHBOARD);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const isInitialMount = useRef(true);

  // --- Estados Principais ---
  const [services, setServices] = useState<Service[]>(() => JSON.parse(localStorage.getItem('ga_services') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('ga_expenses') || '[]'));
  const [sales, setSales] = useState<Sale[]>(() => JSON.parse(localStorage.getItem('ga_sales') || '[]'));
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('ga_company_profile');
    return saved ? JSON.parse(saved) : {
      name: 'SSA360 SOLUÇÕES CAPTAÇÃO DE IMAGEM',
      cnpj: '57.502.430/0001-29',
      phone: '(71) 98765-4321',
      email: 'contato@ssa360.com.br',
      address: 'Conjunto São Judas Tadeu, nº 114, Bl41, Pernambués - Salvador/BA',
      ownerName: 'Leandro Nascimento'
    };
  });

  // --- Inicialização do Cliente Cloud ---
  useEffect(() => {
    if (companyProfile.cloudConfig?.supabaseUrl && companyProfile.cloudConfig?.supabaseKey) {
      try {
        const client = createClient(
          companyProfile.cloudConfig.supabaseUrl,
          companyProfile.cloudConfig.supabaseKey
        );
        setSupabase(client);
      } catch (err) {
        console.error("Erro ao inicializar Supabase:", err);
      }
    } else {
      setSupabase(null);
    }
  }, [companyProfile.cloudConfig?.supabaseUrl, companyProfile.cloudConfig?.supabaseKey]);

  // --- Função de Sincronização (Upsert) ---
  const syncToCloud = useCallback(async () => {
    if (!supabase || !companyProfile.cloudConfig?.projectId) return;

    setSyncStatus('syncing');
    const fullData = { services, expenses, sales, companyProfile };
    
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
      console.error("Erro na sincronização Cloud:", err);
      setSyncStatus('error');
    }
  }, [supabase, services, expenses, sales, companyProfile]);

  // --- Carregamento Inicial da Nuvem ---
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
          if (cloud.companyProfile) setCompanyProfile(cloud.companyProfile);
          setSyncStatus('success');
        } else {
          setSyncStatus('idle');
        }
      } catch (err) {
        console.error("Erro ao buscar dados na nuvem:", err);
        setSyncStatus('error');
      }
    };
    
    if (supabase) {
      fetchCloudData();
    }
  }, [supabase, companyProfile.cloudConfig?.projectId]);

  // --- Auto-Save Local e Cloud Sync (com Debounce) ---
  useEffect(() => {
    // Salva localmente sempre
    localStorage.setItem('ga_services', JSON.stringify(services));
    localStorage.setItem('ga_expenses', JSON.stringify(expenses));
    localStorage.setItem('ga_sales', JSON.stringify(sales));
    localStorage.setItem('ga_company_profile', JSON.stringify(companyProfile));

    // Evita sincronizar no primeiro mount (para não sobrescrever a nuvem com dados locais vazios)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      syncToCloud();
    }, 3000); 

    return () => clearTimeout(timeout);
  }, [services, expenses, sales, companyProfile, syncToCloud]);

  const renderContent = () => {
    switch (activeTab) {
      case ViewType.DASHBOARD:
        return <DashboardView currentDate={currentDate} setCurrentDate={setCurrentDate} sales={sales} expenses={expenses} setActiveTab={setActiveTab} />;
      case ViewType.SERVICES:
        return <ServicesView services={services} setServices={setServices} />;
      case ViewType.SALES:
        return (
          <SalesView 
            services={services} 
            sales={sales} 
            setSales={setSales} 
            expenses={expenses}
            setExpenses={setExpenses}
            setActiveTab={setActiveTab} 
          />
        );
      case ViewType.PROPOSALS:
        return <ProposalView companyProfile={companyProfile} />;
      case ViewType.CONTRACTS:
        return <ContractView companyProfile={companyProfile} />;
      case ViewType.EXPENSES:
        return <ExpensesView currentDate={currentDate} setCurrentDate={setCurrentDate} expenses={expenses} setExpenses={setExpenses} />;
      case ViewType.FINANCIAL:
        return (
          <FinancialView 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            sales={sales} 
            expenses={expenses} 
            setSales={setSales}
            setExpenses={setExpenses}
          />
        );
      case ViewType.SETTINGS:
        return <SettingsView profile={companyProfile} setProfile={setCompanyProfile} />;
      default:
        return <DashboardView currentDate={currentDate} setCurrentDate={setCurrentDate} sales={sales} expenses={expenses} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-inter">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        ownerName={companyProfile.ownerName} 
        isCloudActive={!!supabase}
        syncStatus={syncStatus}
      />
      
      <main className="flex-1 lg:ml-72 p-6 md:p-12 transition-all duration-500 min-h-screen">
        <div className="max-w-7xl mx-auto pb-24">
          <div className="mb-10 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                <Home size={14} />
              </div>
              <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <button onClick={() => setActiveTab(ViewType.DASHBOARD)} className="hover:text-blue-600 transition-colors">Dashboard</button>
                <ChevronRight size={12} className="mx-2 text-slate-300" />
                <span className="text-blue-600 font-black">{activeTab.replace('-', ' ')}</span>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                {syncStatus === 'syncing' ? (
                  <RefreshCw size={12} className="text-blue-500 animate-spin" />
                ) : syncStatus === 'error' ? (
                  <AlertCircle size={12} className="text-rose-500" />
                ) : supabase ? (
                  <Cloud size={12} className="text-emerald-500" />
                ) : (
                  <CloudOff size={12} className="text-slate-300" />
                )}
                <span className={`text-[10px] font-black uppercase tracking-widest 
                  ${syncStatus === 'error' ? 'text-rose-600' : supabase ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {syncStatus === 'syncing' ? 'Sincronizando...' : 
                   syncStatus === 'error' ? 'Erro de Sincronia' :
                   supabase ? 'Conectado à Nuvem' : 'Modo Local'}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <span className="text-[10px] font-black text-slate-300 tracking-[0.3em]">GESTAO AZUL PRO</span>
            </div>
          </div>

          <div className="relative">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
