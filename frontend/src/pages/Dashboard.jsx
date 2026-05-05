import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Settings, Box, DollarSign, Plus, ShoppingCart, Users } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [totals, setTotals] = useState({
    mature: 0,
    milled: 0,
    sold: 0,
    balance: 0
  });

  useEffect(() => {
    api.get('/producers').then(res => {
      const producers = res.data;
      if (producers && producers.length > 0) {
        const t = producers.reduce((acc, p) => ({
          mature: acc.mature + (Number(p.total_mature) || 0),
          milled: acc.milled + (Number(p.total_milled) || 0),
          sold: acc.sold + (Number(p.total_sold) || 0),
          balance: acc.balance + (Number(p.balance) || 0)
        }), { mature: 0, milled: 0, sold: 0, balance: 0 });
        setTotals(t);
      }
    }).catch(err => {
      console.error('Erro ao carregar totais:', err);
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recebido */}
        <div className="bg-emerald-600 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-100 text-white relative overflow-hidden group">
          <Leaf className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[12px] font-black uppercase tracking-widest opacity-90">Total Recebido (Maduro)</p>
              <p className="text-2xl md:text-3xl font-black leading-tight flex items-baseline gap-2">
                {totals.mature.toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({(totals.mature / 60).toFixed(1)} sc)</span>
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
                {totals.milled.toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({(totals.milled / 60).toFixed(1)} sc)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total Vendido */}
        <div className="bg-red-600 p-6 rounded-[2.5rem] shadow-xl shadow-red-100 text-white relative overflow-hidden group">
          <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] md:text-[12px] font-black uppercase tracking-widest opacity-90">Total Vendido</p>
              <p className="text-2xl md:text-3xl font-black leading-tight flex items-baseline gap-2">
                {totals.sold.toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({(totals.sold / 60).toFixed(1)} sc)</span>
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
                {totals.balance.toLocaleString('pt-BR')} <span className="text-sm font-medium">kg</span>
                <span className="text-xs font-bold opacity-60">({(totals.balance / 60).toFixed(1)} sc)</span>
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
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Café do registrador</p>
            </div>
          </Link>

          <Link to="/add-sale" className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#603813] rounded-full flex items-center justify-center shadow-lg shadow-amber-100 group-hover:scale-110 active:scale-95 transition-all">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Nova Venda</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Café do vendedor</p>
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
