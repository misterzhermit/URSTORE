import { useState, useCallback } from 'react';
import type { Order } from '../types';

export interface ReceiptData {
  order: Order;
  receiptUrl: string;
  generatedAt: string;
}

export const useReceiptGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const generateReceipt = useCallback(async (order: Order) => {
    setIsGenerating(true);
    
    // Simulação de delay para futura API Fiscal (Fase 2)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    /**
     * FASE 2 - INTEGRAÇÃO FISCAL:
     * Aqui será feita a chamada POST para a API (Webmania, Focus NFe, etc.)
     * Exemplo:
     * const response = await fetch('https://api.webmania.com/v1/nfe/emissao', {
     *   method: 'POST',
     *   body: JSON.stringify({
     *     pedido_id: order.id,
     *     cliente: { nome: order.clientName, ... },
     *     itens: order.items.map(item => ({ ... })),
     *     // Outros campos obrigatórios: NCM, CPF/CNPJ, etc.
     *   })
     * });
     * const data = await response.json();
     */

    const mockReceiptUrl = `https://appnano.com/recibo/${order.id}`;
    
    setReceiptData({
      order,
      receiptUrl: mockReceiptUrl,
      generatedAt: new Date().toISOString(),
    });
    
    setIsGenerating(false);
  }, []);

  const getWhatsAppLink = useCallback(() => {
    if (!receiptData) return '';
    
    const { order, receiptUrl } = receiptData;
    const phone = order.clientPhone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(
      `Olá ${order.clientName}, seu pedido foi finalizado! Acesse seu recibo detalhado aqui: ${receiptUrl}`
    );
    
    return `https://wa.me/${phone}?text=${message}`;
  }, [receiptData]);

  const resetReceipt = useCallback(() => {
    setReceiptData(null);
  }, []);

  return {
    isGenerating,
    receiptData,
    generateReceipt,
    getWhatsAppLink,
    resetReceipt,
  };
};
