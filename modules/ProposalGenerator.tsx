
import React, { useState } from 'react';
import { FileText, Plus, Trash2, ChevronLeft, Printer, Sparkles, Search, CheckCircle, Camera, BrainCircuit } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { ProposalData, ProposalService } from '../types';
import { generateProposalContent, getMarketPricing } from '../services/geminiService';

const ProposalGenerator: React.FC = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketInsights, setMarketInsights] = useState<{text?: string, sources: any[]}>({ sources: [] });

  const [data, setData] = useState<ProposalData>({
    budgetNumber: '2024.001',
    clientName: 'EMPRESA EXEMPLO LTDA',
    clientPhone: '11 99999-9999',
    date: new Date().toLocaleDateString('pt-BR'),
    location: 'SÃO PAULO, SP',
    services: [
      {
        id: '1',
        title: 'Serviço de Consultoria Estratégica',
        description: 'Análise completa de processos e otimização de fluxo de trabalho.',
        includedItems: ['Diagnóstico inicial', 'Plano de ação', 'Acompanhamento 30 dias'],
        value: 2500.00
      }
    ],
    companyName: 'GESTAO PRO AI SOLUTIONS',
    companyPhone: '(11) 5555-4444',
    companyCnpj: '00.000.000/0001-00',
    companyAddress: 'Av. Paulista, 1000 - São Paulo/SP',
    companyEmail: 'contato@gestaoproai.com'
  });

  const handleAISmartFill = async (index: number) => {
    const service = data.services[index];
    if (!service.title) {
        alert("Por favor, insira pelo menos um título para o serviço para que a IA possa trabalhar.");
        return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateProposalContent(service.title);
      const updatedServices = [...data.services];
      updatedServices[index] = {
        ...service,
        description: result.description,
        includedItems: result.includedItems
      };
      setData({ ...data, services: updatedServices });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const checkPrices = async (index: number) => {
    const service = data.services[index];
    setIsGenerating(true);
    try {
      const result = await getMarketPricing(service.title);
      setMarketInsights(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateServiceField = (index: number, field: keyof ProposalService, value: any) => {
    const updated = [...data.services];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, services: updated });
  };

  const addService = () => {
    setData({
      ...data,
      services: [...data.services, {
        id: Date.now().toString(),
        title: '',
        description: '',
        includedItems: [],
        value: 0
      }]
    });
  };

  const removeService = (index: number) => {
    const updated = data.services.filter((_, i) => i !== index);
    setData({ ...data, services: updated });
  };

  const totalValue = data.services.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  if (isEditing) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
               <FileText size={24} />
             </div>
             <div>
               <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Gerador de Propostas Inteligente</h2>
               <p className="text-sm text-slate-500 font-medium">Crie propostas vendedoras com auxílio de IA</p>
             </div>
          </div>
          <Button onClick={() => setIsEditing(false)} icon={Sparkles} variant="primary">Pré-visualizar Documento</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Número do Orçamento" value={data.budgetNumber} onChange={e => setData({...data, budgetNumber: e.target.value})} />
                <Input label="Local da Proposta" value={data.location} onChange={e => setData({...data, location: e.target.value})} />
                <Input label="Cliente / Empresa" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
                <Input label="Contato do Cliente" value={data.clientPhone} onChange={e => setData({...data, clientPhone: e.target.value})} />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Escopo de Serviços</h3>
                <Button variant="ghost" className="text-xs" icon={Plus} onClick={addService}>Adicionar</Button>
              </div>

              {data.services.map((service, idx) => (
                <div key={service.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 relative group">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Item #{idx+1}</span>
                     <div className="flex gap-2">
                        <Button variant="ai" className="px-3 py-1.5 h-8 text-[10px]" icon={BrainCircuit} onClick={() => handleAISmartFill(idx)} disabled={isGenerating}>
                          {isGenerating ? "Gerando..." : "Sugerir com IA"}
                        </Button>
                        <Button variant="secondary" className="px-3 py-1.5 h-8 text-[10px]" icon={Search} onClick={() => checkPrices(idx)} disabled={isGenerating}>Preços</Button>
                        {data.services.length > 1 && (
                          <button onClick={() => removeService(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                     </div>
                  </div>

                  <Input 
                    label="Título do Serviço" 
                    placeholder="Ex: Consultoria de Marketing Digital" 
                    value={service.title} 
                    onChange={e => updateServiceField(idx, 'title', e.target.value)} 
                  />
                  
                  <Input 
                    label="Descrição Detalhada" 
                    multiline 
                    value={service.description} 
                    onChange={e => updateServiceField(idx, 'description', e.target.value)} 
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">O que está incluso? (um por linha)</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 bg-white"
                      value={service.includedItems.join('\n')}
                      onChange={e => updateServiceField(idx, 'includedItems', e.target.value.split('\n'))}
                    />
                  </div>

                  <Input 
                    label="Investimento (R$)" 
                    type="number"
                    value={service.value} 
                    onChange={e => updateServiceField(idx, 'value', e.target.value)} 
                  />
                </div>
              ))}
            </section>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-200">
               <p className="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">Total do Orçamento</p>
               <h4 className="text-4xl font-black">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
               <p className="text-[10px] opacity-60 mt-4 border-t border-white/20 pt-2 uppercase font-bold tracking-tighter">
                 Sujeito a aprovação de crédito e disponibilidade técnica
               </p>
            </Card>

            <Card className="p-5 border-purple-200 bg-purple-50/30">
              <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-3">
                <Sparkles size={18} />
                Insights de Mercado
              </h4>
              {isGenerating ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-purple-100 rounded w-full"></div>
                  <div className="h-4 bg-purple-100 rounded w-3/4"></div>
                </div>
              ) : marketInsights.text ? (
                <div className="space-y-3">
                  <p className="text-sm text-purple-900 leading-relaxed">{marketInsights.text}</p>
                  {marketInsights.sources.length > 0 && (
                    <div className="pt-2 border-t border-purple-100">
                      <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Fontes:</p>
                      <ul className="space-y-1">
                        {marketInsights.sources.map((s: any, i: number) => (
                           <li key={i}><a href={s.uri} target="_blank" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"><Search size={8}/> {s.title}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Selecione um serviço e clique em "Preços" para ver insights da web.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Preview Mode
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center no-print">
        <Button variant="secondary" onClick={() => setIsEditing(true)} icon={ChevronLeft}>Editar Proposta</Button>
        <div className="flex gap-2">
            <Button variant="dark" icon={Printer} onClick={() => window.print()}>Salvar em PDF</Button>
        </div>
      </div>

      <div className="bg-white w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.1)] print:shadow-none p-16 flex flex-col border border-slate-100">
        <header className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white font-black text-2xl rounded">GP</div>
                <h1 className="text-2xl font-black uppercase tracking-tight">{data.companyName}</h1>
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold space-y-1">
                 <p>{data.companyAddress}</p>
                 <p>CNPJ: {data.companyCnpj} | {data.companyPhone}</p>
                 <p>{data.companyEmail}</p>
              </div>
            </div>
            <div className="text-right">
               <h2 className="text-4xl font-black text-slate-300 uppercase leading-none mb-2">PROPOSTA</h2>
               <div className="bg-slate-900 text-white px-4 py-1 inline-block text-xs font-bold tracking-widest uppercase">
                  Nº {data.budgetNumber}
               </div>
               <p className="mt-4 text-xs font-bold text-slate-500 uppercase">{data.location}, {data.date}</p>
            </div>
        </header>

        <section className="mb-12 bg-slate-50 p-6 rounded-lg border-l-4 border-slate-900">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Destinatário</h3>
          <p className="text-xl font-bold text-slate-900">{data.clientName}</p>
          <p className="text-sm text-slate-600 font-medium">A/C: Setor de Compras | {data.clientPhone}</p>
        </section>

        <main className="flex-1 space-y-12">
           {data.services.map((service, idx) => (
             <div key={service.id} className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-1">
                 {idx + 1}. Escopo do Serviço
               </h4>
               <h5 className="text-2xl font-black text-slate-800">{service.title}</h5>
               <p className="text-slate-600 leading-relaxed">{service.description}</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <h6 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entregáveis e Itens Inclusos</h6>
                   <ul className="space-y-2">
                     {service.includedItems.map((item, i) => (
                       <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="flex flex-col justify-end items-end text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal Item</p>
                    <p className="text-2xl font-bold text-slate-900">R$ {Number(service.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </div>
               </div>
             </div>
           ))}
        </main>

        <footer className="mt-auto pt-12 border-t-2 border-slate-100">
           <div className="flex justify-between items-end mb-12">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Validade da Proposta: 15 dias</p>
                <p className="text-xs font-bold text-slate-400 uppercase">Condição: 50% Entrada / 50% Entrega</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Investimento Total</p>
                <div className="bg-slate-900 text-white p-4 px-8 rounded-sm">
                   <span className="text-3xl font-black tracking-tight">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-20">
              <div className="border-t border-slate-400 pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Carimbo e Assinatura Contratada
              </div>
              <div className="border-t border-slate-400 pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 De acordo do Cliente
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default ProposalGenerator;
