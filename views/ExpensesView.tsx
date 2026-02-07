import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Badge, MonthSelector } from '../components/UI';
import { Plus, Trash2, ArrowDownCircle } from 'lucide-react';
import { Expense } from '../types';
import { isDateInPeriod } from './DashboardView';
import { useApp } from '../contexts/AppDataContext';

interface ExpensesViewProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ currentDate, setCurrentDate }) => {
  const { expenses, setExpenses } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({ description: '', category: 'Outros', value: 0, status: 'Pendente', date: new Date().toISOString().split('T')[0] });

  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => isDateInPeriod(new Date(e.date), currentDate, 'month'));
  }, [expenses, currentDate]);

  const handleSave = () => {
    if (!formData.description) return;
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: formData.description,
      category: formData.category || 'Outros',
      value: Number(formData.value || 0),
      date: formData.date || '',
      status: formData.status as any
    };
    setExpenses([newExpense, ...expenses]);
    setShowForm(false);
    setFormData({ description: '', value: 0, category: 'Outros', status: 'Pendente', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Despesas</h1>
          <p className="text-slate-500">Controle rigoroso de gastos.</p>
        </div>
        <div className="flex gap-2">
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
          <Button variant="danger" onClick={() => setShowForm(true)} icon={Plus}>Nova Despesa</Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-8 border-rose-100 border">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Lançar Despesa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input label="Descrição" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <Input label="Valor (R$)" type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
            <Input label="Vencimento" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleSave}>Salvar Despesa</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4">Vencimento</th>
                <th className="p-4">Descrição</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic font-medium">Nenhuma despesa registrada para este mês.</td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="p-4 text-slate-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4 font-bold text-slate-800">{expense.description}</td>
                    <td className="p-4 text-right font-black text-rose-600">R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-center"><Badge status={expense.status} /></td>
                    <td className="p-4 text-center">
                      <button onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
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
