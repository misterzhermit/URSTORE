
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineMonitor: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0b0f14] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative z-10 space-y-8 max-w-xs"
          >
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl backdrop-blur-xl">
              <WifiOff size={48} className="text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">SINAL PERDIDO</h1>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
                O URSTORE precisa de conexão para sincronizar com o servidor da Liga.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-2xl p-4 flex items-center justify-center gap-3 group"
            >
              <RefreshCw size={18} className="text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-sm font-black uppercase tracking-widest text-white">Tentar Reconectar</span>
            </button>
            
            <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em]">
              Seus dados locais estão protegidos
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
