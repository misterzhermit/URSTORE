import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Check, Clock, RotateCcw, X, Plus, Trash2, ShoppingCart, List as ListIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, type PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import type { CollectionItem, Product } from '../types';
import { getSuggestionsForSector, type NCMSuggestion } from '../lib/taxService';

const SwipeableItem: React.FC<{
  item: CollectionItem;
  product: Product;
  onToggle: (id: string, deliveredQuantity?: number, costPrice?: number) => void;
  onRemove: (id: string) => void;
}> = ({ item, product, onToggle, onRemove }) => {
  const x = useMotionValue(0);
  const isCollected = item.status === 'collected';
  const [showCostModal, setShowCostModal] = useState(false);
  const [costPrice, setCostPrice] = useState(product.costPrice.toString());
  const [deliveredQuantity, setDeliveredQuantity] = useState(item.requestedQuantity.toString());
  
  // Visual feedback based on drag
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);
  
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold && !isCollected) {
      // Swipe Right -> Ask for Cost Price and Delivered Quantity
      setShowCostModal(true);
      // Reset position immediately to avoid sticking
      x.set(0);
    } else if (info.offset.x < -threshold) {
      if (isCollected) {
        // Swipe Left -> Mark as Pending (Undo)
        onToggle(item.id);
      } else {
        // Swipe Left on Pending -> Delete from List
        onRemove(item.id);
      }
      // Reset position
      x.set(0);
    } else {
      // If not enough drag, return to center
      x.set(0);
    }
  };

  const confirmCollection = () => {
    const price = parseFloat(costPrice);
    const qty = parseFloat(deliveredQuantity);
    if (!isNaN(price) && !isNaN(qty)) {
      onToggle(item.id, qty, price);
      setShowCostModal(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl mb-3 group">
        {/* Background Actions */}
        <div className="absolute inset-0 flex justify-between items-center px-6">
          <div className={cn(
            "flex items-center gap-2 font-bold transition-opacity", 
            isCollected ? "text-amber-200" : "text-rose-400"
          )}>
            {isCollected ? <RotateCcw size={24} /> : <Trash2 size={24} />}
            <span>{isCollected ? "Desfazer" : "Excluir"}</span>
          </div>
          <div className={cn("flex items-center gap-2 font-bold", !isCollected ? "text-emerald-200" : "opacity-0")}>
            <span>Confirmar</span>
            <Check size={24} />
          </div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -100, right: isCollected ? 0 : 100 }}
          style={{ x, opacity, scale }}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative p-5 border transition-all cursor-grab active:cursor-grabbing backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] rounded-2xl",
            isCollected 
              ? "bg-white/[0.03] border-white/5" 
              : "bg-gradient-to-br from-white/[0.08] to-white/[0.04] border-white/10"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-inner",
                isCollected ? "bg-white/5 grayscale opacity-30" : "bg-white/10"
              )}>
                {product.emoji}
              </div>
              <div>
                <h3 className={cn("text-xl font-black text-white tracking-tight transition-all", isCollected ? "line-through text-slate-500" : "")}>
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Solicitado</span>
                  <p className="text-xs text-indigo-400 font-mono font-bold">{item.requestedQuantity} cx</p>
                  {isCollected && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Chegou</span>
                        <p className={cn(
                          "text-xs font-mono font-bold",
                          item.deliveredQuantity === item.requestedQuantity 
                            ? "text-emerald-400" 
                            : "text-amber-400"
                        )}>
                          {item.deliveredQuantity} cx
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all backdrop-blur-xl",
              isCollected 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-white/5 border-white/10 text-slate-600"
            )}>
              {isCollected ? <Check size={24} strokeWidth={3} /> : <Clock size={24} />}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cost Price Modal */}
      <AnimatePresence>
        {showCostModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/[0.06] border border-white/[0.12] rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter">
                      RECEBIMENTO
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mt-1">{product.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowCostModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Qtd Realmente Entregue</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      inputMode="decimal"
                      autoFocus
                      value={deliveredQuantity}
                      onChange={e => setDeliveredQuantity(e.target.value.replace(/[^0-9.,]/g, ''))}
                      onFocus={e => e.target.select()}
                      className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 px-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">CX</span>
                  </div>
                  {parseFloat(deliveredQuantity) !== item.requestedQuantity && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                      <Clock size={14} className="animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-wider">
                        Divergência: {parseFloat(deliveredQuantity) - item.requestedQuantity > 0 ? '+' : ''}{parseFloat(deliveredQuantity) - item.requestedQuantity} cx
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Custo de Hoje (Unitário)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={costPrice}
                      onChange={e => setCostPrice(e.target.value.replace(/[^0-9.,]/g, ''))}
                      onFocus={e => e.target.select()}
                      className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={confirmCollection}
                disabled={!costPrice || parseFloat(costPrice) <= 0 || !deliveredQuantity || parseFloat(deliveredQuantity) < 0}
                className="w-full mt-8 bg-emerald-500 text-slate-900 font-black py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 disabled:opacity-30 disabled:grayscale"
              >
                CONFIRMAR E ABASTECER
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const List: React.FC = () => {
  const { collectionList, products, toggleCollectionStatus, addCollectionItem, removeCollectionItem, addProduct, company } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<NCMSuggestion | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('1');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const getProduct = (id: string) => products.find(p => p.id === id);
  const selectedProduct = getProduct(selectedProductId);

  // Get suggestions from tax service based on company sector
  const sectorSuggestions = getSuggestionsForSector(company?.activitySector || '');

  // Search in both existing products and sector suggestions
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.ncm && p.ncm.includes(productSearch))
  );

  const filteredSuggestions = sectorSuggestions.filter(s => {
    const isAlreadyRegistered = products.some(p => p.name.toLowerCase() === s.name.toLowerCase());
    if (isAlreadyRegistered) return false;

    return s.name.toLowerCase().includes(productSearch.toLowerCase()) ||
           s.ncm.includes(productSearch);
  });

  const handleAdd = async () => {
    if (requestedQuantity) {
      try {
        let finalProductId = selectedProductId;

        // Case 1: Suggestion selected -> Create product first
        if (!finalProductId && selectedSuggestion) {
          const newProduct: Product = {
            id: crypto.randomUUID(),
            name: selectedSuggestion.name,
            emoji: selectedSuggestion.emoji,
            defaultPrice: 0,
            costPrice: 0,
            totalStock: 0,
            availableStock: 0,
            ncm: selectedSuggestion.ncm
          };
          await addProduct(newProduct);
          finalProductId = newProduct.id;
        }
        // Case 2: No selection but search term -> Quick create generic product
        else if (!finalProductId && productSearch.trim()) {
          const newProduct: Product = {
            id: crypto.randomUUID(),
            name: productSearch.trim(),
            emoji: '📦',
            defaultPrice: 0,
            costPrice: 0,
            totalStock: 0,
            availableStock: 0,
            ncm: ''
          };
          await addProduct(newProduct);
          finalProductId = newProduct.id;
        }

        if (finalProductId) {
          await addCollectionItem(finalProductId, parseFloat(requestedQuantity));
          setShowAddModal(false);
          setSelectedProductId('');
          setSelectedSuggestion(null);
          setProductSearch('');
          setRequestedQuantity('1');
          setShowProductDropdown(false);
        }
      } catch (error) {
        console.error('Erro ao adicionar à lista:', error);
        alert('Erro ao salvar o produto ou adicionar à lista. Tente novamente.');
      }
    }
  };

  // Sort: Pending first, then Collected
  const sortedList = [...collectionList].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'pending' ? -1 : 1;
  });

  return (
    <div className="pb-24">
      <header className="mb-10 flex justify-between items-center">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-indigo-500 rounded-full blur-sm opacity-50" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-xl backdrop-blur-xl">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Coleta & Compra</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Fluxo Lavrador ➔ Estoque</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 p-4 rounded-2xl transition-all active:scale-90 shadow-lg group"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </header>

      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {sortedList.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <SwipeableItem 
                  item={item} 
                  product={product} 
                  onToggle={toggleCollectionStatus} 
                  onRemove={removeCollectionItem}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedList.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <ListIcon size={32} />
            </div>
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Lista Vazia</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-emerald-400 text-[10px] font-black uppercase underline tracking-widest"
            >
              Adicionar Primeiro Item
            </button>
          </motion.div>
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white/[0.06] border border-white/[0.12] rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter">
                      NOVA COMPRA
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mt-1">Lista de Coleta</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Produto</label>
                  
                  <div className="relative group">
                    <input 
                      type="text"
                      placeholder="Nome ou Código (NCM)..."
                      autoComplete="off"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setSelectedProductId('');
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 pl-12 pr-10 font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                      {selectedProduct ? selectedProduct.emoji : (selectedSuggestion ? selectedSuggestion.emoji : '🔍')}
                    </div>
                    { (productSearch || selectedProductId || selectedSuggestion) && (
                      <button 
                        onClick={() => {
                          setProductSearch('');
                          setSelectedProductId('');
                          setSelectedSuggestion(null);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center text-slate-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showProductDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#1a1f26] border border-white/[0.12] rounded-2xl overflow-hidden z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.6)] max-h-60 overflow-y-auto custom-scrollbar"
                      >
                        {/* Existing Products */}
                        {filteredProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setSelectedSuggestion(null);
                              setProductSearch(p.name);
                              setShowProductDropdown(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 text-left"
                          >
                            <span className="text-2xl">{p.emoji}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-white leading-tight">{p.name}</span>
                              {p.ncm && (
                                <span className="text-[9px] text-indigo-400/70 font-mono mt-0.5">#{p.ncm}</span>
                              )}
                            </div>
                            <span className="ml-auto text-[8px] bg-white/5 px-2 py-0.5 rounded text-slate-500 font-black uppercase tracking-tighter">No Estoque</span>
                          </button>
                        ))}

                        {/* Suggestions from Sector */}
                        {filteredSuggestions.map((s, idx) => (
                          <button
                            key={`suggest-${idx}`}
                            onClick={() => {
                              setSelectedSuggestion(s);
                              setSelectedProductId('');
                              setProductSearch(s.name);
                              setShowProductDropdown(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-500/10 transition-colors border-b border-white/5 last:border-0 text-left"
                          >
                            <span className="text-2xl">{s.emoji}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-white leading-tight">{s.name}</span>
                              <span className="text-[9px] text-emerald-400/70 font-mono mt-0.5">#{s.ncm}</span>
                            </div>
                            <span className="ml-auto text-[8px] bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 font-black uppercase tracking-tighter">Setor: {company?.activitySector}</span>
                          </button>
                        ))}

                        {/* No results -> Quick Add */}
                        {filteredProducts.length === 0 && filteredSuggestions.length === 0 && productSearch.trim() ? (
                          <div className="p-2">
                            <button
                              onClick={() => {
                                setShowProductDropdown(false);
                              }}
                              className="w-full px-4 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-left hover:bg-emerald-500/20 transition-all group"
                            >
                              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <Plus size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-white uppercase tracking-tighter">Criar "{productSearch}"</p>
                                <p className="text-[9px] text-emerald-500/70 font-bold uppercase mt-0.5">Produto novo não cadastrado</p>
                              </div>
                            </button>
                          </div>
                        ) : filteredProducts.length === 0 && filteredSuggestions.length === 0 && (
                          <div className="px-4 py-6 text-center text-slate-500 italic text-sm">
                            Comece a digitar para buscar...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Qtd Solicitada</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={requestedQuantity}
                      onChange={e => setRequestedQuantity(e.target.value.replace(/[^0-9.,]/g, ''))}
                      onFocus={e => e.target.select()}
                      className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 px-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">CX</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAdd}
                disabled={(!selectedProductId && !selectedSuggestion && !productSearch.trim()) || !requestedQuantity}
                className="w-full mt-8 bg-indigo-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-30"
              >
                ADICIONAR À LISTA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
