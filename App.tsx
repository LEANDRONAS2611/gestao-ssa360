
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ServicesView } from './views/ServicesView';
import { SalesView } from './views/SalesView';
import { ProposalView } from './views/ProposalView';
import { ContractView } from './views/ContractView';
import { ExpensesView } from './views/ExpensesView';
import { FinancialView } from './views/FinancialView';
import { SettingsView } from './views/SettingsView';
import { ViewType, PeriodType } from './types';
import { ChevronRight, Home, Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from './contexts/AppDataContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewType>(ViewType.DASHBOARD);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>('month');

  const {
    services, setServices,
    expenses, setExpenses,
    sales, setSales,
    documents, setDocuments,
    companyProfile, setCompanyProfile,
    syncStatus,
    supabase
  } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case ViewType.DASHBOARD:
        return <DashboardView currentDate={currentDate} setCurrentDate={setCurrentDate} periodType={periodType} setPeriodType={setPeriodType} setActiveTab={setActiveTab} />;
      case ViewType.SERVICES:
        return <ServicesView />;
      case ViewType.SALES:
        return (
          <SalesView
            setActiveTab={setActiveTab}
          />
        );
      case ViewType.PROPOSALS:
        return <ProposalView />;
      case ViewType.CONTRACTS:
        return <ContractView />;
      case ViewType.EXPENSES:
        return <ExpensesView currentDate={currentDate} setCurrentDate={setCurrentDate} />;
      case ViewType.FINANCIAL:
        return (
          <FinancialView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            periodType={periodType}
            setPeriodType={setPeriodType}
          />
        );
      case ViewType.SETTINGS:
        return <SettingsView />;
      default:
        return <DashboardView currentDate={currentDate} setCurrentDate={setCurrentDate} periodType={periodType} setPeriodType={setPeriodType} setActiveTab={setActiveTab} />;
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
