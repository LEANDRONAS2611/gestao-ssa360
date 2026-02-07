
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { 
  Save, Building2, User, Phone, Mail, 
  MapPin, ShieldCheck, Sparkles, Globe, 
  Server, Database, ExternalLink, Copy, CheckCircle, AlertCircle, FileSpreadsheet, Download
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { createClient } from '@supabase/supabase-js';

interface SettingsViewProps {
  profile: CompanyProfile;
  setProfile: (p: CompanyProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, setProfile }) => {
  const [tempProfile, setTempProfile] = useState(profile);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'cloud' | 'deploy'>('profile');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'none' | 'success' | 'error'>('none');

  const handleSave = () => {
    setProfile(tempProfile);
    alert("Configurações aplicadas! O sistema irá sincronizar em alguns segundos.");
  };

  const exportFullBackup = () => {
    const services = JSON.parse(localStorage.getItem('ga_services') || '[]');
    const expenses = JSON.parse(localStorage.getItem('ga_expenses') || '[]');
    const sales = JSON.parse(localStorage.getItem('ga_sales') || '[]');

    const allTransactions = [
      ...sales.map((s: any) => ({ data: s.date, desc: s.clientName, cat: 'Receita', tipo: 'entrada', valor: s.total })),
      ...expenses.map((e: any) => ({ data: e.date, desc: e.description, cat: e.category, tipo: 'saida', valor: e.value }))
    ].sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const headers = ["Data", "Descricao", "Categoria", "Tipo", "Valor"];
    const rows = allTransactions.map(item => [
      new Date(item.data).toLocaleDateString('pt-BR'),
      `"${item.desc.replace(/"/g, '""')}"`,
      item.cat,
      item.tipo,
      item.valor.toFixed(2).replace('.', ',')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BACKUP_TOTAL_GESTAOAZUL_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const testConnection = async () => {
    if (!tempProfile.cloudConfig?.supabaseUrl || !tempProfile.cloudConfig?.supabaseKey) {
      alert("Preencha URL e Key antes de testar.");
      return;
    }
    
    setIsTesting(true);
    setTestResult('none');
    
    try {
      const client = createClient(tempProfile.cloudConfig.supabaseUrl, tempProfile.cloudConfig.supabaseKey);
      const { error } = await client.from('app_data').select('count', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') throw error;
      setTestResult('success');
    } catch (err) {
      console.error(err);
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const sqlCommand = `CREATE TABLE app_data (
  id TEXT PRIMARY KEY,
  data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo" ON app_data FOR ALL USING (true) WITH CHECK (true);`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 font-medium italic">Gestão de identidade e infraestrutura.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {['profile', 'cloud', 'deploy'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSubTab === tab ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'profile' ? 'Perfil' : tab === 'cloud' ? 'Nuvem' : 'Publicação'}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Perfil da Empresa</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nome Fantasia / Empresa" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} icon={Building2} />
                <Input label="CNPJ / CPF" value={tempProfile.cnpj} onChange={e => setTempProfile({...tempProfile, cnpj: e.target.value})} icon={ShieldCheck} />
                <Input label="Telefone Comercial" value={tempProfile.phone} onChange={e => setTempProfile({...tempProfile, phone: e.target.value})} icon={Phone} />
                <Input label="E-mail de Contato" value={tempProfile.email} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} icon={Mail} />
                <Input label="Endereço Completo" className="md:col-span-2" value={tempProfile.address} onChange={e => setTempProfile({...tempProfile, address: e.target.value})} icon={MapPin} />
              </div>
            </Card>

            <Card className="p-8 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Cópia de Segurança Local</h3>
              </div>
              <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">
                Independentemente da nuvem, você pode baixar uma base de dados completa em formato CSV a qualquer momento. Isso garante que você nunca perca seus dados financeiros, mesmo se o navegador for limpo.
              </p>
              <Button 
                variant="secondary" 
                className="w-full md:w-auto px-8" 
                icon={Download}
                onClick={exportFullBackup}
              >
                Baixar Banco de Dados (CSV)
              </Button>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8 bg-slate-900 text-white sticky top-8 shadow-2xl">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2"><Sparkles size={18} className="text-blue-400" /> Ações</h3>
              <div className="space-y-3">
                <Button className="w-full py-4 shadow-lg shadow-blue-600/20" onClick={handleSave} icon={Save}>Salvar Tudo</Button>
                <Button variant="outline" className="w-full text-slate-400 border-slate-800" onClick={() => setTempProfile(profile)}>Descartar</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === 'cloud' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
          <Card className="p-10 border-2 border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Database size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Infraestrutura Cloud</h2>
                <p className="text-slate-500 font-medium">Sincronize seus dados entre múltiplos dispositivos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Input 
                    label="Supabase URL" 
                    placeholder="https://sua-url.supabase.co" 
                    value={tempProfile.cloudConfig?.supabaseUrl || ''} 
                    onChange={e => setTempProfile({
                      ...tempProfile, 
                      cloudConfig: { ...(tempProfile.cloudConfig || { supabaseUrl: '', supabaseKey: '', projectId: '' }), supabaseUrl: e.target.value }
                    })}
                  />
                  <Input 
                    label="Supabase Anon Key" 
                    type="password"
                    placeholder="Chave anon/public..." 
                    value={tempProfile.cloudConfig?.supabaseKey || ''} 
                    onChange={e => setTempProfile({
                      ...tempProfile, 
                      cloudConfig: { ...(tempProfile.cloudConfig || { supabaseUrl: '', supabaseKey: '', projectId: '' }), supabaseKey: e.target.value }
                    })}
                  />
                  <Input 
                    label="ID Único do Projeto" 
                    placeholder="ex: projeto-leandro-01" 
                    value={tempProfile.cloudConfig?.projectId || ''} 
                    onChange={e => setTempProfile({
                      ...tempProfile, 
                      cloudConfig: { ...(tempProfile.cloudConfig || { supabaseUrl: '', supabaseKey: '', projectId: '' }), projectId: e.target.value }
                    })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="dark" 
                    className="flex-1 py-4" 
                    onClick={testConnection} 
                    loading={isTesting}
                  >
                    Testar Conexão
                  </Button>
                  <Button 
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500" 
                    onClick={handleSave} 
                    icon={Save}
                  >
                    Ativar Nuvem
                  </Button>
                </div>

                {testResult === 'success' && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3 animate-fade-in">
                    <CheckCircle size={20} />
                    <span className="text-xs font-black uppercase tracking-wider">Conexão Estabelecida com Sucesso!</span>
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center gap-3 animate-fade-in">
                    <AlertCircle size={20} />
                    <span className="text-xs font-black uppercase tracking-wider">Erro: Verifique as chaves e se a tabela existe.</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-6 text-white border border-white/10 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comando SQL Necessário</h4>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(sqlCommand); alert("SQL copiado!"); }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-blue-300 leading-relaxed overflow-x-auto whitespace-pre-wrap bg-black/40 p-4 rounded-xl border border-white/5">
                    {sqlCommand}
                  </pre>
                  <div className="mt-6 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Server size={16} />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Acesse o <span className="text-white font-bold">SQL Editor</span> no Supabase, cole o código acima e clique em <span className="text-emerald-400 font-bold">Run</span> para criar a estrutura necessária.
                    </p>
                  </div>
                </div>
                
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-emerald-600 flex items-center justify-center">
                      <Globe size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Ir para Supabase Console</span>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'deploy' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="p-10 border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
             <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Globe size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Status de Publicação</h2>
                <p className="text-slate-500 font-medium italic">Seu sistema está pronto para o mundo.</p>
              </div>
            </div>
            <div className="space-y-4">
               {[
                 { step: 1, title: 'Repositório GitHub', desc: 'Envie seus arquivos para um repositório git.' },
                 { step: 2, title: 'Deploy Vercel', desc: 'Conecte o repositório no vercel.com.' },
                 { step: 3, title: 'Variáveis de Ambiente', desc: 'Configure a API_KEY do Gemini na Vercel.' },
               ].map(item => (
                 <div key={item.step} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black flex-shrink-0">{item.step}</div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                 </div>
               ))}
               <div className="p-6 bg-blue-600 text-white rounded-3xl mt-6 shadow-xl shadow-blue-500/30 flex items-center justify-between">
                 <div>
                   <h4 className="font-black text-lg">HTTPS Ativo</h4>
                   <p className="text-blue-100 text-xs font-medium">Acesso à câmera habilitado com segurança.</p>
                 </div>
                 <Globe size={40} className="text-blue-400 opacity-50" />
               </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
