import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Share2, MessageCircle, ArrowLeft, Search, Package, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';

export const Catalog: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { products, company } = useApp();
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const shareOnWhatsApp = () => {
    const header = `*📦 CATÁLOGO - ${company?.name || 'Hortifruti'}*\n\n`;
    const body = filteredProducts
      .filter(p => p.availableStock > 0)
      .map(p => `${p.emoji} *${p.name}*\n💰 R$ ${p.defaultPrice.toFixed(2)} /cx\n📦 Disponível: ${p.availableStock} cx\n`)
      .join('\n');
    
    const footer = `\n\n_Preços sujeitos a alteração. Faça seu pedido agora!_`;
    const text = encodeURIComponent(header + body + footer);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="flex items-center justify-between gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-black text-white italic tracking-tighter">CATÁLOGO B2B</h1>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{company?.name}</p>
          </div>
          <button 
            onClick={shareOnWhatsApp}
            className="bg-emerald-500 text-slate-900 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </header>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.map(product => (
          <div 
            key={product.id}
            className={cn(
              "bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden group transition-all",
              product.availableStock <= 0 && "opacity-50 grayscale"
            )}
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-3 shadow-inner group-hover:scale-110 transition-transform">
              {product.emoji}
            </div>
            <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-emerald-400">R$ {product.defaultPrice.toFixed(2)}</span>
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">por caixa</span>
            </div>

            {product.availableStock > 0 ? (
              <div className="mt-3 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">
                  {product.availableStock} em estoque
                </span>
              </div>
            ) : (
              <div className="mt-3 px-2 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest">
                  Indisponível
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Package size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Floating Action Button for WhatsApp Order */}
      <button 
        onClick={shareOnWhatsApp}
        className="fixed bottom-24 right-4 bg-emerald-500 text-slate-900 px-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/40 flex items-center gap-2 active:scale-95 transition-all z-40"
      >
        <MessageCircle size={20} />
        Enviar Catálogo
      </button>
    </div>
  );
};
