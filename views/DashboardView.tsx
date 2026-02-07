
import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppDataContext';
import { Card, TimeRangeSelector, Button } from '../components/UI';
import {
  TrendingUp, TrendingDown, Wallet, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Activity, Sparkles, Target, Lightbulb,
  BarChart3, Zap, ShieldCheck, AlertTriangle, Loader2, X, MessageSquareQuote
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Sale, Expense, ViewType, PeriodType } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  periodType: PeriodType;
  setPeriodType: (p: PeriodType) => void;
  setActiveTab: (tab: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentDate, setCurrentDate, periodType, setPeriodType, setActiveTab
}) => {
  const { sales, expenses } = useApp();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return {
      sales: sales.filter(s => isDateInPeriod(new Date(s.date), currentDate, periodType)),
      expenses: expenses.filter(e => isDateInPeriod(new Date(e.date), currentDate, periodType))
    };
  }, [sales, expenses, currentDate, periodType]);

  const totalSales = filteredData.sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = filteredData.expenses.reduce((acc, e) => acc + e.value, 0);
  const netProfit = totalSales - totalExpenses;

  const diagnostics = useMemo(() => {
    const margin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const efficiency = totalSales > 0 ? (totalExpenses / totalSales) * 100 : 0;
    return { margin, efficiency };
  }, [totalSales, totalExpenses, netProfit]);

  const askAiAssistant = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Atue como um CFO Digital. Analise meu desempenho financeiro deste período (${periodType}):
      - Faturamento Bruto: R$ ${totalSales.toFixed(2)}
      - Despesas Totais: R$ ${totalExpenses.toFixed(2)}
      - Lucro Líquido: R$ ${netProfit.toFixed(2)}
      - Margem de Lucro: ${diagnostics.margin.toFixed(1)}%
      
      Forneça insights estratégicos curtos considerando que esta é uma análise ${periodType}.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAiResponse(result.text || "Não foi possível gerar insights no momento.");
    } catch (error) {
      console.error("Erro na IA:", error);
      setAiResponse("Erro ao conectar com a consultoria digital.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (periodType === 'month') {
      const data = [{ name: 'S1', r: 0, d: 0 }, { name: 'S2', r: 0, d: 0 }, { name: 'S3', r: 0, d: 0 }, { name: 'S4', r: 0, d: 0 }];
      filteredData.sales.forEach(s => {
        const week = Math.min(Math.floor((new Date(s.date).getDate() - 1) / 7), 3);
        data[week].r += s.total;
      });
      filteredData.expenses.forEach(e => {
        const week = Math.min(Math.floor((new Date(e.date).getDate() - 1) / 7), 3);
        data[week].d += e.value;
      });
      return data;
    }

    // Para períodos maiores, agrupar por mês
    const months: Record<string, { name: string, r: number, d: number }> = {};
    const sortedData = [...filteredData.sales, ...filteredData.expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Inicializar labels vazios se anual
    if (periodType === 'year') {
      for (let i = 0; i < 12; i++) {
        const name = new Date(0, i).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        months[i] = { name, r: 0, d: 0 };
      }
    }

    filteredData.sales.forEach(s => {
      const m = new Date(s.date).getMonth();
      if (!months[m]) months[m] = { name: new Date(0, m).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(), r: 0, d: 0 };
      months[m].r += s.total;
    });
    filteredData.expenses.forEach(e => {
      const m = new Date(e.date).getMonth();
      if (!months[m]) months[m] = { name: new Date(0, m).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(), r: 0, d: 0 };
      months[m].d += e.value;
    });

    return Object.values(months);
  }, [filteredData, periodType]);

  return (
    <div className="space-y-10 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Análise de Performance Empresarial.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={askAiAssistant}
            className="bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200"
            icon={isAiLoading ? Loader2 : Sparkles}
            disabled={isAiLoading}
          >
            {isAiLoading ? 'Consultando...' : 'Análise IA'}
          </Button>
          <TimeRangeSelector
            currentDate={currentDate}
            period={periodType}
            onDateChange={setCurrentDate}
            onPeriodChange={setPeriodType}
          />
        </div>
      </div>

      {aiResponse && (
        <Card className="p-8 border-blue-500/30 border-2 bg-blue-50/50 animate-fade-in relative">
          <button onClick={() => setAiResponse(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"><MessageSquareQuote size={24} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Insight Estratégico</h3>
              <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Faturamento" value={`R$ ${totalSales.toLocaleString('pt-BR')}`} change="Receita Bruta" trend="up" icon={TrendingUp} color="blue" />
        <MetricCard title="Despesas" value={`R$ ${totalExpenses.toLocaleString('pt-BR')}`} change="Gastos" trend="down" icon={TrendingDown} color="rose" />
        <MetricCard title="Lucro Líquido" value={`R$ ${netProfit.toLocaleString('pt-BR')}`} change="Resultado" trend={netProfit >= 0 ? 'up' : 'down'} icon={Wallet} color="emerald" />
        <MetricCard title="Margem" value={`${diagnostics.margin.toFixed(1)}%`} change="Rentabilidade" trend="up" icon={Activity} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={20} /> Fluxo de Caixa por Período
            </h3>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800 }} />
                <Area type="monotone" dataKey="r" name="Receita" stroke="#2563eb" fillOpacity={0.1} fill="#2563eb" strokeWidth={4} />
                <Area type="monotone" dataKey="d" name="Despesa" stroke="#f43f5e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-black text-slate-800 mb-8">Composição do Período</h3>
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contratos Registrados</p>
              <p className="text-2xl font-black text-slate-900">{filteredData.sales.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Médio</p>
              <p className="text-2xl font-black text-slate-900">R$ {filteredData.sales.length > 0 ? (totalSales / filteredData.sales.length).toLocaleString('pt-BR') : '0'}</p>
            </div>
            <div className="p-4 bg-slate-900 text-white rounded-2xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Saldo Atual</p>
              <p className="text-2xl font-black">R$ {netProfit.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <button onClick={() => setActiveTab(ViewType.FINANCIAL)} className="w-full mt-8 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all">
            Ver Detalhes Financeiros
          </button>
        </Card>
      </div>
    </div>
  );
};

// Funções Auxiliares de Data
export function isDateInPeriod(date: Date, anchorDate: Date, period: PeriodType): boolean {
  if (period === 'all') return true;

  const year = anchorDate.getFullYear();
  const month = anchorDate.getMonth();
  const dYear = date.getFullYear();
  const dMonth = date.getMonth();

  if (period === 'month') return dYear === year && dMonth === month;
  if (period === 'quarter') {
    const q = Math.floor(month / 3);
    const dq = Math.floor(dMonth / 3);
    return dYear === year && dq === q;
  }
  if (period === 'semester') {
    const s = month < 6 ? 0 : 1;
    const ds = dMonth < 6 ? 0 : 1;
    return dYear === year && ds === s;
  }
  if (period === 'year') return dYear === year;

  return false;
}

const MetricCard: React.FC<any> = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorMap: any = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-600" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-600" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600" }
  };
  const current = colorMap[color];
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${current.bg} ${current.text}`}><Icon size={24} /></div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{change}</div>
      </div>
      <div className="mt-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
      </div>
    </Card>
  );
};
