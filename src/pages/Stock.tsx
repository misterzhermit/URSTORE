import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { ChevronDown, Pencil, Check, Plus, ShoppingBag, Trash2, ClipboardCheck } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const Stock: React.FC = () => {
  const { products, updateProduct, addExpense, addLoss } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);
  const [showEndDayModal, setShowEndDayModal] = useState(false);
  
  // Quick Buy State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [buyQuantity, setBuyQuantity] = useState('1');
  const [buyCost, setBuyCost] = useState('');

  // Loss State
  const [lossProductId, setLossProductId] = useState('');
  const [lossQuantity, setLossQuantity] = useState('1');
  const [lossReason, setLossReason] = useState<'estragado' | 'sobra' | 'outro'>('estragado');

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
      await updateProduct(product.id, {
        totalStock: product.totalStock + qty,
        availableStock: product.availableStock + qty
      });

      await addExpense({
        id: crypto.randomUUID(),
        description: `Compra Rápida: ${product.name} (${qty} cx)`,
        amount: qty * cost,
        date: new Date().toISOString().split('T')[0]
      });

      setShowQuickBuy(false);
      setSelectedProductId('');
      setBuyQuantity('1');
      setBuyCost('');
      alert('Compra rápida registrada com sucesso!');
    }
  };

  const handleRegisterLoss = async () => {
    const product = products.find(p => p.id === lossProductId);
    const qty = parseFloat(lossQuantity.replace(',', '.'));

    if (product && !isNaN(qty)) {
      await addLoss({
        id: crypto.randomUUID(),
        productId: product.id,
        quantity: qty,
        reason: lossReason,
        date: new Date().toISOString().split('T')[0],
        costPrice: product.costPrice
      });

      setShowLossModal(false);
      setLossProductId('');
      setLossQuantity('1');
      setLossReason('estragado');
      alert('Perda registrada com sucesso!');
    }
  };

  return (
    <div className="pb-24 space-y-4">
      <header className="px-1 flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Estoque & Preços</h1>
            <p className="text-slate-400 text-sm">Controle de preço e disponibilidade.</p>
          </div>
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
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowQuickBuy(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all shadow-lg"
          >
            <Plus size={14} />
            Compra Rápida
          </button>
          <button 
            onClick={() => setShowLossModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all shadow-lg"
          >
            <Trash2 size={14} />
            Perda Unitária
          </button>
          <button 
            onClick={() => setShowEndDayModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all shadow-lg"
          >
            <ClipboardCheck size={14} />
            Conferência Final
          </button>
        </div>
      </header>

      {/* Loss Modal */}
      <Modal 
        isOpen={showLossModal} 
        onClose={() => setShowLossModal(false)}
        title="Registrar Perda"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Baixa por Perda</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">O estoque baixa e o prejuízo é contabilizado.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1.5 px-1">Produto</label>
              <select 
                value={lossProductId}
                onChange={e => setLossProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
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
                    value={lossQuantity}
                    onChange={e => setLossQuantity(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">CX</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1.5 px-1">Motivo</label>
                <select 
                  value={lossReason}
                  onChange={e => setLossReason(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                >
                  <option value="estragado">Estragado</option>
                  <option value="sobra">Sobra/Vencido</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleRegisterLoss}
              disabled={!lossProductId || !lossQuantity}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
            >
              Confirmar Perda
            </button>
          </div>
        </div>
      </Modal>

      {/* End of Day Balance Modal */}
      <Modal
        isOpen={showEndDayModal}
        onClose={() => setShowEndDayModal(false)}
        title="Conferência de Final de Dia"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl mb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">Balanço de Sobras</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Registre o que estragou ou sobrou para zerar o estoque para amanhã.</p>
          </div>

          <div className="space-y-4">
            {products.filter(p => p.totalStock > 0).map(product => (
              <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.emoji}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{product.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black">Em estoque: {product.totalStock} cx</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={async () => {
                      if (confirm(`Confirmar que ${product.totalStock} cx de ${product.name} ESTRAGARAM?`)) {
                        await addLoss({
                          id: crypto.randomUUID(),
                          productId: product.id,
                          quantity: product.totalStock,
                          reason: 'estragado',
                          date: new Date().toISOString().split('T')[0],
                          costPrice: product.costPrice
                        });
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Trash2 size={14} /> Estragou Tudo
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm(`Confirmar que ${product.totalStock} cx de ${product.name} SOBRARAM para amanhã?`)) {
                        // For leftovers, we might just keep them in stock or register as 'sobra' loss to reset stock
                        // In this business model, maybe 'sobra' means it's still good but needs to be accounted.
                        // For now, let's just offer a way to register partial loss.
                        const qty = prompt(`Quantas caixas de ${product.name} ESTRAGARAM? (Máx: ${product.totalStock})`, "0");
                        if (qty !== null) {
                          const val = parseFloat(qty.replace(',', '.'));
                          if (!isNaN(val) && val > 0) {
                            await addLoss({
                              id: crypto.randomUUID(),
                              productId: product.id,
                              quantity: Math.min(val, product.totalStock),
                              reason: 'estragado',
                              date: new Date().toISOString().split('T')[0],
                              costPrice: product.costPrice
                            });
                          }
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Check size={14} /> Sobrou (Parcial)
                  </button>
                </div>
              </div>
            ))}

            {products.filter(p => p.totalStock > 0).length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Tudo zerado por aqui! ✨</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setShowEndDayModal(false)}
            className="w-full bg-white text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Finalizar Conferência
          </button>
        </div>
      </Modal>

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
