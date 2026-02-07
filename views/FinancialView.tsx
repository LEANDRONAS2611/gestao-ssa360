
import React, { useState, useMemo, useRef } from 'react';
import { Card, TimeRangeSelector, Button } from '../components/UI';
import { 
  X, Check, FileUp, Sparkles, MessageSquareQuote, Loader2, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft
} from 'lucide-react';
import { Sale, Expense, FinancialDocument, PeriodType } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { isDateInPeriod } from './DashboardView';

interface FinancialViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  periodType: PeriodType;
  setPeriodType: (p: PeriodType) => void;
  sales: Sale[];
  expenses: Expense[];
  documents: FinancialDocument[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<FinancialDocument[]>>;
}

export const FinancialView: React.FC<FinancialViewProps> = ({ 
  currentDate, setCurrentDate, periodType, setPeriodType, sales, expenses, documents, setSales, setExpenses, setDocuments 
}) => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isCfoConsulting, setIsCfoConsulting] = useState(false);
  const [cfoInsight, setCfoInsight] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ledger = useMemo(() => {
    const all = [
      ...sales.map(s => ({ type: 'entrada' as const, label: s.clientName, value: s.total, date: s.date, id: s.id, category: 'Receita' })),
      ...expenses.map(e => ({ type: 'saida' as const, label: e.description, value: e.value, date: e.date, id: e.id, category: e.category }))
    ];
    return all.filter(item => isDateInPeriod(new Date(item.date), currentDate, periodType))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, expenses, currentDate, periodType]);

  const totals = useMemo(() => ledger.reduce((acc, curr) => {
    if (curr.type === 'entrada') acc.entradas += curr.value;
    else acc.saidas += curr.value;
    return acc;
  }, { entradas: 0, saidas: 0 }), [ledger]);

  const extractDataWithAI = async (file: File) => {
    setIsAiProcessing(true);
    try {
      // @ts-ignore
      const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str || "").join(" ");
        fullText += pageText + "\n";
      }

      if (!fullText.trim()) throw new Error("Texto não extraído.");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extraia transações deste extrato bancário. Ignore ruídos. Retorne JSON: { "transactions": [{ "date": "YYYY-MM-DD", "description": "nome", "value": 0.0, "type": "entrada/saida", "category": "categoria" }] }. Texto: ${fullText.substring(0, 15000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transactions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    description: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    category: { type: Type.STRING }
                  },
                  required: ["date", "description", "value", "type"]
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      if (result.transactions && Array.isArray(result.transactions)) {
        const newSales: Sale[] = [];
        const newExpenses: Expense[] = [];

        result.transactions.forEach((t: any) => {
          if (t.type === 'entrada') {
            newSales.push({
              id: `sale-ai-${Math.random()}`,
              clientName: t.description,
              date: t.date,
              items: [],
              total: t.value,
              paymentMethod: 'IA Extrato',
              status: 'Concluído'
            });
          } else {
            newExpenses.push({
              id: `exp-ai-${Math.random()}`,
              description: t.description,
              value: t.value,
              date: t.date,
              category: t.category || 'Outros',
              status: 'Pago'
            });
          }
        });

        setSales(prev => [...newSales, ...prev]);
        setExpenses(prev => [...newExpenses, ...prev]);
        alert(`${result.transactions.length} transações importadas com sucesso!`);
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao processar arquivo. Verifique se o formato é válido.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const consultCfoAi = async () => {
    setIsCfoConsulting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Atue como CFO. Analise: Receita R$ ${totals.entradas}, Gastos R$ ${totals.saidas}. Dê um conselho curto.`;
      const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setCfoInsight(result.text || "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCfoConsulting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Fluxo Financeiro</h1>
          <p className="text-slate-500 font-medium italic">Gestão e auditoria assistida por IA.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-center">
          <Button 
            variant="dark" 
            icon={isCfoConsulting ? Loader2 : Sparkles} 
            loading={isCfoConsulting}
            onClick={consultCfoAi}
            className="shadow-lg shadow-slate-900/10"
          >
            Auditoria IA
          </Button>
          <TimeRangeSelector 
            currentDate={currentDate} 
            period={periodType} 
            onDateChange={setCurrentDate} 
            onPeriodChange={setPeriodType} 
          />
        </div>
      </div>

      {cfoInsight && (
        <Card className="p-8 border-blue-500 border-2 bg-blue-50/50 animate-slide-up relative">
          <button onClick={() => setCfoInsight(null)} className="absolute top-4 right-4 text-slate-400"><X size={20} /></button>
          <div className="flex items-start gap-4">
            <MessageSquareQuote className="text-blue-600" size={24} />
            <div>
              <h3 className="text-lg font-black text-slate-800">Parecer CFO Digital</h3>
              <p className="text-slate-700 font-medium mt-1 leading-relaxed">{cfoInsight}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-8 border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <FileUp size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight uppercase">Sincronização Direta</h3>
                <p className="text-xs text-blue-400 font-black tracking-widest uppercase">Importação Automática Gemini 3</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Faça o upload do seu extrato bancário. A IA identificará entradas e saídas e as lançará instantaneamente no seu fluxo de caixa.</p>
          </div>
          <div className="w-full lg:w-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => e.target.files?.[0] && extractDataWithAI(e.target.files[0])} 
              className="hidden" 
              accept="application/pdf" 
            />
            <Button 
              className="w-full lg:w-48 shadow-lg shadow-blue-600/20" 
              onClick={() => fileInputRef.current?.click()}
              loading={isAiProcessing}
              icon={isAiProcessing ? undefined : Sparkles}
            >
              {isAiProcessing ? "Processando..." : "Lançar Extrato"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricSmall title="Entradas Totais" value={totals.entradas} color="emerald" icon={ArrowUpCircle} />
        <MetricSmall title="Saídas Totais" value={totals.saidas} color="rose" icon={ArrowDownCircle} />
        <MetricSmall title="Saldo de Caixa" value={totals.entradas - totals.saidas} color="blue" icon={ArrowRightLeft} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr><th className="p-5">Data</th><th className="p-5">Descrição</th><th className="p-5">Categoria</th><th className="p-5">Tipo</th><th className="p-5 text-right">Valor</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">Nenhum lançamento no período selecionado.</td></tr>
              ) : (
                ledger.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 text-slate-500 font-medium">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-5 font-bold text-slate-800">{item.label}</td>
                    <td className="p-5"><span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.category}</span></td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${item.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`p-5 text-right font-black ${item.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const MetricSmall: React.FC<any> = ({ title, value, color, icon: Icon }) => (
  <Card className={`p-6 bg-white border-l-4 ${color === 'emerald' ? 'border-l-emerald-500' : color === 'rose' ? 'border-l-rose-500' : 'border-l-blue-500'}`}>
    <div className="flex items-center gap-3 mb-2">
      <Icon size={16} className={color === 'emerald' ? 'text-emerald-500' : color === 'rose' ? 'text-rose-500' : 'text-blue-500'} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    <h3 className="text-2xl font-black text-slate-900">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
  </Card>
);
