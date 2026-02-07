
import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/UI';
import {
  FileText, Plus, Trash2, ChevronLeft,
  Printer, Camera, CheckCircle, Share2, Download
} from 'lucide-react';
import { Proposal, ProposalItem, CompanyProfile } from '../types';

import { useApp } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';

export const ProposalView: React.FC = () => {
  const { companyProfile } = useApp();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(true);
  const [data, setData] = useState<Proposal>({
    id: '1',
    budgetNumber: '001',
    clientName: '',
    clientPhone: '',
    date: new Date().toLocaleDateString('pt-BR'),
    location: '',
    services: [
      {
        id: '1',
        title: '',
        description: '',
        includedItems: '',
        value: 0
      }
    ],
    companyName: companyProfile.name,
    companyPhone: companyProfile.phone,
    companyCnpj: companyProfile.cnpj,
    companyAddress: companyProfile.address,
    companyEmail: companyProfile.email
  });

  // Keep internal proposal data synced with global profile when not manually edited
  useEffect(() => {
    setData(prev => ({
      ...prev,
      companyName: companyProfile.name,
      companyPhone: companyProfile.phone,
      companyCnpj: companyProfile.cnpj,
      companyAddress: companyProfile.address,
      companyEmail: companyProfile.email
    }));
  }, [companyProfile]);

  const addService = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      includedItems: '',
      value: 0
    };
    setData({ ...data, services: [...data.services, newItem] });
  };

  const removeService = (id: string) => {
    if (data.services.length <= 1) return;
    setData({ ...data, services: data.services.filter(s => s.id !== id) });
  };

  const updateService = (id: string, field: keyof ProposalItem, value: any) => {
    setData({
      ...data,
      services: data.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const totalValue = data.services.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const handleShare = () => {
    if (!data.clientName) {
      addToast("Defina o nome do cliente antes de compartilhar.", "warning");
      return;
    }
    const mockLink = `https://gestaoazulpro.com/proposta/${data.id}_${Date.now()}`;
    navigator.clipboard.writeText(mockLink).then(() => {
      addToast("Link da proposta copiado para a área de transferência!", "success");
    });
  };

  if (!isEditing) {
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 no-print">
          <Button variant="outline" onClick={() => setIsEditing(true)} icon={ChevronLeft}>Voltar ao Editor</Button>
          <div className="flex gap-2">
            <Button variant="outline" icon={Share2} onClick={handleShare}>Compartilhar</Button>
            <Button variant="dark" onClick={() => window.print()} icon={Printer}>Imprimir / PDF</Button>
          </div>
        </div>

        <div className="bg-white mx-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none max-w-[850px] min-h-[1100px] flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white p-10 flex justify-between items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-blue-600/10 skew-x-12 translate-x-1/4"></div>
            <div className="z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">
                <Camera size={42} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter leading-none">{data.companyName}</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold mt-2">Soluções Empresariais</p>
              </div>
            </div>
            <div className="text-right z-10 hidden sm:block">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Proposta Comercial</h2>
              <p className="text-xl font-light text-slate-100 mt-1 italic">Ref: #{data.budgetNumber}</p>
            </div>
          </div>

          <div className="p-10 flex-1 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <InfoBlock label="Solicitante" value={data.clientName || 'Não Informado'} sub={data.clientPhone} />
              <InfoBlock label="Local" value={data.location || 'A Definir'} />
              <InfoBlock label="Data de Emissão" value={data.date} />
            </div>

            <div className="space-y-12 mb-16">
              {data.services.map((item, idx) => (
                <div key={item.id} className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black flex-shrink-0">
                      0{idx + 1}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.title || 'Serviço sem título'}</h3>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6 ml-12">
                    {item.description || 'Nenhuma descrição detalhada fornecida.'}
                  </p>

                  <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Itens Inclusos</p>
                      <ul className="space-y-3">
                        {item.includedItems ? item.includedItems.split('\n').map((li, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium leading-relaxed">
                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{li.replace(/^- /, '')}</span>
                          </li>
                        )) : <li className="text-xs text-slate-400 italic">Nenhum item especificado.</li>}
                      </ul>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor do Serviço</p>
                      <p className="text-2xl font-black text-slate-900">
                        R$ {Number(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center shadow-2xl">
                <div>
                  <h4 className="text-lg font-bold">Investimento Total</h4>
                  <p className="text-slate-400 text-xs mt-1">Valores válidos por 15 dias. Condições sob consulta.</p>
                </div>
                <div className="text-4xl font-black text-blue-400 mt-4 md:mt-0">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-20 mt-16 px-10">
              <div className="border-t border-slate-200 pt-3 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.companyName}</p>
              </div>
              <div className="border-t border-slate-200 pt-3 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aceite do Cliente</p>
              </div>
            </div>
          </div>

          <footer className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
              <span>CNPJ: {data.companyCnpj}</span>
              <span>Email: {data.companyEmail}</span>
              <span>Fone: {data.companyPhone}</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Criar Proposta</h1>
          <p className="text-slate-500">Configure os detalhes do orçamento personalizado.</p>
        </div>
        <Button onClick={() => setIsEditing(false)} icon={FileText}>Ver Proposta</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <LayoutIcon size={18} className="text-blue-500" /> Cabeçalho do Documento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Número Orçamento" value={data.budgetNumber} onChange={e => setData({ ...data, budgetNumber: e.target.value })} />
              <Input label="Data (DD/MM/AAAA)" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
              <Input label="Cliente / Empresa" value={data.clientName} onChange={e => setData({ ...data, clientName: e.target.value })} />
              <Input label="Telefone Contato" value={data.clientPhone} onChange={e => setData({ ...data, clientPhone: e.target.value })} />
              <Input label="Local do Job" className="md:col-span-2" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Serviços Solicitados</h3>
              <Button variant="ghost" icon={Plus} onClick={addService}>Add Serviço</Button>
            </div>

            {data.services.map((item, idx) => (
              <Card key={item.id} className="p-6 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Item #{idx + 1}</span>
                  <button onClick={() => removeService(item.id)} className="text-rose-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Título do Serviço"
                    value={item.title}
                    onChange={e => updateService(item.id, 'title', e.target.value)}
                    placeholder="Ex: Consultoria Técnica"
                  />
                  <Input
                    label="Descrição Longa"
                    value={item.description}
                    onChange={e => updateService(item.id, 'description', e.target.value)}
                    placeholder="Explique o que será feito..."
                    multiline
                  />
                  <Input
                    label="Itens Inclusos (Um por linha)"
                    value={item.includedItems}
                    onChange={e => updateService(item.id, 'includedItems', e.target.value)}
                    placeholder="- Item 1&#10;- Item 2"
                    multiline
                  />
                  <Input
                    label="Valor Unitário (R$)"
                    type="number"
                    value={item.value}
                    onChange={e => updateService(item.id, 'value', e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 sticky top-8">
            <h3 className="font-bold text-slate-800 mb-6">Resumo da Proposta</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Itens</span>
                <span className="font-bold">{data.services.length}</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black text-blue-600">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <Button className="w-full py-4 text-lg" onClick={() => setIsEditing(false)}>Gerar PDF / Visualizar</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoBlock: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
    {sub && <p className="text-xs text-slate-500 font-medium">{sub}</p>}
  </div>
);

const LayoutIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);
