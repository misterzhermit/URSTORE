import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Check, Clock, RotateCcw, X, Plus, Trash2, ShoppingCart, List as ListIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, type PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import type { CollectionItem, Product } from '../types';

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
    } else if (info.offset.x < -threshold) {
      if (isCollected) {
        // Swipe Left -> Mark as Pending (Undo)
        onToggle(item.id);
      } else {
        // Swipe Left on Pending -> Delete from List
        onRemove(item.id);
      }
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
            "relative p-4 border transition-colors cursor-grab active:cursor-grabbing backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
            isCollected 
              ? "bg-white/[0.04] border-white/10" 
              : "bg-white/[0.08] border-white/15"
          )}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={cn("text-3xl transition-transform", isCollected ? "scale-90 grayscale opacity-50" : "")}>
                {product.emoji}
              </span>
              <div>
                <h3 className={cn("text-lg font-bold text-white transition-all", isCollected ? "line-through text-slate-500" : "")}>
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-400 font-mono">Solicitado: {item.requestedQuantity} cx</p>
                  {isCollected && (
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-[10px] px-2 rounded-full font-bold",
                        item.deliveredQuantity === item.requestedQuantity 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-amber-500/20 text-amber-400"
                      )}>
                        Chegou: {item.deliveredQuantity} cx
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border transition-all bg-white/5",
              isCollected 
                ? "border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                : "border-white/10 text-slate-300"
            )}>
              {isCollected ? <Check size={20} /> : <Clock size={20} />}
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
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    {product.emoji} Recebido
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ajuste os dados reais</p>
                </div>
                <button onClick={() => setShowCostModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Qtd Realmente Entregue</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={deliveredQuantity}
                      onChange={e => setDeliveredQuantity(e.target.value)}
                      className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 px-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">CX</span>
                  </div>
                  {parseFloat(deliveredQuantity) !== item.requestedQuantity && (
                    <div className="flex items-center gap-1 mt-2 text-amber-400">
                      <Clock size={12} />
                      <p className="text-[10px] font-black uppercase">Divergência: {parseFloat(deliveredQuantity) - item.requestedQuantity} cx</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Custo de Hoje (Unitário)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">R$</span>
                    <input 
                      type="number" 
                      value={costPrice}
                      onChange={e => setCostPrice(e.target.value)}
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
  const { collectionList, products, toggleCollectionStatus, addCollectionItem, removeCollectionItem } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('1');

  const getProduct = (id: string) => products.find(p => p.id === id);

  const handleAdd = () => {
    if (selectedProductId && requestedQuantity) {
      addCollectionItem(selectedProductId, parseFloat(requestedQuantity));
      setShowAddModal(false);
      setSelectedProductId('');
      setRequestedQuantity('1');
    }
  };

  // Sort: Pending first, then Collected
  const sortedList = [...collectionList].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'pending' ? -1 : 1;
  });

  return (
    <div className="pb-24">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
              <ShoppingCart size={16} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Coleta & Compra</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Fluxo Lavrador ➔ Estoque</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3 rounded-2xl transition-all active:scale-90"
        >
          <Plus size={24} />
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">Nova Compra</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Produto</label>
                  <select 
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 px-4 text-lg font-bold text-white focus:outline-none appearance-none"
                  >
                    <option value="" className="bg-slate-900">Selecione...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} className="bg-slate-900">{p.emoji} {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-black tracking-widest block mb-2">Qtd Solicitada</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={requestedQuantity}
                      onChange={e => setRequestedQuantity(e.target.value)}
                      className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl py-4 px-4 text-2xl font-black text-white focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">CX</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAdd}
                disabled={!selectedProductId || !requestedQuantity}
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
