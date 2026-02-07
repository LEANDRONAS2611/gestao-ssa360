
import React, { useState, useEffect } from 'react';
import { Target, Plus, Flame, Snowflake, Loader2, Sparkles, Trash2, X, User, Briefcase, DollarSign as DollarIcon } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { Lead } from '../types';
import { suggestNextStep } from '../services/geminiService';

const STORAGE_KEY = 'ssa360_sales_v2';

const Sales: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<Record<string, string>>({});
  
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    company: '',
    value: 0,
    status: 'Prospecção',
    temperature: 'Morno'
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const handleAddLead = () => {
    if (!newLead.name || !newLead.company) return;
    const lead: Lead = {
      id: Date.now().toString(),
      name: newLead.name || '',
      company: newLead.company || '',
      value: Number(newLead.value) || 0,
      status: (newLead.status as any) || 'Prospecção',
      temperature: (newLead.temperature as any) || 'Morno',
      lastContact: new Date().toLocaleDateString('pt-BR')
    };
    setLeads([lead, ...leads]);
    setShowAddModal(false);
    setNewLead({ name: '', company: '', value: 0, status: 'Prospecção', temperature: 'Morno' });
  };

  const handleAISuggestion = async (lead: Lead) => {
    setIsAnalyzing(lead.id);
    try {
      const suggestion = await suggestNextStep(lead.name, lead.company, lead.status);
      setAiSuggestion(prev => ({ ...prev, [lead.id]: suggestion || '' }));
    } catch (error) { 
      console.error(error); 
      alert("Erro ao conectar com a IA.");
    } finally { 
      setIsAnalyzing(null); 
    }
  };

  const deleteLead = (id: string) => {
    if(confirm("Excluir lead permanentemente?")) {
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Target size={24} /></div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pipeline de Vendas</h2>
            <p className="text-sm text-slate-500 font-medium">Gestão ativa de oportunidades comerciais</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>Novo Lead</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-blue-500">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Valor em Negociação</p>
          <h4 className="text-3xl font-black text-slate-900">R$ {leads.reduce((a,b) => a + b.value, 0).toLocaleString('pt-BR')}</h4>
        </Card>
        <Card className="p-6 border-l-4 border-emerald-500">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Leads Ativos</p>
          <h4 className="text-3xl font-black text-slate-900">{leads.length}</h4>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {leads.length === 0 ? (
            <div className="p-20 text-center opacity-40">
              <div className="space-y-4">
                <p className="font-black uppercase tracking-widest text-xs">Nenhum lead encontrado</p>
                <p className="text-xs max-w-xs mx-auto">Cadastre suas oportunidades para começar a vender.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-400">
                  <th className="px-6 py-4">Lead / Empresa</th>
                  <th className="px-6 py-4">Valor Estimado</th>
                  <th className="px-6 py-4">Status / Temp.</th>
                  <th className="px-6 py-4">Sugestão IA</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{lead.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-700">R$ {lead.value.toLocaleString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-blue-600">{lead.status}</span>
                        <div className="flex items-center gap-1">
                           {lead.temperature === 'Quente' ? <Flame size={12} className="text-orange-500" /> : <Snowflake size={12} className="text-blue-300" />}
                           <span className="text-[9px] font-bold text-slate-400 uppercase">{lead.temperature}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                       {aiSuggestion[lead.id] ? (
                         <p className="text-[11px] font-medium text-slate-600 leading-tight bg-blue-50 p-2 rounded-lg border border-blue-100">
                           {aiSuggestion[lead.id]}
                         </p>
                       ) : (
                         <button 
                           onClick={() => handleAISuggestion(lead)}
                           disabled={isAnalyzing === lead.id}
                           className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline"
                         >
                           {isAnalyzing === lead.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                           Analisar com IA
                         </button>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteLead(lead.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* MODAL NOVO LEAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X/></button>
            <h3 className="text-xl font-black text-slate-900 uppercase">Novo Lead Comercial</h3>
            <div className="space-y-4">
              <Input label="Nome do Contato" value={newLead.name || ''} onChange={e => setNewLead({...newLead, name: e.target.value})} icon={User} />
              <Input label="Empresa" value={newLead.company || ''} onChange={e => setNewLead({...newLead, company: e.target.value})} icon={Briefcase} />
              <Input label="Valor da Oportunidade (R$)" type="number" value={newLead.value || ''} onChange={e => setNewLead({...newLead, value: Number(e.target.value)})} icon={DollarIcon} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newLead.status}
                    onChange={e => setNewLead({...newLead, status: e.target.value as any})}
                  >
                    <option>Prospecção</option>
                    <option>Qualificação</option>
                    <option>Proposta</option>
                    <option>Negociação</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Temperatura</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newLead.temperature}
                    onChange={e => setNewLead({...newLead, temperature: e.target.value as any})}
                  >
                    <option>Frio</option>
                    <option>Morno</option>
                    <option>Quente</option>
                  </select>
                </div>
              </div>
            </div>
            <Button className="w-full py-4 uppercase font-black tracking-widest" onClick={handleAddLead}>Salvar Oportunidade</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Sales;
