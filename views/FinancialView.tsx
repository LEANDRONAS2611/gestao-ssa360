
import React, { useState, useRef } from 'react';
import { Card, MonthSelector, Button, Badge } from '../components/UI';
import { Search, Download, Filter, ArrowUpCircle, ArrowDownCircle, History, FileUp, Sparkles, Loader2 } from 'lucide-react';
import { Sale, Expense } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface FinancialViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  sales: Sale[];
  expenses: Expense[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export const FinancialView: React.FC<FinancialViewProps> = ({ 
  currentDate, setCurrentDate, sales, expenses, setSales, setExpenses 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ledger = [
    ...sales.map(s => ({ type: 'entrada', label: `Venda: ${s.clientName}`, value: s.total, date: s.date, id: s.id })),
    ...expenses.map(e => ({ type: 'saida', label: e.description, value: e.value, date: e.date, id: e.id }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExportCSV = () => {
    const headers = "Data,Descricao,Tipo,Valor\n";
    const rows = ledger.map(item => `${item.date},${item.label},${item.type},${item.value}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financeiro_${currentDate.toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type || "application/pdf"
                }
              },
              {
                text: "Analise este extrato bancário. Extraia todas as transações (entradas e saídas). Identifique a data (no formato YYYY-MM-DD), a descrição limpa e o valor numérico. Ignore saldos e taxas de cabeçalho. Retorne estritamente um JSON."
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              entradas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    data: { type: Type.STRING },
                    descricao: { type: Type.STRING },
                    valor: { type: Type.NUMBER }
                  },
                  required: ["data", "descricao", "valor"]
                }
              },
              saidas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    data: { type: Type.STRING },
                    descricao: { type: Type.STRING },
                    valor: { type: Type.NUMBER }
                  },
                  required: ["data", "descricao", "valor"]
                }
              }
            },
            required: ["entradas", "saidas"]
          }
        }
      });

      const result = JSON.parse(response.text);

      // Map to Sales
      const newSales: Sale[] = result.entradas.map((e: any) => ({
        id: `ai-sale-${Math.random().toString(36).substr(2, 9)}`,
        clientName: `[IA] ${e.descricao}`,
        date: e.data,
        items: [],
        total: e.valor,
        paymentMethod: 'Transferência Bancária',
        status: 'Concluído'
      }));

      // Map to Expenses
      const newExpenses: Expense[] = result.saidas.map((s: any) => ({
        id: `ai-exp-${Math.random().toString(36).substr(2, 9)}`,
        description: `[IA] ${s.descricao}`,
        category: 'Operacional (IA)',
        value: s.valor,
        date: s.data,
        status: 'Pago'
      }));

      setSales(prev => [...newSales, ...prev]);
      setExpenses(prev => [...newExpenses, ...prev]);

      alert(`${newSales.length} entradas e ${newExpenses.length} saídas importadas com sucesso!`);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      alert("Falha ao analisar o documento. Verifique se o arquivo é legível.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReceipt = (item: any) => {
    alert(`Gerando recibo digital para:\n\n${item.label}\nValor: R$ ${item.value.toFixed(2)}\nData: ${new Date(item.date).toLocaleDateString('pt-BR')}`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <Card className="p-10 flex flex-col items-center gap-6 animate-bounce shadow-2xl border-blue-500/50 border-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
              <Sparkles size={48} className="text-blue-500 relative animate-spin-slow" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">IA Analisando Extrato...</h3>
              <p className="text-slate-400 text-sm mt-2">Extraindo movimentações bancárias automaticamente.</p>
            </div>
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Livro Caixa</h1>
          <p className="text-slate-500">Histórico unificado de entradas e saídas.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={processFile} 
            accept="application/pdf,image/*" 
            className="hidden" 
          />
          <Button 
            variant="secondary" 
            icon={FileUp} 
            onClick={() => fileInputRef.current?.click()}
          >
            Importar Extrato (IA)
          </Button>
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>Exportar CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-emerald-50 border-emerald-100 border">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Total Entradas</span>
          </div>
          <h3 className="text-2xl font-black text-emerald-900 mt-3">
            R$ {sales.reduce((a,c)=>a+c.total,0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100 border">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="text-rose-500" />
            <span className="text-xs font-bold text-rose-800 uppercase tracking-widest">Total Saídas</span>
          </div>
          <h3 className="text-2xl font-black text-rose-900 mt-3">
            R$ {expenses.reduce((a,c)=>a+c.value,0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 bg-slate-900 text-white border-none">
          <div className="flex items-center gap-3">
            <History className="text-blue-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Atual</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">
            R$ {(sales.reduce((a,c)=>a+c.total,0) - expenses.reduce((a,c)=>a+c.value,0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Descrição da Transação</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic">Nenhuma movimentação registrada.</td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 font-medium">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      {item.label}
                      {item.id.includes('ai-') && (
                        <span className="bg-blue-50 text-blue-500 text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={8} /> IA
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${item.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-black ${item.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type === 'entrada' ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleReceipt(item)} className="text-slate-400 hover:text-blue-500 font-bold text-xs underline">Recibo</button>
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
