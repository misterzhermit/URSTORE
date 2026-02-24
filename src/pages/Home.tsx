import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Quote, Award, Sparkles } from 'lucide-react';
import { useApp } from '../context/useApp';

const ESTOIC_QUOTES = [
  "Foca no que você controla.",
  "O obstáculo é o caminho.",
  "Temos duas orelhas e uma boca para ouvir mais e falar menos.",
  "A felicidade da sua vida depende da qualidade dos seus pensamentos.",
  "Não é o que acontece com você, mas como você reage que importa."
];

export const Home: React.FC = () => {
  const { orders, products } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => (o.date === today || !o.date));
  const deliveredCount = todaysOrders.filter(o => o.status === 'entregue').length;
  const totalCount = todaysOrders.length;
  
  const progress = totalCount > 0 ? (deliveredCount / totalCount) * 100 : 0;
  
  // Daily Quote based on day of month
  const quoteIndex = new Date().getDate() % ESTOIC_QUOTES.length;
  const dailyQuote = ESTOIC_QUOTES[quoteIndex];

  return (
    <div className="pb-24 space-y-8 flex flex-col items-center justify-center min-h-[70vh]">
      {/* 3D Avatar Placeholder (Glyph) */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 1 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/30 transition-colors" />
        <div className="relative w-48 h-48 rounded-full border-4 border-white/10 p-2 shadow-[0_0_40px_rgba(16,185,129,0.1)] backdrop-blur-xl">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="Glyph Avatar" 
            className="w-full h-full rounded-full bg-slate-800/50"
          />
          {/* Level Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-900 px-4 py-1 rounded-full font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1">
            <Award size={14} />
            NÍVEL 4
          </div>
        </div>
      </motion.div>

      {/* Daily Progress Widget */}
      <div className="w-full max-w-[280px] space-y-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Diária</h3>
            <p className="text-xl font-black text-white">{deliveredCount} <span className="text-slate-500 text-sm">/ {totalCount}</span></p>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-black text-lg">{progress.toFixed(0)}%</span>
          </div>
        </div>

        {/* Neon Progress Bar */}
        <div className="h-4 w-full bg-white/5 rounded-full border border-white/10 overflow-hidden relative p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Stoic Quote Widget */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-[300px] text-center space-y-4 pt-4"
      >
        <div className="flex justify-center text-emerald-500/30">
          <Quote size={32} />
        </div>
        <p className="text-slate-300 italic text-lg leading-relaxed font-serif px-4">
          "{dailyQuote}"
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          <div className="h-px w-8 bg-white/10" />
          <span>Sabedoria do Dia</span>
          <div className="h-px w-8 bg-white/10" />
        </div>
      </motion.div>

      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};
