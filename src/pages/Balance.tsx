import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Wallet, TrendingDown, DollarSign, Plus, Check, User } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const Balance: React.FC = () => {
  const { orders, expenses, dailyHistory, addExpense, updateOrder } = useApp();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Current Month Logic
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  // 1. Calculate Monthly Metrics from DailyHistory (Closed Days)
  // AND Current Active Data (Open Days/Today)?
  // Usually Balance shows closed + current? 
  // Let's aggregate everything for the current month.
  
  // Filter history for this month
  const historyThisMonth = dailyHistory.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  });

  const historyRevenue = historyThisMonth.reduce((acc, h) => acc + h.totalRevenue, 0);
  const historyCost = historyThisMonth.reduce((acc, h) => acc + h.totalCost, 0);
  
  // Add today's potential metrics if not closed?
  // Ideally, "Balance" shows the definitive financial state.
  // But let's stick to "Closed Days" + "Active Expenses" for a cleaner "Financial Command Center".
  // Actually, user wants to see "Real Profit" including pending expenses.
  
  // Let's calculate Totals based on ALL orders of the month (active + history if we kept them, but we archived them).
  // Wait, `closeDay` removes orders from `orders`.
  // So `orders` only has "Today's" or "Active" orders.
  // `dailyHistory` has the past.
  // So Total = History + Current Active Orders (if we want real-time).
  // For simplicity and stability, let's use History + Active Orders Revenue.
  
  const activeOrdersThisMonth = orders.filter(o => {
    if (!o.date) return true; // Assume new
    const d = new Date(o.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear && o.status === 'entregue';
  });
  
  const activeRevenue = activeOrdersThisMonth.reduce((acc, o) => acc + o.total, 0);
  
  // Active Expenses (not yet closed in a day, but registered)
  // `expenses` in context is a list. We filter by month.
  const expensesThisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  });
  
  // Note: `closeDay` calculates profit based on expenses of that day.
  // If we sum history profit + active profit, we might double count if we don't separate "closed expenses" vs "open expenses".
  // `closeDay` does NOT remove expenses from the main list in my implementation, it just uses them for calculation.
  // So `expensesThisMonth` includes ALL expenses of the month.
  
  // COGS for active orders
  // We need to calculate COGS for history + active.
  // History has `totalCost` which includes COGS + Expenses.
  // So History Profit is net.
  
  // But we want to show:
  // 1. Total Revenue (History Revenue + Active Revenue)
  // 2. Total Costs (History Cost + Active COGS + Active Expenses?? No, History Cost includes expenses of that day)
  // If `expenses` array keeps all expenses, and `dailyHistory` stores a snapshot...
  // We should rely on `dailyHistory` for past days, and calculate "Today/Open" for the rest.
  // BUT `expenses` are not cleared. So `expensesThisMonth` has everything.
  // If we sum `expensesThisMonth`, we are summing expenses that are already in `dailyHistory.totalCost`.
  // RISK: Double counting costs.
  
  // CORRECT APPROACH:
  // Total Revenue = Sum(History Revenue) + Sum(Active Orders Revenue)
  // Total Expenses/Costs = Sum(History Cost) + (Active Orders COGS) + (Expenses of Today/Open Days)
  // To avoid complexity:
  // Let's just sum `dailyHistory` for the "Closed" part.
  // And add "Today's" estimated metrics for the "Open" part.
  // Today = `new Date().toISOString().split('T')[0]`
  // We filter expenses and orders for TODAY.
  // Everything else (past days) should be in history.
  // If a day wasn't closed, it's data might be lost from stats if we only look at today vs history?
  // `orders` keeps pending/fiado orders forever until paid/delivered.
  // `orders` keeps "Entregue" orders only until `closeDay`.
  // So `orders` = Today's Delivered + All Pending/Fiado.
  // So we can safely sum `orders.filter(status === 'entregue')` as "Pending to Close Revenue".
  
  const todayDate = new Date().toISOString().split('T')[0];
  
  // Revenue
  const totalRevenue = historyRevenue + activeRevenue;
  
  // Costs
  // History Cost is already calculated.
  // We need Active Costs (COGS of active delivered orders + Expenses of Today).
  // Actually, we should check if expenses are in history.
  // If `closeDay` was run for a date, that date is in history.
  // Any expense with a date present in history should NOT be added again if we use history's totalCost.
  // BUT `expenses` list persists.
  // Let's rely on the `expenses` list for the "Expenses" section display, but for the "Top Cards" metrics, we need to be careful.
  
  // Let's simplify:
  // Top Cards = Snapshot of Reality.
  // Revenue = Total Invoiced (History + Active).
  // Costs = Total Outflow (History Costs + Active COGS + Expenses not in history?).
  // Actually, simplest is:
  // Revenue = Sum(History Revenue) + Active Revenue
  // Profit = Sum(History Profit) + (Active Revenue - Active COGS - Today's Expenses)
  // Costs = Revenue - Profit.
  
  // Active COGS
  // (We need access to products to calculate COGS, which we don't have easily here without iterating)
  // Let's approximate or fetch products.
  // We have `products` in context! I missed adding it to destructuring.
  // Added `products` to destructuring.
  
  const { products } = useApp(); // Need to grab this
  
  let activeCOGS = 0;
  activeOrdersThisMonth.forEach(o => {
     o.items.forEach(i => {
       const p = products.find(prod => prod.id === i.productId);
       if (p) activeCOGS += p.costPrice * i.quantity;
     });
  });
  
  const todaysExpenses = expenses.filter(e => e.date === todayDate);
  const todaysExpensesTotal = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  const totalCosts = historyCost + activeCOGS + todaysExpensesTotal;
  const netProfit = totalRevenue - totalCosts;

  // Receivables (Fiado) Logic
  const receivables = orders.filter(o => o.payment === 'fiado');
  // const totalReceivable = receivables.reduce((acc, o) => acc + o.total, 0); // Variável não utilizada

  // Group by client
  const byClient = receivables.reduce((acc, order) => {
    acc[order.clientName] = (acc[order.clientName] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const handleSettleDebt = (clientName: string) => {
    // Find all fiado orders for this client
    const clientOrders = orders.filter(o => o.clientName === clientName && o.payment === 'fiado');
    
    if (confirm(`Confirmar recebimento de R$ ${byClient[clientName].toFixed(2)} de ${clientName}?`)) {
      clientOrders.forEach(o => {
        updateOrder(o.id, { payment: 'pago', status: 'entregue' }); // Ensure it's marked as delivered/paid
      });
      alert("Dívida liquidada! O valor entrou para o faturamento.");
    }
  };

  const handleAddExpense = () => {
    if (!expenseDesc || !expenseAmount) return;
    addExpense({
      id: Date.now().toString(),
      description: expenseDesc,
      amount: parseFloat(expenseAmount),
      date: new Date().toISOString().split('T')[0]
    });
    setIsExpenseModalOpen(false);
    setExpenseDesc('');
    setExpenseAmount('');
  };

  return (
    <div className="pb-24 space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-white capitalize">Balanço - {currentMonth}</h1>
        <p className="text-slate-400 text-sm">Centro de Comando Financeiro</p>
      </header>

      {/* Top Cards - Redesenhados para Ultra-Slim Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Faturamento */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] text-emerald-200/60 font-black uppercase tracking-widest leading-none mb-1">Faturamento</p>
              <h2 className="text-xl font-black text-white leading-none">R$ {totalRevenue.toFixed(2)}</h2>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <DollarSign size={64} />
          </div>
        </div>
        
        {/* Custos */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-[10px] text-rose-200/60 font-black uppercase tracking-widest leading-none mb-1">Custos Totais</p>
              <h2 className="text-xl font-black text-white leading-none">R$ {totalCosts.toFixed(2)}</h2>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <TrendingDown size={64} />
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200/60 font-black uppercase tracking-widest leading-none mb-1">Lucro Real</p>
              <h2 className="text-xl font-black text-white leading-none">R$ {netProfit.toFixed(2)}</h2>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Wallet size={64} />
          </div>
        </div>
      </div>

      {/* Seção 1: Controle de Fiado */}
      <div>
        <h3 className="text-xs font-black text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-[0.2em]">
          <User size={14} className="text-amber-400" />
          Fiados Pendentes
        </h3>
        <div className="space-y-2">
          {Object.entries(byClient).map(([client, total]) => (
            <div key={client} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex justify-between items-center group shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <User size={14} />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block leading-tight">{client}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Débito em Aberto</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-rose-400 font-black text-base">
                  R$ {total.toFixed(2)}
                </span>
                <button 
                  onClick={() => handleSettleDebt(client)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-8 h-8 rounded-lg transition-all flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.15)] active:scale-90"
                  title="Liquidar Dívida"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ))}
          {Object.keys(byClient).length === 0 && (
             <div className="bg-white/[0.06] border border-white/10 p-6 rounded-xl text-center backdrop-blur-xl">
               <p className="text-slate-500">Ninguém deve nada! 🙌</p>
             </div>
          )}
        </div>
      </div>

      {/* Seção 2: Despesas Operacionais */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-[0.2em]">
            <TrendingDown size={14} className="text-rose-400" />
            Despesas do Mês
          </h3>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="text-[10px] bg-white/5 text-rose-300 px-2 py-1 rounded-lg border border-rose-500/30 hover:bg-white/10 transition-colors flex items-center gap-1 font-black uppercase tracking-widest"
          >
            <Plus size={12} />
            Lançar
          </button>
        </div>
        
        <div className="space-y-2">
          {expensesThisMonth.length > 0 ? (
            expensesThisMonth.map((expense) => (
              <div key={expense.id} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-2.5 rounded-xl flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <DollarSign size={14} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-200 block leading-tight">{expense.description}</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-rose-400 font-black text-sm">
                  - R$ {expense.amount.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm bg-white/[0.06] rounded-xl border border-white/10">
              Nenhuma despesa registrada este mês.
            </div>
          )}
        </div>
      </div>

      {/* New Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Nova Despesa"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Descrição</label>
            <input 
              value={expenseDesc}
              onChange={e => setExpenseDesc(e.target.value)}
              placeholder="Ex: Gasolina, Almoço..."
              className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Valor (R$)</label>
            <input 
              type="number"
              value={expenseAmount}
              onChange={e => setExpenseAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <button 
            onClick={handleAddExpense}
            className="w-full bg-white/[0.06] hover:bg-white/10 text-rose-200 py-3 rounded-xl font-bold transition-colors shadow-[0_0_14px_rgba(244,63,94,0.35)] border border-rose-400/30 mt-2"
          >
            Adicionar Despesa
          </button>
        </div>
      </Modal>
    </div>
  );
};
