import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { ChevronDown, Pencil, Check, Plus, ShoppingBag, X } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const Stock: React.FC = () => {
  const { products, updateProduct, addExpense } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  
  // Quick Buy State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('1');
  const [buyCost, setBuyCost] = useState('');

  const handlePriceChange = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice.replace(',', '.'));
    if (!isNaN(price)) {
      updateProduct(id, { defaultPrice: price });
    }
  };

  const handleQuickBuy = async () => {
    const product = products.find(p => p.id === selectedProductId);
    const qty = parseFloat(buyQuantity.replace(',', '.'));
    const cost = parseFloat(buyCost.replace(',', '.'));

    if (product && !isNaN(qty) && !isNaN(cost)) {
      // 1. Update Stock
      await updateProduct(product.id, {
        totalStock: product.totalStock + qty,
        availableStock: product.availableStock + qty
      });

      // 2. Add Expense
      await addExpense({
        id: crypto.randomUUID(),
        description: `Compra Rápida: ${product.name} (${qty} cx)`,
        amount: qty * cost,
        date: new Date().toISOString().split('T')[0]
      });

      // 3. Reset and Close
      setShowQuickBuy(false);
      setSelectedProductId('');
      setBuyQuantity('1');
      setBuyCost('');
      alert('Compra rápida registrada com sucesso!');
    }
  };

  return (
    <div className="pb-24 space-y-4">
      <header className="px-1 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Estoque & Preços</h1>
          <p className="text-slate-400 text-sm">Controle rápido de preço e disponibilidade.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowQuickBuy(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all shadow-lg"
          >
            <Plus size={14} />
            Compra Rápida
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg",
              isEditing 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
            )}
          >
            {isEditing ? (
              <>
                <Check size={16} />
                Pronto
              </>
            ) : (
              <>
                <Pencil size={16} />
                Editar
              </>
            )}
          </button>
        </div>
      </header>

      {/* Quick Buy Modal */}
      <Modal 
        isOpen={showQuickBuy} 
        onClose={() => setShowQuickBuy(false)}
        title="Compra Rápida"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Entrada Direta</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">O estoque sobe e o financeiro abate na hora.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1.5 px-1">Produto</label>
              <select 
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Selecione...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1.5 px-1">Quantidade</label>
                <div className="relative">
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={buyQuantity}
                    onChange={e => setBuyQuantity(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">CX</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1.5 px-1">Custo Unitário</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                  <input 
                    type="text"
                    inputMode="decimal"
                    value={buyCost}
                    onChange={e => setBuyCost(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-9 pr-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleQuickBuy}
              disabled={!selectedProductId || !buyQuantity || !buyCost}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              Confirmar Compra
            </button>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col gap-3">
        {products.map((product) => {
          const stockRatio = product.totalStock > 0 ? product.availableStock / product.totalStock : 0;
          const isLowStock = stockRatio <= 0.4;

          return (
            <div 
              key={product.id}
              className={cn(
                "bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl flex flex-col shadow-xl transition-all relative overflow-hidden",
                isLowStock 
                  ? "border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.03)]" 
                  : "border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.03)]"
              )}
            >
              {/* Título Destacado no Topo */}
              <div className="bg-white/5 px-4 py-1.5 border-b border-white/5 flex justify-center">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{product.name}</h3>
              </div>

              <div className="px-3 py-3 flex items-center justify-between gap-3">
                {/* Lado Esquerdo: Emoji */}
                <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-xl shadow-inner">
                  {product.emoji}
                </div>

                {/* Centro: Estoque Lavrador (Total) - Não editável para manter consistência com Coleta */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-inner transition-all"
                  )}>
                    <span className="text-xs font-bold text-slate-300">{product.totalStock}</span>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">CX</span>
                  </div>
                </div>

                {/* Centro-Direita: Preço */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "flex flex-col items-center gap-0.5"
                  )}>
                    <div className={cn(
                      "flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 transition-all shadow-inner",
                      isEditing && "ring-2 ring-emerald-500/30 border-emerald-500/50 bg-white/10"
                    )}>
                      <span className="text-[10px] font-bold text-slate-400">R$</span>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={product.defaultPrice}
                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                          className="w-8 bg-transparent text-white font-bold text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">{product.defaultPrice}</span>
                      )}
                      {isEditing && <ChevronDown size={14} className="text-emerald-400 animate-pulse" />}
                    </div>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Custo: R$ {product.costPrice}</span>
                  </div>
                </div>

                {/* Lado Direito: Badge Estoque Atual (Neon) */}
                <div className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-black tracking-tighter shadow-lg transition-all ml-auto",
                  isLowStock 
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]" 
                    : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                )}>
                  {product.availableStock} CX
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
