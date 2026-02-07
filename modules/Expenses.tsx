
import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Search, X } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Expense } from '../types';

const STORAGE_KEY = 'ssa360_expenses_clean';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    category: 'Fixo',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pendente'
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.value) return;
    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description || '',
      category: newExpense.category || 'Fixo',
      value: Number(newExpense.value) || 0,
      date: newExpense.date || '',
      status: (newExpense.status as any) || 'Pendente'
    };
    setExpenses([expense, ...expenses]);
    setShowAddModal(false);
    setNewExpense({ description: '', category: 'Fixo', value: 0, date: new Date().toISOString().split('T')[0], status: 'Pendente' });
  };

  const deleteExpense = (id: string) => {
    if(confirm("Excluir lançamento?")) setExpenses(expenses.filter(e => e.id !== id));
  };

  const filteredExpenses = expenses.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><CreditCard size={24} /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Despesas</h2>
            <p className="text-sm text-slate-500 font-medium">Controle financeiro de saída</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={Plus}>Nova Despesa</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-rose-50 border-rose-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Total Lançado</p>
          <h4 className="text-3xl font-black text-rose-600">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
           <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
        </div>
        <div className="overflow-x-auto">
          {expenses.length === 0 ? (
            <div className="p-20 text-center opacity-40 font-bold uppercase tracking-widest text-xs">Nenhuma despesa registrada</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{expense.description}</td>
                    <td className="px-6 py-4 text-[10px] font-bold uppercase text-slate-500">{expense.category}</td>
                    <td className="px-6 py-4 text-sm font-bold">R$ {expense.value.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => deleteExpense(expense.id)} className="text-rose-500"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400"><X/></button>
            <h3 className="text-xl font-black text-slate-900 uppercase">Novo Gasto</h3>
            <div className="space-y-4">
              <Input label="Descrição" value={newExpense.description || ''} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              <Input label="Valor (R$)" type="number" value={newExpense.value || ''} onChange={e => setNewExpense({...newExpense, value: Number(e.target.value)})} />
              <Input label="Data" type="date" value={newExpense.date || ''} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
            </div>
            <Button className="w-full" onClick={handleAddExpense}>Salvar Despesa</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Expenses;
