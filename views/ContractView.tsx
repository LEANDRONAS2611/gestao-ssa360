
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import {
  PenTool, User, FileText, Calendar, Clock, MapPin,
  DollarSign, CheckSquare, Printer, ChevronLeft,
  ShieldAlert, Camera, Landmark, Info, Plus, X, ListPlus
} from 'lucide-react';
import { CompanyProfile, Contract } from '../types';

import { useApp } from '../contexts/AppDataContext';

export const ContractView: React.FC = () => {
  const { companyProfile } = useApp();
  const [isEditing, setIsEditing] = useState(true);
  const [newItemText, setNewItemText] = useState('');
  const [data, setData] = useState<Contract>({
    id: `cont-${Date.now()}`,
    clientName: '',
    clientCpf: '',
    clientAddress: '',
    serviceObject: 'Prestação de Serviço de locação, operação do (Totem Selfie) FotoLigth com impressão de fotos ilimitadas no formato 5x15cm.',
    eventDate: '',
    eventTime: '',
    eventDuration: '03:00hs',
    eventLocation: '',
    value: 0,
    paymentDate: '',
    paymentMethod: 'Pix',
    pixKey: '01623871565',
    bankDetails: 'Banco: EFÍ EMPRESAS, Agência: 0001, Conta PJ: 613529-3',
    includedItems: [
      'impressão de fotos ilimitadas no formato tirinhas 5x15cm',
      'Iluminação com refletor led profissional',
      'Operador treinado para atendimento',
      'Compartilhamento de fotos por QR Code',
      'Fotos personalizadas com marca d\'água'
    ],
    status: 'Draft'
  });

  const addItem = () => {
    if (!newItemText.trim()) return;
    setData({ ...data, includedItems: [...data.includedItems, newItemText.trim()] });
    setNewItemText('');
  };

  const removeItem = (index: number) => {
    const newList = [...data.includedItems];
    newList.splice(index, 1);
    setData({ ...data, includedItems: newList });
  };

  const toggleStandardItem = (item: string) => {
    if (data.includedItems.includes(item)) {
      setData({ ...data, includedItems: data.includedItems.filter(i => i !== item) });
    } else {
      setData({ ...data, includedItems: [...data.includedItems, item] });
    }
  };

  if (!isEditing) {
    return (
      <div className="animate-fade-in pb-20 font-inter">
        <div className="flex justify-between items-center mb-8 no-print">
          <Button variant="outline" icon={ChevronLeft} onClick={() => setIsEditing(true)}>Voltar ao Editor</Button>
          <Button variant="dark" icon={Printer} onClick={() => window.print()}>Gerar PDF / Imprimir</Button>
        </div>

        {/* Contract Preview Frame - Modern Sans Design */}
        <div className="bg-white mx-auto shadow-2xl border border-slate-100 max-w-[850px] min-h-[1100px] p-16 text-slate-900 print:shadow-none print:border-none print:m-0 print:p-10">

          {/* Modern Header Section */}
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">S</div>
                <h2 className="text-xl font-black tracking-tight uppercase">{companyProfile.name.split(' ')[0]} 360</h2>
              </div>
              <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Contrato</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Instrumento de Prestação de Serviços</p>
            </div>
          </div>

          {/* Modern Parties Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md">Contratante</span>
              <div className="pl-1">
                <p className="font-extrabold text-xl text-slate-900 tracking-tight">{data.clientName || "NOME DO CLIENTE"}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">DOC: {data.clientCpf || "000.000.000-00"}</p>
                <p className="text-xs font-medium text-slate-400 mt-2 italic leading-relaxed">{data.clientAddress || "Endereço não informado"}</p>
              </div>
            </div>
            <div className="space-y-4 text-left md:text-right md:border-l border-slate-100 md:pl-12">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 px-3 py-1 rounded-md">Contratado</span>
              <div className="pr-1">
                <p className="font-extrabold text-lg text-slate-900 tracking-tight">{companyProfile.name}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">CNPJ: {companyProfile.cnpj}</p>
                <p className="text-xs font-medium text-slate-400 mt-2 italic leading-relaxed">{companyProfile.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-12 mb-20">
            {/* Clause 1: Objeto */}
            <section className="relative group">
              <div className="flex gap-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">01</span>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-3">Objeto do Contrato</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.serviceObject}</p>
                </div>
              </div>
            </section>

            {/* Clause 2: Cronograma */}
            <section className="relative group">
              <div className="flex gap-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">02</span>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-3">Cronograma e Localização</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Data</p>
                      <p className="text-xs font-bold">{data.eventDate || "---"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Horário</p>
                      <p className="text-xs font-bold">{data.eventTime || "---"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Duração</p>
                      <p className="text-xs font-bold">{data.eventDuration}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">ID Contrato</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase">#{data.id.split('-')[1]}</p>
                    </div>
                    <div className="col-span-full pt-2 border-t border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Local da Prestação</p>
                      <p className="text-xs font-bold">{data.eventLocation || "Endereço a definir"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 3: Investimento */}
            <section className="relative group">
              <div className="flex gap-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">03</span>
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-3">Condições Financeiras</h3>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="text-sm font-medium text-slate-600 max-w-md">
                      O valor total de investimento para a realização do escopo descrito é de <span className="text-slate-900 font-extrabold">R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>, a ser quitado via {data.paymentMethod}.
                    </div>
                    <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 text-right">
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Total Líquido</p>
                      <p className="text-2xl font-black text-emerald-700 leading-none mt-1">R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Clause 7: Escopo (Dynamic) */}
            <section className="relative group page-break-before">
              <div className="flex gap-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">04</span>
                <div className="flex-1">
                  <h3 className="font-black text-blue-600 uppercase text-xs tracking-[0.2em] mb-5">Escopo de Entrega Detalhado</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.includedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <CheckSquare size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Legal Footer Section */}
          <div className="mt-20 space-y-4 pt-10 border-t border-slate-100">
            <div className="flex gap-4">
              <ShieldAlert size={14} className="text-rose-500 mt-1 flex-shrink-0" />
              <p className="text-[9px] font-medium text-slate-400 text-justify leading-relaxed">
                <span className="font-black text-slate-600 uppercase tracking-tighter">Rescisão:</span> Em caso de cancelamento por iniciativa de qualquer das partes, incidirá multa de 40% (quarenta por cento) sobre o valor total contratado, conforme legislação vigente e termos de prestação de serviços da SSA360.
              </p>
            </div>
            <div className="flex gap-4">
              <Info size={14} className="text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-[9px] font-medium text-slate-400 text-justify leading-relaxed">
                Este instrumento não gera vínculo de subordinação hierárquica ou dependência econômica, tratando-se de contratação de natureza estritamente comercial entre partes autônomas e independentes.
              </p>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-2 gap-24">
            <div className="space-y-4 text-center">
              <div className="h-0.5 bg-slate-900 w-full rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{data.clientName || "Contratante"}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Cliente Solicitante</p>
            </div>
            <div className="space-y-4 text-center">
              <div className="h-0.5 bg-slate-900 w-full rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{companyProfile.name}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Emissor Contratado</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Gerado Digitalmente via Gestão Azul Pro • {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Novo Contrato</h1>
          <p className="text-slate-500 font-medium italic">Edite as cláusulas e escopo dinâmico.</p>
        </div>
        <Button onClick={() => setIsEditing(false)} icon={FileText} variant="dark">Visualizar Contrato Moderno</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          <Card className="p-8">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3">
              <User size={20} className="text-blue-500" /> Identificação das Partes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Contratante (Cliente)" value={data.clientName} onChange={e => setData({ ...data, clientName: e.target.value })} placeholder="Nome Completo ou Razão Social" />
              <Input label="CPF ou CNPJ" value={data.clientCpf} onChange={e => setData({ ...data, clientCpf: e.target.value })} placeholder="000.000.000-00" />
              <Input label="Endereço do Contratante" className="md:col-span-2" value={data.clientAddress} onChange={e => setData({ ...data, clientAddress: e.target.value })} />
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="font-black text-slate-900 mb-6 flex items-center gap-3">
              <PenTool size={20} className="text-indigo-500" /> Detalhes da Execução
            </h3>
            <div className="space-y-4">
              <Input label="Objeto do Serviço" multiline value={data.serviceObject} onChange={e => setData({ ...data, serviceObject: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Data do Job" type="date" value={data.eventDate} onChange={e => setData({ ...data, eventDate: e.target.value })} />
                <Input label="Janela de Horário" placeholder="Ex: 21:00 às 01:00" value={data.eventTime} onChange={e => setData({ ...data, eventTime: e.target.value })} />
                <Input label="Duração Estimada" value={data.eventDuration} onChange={e => setData({ ...data, eventDuration: e.target.value })} />
              </div>
              <Input label="Endereço de Realização" icon={MapPin} value={data.eventLocation} onChange={e => setData({ ...data, eventLocation: e.target.value })} />
            </div>
          </Card>

          {/* Section: Dynamic Service Packages */}
          <Card className="p-8 overflow-visible">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-900 flex items-center gap-3">
                <ListPlus size={20} className="text-emerald-500" /> Escopo do Pacote
              </h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-3 py-1 rounded-full">Itens Selecionados: {data.includedItems.length}</p>
            </div>

            {/* New Item Input */}
            <div className="flex gap-2 mb-8 bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <Input
                className="flex-1 bg-white"
                placeholder="Ex: Cabine de LED personalizada..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addItem()}
              />
              <Button onClick={addItem} icon={Plus} className="h-[46px] mt-6">Add</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.includedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border-2 border-blue-600 bg-blue-50 text-blue-900 group">
                  <div className="flex items-center gap-3 truncate">
                    <CheckSquare size={16} className="text-blue-600 flex-shrink-0" />
                    <span className="text-[11px] font-extrabold truncate">{item}</span>
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1 text-blue-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {/* Sugestões Rápidas */}
              <div className="col-span-full pt-6 border-t border-slate-100 mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sugestões Rápidas (Clique para adicionar)</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Suporte Técnico 24h',
                    'Backup em Nuvem Realtime',
                    'Link Dedicado',
                    'Operador Bilingue',
                    'Fotos em Pen Drive',
                    'Impressão de Fotos Ilimitada'
                  ].map(sug => (
                    <button
                      key={sug}
                      onClick={() => toggleStandardItem(sug)}
                      className={`text-[9px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg border-2 transition-all ${data.includedItems.includes(sug) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 text-slate-400 hover:border-blue-500 hover:text-blue-600'}`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar: Totals & Modern Finance */}
        <div className="space-y-6">
          <Card className="p-8 bg-slate-900 text-white sticky top-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-blue-400 relative z-10">
              <DollarSign size={24} /> Financeiro
            </h3>

            <div className="space-y-6 relative z-10">
              <Input
                label="Total do Contrato (R$)"
                type="number"
                className="bg-slate-800 border-slate-700 text-white"
                value={data.value}
                onChange={e => setData({ ...data, value: Number(e.target.value) })}
              />
              <Input
                label="Vencimento Pagamento"
                type="date"
                className="bg-slate-800 border-slate-700 text-white"
                value={data.paymentDate}
                onChange={e => setData({ ...data, paymentDate: e.target.value })}
              />

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Método de Quitação</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pix', 'Crédito', 'Espécie', 'Boleto'].map(m => (
                    <button
                      key={m}
                      onClick={() => setData({ ...data, paymentMethod: m })}
                      className={`py-3 text-[10px] font-black rounded-xl border transition-all ${data.paymentMethod === m ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 translate-y-[-2px]' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-blue-400 uppercase mb-2">Resumo Jurídico</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    O contrato utiliza a fonte <span className="text-white font-bold">Inter</span> para legibilidade máxima e inclui multa rescisória padrão de 40%.
                  </p>
                </div>
                <Button className="w-full py-5 text-base font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30" onClick={() => setIsEditing(false)}>Gerar Documento Moderno</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
