import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import { Modal } from '../components/ui/Modal';
import { ReceiptComponent } from '../components/ui/ReceiptComponent';
import { useReceiptGenerator } from '../hooks/useReceiptGenerator';
import { Truck, CheckCircle, Clock, DollarSign, Share2, Pencil, Plus, Trash2, RotateCcw, FileText, Loader2, Eye, ExternalLink, Search, Filter, Users, Box, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Order, OrderItem, OrderStatus } from '../types';

const createOrderId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `ord-${Math.random().toString(36).slice(2, 10)}`;
};

export const Orders: React.FC = () => {
  const { orders, products, addOrder, updateOrder, updateProduct } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all' | 'fiado'>('all');
  const [isClanMode, setIsClanMode] = useState(false);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  
  const { 
    isGenerating, 
    receiptData, 
    generateReceipt, 
    getWhatsAppLink, 
    resetReceipt 
  } = useReceiptGenerator();
  
  // New Order State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  // Separation Mode State
  const [isSeparating, setIsSeparating] = useState(false);
  const [separationItems, setSeparationItems] = useState<OrderItem[]>([]);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    resetReceipt();
    setIsSeparating(false);
  };

  const startSeparation = () => {
    if (!selectedOrder) return;
    setIsSeparating(true);
    setSeparationItems(selectedOrder.items.map(item => ({
      ...item,
      originalQuantity: item.originalQuantity || item.quantity,
      collected: item.collected || false
    })));
  };

  const toggleItemCollected = (index: number) => {
    setSeparationItems(prev => prev.map((item, i) => 
      i === index ? { ...item, collected: !item.collected } : item
    ));
  };

  const updateSeparationQuantity = (index: number, newQty: string) => {
    const qty = parseFloat(newQty) || 0;
    setSeparationItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: qty } : item
    ));
  };

  const confirmSeparation = () => {
    if (!selectedOrder) return;
    
    const allCollected = separationItems.every(item => item.collected);
    if (!allCollected) {
      if (!confirm('Alguns itens não foram marcados como coletados. Confirmar assim mesmo?')) return;
    }

    const newTotal = calculateTotal(separationItems);
    
    // Update Order
    updateOrder(selectedOrder.id, {
      items: separationItems,
      total: newTotal,
      status: 'pendente' // Moves from separation back to pending (ready for delivery)
    });

    // Visual feedback logic would go here (sound/vibration)
    
    setIsModalOpen(false);
    setIsSeparating(false);
    alert('Pedido separado e atualizado com sucesso!');
  };

  const toggleClientExpansion = (client: string) => {
    setExpandedClients(prev => 
      prev.includes(client) ? prev.filter(c => c !== client) : [...prev, client]
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || 
                         (statusFilter === 'fiado' ? order.payment === 'fiado' : order.status === statusFilter);
    
    return matchesSearch && matchesFilter;
  });

  const ordersByClient = filteredOrders.reduce((acc, order) => {
    if (!acc[order.clientName]) acc[order.clientName] = [];
    acc[order.clientName].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const handleShare = () => {
    if (!selectedOrder) return;
    
    // Format message for WhatsApp
    let message = `*Pedido #${selectedOrder.id}* - ${selectedOrder.clientName}\n\n`;
    selectedOrder.items.forEach(item => {
      message += `${getProductEmoji(item.productId)} ${item.quantity}x ${getProductName(item.productId)} - R$ ${(item.priceAtOrder * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: R$ ${selectedOrder.total.toFixed(2)}*`;

    const encodedMessage = encodeURIComponent(message);
    const phone = selectedOrder.clientPhone ? selectedOrder.clientPhone.replace(/\D/g, '') : '';
    
    // If phone exists, open chat directly. Otherwise, open share picker (generic wa.me)
    const url = phone ? `https://wa.me/${phone}?text=${encodedMessage}` : `https://wa.me/?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  };

  const handleReturnItem = (orderId: string, itemIndex: number) => {
    if (!selectedOrder) return;

    const newItems = [...selectedOrder.items];
    const itemToRemove = newItems[itemIndex];
    newItems.splice(itemIndex, 1);
    
    const newTotal = calculateTotal(newItems);
    
    // Perguntar se volta pro estoque ou é perda
    const returnToStock = confirm(`Devolução: ${getProductName(itemToRemove.productId)}\n\nVoltar este item para o estoque?\n\nOK = Voltar pro Estoque\nCancelar = Registrar como Perda`);
    
    if (returnToStock) {
      // Devolver ao estoque
      const product = products.find(p => p.id === itemToRemove.productId);
      if (product) {
        updateProduct(product.id, {
          availableStock: product.availableStock + itemToRemove.quantity
        });
      }
    }
    
    updateOrder(orderId, {
      items: newItems,
      total: newTotal,
      status: newItems.length === 0 ? 'entregue' : selectedOrder.status
    });
    
    setSelectedOrder({
      ...selectedOrder,
      items: newItems,
      total: newTotal
    });
    
    alert(`Item ${getProductName(itemToRemove.productId)} removido. ${returnToStock ? 'Devolvido ao estoque.' : 'Registrado como perda.'}`);
  };

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Produto desconhecido';
  };

  const getProductEmoji = (id: string) => {
    return products.find(p => p.id === id)?.emoji || '📦';
  };

  const handleAddItem = () => {
    if (!selectedProductId || !quantity) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty <= 0) return;

    setNewOrderItems(prev => {
      const existing = prev.find(item => item.productId === selectedProductId);
      if (existing) {
        return prev.map(item => 
          item.productId === selectedProductId 
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { productId: selectedProductId, quantity: qty, priceAtOrder: product.defaultPrice }];
    });
    
    setSelectedProductId('');
    setQuantity('1');
  };

  const handleRemoveItem = (productId: string) => {
    setNewOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((acc, item) => acc + (item.priceAtOrder * item.quantity), 0);
  };

  const handleSaveOrder = () => {
    if (!clientName || newOrderItems.length === 0) return;

    const newOrder: Order = {
      id: createOrderId(),
      clientName,
      clientPhone,
      items: newOrderItems,
      total: calculateTotal(newOrderItems),
      status: 'pendente',
      payment: 'fiado',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };

    addOrder(newOrder);
    setIsNewOrderOpen(false);
    setClientName('');
    setClientPhone('');
    setNewOrderItems([]);
    setSelectedProductId('');
    setQuantity('1');
  };

  return (
    <div className="pb-24">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <button 
            onClick={() => setIsNewOrderOpen(true)}
            className="bg-white/10 hover:bg-white/[0.15] text-white px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 backdrop-blur-xl shadow-[0_0_18px_rgba(16,185,129,0.25)] transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Novo Pedido</span>
          </button>
        </div>

        {/* Omnibar & Filters */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar por cliente ou pedido #..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all backdrop-blur-md"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setStatusFilter('all')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                statusFilter === 'all' ? "bg-white text-slate-900 border-white" : "bg-white/5 text-slate-400 border-white/5"
              )}
            >
              Todos
            </button>
            <button 
              onClick={() => setStatusFilter('pendente')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                statusFilter === 'pendente' ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20" : "bg-white/5 text-slate-400 border-white/5"
              )}
            >
              <Truck size={14} />
              Pendentes
            </button>
            <button 
              onClick={() => setStatusFilter('em_separacao')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                statusFilter === 'em_separacao' ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" : "bg-white/5 text-slate-400 border-white/5"
              )}
            >
              <Box size={14} />
              Separação
            </button>
            <button 
              onClick={() => setStatusFilter('fiado')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                statusFilter === 'fiado' ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" : "bg-white/5 text-slate-400 border-white/5"
              )}
            >
              <DollarSign size={14} />
              Fiado
            </button>
            <button 
              onClick={() => setStatusFilter('entregue')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                statusFilter === 'entregue' ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white/5 text-slate-400 border-white/5"
              )}
            >
              <CheckCircle size={14} />
              Entregue
            </button>
            <div className="flex-1" />
            <button 
              onClick={() => setIsClanMode(!isClanMode)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2",
                isClanMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-white/5 text-slate-400 border-white/5"
              )}
            >
              <Users size={14} />
              Modo Clan
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2.5">
        {isClanMode ? (
          Object.entries(ordersByClient).map(([client, clientOrders]) => (
            <div key={client} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => toggleClientExpansion(client)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    {client.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">{client}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{clientOrders.length} Pedidos Ativos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-black">R$ {clientOrders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}</span>
                  {expandedClients.includes(client) ? <ChevronDown size={20} className="text-slate-600" /> : <ChevronRight size={20} className="text-slate-600" />}
                </div>
              </button>
              
              {expandedClients.includes(client) && (
                <div className="p-2 pt-0 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {clientOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onClick={() => handleOpenOrder(order)}
                      updateOrder={updateOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onClick={() => handleOpenOrder(order)}
              updateOrder={updateOrder}
            />
          ))
        )}
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={isSeparating ? "Separando Pedido" : (selectedOrder ? `Pedido #${selectedOrder.id.slice(0, 8)}` : "Detalhes")}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {!isSeparating ? (
              // View Mode
              <>
                <div className="flex justify-between items-center bg-white/[0.06] p-3 rounded-xl border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Horário</p>
                      <p className="font-semibold text-white">{selectedOrder.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-bold text-emerald-400 text-xl">R$ {selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Itens do Pedido</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 group">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getProductEmoji(item.productId)}</span>
                          <div>
                            <p className="text-white font-medium">{getProductName(item.productId)}</p>
                            <p className="text-xs text-slate-500">{item.quantity} x R$ {item.priceAtOrder.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">R$ {(item.quantity * item.priceAtOrder).toFixed(2)}</span>
                          {selectedOrder.status === 'entregue' && (
                            <button 
                              onClick={() => handleReturnItem(selectedOrder.id, idx)}
                              className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-rose-500/10 rounded"
                              title="Registrar Devolução"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  {/* Status Change Flow */}
                  {selectedOrder.status === 'pendente' && (
                    <button 
                      onClick={startSeparation}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    >
                      <Box size={20} />
                      Iniciar Separação
                    </button>
                  )}

                  {selectedOrder.status === 'em_separacao' && (
                    <button 
                      onClick={startSeparation}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    >
                      <Box size={20} />
                      Continuar Separação
                    </button>
                  )}

                  {(selectedOrder.status === 'entregue' || selectedOrder.payment === 'pago') && (
                    <div className="space-y-3">
                      {!receiptData ? (
                        <button 
                          onClick={() => generateReceipt(selectedOrder)}
                          disabled={isGenerating}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-70"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              Gerando Recibo...
                            </>
                          ) : (
                            <>
                              <FileText size={20} />
                              Gerar Recibo
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <CheckCircle size={20} />
                            Recibo Gerado
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => setIsReceiptModalOpen(true)}
                              className="bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                            >
                              <Eye size={18} />
                              Visualizar
                            </button>
                            <button 
                              onClick={() => window.open(getWhatsAppLink(), '_blank')}
                              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-emerald-500/30 transition-colors"
                            >
                              <Share2 size={18} />
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={handleShare}
                      className="flex-1 bg-white/[0.06] hover:bg-white/10 text-emerald-200 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-emerald-400/30 shadow-[0_0_14px_rgba(16,185,129,0.35)]"
                    >
                      <Share2 size={20} />
                      Pedido
                    </button>
                    {selectedOrder.status === 'entregue' && (
                      <button 
                        className="flex-1 bg-white/[0.06] hover:bg-white/10 text-slate-200 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-white/10"
                        onClick={() => alert("Funcionalidade de edição completa em breve!")}
                      >
                        <Pencil size={20} />
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Separation Mode (Checklist)
              <div className="space-y-6">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-center">
                  <p className="text-xs text-indigo-300 uppercase font-black tracking-widest mb-1">Checklist de Coleta</p>
                  <p className="text-sm text-slate-400">Marque os itens e ajuste as quantidades reais.</p>
                </div>

                <div className="space-y-3">
                  {separationItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                        item.collected 
                          ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                          : "bg-white/[0.03] border-white/5"
                      )}
                    >
                      <button 
                        onClick={() => toggleItemCollected(idx)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                          item.collected 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            : "bg-transparent border-white/20 text-transparent"
                        )}
                      >
                        <Check size={18} />
                      </button>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-white flex items-center gap-2">
                              <span>{getProductEmoji(item.productId)}</span>
                              {getProductName(item.productId)}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                              Original: {item.originalQuantity} un
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium">Qtd Final:</span>
                          <div className="relative">
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateSeparationQuantity(idx, e.target.value)}
                              className={cn(
                                "w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all",
                                item.quantity < (item.originalQuantity || 0) && "text-amber-400 border-amber-500/40 bg-amber-500/5 animate-pulse"
                              )}
                            />
                            {item.quantity < (item.originalQuantity || 0) && (
                              <div className="absolute -top-6 left-0 text-[8px] font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">
                                Divergência
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsSeparating(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-4 rounded-xl font-bold border border-white/10 transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={confirmSeparation}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Confirmar Aceite
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Receipt View Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Visualização do Recibo"
      >
        {receiptData && (
          <div className="space-y-6">
            <ReceiptComponent 
              order={receiptData.order}
              receiptUrl={receiptData.receiptUrl}
              generatedAt={receiptData.generatedAt}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.open(getWhatsAppLink(), '_blank')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                <Share2 size={20} />
                Enviar no WhatsApp
              </button>
              <button 
                onClick={() => window.print()}
                className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl font-bold border border-white/10 transition-all"
              >
                Imprimir
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Order Modal */}
      <Modal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        title="Novo Pedido"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Cliente</label>
              <input 
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">WhatsApp (Opcional)</label>
              <input 
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="5511999999999"
                type="tel"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Adicionar Item</h3>
            <div className="flex gap-2 mb-2">
              <select 
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Selecione...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                ))}
              </select>
              <input 
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button 
              onClick={handleAddItem}
              disabled={!selectedProductId}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Adicionar Item
            </button>
          </div>

          {newOrderItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Itens Adicionados</h3>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {newOrderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <span>{getProductEmoji(item.productId)}</span>
                      <div className="text-sm">
                        <p className="text-white">{getProductName(item.productId)}</p>
                        <p className="text-slate-500 text-xs">{item.quantity} x R$ {item.priceAtOrder}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium text-sm">R$ {item.quantity * item.priceAtOrder}</span>
                      <button 
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                <span className="text-slate-400">Total Estimado</span>
                <span className="text-xl font-bold text-emerald-400">R$ {calculateTotal(newOrderItems).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handleSaveOrder}
            disabled={!clientName || newOrderItems.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Finalizar Pedido
          </button>
        </div>
      </Modal>
    </div>
  );
};

// Helper component for Order Card
interface OrderCardProps {
  order: Order;
  onClick: () => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, updateOrder }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "backdrop-blur-md border p-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer hover:bg-white/10 shadow-lg",
        order.status === 'em_separacao' 
          ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
          : "bg-white/[0.04] border-white/10"
      )}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{order.clientName}</h3>
          <span className="text-[10px] text-slate-500 font-mono">#{order.id.slice(0, 4)}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
          <Clock size={10} />
          {order.time}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus: OrderStatus = order.status === 'pendente' ? 'em_separacao' : (order.status === 'em_separacao' ? 'entregue' : 'pendente');
              updateOrder(order.id, { status: nextStatus });
            }}
            className={cn(
              "px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tight flex items-center gap-1 border transition-all uppercase",
              order.status === 'entregue' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
              order.status === 'em_separacao' && "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.3)]",
              order.status === 'pendente' && "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            )}
          >
            {order.status === 'entregue' ? 'Entregue' : (order.status === 'em_separacao' ? 'Em Separação' : 'Pendente')}
          </button>

          <span className={cn(
            "px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tight flex items-center gap-1 border uppercase",
            order.payment === 'pago' 
              ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-300 border-rose-500/20"
          )}>
            {order.payment === 'pago' ? 'Pago' : 'Fiado'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{order.items.length} ITENS</span>
          <span className="text-sm font-black text-white">R$ {order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Orders;
