
import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Plus, Search, Trash2, Edit2, Filter, Package } from 'lucide-react';
import { Service } from '../types';

interface ServicesViewProps {
  services: Service[];
  setServices: (services: Service[]) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ services, setServices }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({ name: '', price: 0, cost: 0, type: 'Serviço' });

  const handleSave = () => {
    if (!formData.name) return;
    const newService: Service = {
      id: `svc-${Date.now()}`,
      name: formData.name,
      price: Number(formData.price || 0),
      cost: Number(formData.cost || 0),
      type: formData.type as any
    };
    setServices([newService, ...services]);
    setShowForm(false);
    setFormData({ name: '', price: 0, cost: 0, type: 'Serviço' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catálogo de Itens</h1>
          <p className="text-slate-500">Produtos e serviços para o seu negócio.</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus}>Novo Item</Button>
      </div>

      {showForm && (
        <Card className="p-8 shadow-xl border-blue-100 border">
          <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Cadastrar Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input label="Nome" className="lg:col-span-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipo</label>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm h-[42px] text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="Serviço">Serviço</option>
                <option value="Produto">Produto</option>
              </select>
            </div>
            <Input label="Preço de Venda (R$)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar no Catálogo</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4">Descrição</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Valor Unitário</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic font-medium">Nenhum item cadastrado no catálogo.</td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><Package size={16} /></div>
                      <span className="font-bold text-slate-700">{service.name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${service.type === 'Serviço' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {service.type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => setServices(services.filter(s => s.id !== service.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
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
