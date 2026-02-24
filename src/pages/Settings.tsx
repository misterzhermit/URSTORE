import React from 'react';
import { useApp } from '../context/useApp';
import { Store, Building2, MapPin, LogOut, ChevronRight, ShieldCheck, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  const { company, products, orders, logout } = useApp();

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da conta?')) {
      logout();
    }
  };

  const handleReset = () => {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados do aplicativo permanentemente. Deseja continuar?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 pb-32 space-y-8 max-w-md mx-auto">
      <div className="text-center pt-4">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-2xl backdrop-blur-xl">
          <Store size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">{company?.name || 'Empresa'}</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{company?.activitySector || 'Setor não definido'}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Informações do Negócio</h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl">
          <div className="p-4 flex items-center gap-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">CNPJ</p>
              <p className="text-sm font-bold text-slate-200">{company?.cnpj || 'Não informado'}</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase">Localização</p>
              <p className="text-sm font-bold text-slate-200">{company?.address || 'Não informado'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Estatísticas de Uso</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Produtos</p>
            <p className="text-xl font-black text-white">{products.length}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Vendas</p>
            <p className="text-xl font-black text-white">{orders.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Sistema</h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl">
          <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                <Database size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Backup de Dados</p>
                <p className="text-[10px] text-slate-500">Exportar dados em JSON</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-600" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <LogOut size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Sair da Conta</p>
                <p className="text-[10px] text-slate-500">Encerrar sessão atual</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-600" />
          </button>
          
          <button 
            onClick={handleReset}
            className="w-full p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20">
                <LogOut size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-red-400">Resetar Aplicativo</p>
                <p className="text-[10px] text-red-500/60">Apagar tudo e reiniciar</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-red-900" />
          </button>
        </div>
      </div>

      <div className="text-center space-y-2 pt-8">
        <div className="flex items-center justify-center gap-2 text-emerald-500/40">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Seguro & Local</span>
        </div>
        <p className="text-[10px] text-slate-700 font-medium">Versão 1.0.0 • UrPlan Pro</p>
      </div>
    </div>
  );
};
