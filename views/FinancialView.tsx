
import React, { useState, useRef, useMemo } from 'react';
import { Card, MonthSelector, Button, Input } from '../components/UI';
import { 
  Download, ArrowUpCircle, ArrowDownCircle, 
  History, FileUp, Sparkles, Loader2, Trash2, Edit3, X, Save, AlertTriangle
} from 'lucide-react';
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

interface EditingItem {
  id: string;
  type: 'entrada' | 'saida';
  label: string;
  value: number;
  date: string;
}

export const FinancialView: React.FC<FinancialViewProps> = ({ 
  currentDate, setCurrentDate, sales, expenses, setSales, setExpenses 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'entrada' | 'saida'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consolida e filtra vendas e despesas pelo mês selecionado
  const ledger = useMemo(() => {
    const all = [
      ...sales.map(s => ({ type: 'entrada' as const, label: `Venda: ${s.clientName}`, value: s.total, date: s.date, id: s.id })),
      ...expenses.map(e => ({ type: 'saida' as const, label: e.description, value: e.value, date: e.date, id: e.id }))
    ];

    return all
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentDate.getMonth() && 
               itemDate.getFullYear() === currentDate.getFullYear();
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, expenses, currentDate]);

  const totals = useMemo(() => {
    return ledger.reduce((acc, curr) => {
      if (curr.type === 'entrada') acc.entradas += curr.value;
      else acc.saidas += curr.value;
      return acc;
    }, { entradas: 0, saidas: 0 });
  }, [ledger]);

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

      const newSales: Sale[] = result.entradas.map((e: any) => ({
        id: `ai-sale-${Math.random().toString(36).substr(2, 9)}`,
        clientName: `[IA] ${e.descricao}`,
        date: e.data,
        items: [],
        total: e.valor,
        paymentMethod: 'Transferência Bancária',
        status: 'Concluído'
      }));

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

  const handleEditClick = (item: any) => {
    setEditingItem({
      id: item.id,
      type: item.type,
      label: item.label.startsWith('Venda: ') ? item.label.replace('Venda: ', '') : item.label,
      value: item.value,
      date: item.date
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (editingItem.type === 'entrada') {
      setSales(prev => prev.map(s => 
        s.id === editingItem.id 
          ? { ...s, clientName: editingItem.label, total: editingItem.value, date: editingItem.date } 
          : s
      ));
    } else {
      setExpenses(prev => prev.map(e => 
        e.id === editingItem.id 
          ? { ...e, description: editingItem.label, value: editingItem.value, date: editingItem.date } 
          : e
      ));
    }

    setEditingItem(null);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'entrada') {
      setSales(prev => prev.filter(s => s.id !== itemToDelete.id));
    } else {
      setExpenses(prev => prev.filter(e => e.id !== itemToDelete.id));
    }

    setItemToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Modal de Edição */}
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-lg p-8 shadow-2xl border-blue-500/20 border animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-500" /> Editar Transação
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <Input 
                label={editingItem.type === 'entrada' ? "Nome do Cliente" : "Descrição da Despesa"} 
                value={editingItem.label} 
                onChange={e => setEditingItem({...editingItem, label: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Valor (R$)" 
                  type="number" 
                  value={editingItem.value} 
                  onChange={e => setEditingItem({...editingItem, value: Number(e.target.value)})} 
                />
                <Input 
                  label="Data" 
                  type="date" 
                  value={editingItem.date} 
                  onChange={e => setEditingItem({...editingItem, date: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <Button variant="ghost" className="flex-1" onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button className="flex-1" icon={Save} onClick={handleSaveEdit}>Salvar Alterações</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <Card className="w-full max-w-sm p-8 text-center shadow-2xl border-rose-500/20 border animate-slide-up">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Confirmar Exclusão?</h3>
            <p className="text-sm text-slate-500 mb-8">Esta ação removerá permanentemente o lançamento do seu histórico financeiro.</p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setItemToDelete(null)}>Manter</Button>
              <Button variant="danger" className="flex-1" icon={Trash2} onClick={confirmDelete}>Excluir Agora</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Overlay de Processamento IA */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <Card className="p-10 flex flex-col items-center gap-6 shadow-2xl border-blue-500/50 border-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
              <Sparkles size={48} className="text-blue-500 relative animate-spin-slow" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">IA Analisando Extrato...</h3>
              <p className="text-slate-400 text-sm mt-2">Convertendo documento em lançamentos digitais.</p>
            </div>
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Livro Caixa</h1>
          <p className="text-slate-500">Gestão centralizada de entradas e saídas.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <input type="file" ref={fileInputRef} onChange={processFile} accept="application/pdf,image/*" className="hidden" />
          <Button variant="secondary" icon={FileUp} onClick={() => fileInputRef.current?.click()}>Importar Extrato (IA)</Button>
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>Exportar CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-emerald-50 border-emerald-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="text-emerald-500" size={18} />
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Entradas do Mês</span>
          </div>
          <h3 className="text-2xl font-black text-emerald-900 mt-3">
            R$ {totals.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 bg-rose-50 border-rose-100 border shadow-sm">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="text-rose-500" size={18} />
            <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Saídas do Mês</span>
          </div>
          <h3 className="text-2xl font-black text-rose-900 mt-3">
            R$ {totals.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
        <Card className="p-6 bg-slate-900 text-white border-none shadow-xl">
          <div className="flex items-center gap-3">
            <History className="text-blue-400" size={18} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Mensal</span>
          </div>
          <h3 className="text-2xl font-black text-white mt-3">
            R$ {(totals.entradas - totals.saidas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="p-5">Data</th>
                <th className="p-5">Descrição da Transação</th>
                <th className="p-5">Tipo</th>
                <th className="p-5 text-right">Valor</th>
                <th className="p-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">Nenhuma movimentação para este mês.</td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{item.label}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${item.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className={`p-5 text-right font-black ${item.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.type === 'entrada' ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Editar lançamento"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => setItemToDelete({ id: item.id, type: item.type })}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Excluir lançamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
