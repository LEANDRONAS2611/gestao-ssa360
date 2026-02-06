
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { 
  Plus, UserPlus, FileCheck, Trash2, 
  Briefcase, Calendar, Clock, ClipboardList, Percent, AlertCircle
} from 'lucide-react';
import { Service, Sale, Expense, ViewType } from '../types';

interface SalesViewProps {
  services: Service[];
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  setActiveTab: (tab: ViewType) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ services, sales, setSales, expenses, setExpenses, setActiveTab }) => {
  const [clientName, setClientName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [cart, setCart] = useState<{serviceId: string, name: string, price: number, quantity: number}[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  // Filter only services from the global catalog
  const availableServices = services.filter(s => s.type === 'Serviço');

  const addToCart = (service: Service) => {
    const existing = cart.find(c => c.serviceId === service.id);
    if (existing) {
      setCart(cart.map(c => c.serviceId === service.id ? {...c, quantity: c.quantity + 1} : c));
    } else {
      setCart([...cart, { serviceId: service.id, name: service.name, price: service.price, quantity: 1 }]);
    }
  };

  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter(c => c.serviceId !== serviceId));
  };

  // O subtotal é o valor bruto da venda
  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  // O imposto é calculado sobre o bruto para ser lançado como despesa
  const taxValue = subtotal * (taxPercent / 100);
  const finalTotal = subtotal; // O total recebido do cliente é o bruto

  const handleFinalize = () => {
    if (!clientName || cart.length === 0) {
      alert("Por favor, identifique o cliente e selecione ao menos um serviço.");
      return;
    }

    const saleDate = new Date().toISOString().split('T')[0];

    // 1. Criar o objeto de Venda (Entrada bruta)
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      clientName,
      date: saleDate,
      deadline: deadline,
      items: [...cart],
      total: subtotal,
      taxPercent: taxPercent,
      paymentMethod,
      status: 'Concluído'
    };

    // 2. Se houver imposto, criar o objeto de Despesa (Saída deduzida)
    let updatedExpenses = [...expenses];
    if (taxPercent > 0) {
      const taxExpense: Expense = {
        id: `tax-exp-${Date.now()}`,
        description: `Imposto s/ Venda: ${clientName}`,
        category: 'Impostos/Taxas',
        value: taxValue,
        date: saleDate,
        status: 'Pago'
      };
      updatedExpenses = [taxExpense, ...expenses];
    }

    setSales([...sales, newSale]);
    setExpenses(updatedExpenses);

    alert(`Contrato registrado! ${taxPercent > 0 ? `Um lançamento de despesa de R$ ${taxValue.toFixed(2)} foi gerado automaticamente.` : ''}`);
    
    setCart([]);
    setClientName('');
    setDeadline('');
    setTaxPercent(0);
    setActiveTab(ViewType.FINANCIAL); 
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nova Venda de Serviço</h1>
          <p className="text-slate-500">Registre novos contratos e ordens de serviço.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 text-sm font-bold">
          <Briefcase size={16} /> Canal de Vendas Ativo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <UserPlus size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Identificação do Projeto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input 
                label="Cliente / Contratante" 
                placeholder="Nome completo ou Razão Social" 
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
              <Input 
                label="Prazo de Entrega Estimado" 
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                icon={Calendar}
              />
              <Input 
                label="Alíquota de Imposto (%)" 
                type="number"
                placeholder="0"
                value={taxPercent}
                onChange={e => setTaxPercent(Math.max(0, Number(e.target.value)))}
                icon={Percent}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ClipboardList size={18} className="text-slate-400" /> Catálogo de Serviços
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {availableServices.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400 italic">Nenhum serviço cadastrado.</p>
                    <Button variant="ghost" className="mt-2" onClick={() => setActiveTab(ViewType.SERVICES)}>Ir para Catálogo</Button>
                  </div>
                ) : (
                  availableServices.map(service => (
                    <button 
                      key={service.id}
                      onClick={() => addToCart(service)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{service.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valor do Projeto</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={14} />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-600">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" /> Serviços Selecionados
              </h3>
              <div className="space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                    <Clock size={32} className="mb-2 opacity-20" />
                    <p className="text-xs font-medium italic">Aguardando seleção...</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.serviceId} className="flex justify-between items-start gap-4 p-3 bg-slate-50 rounded-xl group">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Qtd: {item.quantity} • Un: R$ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-black text-slate-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => removeFromCart(item.serviceId)} 
                          className="p-1 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-8 sticky top-8 bg-slate-900 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
              <FileCheck size={24} className="text-blue-400" /> Resumo do Contrato
            </h3>
            
            <div className="space-y-5 mb-8 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Faturamento Bruto</span>
                <span className="font-bold text-slate-200">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Imposto ({taxPercent}%)</span>
                  <span className="font-black text-rose-400">- R$ {taxValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-start gap-2 text-[9px] text-slate-500 leading-tight italic">
                  <AlertCircle size={10} className="mt-0.5" />
                  <span>Este valor será lançado automaticamente como uma despesa na finalização.</span>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Margem Líquida Estimada</span>
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black">R$ {(subtotal - taxValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Forma de Recebimento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'Boleto', 'Cartão', 'Transferência'].map(method => (
                    <button 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 text-[10px] font-bold rounded-lg border transition-all ${paymentMethod === method ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-base font-black uppercase tracking-wider rounded-xl shadow-xl shadow-blue-600/20"
                onClick={handleFinalize}
                disabled={cart.length === 0}
              >
                Registrar e Lançar Taxa
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
