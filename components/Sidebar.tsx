
import React from 'react';
import { 
  Package, ShoppingCart, DollarSign, 
  FileText, CreditCard, LayoutDashboard,
  Menu, X, ChevronRight, LogOut, Settings,
  PenTool, Cloud, CloudOff, RefreshCw
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeTab: ViewType;
  setActiveTab: (tab: ViewType) => void;
  ownerName: string;
  isCloudActive?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error' | 'success';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, ownerName, isCloudActive, syncStatus 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: ViewType.DASHBOARD, label: 'Resumo', icon: LayoutDashboard },
    { id: ViewType.SALES, label: 'Vendas', icon: ShoppingCart },
    { id: ViewType.CONTRACTS, label: 'Contratos', icon: PenTool },
    { id: ViewType.PROPOSALS, label: 'Propostas', icon: FileText },
    { id: ViewType.SERVICES, label: 'Serviços', icon: Package },
    { id: ViewType.EXPENSES, label: 'Despesas', icon: CreditCard },
    { id: ViewType.FINANCIAL, label: 'Financeiro', icon: DollarSign },
    { id: ViewType.SETTINGS, label: 'Configurações', icon: Settings },
  ];

  const handleNav = (id: ViewType) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 no-print"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] no-print
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <span className="font-black text-2xl tracking-tighter">G</span>
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight leading-none">Gestão Azul</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-black">Pro Enterprise</span>
                {isCloudActive ? (
                  <Cloud size={10} className="text-emerald-500" />
                ) : (
                  <CloudOff size={10} className="text-slate-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Menu Corporativo</p>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className={`
                      w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all relative group
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-white/50" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6">
          {syncStatus === 'syncing' && (
            <div className="px-4 py-2 mb-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center gap-2">
              <RefreshCw size={12} className="text-blue-400 animate-spin" />
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Sincronizando...</span>
            </div>
          )}
          
          <div className="p-4 rounded-3xl bg-slate-800/40 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-black text-blue-400">
              {getInitials(ownerName)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate">{ownerName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Diretoria</p>
            </div>
            <button className="text-slate-500 hover:text-rose-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
