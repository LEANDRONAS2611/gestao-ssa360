
import React, { useState } from 'react';
import {
  Package, ShoppingCart, DollarSign,
  FileText, CreditCard, LayoutDashboard,
  Menu, X, ChevronRight, LogOut, Settings,
  PenTool, Cloud, CloudOff, RefreshCw, ChevronLeft
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    setIsMobileOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-500/30 no-print"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out no-print shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            {!isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <span className="font-black text-xl tracking-tighter">G</span>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <span className="font-black text-sm">G</span>
              </div>
            )}

            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="font-black text-base tracking-tight leading-none whitespace-nowrap">Gestão Azul</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-bold whitespace-nowrap">Pro Enterprise</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <p className="px-4 mb-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Menu Principal</p>}
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3'} 
                      rounded-xl text-sm font-bold transition-all relative group
                      ${isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-400 transition-colors'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {isActive && !isCollapsed && <ChevronRight size={14} className="text-white/40" />}

                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          {isCloudActive !== undefined && (
            <div className={`mb-4 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
              {isCloudActive ? (
                <Cloud size={16} className="text-emerald-500" />
              ) : (
                <CloudOff size={16} className="text-slate-500" />
              )}
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isCloudActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isCloudActive ? 'Nuvem Ativa' : 'Offline'}
                  </span>
                  {syncStatus === 'syncing' && <span className="text-[9px] text-brand-400 animate-pulse">Sincronizando...</span>}
                </div>
              )}
            </div>
          )}

          <div className={`p-3 rounded-2xl bg-slate-800/40 border border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-black text-brand-400 shrink-0">
              {getInitials(ownerName)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="text-xs font-bold truncate text-slate-200">{ownerName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Diretoria</p>
              </div>
            )}
            {!isCollapsed && (
              <button className="text-slate-500 hover:text-rose-400 transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
