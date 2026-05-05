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
    <div className="space-y-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-summary bg-emerald-600 h-28 md:h-32">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Leaf className="w-6 h-6 md:w-8 md:h-8 text-white" />
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

        <div className="card-summary bg-[#603813] h-28 md:h-32">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Settings className="w-6 h-6 md:w-8 md:h-8 text-white" />
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

        <div className="card-summary bg-[#dc2626] h-28 md:h-32">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-white" />
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

        <div className="card-summary bg-[#1d4ed8] h-28 md:h-32">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Box className="w-6 h-6 md:w-8 md:h-8 text-white" />
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

      <div className="space-y-6 pt-4">
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Ações</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
          <Link to="/add-guide" className="btn-action !bg-transparent !border-none !shadow-none hover:opacity-80">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#00a86b] rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100">
              <Plus className="w-9 h-9 md:w-12 md:h-12" />
            </div>
            <div className="text-center">
              <p className="text-[12px] md:text-[14px] font-black text-slate-800 leading-none">Nova Entrada</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1">Café do Registrador</p>
            </div>
          </Link>

          <Link to="/add-sale" className="btn-action !bg-transparent !border-none !shadow-none hover:opacity-80">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#603813] rounded-full flex items-center justify-center text-white shadow-xl shadow-amber-900/20">
              <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="text-center">
              <p className="text-[12px] md:text-[14px] font-black text-slate-800 leading-none">Nova Venda</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1">Café do Vendedor</p>
            </div>
          </Link>

          <Link to="/producers" className="btn-action !bg-transparent !border-none !shadow-none hover:opacity-80">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1d4ed8] rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <Users className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="text-center">
              <p className="text-[12px] md:text-[14px] font-black text-slate-800 leading-none">Produtores</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-1">Ver relatório</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
