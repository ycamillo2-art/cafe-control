import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Settings, Box, Plus, ShoppingCart, Users, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [totals, setTotals] = useState({
    mature: 0,
    milled: 0,
    sold: 0,
    balance: 0
  });
  const [quotes, setQuotes] = useState(null);
  const [isQuotesOpen, setIsQuotesOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/stats');
      const stats = res.data;
      
      setTotals({ 
        mature: stats.total_mature || 0, 
        milled: stats.total_milled || 0, 
        sold: stats.total_sold || 0, 
        balance: stats.balance || 0 
      });
      setQuotes(stats.quotes);
    } catch (err) {
      console.error('Erro ao carregar totais:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cotação Discreta e Expansiva */}
      {quotes && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <button 
            onClick={() => setIsQuotesOpen(!isQuotesOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left">Mercado</span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Cotação Cooabriel Hoje</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">LIVE</span>
              {isQuotesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>
          
          {isQuotesOpen && (
            <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(quotes.quotes).map(([tipo, preco]) => (
                  <div key={tipo} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase">{tipo}</span>
                    <span className="text-sm font-black text-slate-800">{preco}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Última atualização: {quotes.updated_at}</span>
                <a href="https://cooabriel.coop.br/cotacao-do-dia" target="_blank" rel="noreferrer" className="text-[9px] font-black text-amber-600 uppercase hover:underline">Ver site oficial</a>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total em Kilos de Café Maduro */}
        <div className="bg-emerald-600 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-100 text-white relative overflow-hidden group">
          <Leaf className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[12px] font-black uppercase tracking-widest opacity-90">Total em Kilos de Café Maduro</p>
              <p className="text-2xl md:text-3xl font-black leading-tight flex items-baseline gap-2">
                {(totals.mature || 0).toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({((totals.mature || 0) / 60).toFixed(1)} sc)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total Pilado */}
        <div className="bg-[#603813] p-6 rounded-[2.5rem] shadow-xl shadow-amber-100 text-white relative overflow-hidden group">
          <Settings className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[12px] font-black uppercase tracking-widest opacity-90">Total Pilado (Rendimento)</p>
              <p className="text-2xl md:text-3xl font-black leading-tight flex items-baseline gap-2">
                {(totals.milled || 0).toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({((totals.milled || 0) / 60).toFixed(1)} sc)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Estoque Atual (Pilado) */}
        <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl shadow-blue-100 text-white relative overflow-hidden group">
          <Box className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[12px] font-black uppercase tracking-widest opacity-90">Estoque Atual (Pilado)</p>
              <p className="text-2xl md:text-3xl font-black leading-tight flex items-baseline gap-2">
                {(totals.balance || 0).toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({((totals.balance || 0) / 60).toFixed(1)} sc)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Ações</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/add-guide" className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 active:scale-95 transition-all">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Nova Entrada</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registrar Colheita</p>
            </div>
          </Link>

          <Link to="/add-sale" className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-full flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 active:scale-95 transition-all">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Nova Venda</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Baixar Estoque</p>
            </div>
          </Link>

          <Link to="/producers" className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 active:scale-95 transition-all">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Produtores</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ver relatório</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
