
import React, { useMemo, useState } from 'react';
import { Card, MonthSelector, Button } from '../components/UI';
import { 
  TrendingUp, TrendingDown, Wallet, ShoppingCart, 
  ArrowUpRight, ArrowDownRight, Activity, Sparkles, BrainCircuit, Loader2, Target, Lightbulb
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { Sale, Expense, ViewType } from '../types';
import { GoogleGenAI } from "@google/genai";

interface DashboardViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  sales: Sale[];
  expenses: Expense[];
  setActiveTab: (tab: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentDate, setCurrentDate, sales, expenses, setActiveTab }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Filtra dados pelo mês selecionado
  const filteredData = useMemo(() => {
    const fSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
    const fExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
    return { sales: fSales, expenses: fExpenses };
  }, [sales, expenses, currentDate]);

  const totalSales = filteredData.sales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = filteredData.expenses.reduce((acc, e) => acc + e.value, 0);
  const netProfit = totalSales - totalExpenses;

  const chartData = useMemo(() => {
    const data = [
      { name: 'S1', receitas: 0, despesas: 0 },
      { name: 'S2', receitas: 0, despesas: 0 },
      { name: 'S3', receitas: 0, despesas: 0 },
      { name: 'S4', receitas: 0, despesas: 0 },
    ];

    filteredData.sales.forEach(s => {
      const day = new Date(s.date).getDate();
      const week = Math.min(Math.floor((day - 1) / 7), 3);
      data[week].receitas += s.total;
    });

    filteredData.expenses.forEach(e => {
      const day = new Date(e.date).getDate();
      const week = Math.min(Math.floor((day - 1) / 7), 3);
      data[week].despesas += e.value;
    });

    return data;
  }, [filteredData]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise os dados financeiros deste mês para o proprietário da empresa:
        - Faturamento Total: R$ ${totalSales.toFixed(2)}
        - Despesas Totais: R$ ${totalExpenses.toFixed(2)}
        - Lucro Líquido: R$ ${netProfit.toFixed(2)}
        - Número de Vendas: ${filteredData.sales.length}
        - Desempenho por Semana (Receitas vs Despesas): ${JSON.stringify(chartData)}

        Forneça uma análise curta, direta e motivadora. 
        Aponte 1 ponto forte, 1 ponto de atenção e 1 recomendação prática para aumentar o lucro.
        Use uma linguagem executiva e profissional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um consultor financeiro sênior especializado em pequenas empresas. Seu tom é profissional, analítico e focado em resultados reais.",
          temperature: 0.7,
        }
      });

      setAiAnalysis(response.text);
    } catch (error) {
      console.error("Erro na análise IA:", error);
      setAiAnalysis("Não foi possível gerar a análise no momento. Verifique sua conexão.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Performance</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Consolidação de dados do período.</p>
        </div>
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
      </div>

      {/* Seção IA de Análise */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[28px] blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
        <Card className="relative p-8 border-none bg-white shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                <BrainCircuit size={32} className={isAnalyzing ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  Analista Estratégico IA <Sparkles size={18} className="text-blue-500" />
                </h2>
                <p className="text-slate-500 text-sm font-medium">Insights personalizados baseados no seu fluxo de caixa real.</p>
              </div>
            </div>
            {!aiAnalysis && !isAnalyzing && (
              <Button 
                onClick={generateAIAnalysis} 
                className="w-full md:w-auto px-10 py-4 text-base font-black uppercase tracking-widest shadow-xl"
              >
                Gerar Análise do Mês
              </Button>
            )}
          </div>

          {(isAnalyzing || aiAnalysis) && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando cérebro financeiro...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 leading-relaxed text-slate-700 text-sm font-medium whitespace-pre-wrap italic">
                    {aiAnalysis}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <Target className="text-emerald-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Dica de Performance</p>
                        <p className="text-xs text-emerald-700 font-bold">Considere reinvestir 20% do lucro em marketing para escalar suas vendas.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <Lightbulb className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Oportunidade</p>
                        <p className="text-xs text-blue-700 font-bold">Analise o dia com maior pico de faturamento para replicar a estratégia.</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={generateAIAnalysis} className="w-full text-xs font-black uppercase tracking-widest border border-slate-200 py-3">
                      Recalcular Insights
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Faturamento" 
          value={`R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Mensal" 
          trend="up" 
          icon={TrendingUp} 
          color="blue" 
        />
        <MetricCard 
          title="Despesas" 
          value={`R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Mensal" 
          trend="down" 
          icon={TrendingDown} 
          color="rose" 
        />
        <MetricCard 
          title="Lucro Líquido" 
          value={`R$ ${netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          change="Mensal" 
          trend="up" 
          icon={Wallet} 
          color="emerald" 
        />
        <MetricCard 
          title="Vendas" 
          value={filteredData.sales.length.toString()} 
          change="Qtd" 
          trend="up" 
          icon={ShoppingCart} 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800">Fluxo de Caixa Mensal</h3>
            </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '12px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#2563eb" 
                  fillOpacity={1} 
                  fill="url(#colorRec)" 
                  strokeWidth={4} 
                />
                <Area 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#f43f5e" 
                  fill="transparent" 
                  strokeWidth={2} 
                  strokeDasharray="8 8" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-black text-slate-800 mb-8">Últimos Movimentos</h3>
          <div className="space-y-6">
            {filteredData.sales.length === 0 && filteredData.expenses.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <Activity size={32} />
                </div>
                <p className="text-xs font-bold text-slate-400 italic">Sem movimentações este mês.</p>
              </div>
            ) : (
              <>
                {filteredData.sales.slice(-3).reverse().map(sale => (
                  <div key={sale.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab(ViewType.FINANCIAL)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowUpRight size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 truncate max-w-[120px]">{sale.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">+ R$ {sale.total.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
                {filteredData.expenses.slice(-2).reverse().map(exp => (
                  <div key={exp.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab(ViewType.FINANCIAL)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <ArrowDownRight size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 truncate max-w-[120px]">{exp.description}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-rose-600">- R$ {exp.value.toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          <button 
            onClick={() => setActiveTab(ViewType.FINANCIAL)}
            className="w-full mt-8 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-400 tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            Ver Extrato Completo
          </button>
        </Card>
      </div>
    </div>
  );
};

const MetricCard: React.FC<any> = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorMap: any = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-600", gradient: "from-blue-600 to-indigo-600" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-600", gradient: "from-rose-500 to-pink-600" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600", gradient: "from-emerald-500 to-teal-600" },
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600", gradient: "from-indigo-600 to-purple-600" }
  };
  
  const current = colorMap[color];

  return (
    <Card className="p-6 group hover:shadow-2xl transition-all duration-500">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${current.bg} ${current.text} group-hover:bg-gradient-to-br ${current.gradient} group-hover:text-white transition-all duration-500`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
      </div>
    </Card>
  );
};
