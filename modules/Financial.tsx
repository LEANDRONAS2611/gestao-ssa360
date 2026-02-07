
import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Sparkles, Plus, Wallet, X, TrendingUp, TrendingDown, Calendar, Upload, Loader2, FileText, FileUp, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Badge, MonthSelector } from '../components/UI';
import { Transaction, Lead, Expense } from '../types';
import { extractFinancialDataFromDocument } from '../services/geminiService';

const MANUAL_TRANSACTIONS_KEY = 'ssa360_financial_manual';
const SALES_KEY = 'ssa360_sales_v2';
const EXPENSES_KEY = 'ssa360_expenses_clean';

const Financial: React.FC = () => {
  // Estados para dados
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(MANUAL_TRANSACTIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Estado para Modal e Upload
  const [showModal, setShowModal] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    description: '',
    value: 0,
    type: 'Entrada',
    category: 'Outros',
    date: new Date().toISOString().split('T')[0],
    status: 'Pago'
  });

  // Carregar dados de outros módulos
  useEffect(() => {
    const loadIntegrations = () => {
      const savedLeads = localStorage.getItem(SALES_KEY);
      const savedExpenses = localStorage.getItem(EXPENSES_KEY);
      
      if (savedLeads) setLeads(JSON.parse(savedLeads));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    };

    loadIntegrations();
    // Adiciona listener para atualizar se houver mudanças em outras abas
    window.addEventListener('storage', loadIntegrations);
    return () => window.removeEventListener('storage', loadIntegrations);
  }, []);

  // Salvar transações manuais
  useEffect(() => {
    localStorage.setItem(MANUAL_TRANSACTIONS_KEY, JSON.stringify(manualTransactions));
  }, [manualTransactions]);

  // Consolidar e Filtrar Dados
  const getConsolidatedTransactions = () => {
    const allTransactions: (Transaction & { source: 'Vendas' | 'Despesas' | 'Manual' | 'Importado' })[] = [];

    // 1. Vendas Fechadas (Entradas)
    leads.filter(l => l.status === 'Fechado').forEach(l => {
      allTransactions.push({
        id: l.id,
        description: `Venda: ${l.name} (${l.company})`,
        value: l.value,
        type: 'Entrada',
        category: 'Vendas',
        date: l.lastContact ? l.lastContact.split('/').reverse().join('-') : new Date().toISOString().split('T')[0], // Fallback date handling
        status: 'Pago',
        source: 'Vendas'
      });
    });

    // 2. Despesas Pagas (Saídas)
    expenses.filter(e => e.status === 'Pago').forEach(e => {
      allTransactions.push({
        id: e.id,
        description: e.description,
        value: e.value,
        type: 'Saída',
        category: e.category,
        date: e.date,
        status: 'Pago',
        source: 'Despesas'
      });
    });

    // 3. Manuais e Importados
    manualTransactions.forEach(t => {
      // Identifica se foi importado pelo ID
      const src = t.id.startsWith('imported-') ? 'Importado' : 'Manual';
      allTransactions.push({ ...t, source: src });
    });

    // Filtro por Mês/Ano
    return allTransactions.filter(t => {
      // Ajuste para garantir que datas estejam em formato compatível
      const tDate = new Date(t.date); 
      return tDate.getMonth() === currentMonth.getMonth() && 
             tDate.getFullYear() === currentMonth.getFullYear();
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredData = getConsolidatedTransactions();
  const totalIn = filteredData.filter(t => t.type === 'Entrada').reduce((a, b) => a + b.value, 0);
  const totalOut = filteredData.filter(t => t.type === 'Saída').reduce((a, b) => a + b.value, 0);
  const balance = totalIn - totalOut;

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.value) return;
    
    const transaction: Transaction = {
      id: `manual-${Date.now()}`,
      description: newTransaction.description || '',
      value: Number(newTransaction.value),
      type: newTransaction.type as 'Entrada' | 'Saída',
      category: newTransaction.category || 'Outros',
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      status: 'Pago'
    };

    setManualTransactions([transaction, ...manualTransactions]);
    setShowModal(false);
    setNewTransaction({ description: '', value: 0, type: 'Entrada', category: 'Outros', date: new Date().toISOString().split('T')[0], status: 'Pago' });
  };

  const deleteManualTransaction = (id: string) => {
    if (confirm("Excluir este lançamento?")) {
      setManualTransactions(manualTransactions.filter(t => t.id !== id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        alert("Formato não suportado. Use PDF ou Imagens (JPG, PNG).");
        return;
    }

    setIsProcessingFile(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        // Chamada à IA
        const extractedData = await extractFinancialDataFromDocument(base64String, file.type);
        
        if (extractedData && extractedData.length > 0) {
          const newTransactions = extractedData.map((t: any, index: number) => ({
            id: `imported-${Date.now()}-${index}`,
            description: t.description,
            value: Number(t.value),
            type: t.type,
            category: t.category,
            date: t.date,
            status: 'Pago'
          }));
          
          setManualTransactions(prev => [...newTransactions, ...prev]);
          alert(`Sucesso! ${extractedData.length} movimentações foram identificadas e adicionadas.`);
        } else {
          alert("A IA analisou o arquivo mas não encontrou transações financeiras claras. Tente uma imagem mais nítida ou um extrato padrão.");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar documento. Verifique sua conexão ou a chave de API.");
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign size={24} /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Fluxo de Caixa</h2>
            <p className="text-sm text-slate-500 font-medium">Gestão Inteligente de Receitas e Despesas</p>
          </div>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
           <MonthSelector currentDate={currentMonth} onChange={setCurrentMonth} />
           <Button onClick={() => setShowModal(true)} icon={Plus}>Novo Lançamento</Button>
        </div>
      </div>

      {/* ÁREA DE IMPORTAÇÃO INTELIGENTE (UPLOAD PDF) */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-none text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-3 opacity-10">
            <FileUp size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs">
                    <Sparkles size={14} /> Inteligência Artificial Gemini
                </div>
                <h3 className="text-xl font-bold">Importe seus Extratos e Notas Fiscais</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Carregue arquivos <strong>PDF</strong> ou <strong>Imagens</strong>. A IA irá ler o documento, identificar datas, valores e categorias automaticamente para você.
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                />
                <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="ai" 
                    disabled={isProcessingFile}
                    className="w-full md:w-auto py-3 px-6 shadow-xl shadow-blue-900/50"
                    icon={isProcessingFile ? Loader2 : Upload}
                >
                    {isProcessingFile ? "Analisando Documento..." : "Selecionar Arquivo PDF / Img"}
                </Button>
                <span className="text-[9px] text-slate-500 uppercase font-bold">Máximo 5MB por arquivo</span>
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-emerald-500 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Entradas</p>
            <h4 className="text-3xl font-black text-emerald-600">R$ {totalIn.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
          </div>
          <ArrowUpCircle className="absolute right-4 bottom-4 text-emerald-100" size={64} />
        </Card>
        <Card className="p-6 border-l-4 border-rose-500 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Saídas</p>
            <h4 className="text-3xl font-black text-rose-600">R$ {totalOut.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
          </div>
          <ArrowDownCircle className="absolute right-4 bottom-4 text-rose-100" size={64} />
        </Card>
        <Card className={`p-6 text-white border-none relative overflow-hidden shadow-lg ${balance >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-1">Saldo do Período</p>
            <h4 className="text-3xl font-black">R$ {balance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h4>
          </div>
          <Wallet className="absolute right-4 bottom-4 text-white/20" size={64} />
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
             <div className="p-20 text-center opacity-40">
               <Calendar size={48} className="mx-auto mb-4 text-slate-300"/>
               <p className="font-bold uppercase tracking-widest text-xs">Sem movimentações em {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
               <p className="text-xs text-slate-500 mt-2">Registre vendas, despesas ou importe um PDF acima.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Origem</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{t.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{t.category}</p>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${
                         t.source === 'Vendas' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                         t.source === 'Despesas' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                         t.source === 'Importado' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                         'bg-slate-100 text-slate-600 border-slate-200'
                       }`}>
                         {t.source}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.type === 'Entrada' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><TrendingUp size={14}/> Entrada</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600"><TrendingDown size={14}/> Saída</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-black ${t.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'Entrada' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(t.source === 'Manual' || t.source === 'Importado') && (
                        <button onClick={() => deleteManualTransaction(t.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* MODAL NOVO LANÇAMENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X/></button>
            <h3 className="text-xl font-black text-slate-900 uppercase">Novo Lançamento Manual</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setNewTransaction({...newTransaction, type: 'Entrada'})}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-md transition-all ${newTransaction.type === 'Entrada' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Entrada
                </button>
                <button 
                   onClick={() => setNewTransaction({...newTransaction, type: 'Saída'})}
                   className={`flex-1 py-2 text-xs font-black uppercase rounded-md transition-all ${newTransaction.type === 'Saída' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Saída
                </button>
              </div>

              <Input label="Descrição" value={newTransaction.description || ''} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Valor (R$)" type="number" value={newTransaction.value || ''} onChange={e => setNewTransaction({...newTransaction, value: Number(e.target.value)})} />
                <Input label="Data" type="date" value={newTransaction.date || ''} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase text-slate-500">Categoria</label>
                 <select 
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                   value={newTransaction.category}
                   onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                 >
                   <option>Vendas</option>
                   <option>Serviços</option>
                   <option>Investimento</option>
                   <option>Retirada</option>
                   <option>Impostos</option>
                   <option>Outros</option>
                 </select>
              </div>
            </div>
            <Button className="w-full py-4 uppercase font-black tracking-widest" onClick={handleAddTransaction}>Confirmar Lançamento</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Financial;
