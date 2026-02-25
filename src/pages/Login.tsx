import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        // Lógica de Login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      } else {
        // Lógica de Cadastro
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (signUpError) throw signUpError;
        
        if (signUpData.session) {
          // Se o Supabase estiver configurado para auto-login após signup
          // O onAuthStateChange no AppContext cuidará do redirecionamento
        } else {
          alert('Conta criada com sucesso! Verifique seu email para confirmar o acesso.');
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      console.error('Erro na autenticação:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-6 flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        <motion.div 
          key={isLogin ? 'login-header' : 'signup-header'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
            {isLogin ? <LogIn size={40} className="text-emerald-400" /> : <UserPlus size={40} className="text-emerald-400" />}
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter mb-2 uppercase">
            {isLogin ? 'BEM-VINDO' : 'CRIAR CONTA'}
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
            {isLogin ? 'Acesse sua conta UrPlan' : 'Comece sua gestão agora'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

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
            {isLoading ? (isLogin ? 'ENTRANDO...' : 'CRIANDO...') : (isLogin ? 'ENTRAR NA CONTA' : 'FINALIZAR CADASTRO')}
            <ArrowRight size={22} />
          </button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center space-y-6"
        >
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              {isLogin ? 'Ainda não tem conta?' : 'Já possui uma conta?'}
            </p>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 font-black uppercase tracking-widest text-sm hover:text-emerald-300 transition-colors"
            >
              {isLogin ? 'CRIAR MINHA CONTA' : 'VOLTAR PARA O LOGIN'}
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-slate-700">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Acesso Seguro Supabase</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
