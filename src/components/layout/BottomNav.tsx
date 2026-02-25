import React from 'react';
import { Home, List, Package, ShoppingBag, ClipboardList, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 0, icon: Home, label: 'Home' },
    { id: 1, icon: List, label: 'Lista' },
    { id: 2, icon: Package, label: 'Estoque' },
    { id: 3, icon: ShoppingBag, label: 'Pedidos' },
    { id: 4, icon: ClipboardList, label: 'Diário' },
    { id: 5, icon: Wallet, label: 'Balanço' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
      <div className="mx-auto max-w-md">
        <div className="bg-white/7 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] rounded-3xl flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                isActive
                  ? "text-emerald-300 scale-110 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2 : 1.6} />
              <span className={cn("text-[10px] mt-1 font-medium", isActive ? "text-emerald-300" : "text-slate-400")}>
                {tab.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
};
