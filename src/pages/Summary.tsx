import React from 'react';
import { useApp } from '../context/useApp';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export const Summary: React.FC = () => {
  const { orders, products, expenses, divergenceLogs, closeDay } = useApp();

  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's data
  const todaysOrders = orders.filter(o => (o.date === today || !o.date) && o.status === 'entregue');
  const todaysDivergences = divergenceLogs.filter(log => log.date.startsWith(today));
  
  // 1. Revenue (Faturamento)
  const revenue = todaysOrders.reduce((acc, o) => acc + o.total, 0);

  // 2. COGS (Custo das Mercadorias Vendidas)
  let cogs = 0;
  todaysOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        cogs += (product.costPrice * item.quantity);
      }
    });
  });

  // 3. Expenses (Despesas do dia)
  const todaysExpenses = expenses.filter(e => e.date === today);
  const totalExpenses = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);

  // 4. Profit (Lucro Real)
  const profit = revenue - (cogs + totalExpenses);

  // 5. Losses (Quebra - Mocked or derived from returns?)
  // Currently we handle returns by removing items from orders, so revenue decreases.
  // Explicit "Loss" tracking is not yet in state, maybe "Quebra" expenses?
  // Let's assume losses are just part of expenses or reduced revenue for now.
  // But let's show Expenses as "Saídas Extras".

  const handleCloseDay = () => {
    if (confirm("Tem certeza que deseja fechar o dia? Isso irá consolidar os dados e limpar a visualização de pedidos de hoje.")) {
      closeDay();
    }
  };

  return (
    <div className="pb-24 space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-white">Resumo Diário</h1>
        <p className="text-slate-400 text-sm">Desempenho de hoje ({new Date().toLocaleDateString()}).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Faturamento */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] text-emerald-200/60 font-black uppercase tracking-widest leading-none mb-1">Entrou Hoje</p>
              <h2 className="text-xl font-black text-white leading-none">R$ {revenue.toFixed(2)}</h2>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <TrendingUp size={64} />
          </div>
        </div>

        {/* Lucro Real */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-widest leading-none mb-1">Lucro no Bolso</p>
              <h2 className="text-xl font-black text-white leading-none">R$ {profit.toFixed(2)}</h2>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <DollarSign size={64} />
          </div>
        </div>

        {/* Custos / Despesas */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] text-rose-200/60 font-black uppercase tracking-widest leading-none mb-1">Custos & Saídas</p>
              <h2 className="text-xl font-black text-white leading-none">R$ {(cogs + totalExpenses).toFixed(2)}</h2>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <AlertCircle size={64} />
          </div>
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2 mb-2">
          <span>Detalhamento Diário</span>
          <span className="text-slate-400">Valores Reais</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Mercadorias</span>
            <span className="text-xs font-black text-white">R$ {cogs.toFixed(2)}</span>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Despesas Extras</span>
            <span className="text-xs font-black text-white">R$ {totalExpenses.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Divergências do Dia */}
      {todaysDivergences.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 mb-3 px-1">Alertas de Divergência (Hoje)</h3>
          <div className="space-y-2">
            {todaysDivergences.map(log => (
              <div key={log.id} className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{log.productName}</p>
                  <p className="text-[10px] text-amber-400/70 font-mono">Solicitado: {log.requestedQuantity} | Recebido: {log.deliveredQuantity}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-black", log.diff > 0 ? "text-emerald-400" : "text-rose-400")}>
                    {log.diff > 0 ? '+' : ''}{log.diff} cx
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">Custo: R$ {log.costPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={handleCloseDay}
        className="w-full py-6 bg-white/[0.06] hover:bg-white/10 border border-indigo-400/30 rounded-2xl text-indigo-200 font-bold text-lg shadow-[0_0_18px_rgba(99,102,241,0.35)] transition-all active:scale-95 flex items-center justify-center gap-3 mt-8"
      >
        <Moon size={24} />
        Fechar o Dia
      </button>
      
      <p className="text-center text-slate-500 text-xs px-6">
        Ao fechar o dia, os dados serão salvos no histórico e os pedidos de hoje serão arquivados.
      </p>
    </div>
  );
};
