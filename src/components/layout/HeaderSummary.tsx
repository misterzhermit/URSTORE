import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Truck, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { cn } from '../../lib/utils';

interface HeaderSummaryProps {
  onProfileClick: () => void;
  isSettingsActive: boolean;
}

export const HeaderSummary: React.FC<HeaderSummaryProps> = ({ onProfileClick, isSettingsActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { company, orders, products, expenses } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => (o.date === today || !o.date));
  const deliveredOrders = todaysOrders.filter(o => o.status === 'entregue');
  
  // Metrics Calculation
  const revenue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
  let cogs = 0;
  deliveredOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) cogs += (product.costPrice * item.quantity);
    });
  });
  const todaysExpenses = expenses.filter(e => e.date === today);
  const totalExpenses = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedProfit = revenue - (cogs + totalExpenses);

  const receivables = orders.filter(o => o.payment === 'fiado');
  const totalReceivable = receivables.reduce((acc, o) => acc + o.total, 0);

  const lowStockCount = products.filter(p => (p.availableStock / (p.totalStock || 1)) <= 0.3).length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-[env(safe-area-inset-top,8px)] pb-1 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto flex justify-between items-center relative h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
              {company?.name?.[0] || 'N'}
            </div>
            <span className="font-bold text-lg tracking-tight text-white">{company?.name || 'Minha Loja'}</span>
          </div>

          {/* Interaction Trigger */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group py-1"
          >
            <div className="w-10 h-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors mb-0.5" />
            <ChevronDown 
              size={14} 
              className={cn("text-slate-500 transition-transform duration-300", isOpen ? "rotate-180" : "")} 
            />
          </button>

          <button 
            onClick={onProfileClick}
            className={cn(
              "w-8 h-8 rounded-full border overflow-hidden transition-all",
              isSettingsActive ? "ring-2 ring-emerald-500 border-emerald-500" : "bg-slate-800 border-slate-700"
            )}
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[51]"
            />

            {/* Glass Drawer */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 right-0 z-[52] bg-white/[0.03] backdrop-blur-2xl border-b border-white/10 rounded-b-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pt-[calc(env(safe-area-inset-top,8px)+56px)] pb-8 px-6"
            >
              <div className="max-w-md mx-auto space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Resumo Vapt-Vupt</h2>
                  {lowStockCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold animate-pulse">
                      <AlertCircle size={10} />
                      <span>{lowStockCount} PRODUTOS BAIXOS</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Lucro</span>
                    <span className="text-sm font-black text-white">R$ {estimatedProfit.toFixed(0)}</span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                      <Truck size={16} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Entregas</span>
                    <span className="text-sm font-black text-white">{deliveredOrders.length}/{todaysOrders.length}</span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                      <Wallet size={16} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">Fiado</span>
                    <span className="text-sm font-black text-white">R$ {totalReceivable.toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 px-2">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                      alt="Glyph" 
                      className="w-full h-full rounded-full bg-slate-800"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 italic">"Foca no que você controla."</p>
                    <p className="text-[10px] text-emerald-400 font-black uppercase mt-1 tracking-widest">Glyph • Nível 4</p>
                  </div>
                </div>
              </div>

              {/* Close Handle */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/10"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
