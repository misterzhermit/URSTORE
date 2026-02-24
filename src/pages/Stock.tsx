import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { ChevronDown, Pencil, Check } from 'lucide-react';

export const Stock: React.FC = () => {
  const { products, updateProduct } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const handlePriceChange = (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price)) {
      updateProduct(id, { defaultPrice: price });
    }
  };

  const handleTotalStockChange = (id: string, newTotal: string) => {
    const total = parseInt(newTotal);
    if (!isNaN(total)) {
      updateProduct(id, { totalStock: total });
    }
  };

  return (
    <div className="pb-24 space-y-4">
      <header className="px-1 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Estoque & Preços</h1>
          <p className="text-slate-400 text-sm">Controle rápido de preço e disponibilidade.</p>
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
      </header>

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

                {/* Centro: Input Lavrador (Total) */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    "bg-white/5 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-inner transition-all",
                    isEditing && "ring-2 ring-emerald-500/30 border-emerald-500/50 bg-white/10"
                  )}>
                    {isEditing ? (
                      <input 
                        type="number"
                        value={product.totalStock}
                        onChange={(e) => handleTotalStockChange(product.id, e.target.value)}
                        className="w-8 bg-transparent text-white font-bold text-xs text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-300">{product.totalStock}</span>
                    )}
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
