import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Wallet, TrendingDown, DollarSign, Plus, Check, User, BarChart3, Trash2, Package } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const Balance: React.FC = () => {
  const { orders, expenses, dailyHistory, addExpense, updateOrder, products, losses } = useApp();
  const [activeTab, setActiveTab] = useState<'geral' | 'abc' | 'perdas'>('geral');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Current Month Logic
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  // 1. Calculate Monthly Metrics from DailyHistory (Closed Days)
  const historyThisMonth = dailyHistory.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  });

  const historyRevenue = historyThisMonth.reduce((acc, h) => acc + h.totalRevenue, 0);
  const historyCost = historyThisMonth.reduce((acc, h) => acc + h.totalCost, 0);
  
  const activeOrdersThisMonth = orders.filter(o => {
    if (!o.date) return true;
    const d = new Date(o.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear && o.status === 'entregue';
  });
  
  const activeRevenue = activeOrdersThisMonth.reduce((acc, o) => acc + o.total, 0);
  
  const expensesThisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  });

  const lossesThisMonth = losses.filter(l => {
    const d = new Date(l.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
  });
  const totalLossAmount = lossesThisMonth.reduce((acc, l) => acc + (l.quantity * l.costPrice), 0);

  const todayDate = new Date().toISOString().split('T')[0];
  const totalRevenue = historyRevenue + activeRevenue;
  
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

  // ABC Curve Calculation
  const productPerformance = products.map(p => {
    // Total revenue for this product this month (History + Active)
    // Note: History doesn't have per-product breakdown, so we use all available orders
    const productOrders = orders.filter(o => o.status === 'entregue').flatMap(o => o.items)
      .filter(item => item.productId === p.id);
    
    const revenue = productOrders.reduce((acc, item) => acc + (item.quantity * item.priceAtOrder), 0);
    const quantity = productOrders.reduce((acc, item) => acc + item.quantity, 0);
    
    return {
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      revenue,
      quantity
    };
  }).filter(p => p.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  const totalABCRevenue = productPerformance.reduce((acc, p) => acc + p.revenue, 0);
  let cumulativeRevenue = 0;
  
  const abcData = productPerformance.map(p => {
    cumulativeRevenue += p.revenue;
    const percentage = (cumulativeRevenue / totalABCRevenue) * 100;
    let category: 'A' | 'B' | 'C' = 'C';
    if (percentage <= 70) category = 'A';
    else if (percentage <= 90) category = 'B';
    
    return { ...p, category, share: (p.revenue / totalABCRevenue) * 100 };
  });

  // Receivables (Fiado) Logic
  const receivables = orders.filter(o => o.payment === 'fiado');
  const byClient = receivables.reduce((acc, order) => {
    acc[order.clientName] = (acc[order.clientName] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const handleSettleDebt = (clientName: string) => {
    const clientOrders = orders.filter(o => o.clientName === clientName && o.payment === 'fiado');
    if (confirm(`Confirmar recebimento de R$ ${byClient[clientName].toFixed(2)} de ${clientName}?`)) {
      clientOrders.forEach(o => {
        updateOrder(o.id, { payment: 'pago', status: 'entregue' });
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

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

      {/* Tabs Selector */}
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 gap-1">
        <button 
          onClick={() => setActiveTab('geral')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'geral' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <DollarSign size={14} /> Geral
        </button>
        <button 
          onClick={() => setActiveTab('abc')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'abc' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BarChart3 size={14} /> Curva ABC
        </button>
        <button 
          onClick={() => setActiveTab('perdas')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'perdas' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Trash2 size={14} /> Perdas
        </button>
      </div>

      {activeTab === 'geral' && (
        <div className="space-y-6">
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
        </div>
      )}

      {activeTab === 'abc' && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <h3 className="text-sm font-black text-white mb-1 uppercase tracking-wider">Curva ABC de Produtos</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Produtos ranqueados por contribuição no faturamento</p>
          </div>
          
          <div className="space-y-2">
            {abcData.map((item) => (
              <div key={item.id} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex justify-between items-center shadow-lg relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  item.category === 'A' ? 'bg-emerald-500' : 
                  item.category === 'B' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        item.category === 'A' ? 'bg-emerald-500/10 text-emerald-400' : 
                        item.category === 'B' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        Categoria {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{item.quantity} cx vendidas</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white block">R$ {item.revenue.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 font-bold">{item.share.toFixed(1)}% do faturamento</span>
                </div>
              </div>
            ))}
            {abcData.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-white/5 rounded-xl border border-white/10">
                Ainda não há dados de vendas suficientes para gerar a Curva ABC.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'perdas' && (
        <div className="space-y-4">
          <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl flex justify-between items-end">
            <div>
              <h3 className="text-sm font-black text-rose-400 mb-1 uppercase tracking-wider">Gestão de Perdas</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Total de mercadoria perdida no mês</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-rose-400">R$ {totalLossAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            {lossesThisMonth.map((loss) => {
              const product = products.find(p => p.id === loss.productId);
              return (
                <div key={loss.id} className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-3 rounded-xl flex justify-between items-center shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product?.emoji || '📦'}</span>
                    <div>
                      <span className="text-sm font-bold text-white block leading-tight">{product?.name || 'Produto'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                          {loss.reason}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{loss.quantity} cx perdida(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-400 block">- R$ {(loss.quantity * loss.costPrice).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(loss.date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
            {lossesThisMonth.length === 0 && (
              <div className="text-center py-12 text-slate-500 bg-white/5 rounded-xl border border-white/10">
                Nenhuma perda registrada este mês. Bom trabalho! 🍏
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Nova Despesa"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1 font-black uppercase tracking-widest text-[10px]">Descrição</label>
            <input 
              value={expenseDesc}
              onChange={e => setExpenseDesc(e.target.value)}
              placeholder="Ex: Gasolina, Almoço..."
              className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1 font-black uppercase tracking-widest text-[10px]">Valor (R$)</label>
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
            className="w-full bg-white/[0.06] hover:bg-white/10 text-rose-200 py-3 rounded-xl font-bold transition-colors shadow-[0_0_14px_rgba(244,63,94,0.35)] border border-rose-400/30 mt-2 uppercase tracking-widest text-xs"
          >
            Adicionar Despesa
          </button>
        </div>
      </Modal>
    </div>
  );
};
