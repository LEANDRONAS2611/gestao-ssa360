
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Sparkles, Loader2, BrainCircuit, ArrowUpRight, ArrowDownRight, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Button, MonthSelector } from '../components/UI';
import { analyzeFinances } from '../services/geminiService';
import { listUpcomingEvents, isGoogleConnected, signInToGoogle } from '../services/googleCalendar';
import { CalendarEvent, Transaction, Lead, Expense } from '../types';

const SALES_KEY = 'ssa360_sales_v2';
const EXPENSES_KEY = 'ssa360_expenses_clean';
const MANUAL_TRANSACTIONS_KEY = 'ssa360_financial_manual';

const Dashboard: React.FC<{ currentDate: Date; setCurrentDate: (d: Date) => void }> = ({ currentDate, setCurrentDate }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Dados Reais
  const [financialData, setFinancialData] = useState<{
    revenue: number;
    expenses: number;
    profit: number;
    leadCount: number;
    chartData: any[];
  }>({ revenue: 0, expenses: 0, profit: 0, leadCount: 0, chartData: [] });

  // Estados para Calendário
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isCalendarLinked, setIsCalendarLinked] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Efeito para carregar dados reais e consolidar
  useEffect(() => {
    const loadRealData = () => {
      const savedLeads: Lead[] = JSON.parse(localStorage.getItem(SALES_KEY) || '[]');
      const savedExpenses: Expense[] = JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
      const savedManual: Transaction[] = JSON.parse(localStorage.getItem(MANUAL_TRANSACTIONS_KEY) || '[]');

      // 1. Consolidar Leads Ativos
      const activeLeads = savedLeads.length;

      // 2. Filtrar Transações pelo Mês Atual
      const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM
      
      const allTransactions = [
        ...savedLeads.filter(l => l.status === 'Fechado').map(l => ({ 
            value: l.value, 
            type: 'Entrada', 
            date: l.lastContact ? l.lastContact.split('/').reverse().join('-') : new Date().toISOString().split('T')[0] 
        })),
        ...savedExpenses.filter(e => e.status === 'Pago').map(e => ({ value: e.value, type: 'Saída', date: e.date })),
        ...savedManual.map(t => ({ value: t.value, type: t.type, date: t.date }))
      ];

      const monthTransactions = allTransactions.filter(t => t.date.startsWith(currentMonthStr));

      const totalRevenue = monthTransactions.filter(t => t.type === 'Entrada').reduce((acc, t) => acc + t.value, 0);
      const totalExpenses = monthTransactions.filter(t => t.type === 'Saída').reduce((acc, t) => acc + t.value, 0);

      // 3. Gerar Dados do Gráfico (Agrupar por mês, últimos 4 meses)
      const chartDataMap = new Map();
      const today = new Date();
      // Inicializar últimos 4 meses
      for(let i=3; i>=0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7); // YYYY-MM
        const label = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        chartDataMap.set(key, { name: label, receitas: 0, despesas: 0 });
      }

      allTransactions.forEach(t => {
        const key = t.date.slice(0, 7);
        if (chartDataMap.has(key)) {
          const entry = chartDataMap.get(key);
          if (t.type === 'Entrada') entry.receitas += t.value;
          else entry.despesas += t.value;
        }
      });

      setFinancialData({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        leadCount: activeLeads,
        chartData: Array.from(chartDataMap.values())
      });
    };

    loadRealData();
    window.addEventListener('storage', loadRealData); // Escutar mudanças em outras abas
    return () => window.removeEventListener('storage', loadRealData);
  }, [currentDate, refreshTrigger]);

  useEffect(() => {
    const checkAuthAndLoadEvents = async () => {
      const connected = isGoogleConnected();
      setIsCalendarLinked(connected);
      if (connected) {
        setLoadingCalendar(true);
        const data = await listUpcomingEvents();
        // @ts-ignore
        setEvents(data);
        setLoadingCalendar(false);
      }
    };

    checkAuthAndLoadEvents();

    const handleAuthChange = () => checkAuthAndLoadEvents();
    window.addEventListener('google-auth-changed', handleAuthChange);
    return () => window.removeEventListener('google-auth-changed', handleAuthChange);
  }, []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const summary = `Mês ${currentDate.toLocaleDateString('pt-BR', {month:'long'})}. Receitas: R$ ${financialData.revenue}, Despesas: R$ ${financialData.expenses}, Lucro: R$ ${financialData.profit}. Leads ativos: ${financialData.leadCount}.`;
      const result = await analyzeFinances(summary);
      setAiAnalysis(result || "Não foi possível gerar análise no momento.");
    } catch (error) {
      console.error(error);
      setAiAnalysis("Erro na conexão com a inteligência artificial.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const margin = financialData.revenue > 0 ? ((financialData.profit / financialData.revenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Painel Executivo</h2>
          <p className="text-sm text-slate-500 font-medium">Dados reais consolidados de Vendas e Finanças.</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar items-center">
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
          <Button variant="secondary" onClick={() => setRefreshTrigger(prev => prev + 1)} className="px-3" icon={RefreshCw}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Receita (Mês)', val: `R$ ${financialData.revenue.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`, color: 'blue', icon: DollarSign, trend: 'Entradas', up: true },
          { label: 'Despesas (Mês)', val: `R$ ${financialData.expenses.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`, color: 'rose', icon: TrendingDown, trend: 'Saídas', up: false },
          { label: 'Lucro Líquido', val: `R$ ${financialData.profit.toLocaleString('pt-BR', {maximumFractionDigits: 0})}`, color: financialData.profit >= 0 ? 'emerald' : 'rose', icon: TrendingUp, trend: `Margem ${margin}%`, up: financialData.profit >= 0 },
          { label: 'Leads no Pipeline', val: financialData.leadCount.toString(), color: 'purple', icon: Users, trend: 'Oportunidades', up: true },
        ].map((item, i) => (
          <Card key={i} className={`p-4 md:p-6 bg-white border-l-4 border-l-${item.color}-500 shadow-sm hover:translate-y-[-2px] transition-transform`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                <h4 className="text-xl md:text-2xl font-black text-slate-900">{item.val}</h4>
              </div>
              <div className={`p-2 rounded-xl bg-${item.color}-50 text-${item.color}-600`}>
                <item.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
               <span className={`flex items-center text-[10px] font-black ${item.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {item.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                 {item.trend}
               </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO */}
        <Card className="lg:col-span-2 p-4 md:p-6 bg-white border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Fluxo de Caixa Histórico</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Últimos 4 meses consolidados</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><span className="text-[10px] font-black uppercase text-slate-500">Receitas</span></div>
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div><span className="text-[10px] font-black uppercase text-slate-500">Despesas</span></div>
            </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                  contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                />
                <Area type="monotone" dataKey="receitas" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRec)" animationDuration={1500} />
                <Area type="monotone" dataKey="despesas" stroke="#cbd5e1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* COLUNA LATERAL - CALENDÁRIO E IA */}
        <div className="space-y-6">
          
          {/* WIDGET CALENDÁRIO */}
          <Card className="p-6 bg-white border-blue-100 min-h-[200px]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
               <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                 <Calendar size={14} /> Agenda Google
               </h3>
               {!isCalendarLinked && (
                 <button onClick={signInToGoogle} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 underline">Conectar</button>
               )}
            </div>
            
            {!isCalendarLinked ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 opacity-50">
                 <Calendar size={32} />
                 <p className="text-xs font-bold">Agenda desconectada</p>
                 <p className="text-[10px]">Vincule nas configurações</p>
              </div>
            ) : loadingCalendar ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : events.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">Nenhum evento próximo encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(evt => (
                  <div key={evt.id} className="flex gap-3 items-start group">
                    <div className="w-10 flex-shrink-0 text-center bg-blue-50 rounded-lg py-1">
                      <p className="text-[10px] font-bold uppercase text-blue-400">{evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleDateString('pt-BR', {weekday: 'short'}) : 'Dia'}</p>
                      <p className="text-sm font-black text-blue-600">{evt.start.dateTime ? new Date(evt.start.dateTime).getDate() : 'All'}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{evt.summary}</p>
                      <p className="text-[10px] text-slate-400 truncate">{evt.start.dateTime ? new Date(evt.start.dateTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : 'Dia todo'}</p>
                    </div>
                    <a href={evt.htmlLink} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-blue-500 transition-all">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* WIDGET IA */}
          <Card className="p-4 md:p-8 bg-slate-900 text-white border-none relative overflow-hidden flex flex-col shadow-2xl">
             <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                     <BrainCircuit className="text-blue-400" size={24} />
                  </div>
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Gemini Pro AI</h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase">Business Intelligence</p>
                  </div>
                </div>
                
                {aiAnalysis ? (
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="space-y-4 text-sm font-medium leading-relaxed text-slate-300">
                        {aiAnalysis.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('-') ? 'pl-4 border-l-2 border-blue-500/30' : ''}>
                            {line}
                          </p>
                        ))}
                     </div>
                     <button 
                       className="mt-8 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors flex items-center gap-2"
                       onClick={() => setAiAnalysis(null)}
                     >
                       Redefinir Análise <Sparkles size={12} />
                     </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                      <Sparkles className="text-blue-400" size={36} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black tracking-tight">Análise Estratégica</h4>
                      <p className="text-xs text-slate-400 px-6 font-medium leading-relaxed">Processar dados financeiros para otimização.</p>
                    </div>
                    <Button variant="ai" className="w-full py-4 text-xs font-black uppercase tracking-widest" onClick={handleAIAnalysis} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} /> Processando...
                        </span>
                      ) : "Gerar Diagnóstico IA"}
                    </Button>
                  </div>
                )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
    