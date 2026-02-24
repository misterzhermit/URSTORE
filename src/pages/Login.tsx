import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login delay
    setTimeout(() => {
      login();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-6 flex flex-col justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
            <LogIn size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">BEM-VINDO</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Acesse sua conta UrPlan</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 pl-14 text-lg font-bold text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-2">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 pl-14 text-lg font-bold text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 text-slate-900 font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'ENTRANDO...' : 'ENTRAR NA CONTA'}
            <ArrowRight size={22} />
          </button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center space-y-4"
        >
          <p className="text-slate-500 text-xs font-bold">
            Ainda não tem conta? <span className="text-emerald-400 cursor-pointer hover:underline">Falar com suporte</span>
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-700">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Acesso Seguro</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
