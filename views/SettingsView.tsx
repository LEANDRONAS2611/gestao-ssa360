
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { 
  Save, Building2, User, Phone, Mail, 
  MapPin, ShieldCheck, Sparkles, Globe, 
  Github, Zap, Key, CheckCircle2, Cloud, Server, Database
} from 'lucide-react';
import { CompanyProfile, CloudConfig } from '../types';

interface SettingsViewProps {
  profile: CompanyProfile;
  setProfile: (p: CompanyProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, setProfile }) => {
  const [tempProfile, setTempProfile] = useState(profile);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'cloud' | 'deploy'>('profile');

  const handleSave = () => {
    setProfile(tempProfile);
    alert("Configurações salvas com sucesso! As alterações já estão aplicadas em todo o sistema.");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 font-medium">Gerencie sua identidade e sincronização.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['profile', 'cloud', 'deploy'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'profile' ? 'Perfil' : tab === 'cloud' ? 'Nuvem (DB)' : 'Publicação'}
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

            <Card className="p-8 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">Dados do Responsável</h3>
              </div>
              <div className="max-w-md">
                <Input label="Nome do Responsável" value={tempProfile.ownerName} onChange={e => setTempProfile({...tempProfile, ownerName: e.target.value})} icon={User} />
              </div>
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
        <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
          <Card className="p-10 border-2 border-emerald-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Database size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Banco de Dados Cloud</h2>
                <p className="text-slate-500">Conecte ao Supabase para salvar dados globalmente.</p>
              </div>
            </div>

            <div className="space-y-6">
              <Input 
                label="Supabase URL" 
                placeholder="https://xyz.supabase.co" 
                value={tempProfile.cloudConfig?.supabaseUrl || ''} 
                onChange={e => setTempProfile({
                  ...tempProfile, 
                  cloudConfig: { ...(tempProfile.cloudConfig || { supabaseUrl: '', supabaseKey: '', projectId: '' }), supabaseUrl: e.target.value }
                })}
              />
              <Input 
                label="Supabase Anon Key" 
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                value={tempProfile.cloudConfig?.supabaseKey || ''} 
                onChange={e => setTempProfile({
                  ...tempProfile, 
                  cloudConfig: { ...(tempProfile.cloudConfig || { supabaseUrl: '', supabaseKey: '', projectId: '' }), supabaseKey: e.target.value }
                })}
              />
              <Input 
                label="ID do Projeto (Slug único)" 
                placeholder="ex: meu-gestao-pro-2024" 
                value={tempProfile.cloudConfig?.projectId || ''} 
                onChange={e => setTempProfile({
                  ...tempProfile, 
                  cloudConfig: { ...(tempProfile.cloudConfig || { supabaseUrl: '', supabaseKey: '', projectId: '' }), projectId: e.target.value }
                })}
              />

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mt-8">
                <h4 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Server size={18} className="text-blue-500" /> Como configurar?
                </h4>
                <ol className="text-xs text-slate-500 space-y-2 list-decimal ml-4">
                  <li>Crie uma conta gratuita em <strong>supabase.com</strong></li>
                  <li>Crie um novo projeto e copie a <strong>URL</strong> e a <strong>Anon Key</strong> da aba "API"</li>
                  <li>No SQL Editor, execute o comando de criação da tabela <strong>app_data</strong></li>
                  <li>Salve aqui e seu sistema estará sincronizado em tempo real!</li>
                </ol>
              </div>

              <Button className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-500" onClick={handleSave} icon={Cloud}>Ativar Sincronização Cloud</Button>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'deploy' && (
        <div className="max-w-3xl mx-auto">
          <Card className="p-10 border-2 border-blue-100">
             <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                <Globe size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Deploy do Sistema</h2>
                <p className="text-slate-500">Torne seu link público e seguro.</p>
              </div>
            </div>
            <div className="space-y-6">
               <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-black text-blue-600 shadow-sm">1</div>
                  <p className="text-sm text-slate-600 font-medium">Suba o código para o <strong>GitHub</strong> em um repositório privado.</p>
               </div>
               <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-black text-blue-600 shadow-sm">2</div>
                  <p className="text-sm text-slate-600 font-medium">Conecte o repositório na <strong>Vercel</strong> (vercel.com).</p>
               </div>
               <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">3</div>
                  <p className="text-sm text-blue-700 font-bold italic">Importante: Adicione a API_KEY do Gemini nas variáveis de ambiente da Vercel.</p>
               </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
