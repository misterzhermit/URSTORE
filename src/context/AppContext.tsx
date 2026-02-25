import React, { useState, useEffect, type ReactNode } from 'react';
import type { Company, Product, Order, CollectionItem, Expense, DailyHistory, DivergenceLog } from '../types';
import { AppContext } from './useApp';
import { supabase } from '../lib/supabase';
import { haptics } from '../lib/haptics';
import type { User } from '@supabase/supabase-js';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [collectionList, setCollectionList] = useState<CollectionItem[]>([]);
  const [divergenceLogs, setDivergenceLogs] = useState<DivergenceLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dailyHistory, setDailyHistory] = useState<DailyHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Monitorar Autenticação
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        // Se não houver sessão, já podemos liberar o loading para mostrar o Login
        if (!session) setIsLoaded(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        if (!session) setIsLoaded(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Carregar Dados Iniciais e Configurar Realtime
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Perfil/Empresa
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) setCompany({
          name: profile.company_name,
          activitySector: profile.activity_sector,
          cnpj: profile.cnpj,
          address: profile.address
        });

      // Produtos
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      if (productsData) setProducts(productsData.map(p => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        defaultPrice: Number(p.default_price),
        costPrice: Number(p.cost_price),
        totalStock: p.total_stock,
        availableStock: p.available_stock,
        ncm: p.ncm
      })));

      // Pedidos (com itens)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersData) setOrders(ordersData.map(o => ({
        id: o.id,
        clientName: o.client_name,
        clientPhone: o.client_phone,
        total: Number(o.total_amount),
        status: o.status,
        payment: o.payment_status,
        time: new Date(o.created_at).toLocaleTimeString(),
        date: o.order_date,
        items: o.order_items.map((i: { product_id: string, quantity: number, original_quantity?: number, price_at_order: string | number, collected: boolean }) => ({
          productId: i.product_id,
          quantity: i.quantity,
          originalQuantity: i.original_quantity,
          priceAtOrder: Number(i.price_at_order),
          collected: i.collected
        }))
      })));

      // Despesas
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false });
      if (expensesData) setExpenses(expensesData.map(e => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        date: e.expense_date
      })));

      // Histórico Diário
      const { data: historyData } = await supabase
        .from('daily_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (historyData) setDailyHistory(historyData.map(h => ({
        date: h.date,
        totalRevenue: Number(h.total_revenue),
        totalCost: Number(h.total_cost),
        totalProfit: Number(h.total_profit),
        ordersCount: h.orders_count
      })));

      // Lista de Coleta
      const { data: collectionData } = await supabase
        .from('collection_list')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (collectionData) setCollectionList(collectionData.map(c => ({
        id: c.id,
        productId: c.product_id,
        requestedQuantity: c.requested_quantity,
        deliveredQuantity: c.delivered_quantity,
        status: c.status,
        costPrice: Number(c.cost_price_day),
        date: c.collection_date
      })));

      // Divergências
      const { data: divergenceData } = await supabase
        .from('divergence_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (divergenceData) setDivergenceLogs(divergenceData.map(d => ({
          id: d.id,
          productId: d.product_id,
          productName: d.product_name || 'Produto Desconhecido',
          requestedQuantity: d.requested_quantity,
          deliveredQuantity: d.delivered_quantity,
          diff: d.diff,
          costPrice: Number(d.cost_price),
          date: d.created_at
        })));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();

    // Configurar Realtime para Produtos
    const productsSubscription = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` }, 
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const p = payload.new;
          setProducts(prev => [...prev, {
            id: p.id, name: p.name, emoji: p.emoji, 
            defaultPrice: Number(p.default_price), costPrice: Number(p.cost_price),
            totalStock: p.total_stock, availableStock: p.available_stock, ncm: p.ncm
          }]);
        } else if (payload.eventType === 'UPDATE') {
          const p = payload.new;
          setProducts(prev => prev.map(old => old.id === p.id ? {
            id: p.id, name: p.name, emoji: p.emoji, 
            defaultPrice: Number(p.default_price), costPrice: Number(p.cost_price),
            totalStock: p.total_stock, availableStock: p.available_stock, ncm: p.ncm
          } : old));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(old => old.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsSubscription);
    };
  }, [user]);

  const login = () => setIsAuthenticated(true); // Manter por enquanto para compatibilidade UI
  const logout = () => supabase.auth.signOut();

  const addProduct = async (product: Product) => {
    if (!user) return;
    const { error } = await supabase
      .from('products')
      .insert([{
        id: product.id, // Usar o ID gerado localmente
        user_id: user.id,
        name: product.name,
        emoji: product.emoji,
        default_price: product.defaultPrice,
        cost_price: product.costPrice,
        total_stock: product.totalStock,
        available_stock: product.availableStock,
        ncm: product.ncm
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error; // Lançar erro para quem chamou poder tratar
    }
    // O setProducts será feito pelo Realtime
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!user) return;
    const mappedUpdates: Record<string, string | number | undefined> = {};
    if (updates.name) mappedUpdates.name = updates.name;
    if (updates.emoji) mappedUpdates.emoji = updates.emoji;
    if (updates.defaultPrice !== undefined) mappedUpdates.default_price = updates.defaultPrice;
    if (updates.costPrice !== undefined) mappedUpdates.cost_price = updates.costPrice;
    if (updates.totalStock !== undefined) mappedUpdates.total_stock = updates.totalStock;
    if (updates.availableStock !== undefined) mappedUpdates.available_stock = updates.availableStock;
    if (updates.ncm) mappedUpdates.ncm = updates.ncm;

    const { error } = await supabase
      .from('products')
      .update(mappedUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Erro ao atualizar produto:', error);
    // O setProducts será feito pelo Realtime
  };

  const addOrder = async (order: Order) => {
    if (!user) return;

    // 1. Criar o pedido
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        client_name: order.clientName,
        client_phone: order.clientPhone,
        total_amount: order.total,
        status: order.status,
        payment_status: order.payment,
        order_date: order.date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      return;
    }

    // 2. Criar os itens do pedido
    const orderItems = order.items.map(item => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      original_quantity: item.originalQuantity || item.quantity,
      price_at_order: item.priceAtOrder,
      collected: item.collected || false
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      return;
    }

    // 3. Atualizar estoque local e remoto
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await updateProduct(product.id, {
          availableStock: Math.max(0, product.availableStock - item.quantity)
        });
      }
    }

    haptics.success();
    // Atualizar estado local de pedidos (poderíamos usar realtime aqui também)
    setOrders(prev => [order, ...prev]);
  };

  const addCollectionItem = async (productId: string, requestedQuantity: number) => {
    if (!user) return;

    // Verificar se já existe um item pendente para este produto hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: existingItem, error: checkError } = await supabase
      .from('collection_list')
      .select('id, requested_quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'pending')
      .eq('collection_date', today)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar item existente:', checkError);
    }

    if (existingItem) {
      // Se já existe, atualizamos a quantidade em vez de inserir novo (evita 409 se houver constraint de unicidade)
      const { data, error: updateError } = await supabase
        .from('collection_list')
        .update({
          requested_quantity: existingItem.requested_quantity + requestedQuantity
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar item de coleta existente:', updateError);
        throw updateError;
      }

      if (data) {
        setCollectionList(prev => prev.map(item => item.id === data.id ? {
          ...item,
          requestedQuantity: data.requested_quantity
        } : item));
      }
      return;
    }

    const { data, error } = await supabase
      .from('collection_list')
      .insert([{
        user_id: user.id,
        product_id: productId,
        requested_quantity: requestedQuantity,
        status: 'pending',
        collection_date: today
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar item de coleta:', error);
      throw error;
    }

    if (data) {
      setCollectionList(prev => [{
        id: data.id,
        productId: data.product_id,
        requestedQuantity: data.requested_quantity,
        status: data.status,
        date: data.collection_date
      }, ...prev]);
    }
  };

  const removeCollectionItem = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('collection_list')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Erro ao remover item de coleta:', error);
    else setCollectionList(prev => prev.filter(item => item.id !== id));
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (!user) return;
    const mappedUpdates: Record<string, string | number | undefined> = {};
    if (updates.clientName) mappedUpdates.client_name = updates.clientName;
    if (updates.clientPhone) mappedUpdates.client_phone = updates.clientPhone;
    if (updates.total !== undefined) mappedUpdates.total_amount = updates.total;
    if (updates.status) mappedUpdates.status = updates.status;
    if (updates.payment) mappedUpdates.payment_status = updates.payment;

    const { error } = await supabase
      .from('orders')
      .update(mappedUpdates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Erro ao atualizar pedido:', error);
    else setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const toggleCollectionStatus = async (id: string, deliveredQuantity?: number, costPrice?: number) => {
    if (!user) return;
    
    const item = collectionList.find(i => i.id === id);
    if (!item) return;

    const newStatus = item.status === 'pending' ? 'collected' : 'pending';
    const finalDelivered = deliveredQuantity !== undefined ? deliveredQuantity : item.requestedQuantity;
    const finalCost = costPrice !== undefined ? costPrice : (item.costPrice || 0);

    // 1. Atualizar no Supabase
    const { error: updateError } = await supabase
      .from('collection_list')
      .update({
        status: newStatus,
        delivered_quantity: newStatus === 'collected' ? finalDelivered : null,
        cost_price_day: newStatus === 'collected' ? finalCost : null
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar status de coleta:', updateError);
      return;
    }

    if (newStatus === 'collected') {
      haptics.medium();
      // 2. Atualizar Estoque e Preço de Custo do Produto
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await updateProduct(product.id, {
          costPrice: finalCost > 0 ? finalCost : product.costPrice,
          totalStock: product.totalStock + finalDelivered,
          availableStock: product.availableStock + finalDelivered
        });

        // 2.5 Registrar como Despesa (Saída de Caixa) para refletir no financeiro
        if (finalCost > 0) {
          await addExpense({
            id: crypto.randomUUID(),
            description: `Compra: ${product.name} (${finalDelivered} cx)`,
            amount: finalCost * finalDelivered,
            date: item.date || new Date().toISOString().split('T')[0]
          });
        }
      }

      // 3. Registrar Divergência se houver
      if (finalDelivered !== item.requestedQuantity) {
        const product = products.find(p => p.id === item.productId);
        await supabase
          .from('divergence_logs')
          .insert([{
            user_id: user.id,
            collection_id: id,
            product_id: item.productId,
            product_name: product?.name || 'Produto Desconhecido',
            requested_quantity: item.requestedQuantity,
            delivered_quantity: finalDelivered,
            diff: finalDelivered - item.requestedQuantity,
            cost_price: finalCost
          }]);
        
        // Atualizar logs locais (poderia ser realtime)
        const { data: newLogs } = await supabase
          .from('divergence_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (newLogs) setDivergenceLogs(newLogs.map(d => ({
          id: d.id,
          productId: d.product_id,
          productName: d.product_name || 'Produto Desconhecido',
          requestedQuantity: d.requested_quantity,
          deliveredQuantity: d.delivered_quantity,
          diff: d.diff,
          costPrice: Number(d.cost_price),
          date: d.created_at
        })));
      }
    } else {
      // Undo collection - Reverter estoque
      const prevDelivered = item.deliveredQuantity || item.requestedQuantity;
      const product = products.find(p => p.id === item.productId);
      if (product) {
        await updateProduct(product.id, {
          totalStock: Math.max(0, product.totalStock - prevDelivered),
          availableStock: Math.max(0, product.availableStock - prevDelivered)
        });
      }

      // Remover divergência do banco
      await supabase
        .from('divergence_logs')
        .delete()
        .eq('collection_id', id)
        .eq('user_id', user.id);
      
      setDivergenceLogs(prev => prev.filter(log => log.id !== id));

      // 4. Remover despesa automática correspondente
      const descToFind = `Compra: ${product?.name}`;
      const autoExpense = expenses.find(e => 
        e.description.startsWith(descToFind) && 
        e.date === (item.date || new Date().toISOString().split('T')[0])
      );
      if (autoExpense) {
        await removeExpense(autoExpense.id);
      }
    }

    // Atualizar lista local
    setCollectionList(prev => prev.map(i => i.id === id ? { 
      ...i, 
      status: newStatus, 
      deliveredQuantity: newStatus === 'collected' ? finalDelivered : undefined,
      costPrice: newStatus === 'collected' ? finalCost : undefined
    } : i));
  };

  const addExpense = async (expense: Expense) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.date
      }])
      .select()
      .single();

    if (error) console.error('Erro ao adicionar despesa:', error);
    else if (data) setExpenses(prev => [{
      id: data.id,
      description: data.description,
      amount: Number(data.amount),
      date: data.expense_date
    }, ...prev]);
  };

  const removeExpense = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) console.error('Erro ao remover despesa:', error);
    else setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const closeDay = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Calcular Métricas
    const todaysOrders = orders.filter(o => (o.date === today || !o.date) && o.status === 'entregue');
    const revenue = todaysOrders.reduce((acc, o) => acc + o.total, 0);
    
    let cogs = 0;
    todaysOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          cogs += (product.costPrice * item.quantity);
        }
      });
    });

    const todaysExpenses = expenses.filter(e => e.date === today);
    const totalExpenses = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);
    const totalCost = cogs + totalExpenses;
    const profit = revenue - totalCost;

    // 2. Salvar no Histórico (Supabase)
    const { error: historyError } = await supabase
      .from('daily_history')
      .insert([{
        user_id: user.id,
        date: today,
        total_revenue: revenue,
        total_cost: totalCost,
        total_profit: profit,
        orders_count: todaysOrders.length
      }]);

    if (historyError) {
      console.error('Erro ao salvar histórico:', historyError);
      return;
    }

    // Atualizar histórico local
    setDailyHistory(prev => [{
      date: today,
      totalRevenue: revenue,
      totalCost: totalCost,
      totalProfit: profit,
      ordersCount: todaysOrders.length
    }, ...prev]);

    // 3. Limpar pedidos liquidados no Supabase
    const settledOrderIds = todaysOrders
      .filter(o => o.payment === 'pago')
      .map(o => o.id);

    if (settledOrderIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .in('id', settledOrderIds)
        .eq('user_id', user.id);
      
      if (deleteError) console.error('Erro ao limpar pedidos liquidados:', deleteError);
      else setOrders(prev => prev.filter(o => !settledOrderIds.includes(o.id)));
    }

    // 4. Repor produtos zerados na Lista de Coleta
    const productsWithZeroStock = products.filter(p => p.availableStock === 0);
    for (const product of productsWithZeroStock) {
      await addCollectionItem(product.id, 1);
    }
    
    alert("Dia Fechado com Sucesso! 🌙");
  };

  const setCompanyAndSave = async (newCompany: Company) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        company_name: newCompany.name,
        activity_sector: newCompany.activitySector,
        cnpj: newCompany.cnpj,
        address: newCompany.address
      });

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }
    setCompany(newCompany);
  };

  return (
    <AppContext.Provider value={{
      isLoaded,
      company,
      setCompany: setCompanyAndSave,
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
      removeExpense,
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
