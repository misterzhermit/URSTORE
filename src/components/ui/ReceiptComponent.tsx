import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/useApp';
import type { Order, Product } from '../../types';
import { cn } from '../../lib/utils';

interface ReceiptComponentProps {
  order: Order;
  receiptUrl: string;
  generatedAt: string;
}

export const ReceiptComponent: React.FC<ReceiptComponentProps> = ({ order, receiptUrl, generatedAt }) => {
  const { company, products } = useApp();

  const getProductInfo = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const formattedDate = new Date(generatedAt).toLocaleString('pt-BR');

  return (
    <div className="bg-white text-slate-900 p-6 rounded-lg shadow-xl max-w-md mx-auto font-mono text-sm">
      {/* Cabeçalho */}
      <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wider">{company?.name || 'MINHA EMPRESA'}</h1>
        <p className="text-xs text-slate-500 mt-1">RECIBO DE VENDA (NÃO FISCAL)</p>
        <p className="text-xs font-bold mt-2">PEDIDO #{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Info Cliente */}
      <div className="mb-4 text-xs">
        <p><span className="font-bold">CLIENTE:</span> {order.clientName}</p>
        {order.clientPhone && <p><span className="font-bold">WHATSAPP:</span> {order.clientPhone}</p>}
        <p><span className="font-bold">DATA:</span> {formattedDate}</p>
      </div>

      {/* Tabela de Itens */}
      <div className="border-b border-dashed border-slate-300 mb-4 pb-4">
        <div className="grid grid-cols-12 gap-1 font-bold mb-2 text-[10px] uppercase">
          <div className="col-span-6">ITEM</div>
          <div className="col-span-2 text-center">QTD</div>
          <div className="col-span-2 text-right">UN</div>
          <div className="col-span-2 text-right">TOTAL</div>
        </div>
        
        {order.items.map((item, idx) => {
          const product = getProductInfo(item.productId);
          return (
            <div key={idx} className="grid grid-cols-12 gap-1 mb-1 text-[11px]">
              <div className="col-span-6 truncate">
                {product?.emoji} {product?.name || 'Item Removido'}
              </div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">
                {item.priceAtOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="col-span-2 text-right font-bold">
                {(item.quantity * item.priceAtOrder).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totais */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between items-center text-base font-bold">
          <span>TOTAL PAGO</span>
          <span>R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold uppercase">FORMA DE PAGAMENTO</span>
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            order.payment === 'pago' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}>
            {order.payment === 'pago' ? 'PAGO' : 'FIADO / A RECEBER'}
          </span>
        </div>
      </div>

      {/* QR Code e Rodapé */}
      <div className="flex flex-col items-center justify-center pt-4 border-t border-dashed border-slate-300">
        <div className="bg-white p-2 rounded-lg border border-slate-200 mb-2">
          <QRCodeSVG value={receiptUrl} size={100} />
        </div>
        <p className="text-[9px] text-slate-400 text-center max-w-[200px]">
          Acesse a versão digital em:<br/>
          <span className="text-slate-600 break-all">{receiptUrl}</span>
        </p>
        <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          OBRIGADO PELA PREFERÊNCIA!
        </p>
      </div>
    </div>
  );
};
