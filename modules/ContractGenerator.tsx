
import React, { useState, useEffect } from 'react';
import { FileCheck, Printer, Settings, Calendar, DollarSign, CreditCard, Landmark, Pencil, Sun, Clock, UserCog, Camera, QrCode, AlertCircle, Wand2, Loader2, Check, Phone, Mail, Link as LinkIcon } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { ContractData, CompanySettings } from '../types';
import { refineLegalText } from '../services/geminiService';
import { createCalendarEvent, isGoogleConnected } from '../services/googleCalendar';

const STORAGE_KEY = 'ssa360_contract_v2_empty';
const SETTINGS_STORAGE_KEY = 'ssa360_company_settings';

// Helper para renderizar os ícones do pacote contratado
const PackageIcon: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case 'printer': return <Printer size={20} />;
    case 'sun': return <Sun size={20} />;
    case 'clock': return <Clock size={20} />;
    case 'user': return <UserCog size={20} />;
    case 'camera': return <Camera size={20} />;
    case 'qr': return <QrCode size={20} />;
    case 'alert': return <AlertCircle size={20} />;
    default: return <Settings size={20} />;
  }
};

const ContractGenerator: React.FC = () => {
  // Carrega as configurações globais da empresa salvas no App.tsx
  const companySettings: CompanySettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');

  const INITIAL_CONTRACT: ContractData = {
    clientName: '',
    clientCpfCnpj: '',
    clientAddress: '',
    companyName: companySettings.name || 'SSA360 SOLUCOES CAPTACAO DE IMAGEM',
    companyCnpj: companySettings.cnpj || '57.502.430/0001-29',
    companyAddress: companySettings.address || 'Salvador - BA',
    serviceDescription: '',
    serviceDate: '',
    serviceTime: '',
    serviceDuration: '',
    serviceLocation: '',
    value: 0,
    paymentDate: '',
    paymentMethod: '',
    pixKey: companySettings.pixKey || '01623871565',
    pixTitular: companySettings.pixTitular || 'Leandro Nascimento da Conceição',
    bankName: companySettings.bankName || 'EFÍ EMPRESAS',
    bankAgency: companySettings.bankAgency || '0001',
    bankAccount: companySettings.bankAccount || '613529-3',
    bankCnpj: companySettings.cnpj || '57.502.430/0001-29',
    cancellationClause: '',
    obligationsContratante: [],
    obligationsContratado: [],
    packageItems: [
      { icon: 'printer', label: 'Impressão de fotos ilimitadas tirinhas 5x15cm' },
      { icon: 'sun', label: 'Iluminação com refletor led profissional' },
      { icon: 'clock', label: 'Tempo de prestação do serviço definido em contrato' },
      { icon: 'user', label: 'Operador treinado para atendimento e montagem' },
      { icon: 'camera', label: 'Equipamento Foto Light profissional' },
      { icon: 'qr', label: 'Compartilhamento digital instantâneo (QR Code)' }
    ],
    imageAuth: true,
    noLinkAuth: false,
    contractCity: companySettings.address?.split('-')[0]?.trim() || 'Salvador',
    contractDate: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  const [data, setData] = useState<ContractData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CONTRACT;
  });
  
  const [isRefining, setIsRefining] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleRefine = async () => {
    if(!data.cancellationClause) {
      alert("Por favor, digite um rascunho da cláusula de cancelamento para que a IA possa juridicamente refiná-la.");
      return;
    }
    setIsRefining(true);
    try {
      const refined = await refineLegalText(data.cancellationClause);
      if (refined) setData({ ...data, cancellationClause: refined });
    } catch (error) {
      console.error("Erro ao refinar texto:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetData = () => {
    if(confirm("Deseja realmente limpar todos os campos do contrato? Isso não afetará as configurações da empresa.")) {
      setData(INITIAL_CONTRACT);
    }
  };

  const handleCalendarSync = async () => {
    if (!isGoogleConnected()) {
      alert("Conecte sua conta Google nas configurações primeiro.");
      return;
    }
    if (!data.serviceDate || !data.serviceTime || !data.clientName) {
      alert("Preencha data, hora e nome do cliente para agendar.");
      return;
    }

    setIsSyncing(true);
    try {
      // Parse data e hora para formato ISO
      // Assumindo formato DD/MM/AAAA para data e HH:MM para hora (input type date do browser pode variar)
      let startDateStr = '';
      if (data.serviceDate.includes('/')) {
        const [d, m, y] = data.serviceDate.split('/');
        startDateStr = `${y}-${m}-${d}`;
      } else {
        startDateStr = data.serviceDate;
      }
      
      const startDateTime = `${startDateStr}T${data.serviceTime}:00`;
      // Adiciona 4 horas padrão de duração se não especificado
      const endDateObj = new Date(new Date(startDateTime).getTime() + (4 * 60 * 60 * 1000));
      const endDateTime = endDateObj.toISOString().replace('.000Z', '');

      await createCalendarEvent({
        summary: `EVENTO: ${data.clientName} - SSA360`,
        location: data.serviceLocation,
        description: `Serviço: ${data.serviceDescription}\nValor: R$ ${data.value}`,
        start: startDateTime,
        end: endDateTime
      });

      alert("Evento criado na sua agenda com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar evento. Verifique se o formato da data está correto ou se a sessão expirou.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-140px)] overflow-hidden">
      
      {/* PAINEL DE EDIÇÃO (ESQUERDA) */}
      <div className="w-full xl:w-[450px] overflow-y-auto pr-4 custom-scrollbar no-print">
        <div className="space-y-6 pb-20">
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50 z-20 py-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <FileCheck className="text-blue-600" /> Editor de Contrato
            </h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={resetData}>Limpar</Button>
              <Button variant="dark" icon={Printer} onClick={handlePrint}>Gerar PDF</Button>
            </div>
          </div>

          <Card className="p-5 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 tracking-widest">1. Dados do Cliente</h3>
            <Input label="Nome / Razão Social" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
            <Input label="CPF ou CNPJ" value={data.clientCpfCnpj} onChange={e => setData({...data, clientCpfCnpj: e.target.value})} />
            <Input label="Endereço Completo" multiline value={data.clientAddress} onChange={e => setData({...data, clientAddress: e.target.value})} />
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">2. Evento e Localização</h3>
               <Button variant="ghost" className="h-6 text-[10px]" icon={Calendar} onClick={handleCalendarSync} disabled={isSyncing}>
                 {isSyncing ? "Sincronizando..." : "Agendar no Google"}
               </Button>
            </div>
            
            <Input label="Local do Evento" value={data.serviceLocation} onChange={e => setData({...data, serviceLocation: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Data do Serviço" type="date" value={data.serviceDate} onChange={e => setData({...data, serviceDate: e.target.value})} />
              <Input label="Horário de Início" type="time" value={data.serviceTime} onChange={e => setData({...data, serviceTime: e.target.value})} />
            </div>
            <Input label="Descrição do Objeto" multiline value={data.serviceDescription} placeholder="Ex: Locação de totem de fotos com impressão ilimitada..." onChange={e => setData({...data, serviceDescription: e.target.value})} />
          </Card>

          <Card className="p-5 space-y-4 border-blue-100 bg-blue-50/10">
            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
              <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest">3. Inteligência Jurídica</h3>
              <button onClick={handleRefine} disabled={isRefining} className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:bg-blue-100 px-3 py-1 rounded-full transition-all disabled:opacity-30">
                {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} Refinar Cláusula
              </button>
            </div>
            <Input multiline placeholder="Escreva aqui sobre multas, cancelamento ou regras específicas..." value={data.cancellationClause} onChange={e => setData({...data, cancellationClause: e.target.value})} />
          </Card>

          <Card className="p-5 space-y-4">
             <h3 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 tracking-widest">4. Condições Comerciais</h3>
             <div className="grid grid-cols-2 gap-4">
               <Input label="Valor Total (R$)" type="number" value={data.value} onChange={e => setData({...data, value: Number(e.target.value)})} />
               <Input label="Vencimento" value={data.paymentDate} onChange={e => setData({...data, paymentDate: e.target.value})} />
             </div>
             <Input label="Forma de Pagamento" value={data.paymentMethod} placeholder="Ex: Cartão de Crédito 3x ou PIX" onChange={e => setData({...data, paymentMethod: e.target.value})} />
          </Card>
        </div>
      </div>

      {/* VISUALIZAÇÃO DO CONTRATO (DIREITA) */}
      <div className="flex-1 bg-slate-100/80 rounded-3xl p-10 overflow-y-auto custom-scrollbar no-print shadow-inner border border-slate-200">
        <div className="flex flex-col items-center gap-20 pb-32">
          
          {/* PÁGINA 1 */}
          <div id="page-1" className="print-page bg-white w-[210mm] min-h-[297mm] shadow-2xl flex flex-col relative overflow-hidden text-[#1a3a3a] p-16">
             <div className="absolute top-0 left-0 right-0 h-48 bg-black z-0" style={{ borderRadius: '0 0 100% 100% / 0 0 40% 40%' }}></div>
             
             <div className="relative z-10 flex justify-between items-start mb-20">
                <div className="bg-white p-3 rounded-2xl shadow-lg mt-2">
                   <div className="text-black font-black text-6xl leading-none tracking-tighter">SSA</div>
                   <div className="text-black font-black text-6xl leading-none tracking-tighter -mt-2">360</div>
                </div>
                <div className="text-right pt-6">
                   <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-none mb-2">Contrato</h1>
                   <div className="h-1.5 w-72 bg-white/20 ml-auto mb-2"></div>
                   <div className="flex flex-col items-end gap-1 text-white/60 font-bold text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Phone size={10} /> {companySettings.phone || '---'}</span>
                      <span className="flex items-center gap-2"><Mail size={10} /> {companySettings.email || '---'}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-12 mt-16 mb-12">
                <div className="space-y-4">
                  <div className="bg-black text-white px-8 py-2.5 text-center font-black uppercase tracking-[0.2em] text-xs rounded-sm">Contratante</div>
                  <p className="text-[13px] leading-relaxed font-bold">
                    <span className="text-emerald-700">{data.clientName || '---'}</span>, CPF/CNPJ: {data.clientCpfCnpj || '---'}. {data.clientAddress || '---'}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-black text-white px-8 py-2.5 text-center font-black uppercase tracking-[0.2em] text-xs rounded-sm">Contratado</div>
                  <p className="text-[13px] leading-relaxed font-bold">
                    <span className="text-emerald-700">{data.companyName}</span>, CNPJ: {data.companyCnpj}. {data.companyAddress}
                  </p>
                </div>
             </div>

             <div className="text-center text-[10px] font-black uppercase tracking-tight text-emerald-900 py-3 border-y border-slate-100 mb-16">
                CONTRATANTE e CONTRATADA de agora em diante denominadas, em conjunto, "Partes".
             </div>

             <div className="grid grid-cols-2 gap-x-12 gap-y-12 flex-1 items-start">
                <section className="flex gap-4">
                   <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex items-center justify-center shrink-0">
                      <Settings size={24} className="text-slate-800" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">1. Objeto</h4>
                      <p className="text-[12px] font-bold text-[#0D7377] leading-snug mt-1">{data.serviceDescription || 'Escopo não definido'}</p>
                   </div>
                </section>
                <section className="flex gap-4">
                   <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex items-center justify-center shrink-0">
                      <Calendar size={24} className="text-slate-800" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">2. Data e local</h4>
                      <p className="text-[12px] font-bold text-[#0D7377] leading-snug mt-1">Data: {data.serviceDate || '---'} | Hora: {data.serviceTime || '---'} | Local: {data.serviceLocation || '---'}</p>
                   </div>
                </section>
                <section className="flex gap-4 col-span-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                   <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex items-center justify-center shrink-0 bg-white">
                      <DollarSign size={24} className="text-slate-800" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">3. Valor e Pagamento</h4>
                      <div className="text-[12px] font-bold text-[#0D7377] leading-snug mt-1">
                         <p>Valor total de R$ {data.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.</p>
                         <p>Forma: {data.paymentMethod || '---'} com vencimento em {data.paymentDate || '---'}.</p>
                      </div>
                   </div>
                </section>
                <section className="flex gap-4">
                   <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex items-center justify-center shrink-0">
                      <CreditCard size={24} className="text-slate-800" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">4. Chave Pix</h4>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{data.pixKey}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{data.pixTitular}</p>
                   </div>
                </section>
                <section className="flex gap-4">
                   <div className="w-12 h-12 border-2 border-slate-800 rounded-full flex items-center justify-center shrink-0">
                      <Landmark size={24} className="text-slate-800" />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">5. Conta Bancária</h4>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{data.bankName}</p>
                      <p className="text-[9px] text-slate-400 font-bold">AG: {data.bankAgency} | CC: {data.bankAccount}</p>
                   </div>
                </section>
             </div>
          </div>

          {/* PÁGINA 2 */}
          <div id="page-2" className="print-page bg-white w-[210mm] min-h-[297mm] shadow-2xl flex flex-col relative overflow-hidden text-[#1a3a3a] p-16 pt-24">
             <section className="mb-14">
               <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-2 uppercase tracking-tighter">6. Pacote Contratado</h3>
               <div className="border border-slate-100 rounded-3xl p-8 bg-slate-50/20 grid grid-cols-2 gap-x-10 gap-y-8">
                  {data.packageItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center">
                          <PackageIcon name={item.icon} />
                       </div>
                       <p className="text-[10px] font-black text-slate-600 uppercase leading-tight">{item.label}</p>
                    </div>
                  ))}
               </div>
             </section>

             <section className="mb-12">
                <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tighter">7. Cláusulas Especiais e Cancelamento</h3>
                <div className="p-6 bg-rose-50/30 rounded-2xl border-l-4 border-rose-500 min-h-[120px]">
                   <p className="text-[12px] font-bold text-slate-700 leading-relaxed italic">
                      {data.cancellationClause || 'Sem cláusulas de cancelamento ou regras especiais definidas.'}
                   </p>
                </div>
             </section>

             <section className="mb-12">
                <h3 className="text-xl font-black text-slate-800 mb-4 uppercase tracking-tighter">8. Autorização de Uso de Imagem</h3>
                <div className="flex gap-10 items-center p-5 border border-emerald-100 bg-emerald-50/20 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border-2 border-slate-900 flex items-center justify-center rounded bg-white">
                         {data.imageAuth && <Check size={20} strokeWidth={4} className="text-black" />}
                      </div>
                      <span className="text-lg font-black text-emerald-700 uppercase">Autorizo</span>
                   </div>
                   <div className="flex items-center gap-3 opacity-30">
                      <div className="w-8 h-8 border-2 border-slate-900 rounded bg-white"></div>
                      <span className="text-lg font-black text-emerald-700 uppercase">Não Autorizo</span>
                   </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-bold italic">
                   * O contratante autoriza o uso das imagens captadas para fins promocionais e redes sociais da contratada.
                </p>
             </section>

             <div className="mt-auto mb-20">
                <p className="text-xl font-black text-emerald-700 mb-16 italic">
                  {data.contractCity}, {data.contractDate}.
                </p>
                <div className="grid grid-cols-2 gap-20">
                   <div className="border-t-2 border-slate-300 pt-4 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assinatura do Contratante</p>
                      <div className="h-10"></div>
                   </div>
                   <div className="border-t-2 border-slate-300 pt-4 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assinatura da SSA360</p>
                      <div className="h-10"></div>
                   </div>
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 h-40 bg-black z-0" style={{ borderRadius: '100% 100% 0 0 / 40% 40% 0 0' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractGenerator;
