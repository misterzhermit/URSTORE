import React, { useState, useEffect, type ReactNode } from 'react';
import type { Company, Product, Order, CollectionItem, Expense, DailyHistory, DivergenceLog } from '../types';
import { AppContext } from './useApp';

const STORAGE_KEY = 'urplan_data_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado inicial vazio para forçar Setup
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collectionList, setCollectionList] = useState<CollectionItem[]>([]);
  const [divergenceLogs, setDivergenceLogs] = useState<DivergenceLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dailyHistory, setDailyHistory] = useState<DailyHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.isAuthenticated) setIsAuthenticated(parsed.isAuthenticated);
        if (parsed.company) setCompany(parsed.company);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.collectionList) setCollectionList(parsed.collectionList);
        if (parsed.divergenceLogs) setDivergenceLogs(parsed.divergenceLogs);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.dailyHistory) setDailyHistory(parsed.dailyHistory);
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar dados no localStorage sempre que algo mudar
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = {
        isAuthenticated,
        company,
        products,
        orders,
        collectionList,
        divergenceLogs,
        expenses,
        dailyHistory
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [company, products, orders, collectionList, divergenceLogs, expenses, dailyHistory, isLoaded]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    
    // Deduct stock from availableStock when order is placed
    setProducts(currProducts => currProducts.map(p => {
      const item = order.items.find(i => i.productId === p.id);
      if (item) {
        return {
          ...p,
          availableStock: Math.max(0, p.availableStock - item.quantity)
        };
      }
      return p;
    }));
  };

  const addCollectionItem = (productId: string, requestedQuantity: number) => {
    const newItem: CollectionItem = {
      id: `coll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      requestedQuantity,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    setCollectionList(prev => [newItem, ...prev]);
  };

  const removeCollectionItem = (id: string) => {
    setCollectionList(prev => prev.filter(item => item.id !== id));
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const toggleCollectionStatus = (id: string, deliveredQuantity?: number, costPrice?: number) => {
    setCollectionList(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'pending' ? 'collected' : 'pending';
        const finalDelivered = deliveredQuantity !== undefined ? deliveredQuantity : item.requestedQuantity;
        const finalCost = costPrice !== undefined ? costPrice : (item.costPrice || 0);

        if (newStatus === 'collected') {
          // 1. Update Product Stock and Cost
          setProducts(currProducts => currProducts.map(p => {
             if (p.id === item.productId) {
               return {
                 ...p,
                 costPrice: finalCost > 0 ? finalCost : p.costPrice,
                 totalStock: p.totalStock + finalDelivered,
                 availableStock: p.availableStock + finalDelivered
                 // NCM already exists on product if defined
               };
             }
             return p;
          }));

          // 2. Check for Divergence
          if (finalDelivered !== item.requestedQuantity) {
            const product = products.find(p => p.id === item.productId);
            const newLog: DivergenceLog = {
              id: `${id}-log-${Date.now()}`,
              productId: item.productId,
              productName: product?.name || 'Produto Desconhecido',
              requestedQuantity: item.requestedQuantity,
              deliveredQuantity: finalDelivered,
              diff: finalDelivered - item.requestedQuantity,
              costPrice: finalCost,
              date: new Date().toISOString()
            };
            setDivergenceLogs(prevLogs => [...prevLogs, newLog]);
          }
          
          return { ...item, status: newStatus, deliveredQuantity: finalDelivered, costPrice: finalCost };
        } else {
           // Undo collection
           const prevDelivered = item.deliveredQuantity || item.requestedQuantity;
           setProducts(currProducts => currProducts.map(p => 
            p.id === item.productId 
              ? { ...p, totalStock: Math.max(0, p.totalStock - prevDelivered), availableStock: Math.max(0, p.availableStock - prevDelivered) }
              : p
          ));

           // Optionally remove divergence log?
           setDivergenceLogs(prevLogs => prevLogs.filter(log => !log.id.startsWith(id)));
           
           return { ...item, status: newStatus, deliveredQuantity: undefined, costPrice: undefined };
        }
      }
      return item;
    }));
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const closeDay = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Calculate Daily Metrics
    // Revenue: Only from orders DELIVERED today (regardless of payment status? Or Paid? 
    // Usually Revenue is Sales. Cash Flow is Receipts.
    // Prompt says: "Faturamento (Entrou): Todo o dinheiro de pedidos entregues."
    // Let's assume "Entregue" means revenue recognized.
    const todaysOrders = orders.filter(o => (o.date === today || !o.date) && o.status === 'entregue');
    
    const revenue = todaysOrders.reduce((acc, o) => acc + o.total, 0);
    
    // Cost of Goods Sold (COGS)
    let cogs = 0;
    todaysOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          cogs += (product.costPrice * item.quantity);
        }
      });
    });

    // Expenses of the day
    const todaysExpenses = expenses.filter(e => e.date === today);
    const totalExpenses = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);

    const totalCost = cogs + totalExpenses;
    const profit = revenue - totalCost;

    // 2. Save to History
    const historyEntry: DailyHistory = {
      date: today,
      totalRevenue: revenue,
      totalCost: totalCost,
      totalProfit: profit,
      ordersCount: todaysOrders.length
    };
    
    setDailyHistory(prev => [...prev, historyEntry]);

    // 3. Clear Orders of the day?
    // Prompt says: "Limpa os Pedidos do dia atual... mantendo no Estoque apenas o saldo residual"
    // AND "Consolidate... move data... then clean".
    // AND "Keep Fiado list".
    // If we remove orders, we lose "Fiado" tracking if it's based on orders.
    // Strategy: Archive "Paid" orders. Keep "Fiado" orders (maybe move date to next day or just keep them).
    // Or just filter `orders` to remove settled ones.
    // Let's remove "Entregue" AND "Pago" orders. Keep "Fiado" or "Pendente".
    setOrders(prev => prev.filter(o => {
      const isToday = o.date === today || !o.date;
      const isSettled = o.status === 'entregue' && o.payment === 'pago';
      if (isToday && isSettled) return false; // Remove settled orders from today
      return true; // Keep others (Fiado, Pendente, or Past Unsettled)
    }));

    // 4. Reset Daily Metrics (Expenses)
    // We might want to keep expenses in history, but clear from active view?
    // `expenses` state could be "current month" or "all time". 
    // Let's assume `expenses` is all time for now, but filtered by date in views.
    // Or we can clear expenses if we only want to show "Current Day" in some view.
    // Prompt says "Limpa as métricas diárias".
    // I will NOT delete expenses, but I'll filter them by date in UI.
    
    // 5. Analisar Estoque e voltar produtos zerados para Lista de Coleta
    // Verificar produtos com estoque zerado e adicionar à lista de coleta
    const productsWithZeroStock = products.filter(p => p.availableStock === 0);
    if (productsWithZeroStock.length > 0) {
      const newCollectionItems = productsWithZeroStock.map(product => ({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        requestedQuantity: 1, // Quantidade padrão para reabastecimento
        status: 'pending' as const,
        date: today
      }));
      
      setCollectionList(prev => [...prev, ...newCollectionItems]);
    }
    
    alert("Dia Fechado com Sucesso! 🌙");
  };

  return (
    <AppContext.Provider value={{
      isLoaded,
      company,
      setCompany,
      products,
      addProduct,
      updateProduct,
      orders,
      addOrder,
      updateOrder,
      collectionList,
      addCollectionItem,
      removeCollectionItem,
      toggleCollectionStatus,
      divergenceLogs,
      expenses,
      addExpense,
      dailyHistory,
      closeDay,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};
