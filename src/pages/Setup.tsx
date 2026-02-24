import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/useApp';
import { Plus, ArrowRight, Store, Search, ChevronDown, Check, Building2, MapPin } from 'lucide-react';
import { ACTIVITY_SECTORS, getSuggestionsForSector, type NCMSuggestion } from '../lib/taxService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Setup: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { setCompany, addProduct, products } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [city, setCity] = useState('');
  const [activitySector, setActivitySector] = useState<string>(ACTIVITY_SECTORS[0]);
  
  const [prodName, setProdName] = useState('');
  const [prodEmoji, setProdEmoji] = useState('📦');
  const [prodPrice, setProdPrice] = useState('');
  const [prodNcm, setProdNcm] = useState('');
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<NCMSuggestion[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prodName.length > 1 && !showSuggestions) {
      const allSuggestions = getSuggestionsForSector(activitySector);
      const filtered = allSuggestions.filter(s => 
        s.name.toLowerCase().includes(prodName.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      if (filtered.length > 0) setShowSuggestions(true);
    } else if (prodName.length <= 1) {
      setShowSuggestions(false);
    }
  }, [prodName, activitySector]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: NCMSuggestion) => {
    setProdName(suggestion.name);
    setProdNcm(suggestion.ncm);
    setProdEmoji(suggestion.emoji);
    setShowSuggestions(false);
  };

  const handleNextStep = () => {
    if (step === 1 && name.trim()) {
      setCompany({ 
        name, 
        activitySector,
        cnpj: cnpj || undefined,
        address: city || undefined
      });
      setStep(2);
    } else if (step === 2) {
      onComplete();
    }
  };

  const handleAddProduct = () => {
    if (prodName && prodPrice) {
      addProduct({
        id: Date.now().toString(),
        name: prodName,
        emoji: prodEmoji,
        defaultPrice: parseFloat(prodPrice),
        costPrice: parseFloat(prodPrice) * 0.5,
        totalStock: 0,
        availableStock: 0,
        ncm: prodNcm
      });
      setProdName('');
      setProdPrice('');
      setProdEmoji('📦');
      setProdNcm('');
    }
  };

  return (
    <div className="min-h-screen text-white p-6 flex flex-col justify-center relative overflow-hidden bg-[#0b0f14]">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-10 -right-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")} />
          <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")} />
        </div>

        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
                <Store size={40} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter mb-2">CONECTAR EMPRESA</h1>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Identidade do seu negócio</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Building2 size={12} /> Nome Comercial
                  </label>
                  <input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Hortifruti do João"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-xl font-bold text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-2xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">CNPJ (Opcional)</label>
                    <input 
                      value={cnpj}
                      onChange={e => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-sm font-bold text-white placeholder-slate-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <MapPin size={12} /> Cidade
                    </label>
                    <input 
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Ex: São Paulo, SP"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-sm font-bold text-white placeholder-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Ramo de Atividade</label>
                <div className="grid grid-cols-2 gap-3">
                  {ACTIVITY_SECTORS.map((sector) => (
                    <button
                      key={sector}
                      onClick={() => setActivitySector(sector)}
                      className={cn(
                        "p-4 rounded-2xl text-xs font-black transition-all border uppercase tracking-widest",
                        activitySector === sector 
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg" 
                          : "bg-white/[0.02] border-white/5 text-slate-600 hover:text-slate-400"
                      )}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
                <Plus size={40} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter mb-2">PRIMEIRO ESTOQUE</h1>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Carregando NCMs de {activitySector}</p>
            </div>

            <div className="bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="grid grid-cols-[auto_1fr] gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const emoji = prompt('Digite o emoji:', prodEmoji);
                    if (emoji) setProdEmoji(emoji);
                  }}
                  className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
                >
                  {prodEmoji}
                </button>
                
                <div className="relative" ref={suggestionsRef}>
                  <div className="relative">
                    <input 
                      value={prodName}
                      onChange={e => setProdName(e.target.value)}
                      onFocus={() => prodName.length > 1 && setShowSuggestions(true)}
                      placeholder="Nome do Produto..."
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <Search size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700" />
                  </div>

                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
                      {filteredSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSuggestion(s)}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{s.emoji}</span>
                            <div className="text-left">
                              <p className="text-sm font-black text-white uppercase">{s.name}</p>
                              <p className="text-[10px] font-mono text-slate-500">NCM {s.ncm}</p>
                            </div>
                          </div>
                          <Check size={16} className="text-emerald-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                  <input 
                    type="number"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    placeholder="Preço Venda"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 text-white font-bold focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-black">NCM</span>
                  <input 
                    value={prodNcm}
                    onChange={e => setProdNcm(e.target.value)}
                    placeholder="0000.00.00"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddProduct}
                className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-indigo-500/30"
              >
                + Adicionar ao Estoque
              </button>

              {/* Added Products List */}
              {products.length > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Produtos Prontos ({products.length})</p>
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {products.slice().reverse().map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span>{p.emoji}</span>
                          <span className="text-xs font-bold text-slate-300">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">NCM {p.ncm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <button 
          onClick={handleNextStep}
          disabled={step === 1 ? !name : false}
          className="w-full bg-emerald-500 text-slate-900 font-black uppercase tracking-[0.2em] py-5 rounded-[2rem] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 mt-10 shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-30 disabled:grayscale"
        >
          {step === 1 ? 'PRÓXIMO PASSO' : 'FINALIZAR SETUP'}
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
