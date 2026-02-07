
import React, { useState, useEffect } from 'react';
import { Package, Plus, RefreshCw, X, Tag, DollarSign as DollarIcon, Briefcase } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { Service } from '../types';
import { fetchServicesFromWeb } from '../services/geminiService';

const STORAGE_KEY = 'ssa360_services_v2';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({ 
    name: '', 
    price: 0, 
    type: 'Serviço',
    cost: 0 
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }, [services]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const targetUrl = 'https://ssa360.com/servicos';
      const webServices = await fetchServicesFromWeb(targetUrl);
      const formatted = webServices.map((s: any, idx: number) => ({
        id: `web-${idx}-${Date.now()}`,
        name: s.name,
        type: s.type || 'Serviço',
        price: s.price || 0,
        cost: s.cost || 0
      }));
      setServices(prev => [...formatted, ...prev]);
    } catch (e) { 
      alert("Não foi possível conectar ao site da SSA360 no momento."); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const handleAddService = () => {
    if(!newService.name || !newService.price) return;
    const service: Service = {
      id: Date.now().toString(),
      name: newService.name || '',
      price: Number(newService.price) || 0,
      type: newService.type || 'Serviço',
      cost: Number(newService.cost) || 0
    };
    setServices([service, ...services]);
    setShowAddModal(false);
    setNewService({ name: '', price: 0, type: 'Serviço', cost: 0 });
  };

  const removeService = (id: string) => {
    if(confirm("Remover serviço do catálogo?")) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Package size={24} /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Catálogo de Soluções</h2>
            <p className="text-sm text-slate-500 font-medium">Produtos e serviços para propostas rápidas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ai" onClick={handleSync} disabled={isSyncing} icon={RefreshCw}>
            {isSyncing ? 'Sincronizando...' : 'Importar da Web'}
          </Button>
          <Button onClick={() => setShowAddModal(true)} icon={Plus}>Novo Serviço</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full py-40 text-center opacity-40">
            <div className="flex flex-col items-center gap-4">
               <Package size={48} className="text-slate-300" />
               <p className="font-black uppercase text-xs tracking-widest">Seu catálogo está vazio</p>
               <Button variant="ghost" className="text-[10px]" onClick={handleSync}>Importar dados iniciais</Button>
            </div>
          </div>
        ) : (
          services.map(s => (
            <Card key={s.id} className="p-6 relative group overflow-hidden border-b-4 border-b-indigo-500">
              <button 
                onClick={() => removeService(s.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={16} />
              </button>
              <p className="text-[10px] uppercase font-black text-indigo-500 mb-1">{s.type}</p>
              <h4 className="font-bold text-slate-800 text-lg leading-tight mb-4">{s.name}</h4>
              <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase">Preço sugerido</p>
                   <span className="text-2xl font-black text-slate-900">R$ {s.price.toLocaleString('pt-BR')}</span>
                </div>
                {s.cost > 0 && (
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Custo aprox.</p>
                      <span className="text-xs font-bold text-rose-400">R$ {s.cost.toLocaleString('pt-BR')}</span>
                   </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* MODAL NOVO SERVIÇO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X/></button>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Plus size={20}/></div>
               <h3 className="text-xl font-black text-slate-900 uppercase">Novo Item no Catálogo</h3>
            </div>
            
            <div className="space-y-4">
              <Input label="Nome do Serviço/Produto" value={newService.name || ''} onChange={e => setNewService({...newService, name: e.target.value})} icon={Tag} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Preço (R$)" type="number" value={newService.price || ''} onChange={e => setNewService({...newService, price: Number(e.target.value)})} icon={DollarIcon} />
                <Input label="Custo (R$)" type="number" value={newService.cost || ''} onChange={e => setNewService({...newService, cost: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Categoria</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newService.type}
                    onChange={e => setNewService({...newService, type: e.target.value})}
                  >
                    <option>Serviço</option>
                    <option>Produto</option>
                    <option>Treinamento</option>
                    <option>Consultoria</option>
                  </select>
                </div>
            </div>
            <Button className="w-full py-4 uppercase font-black tracking-widest" onClick={handleAddService}>Cadastrar Serviço</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Services;
