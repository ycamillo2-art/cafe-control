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
      const prods = res.data;
      const sum = prods.reduce((acc, p) => ({
        mature: acc.mature + (p.total_mature || 0),
        milled: acc.milled + (p.total_milled || 0),
        sold: acc.sold + (p.total_sold || 0),
        balance: acc.balance + (p.balance || 0)
      }), { mature: 0, milled: 0, sold: 0, balance: 0 });
      setTotals(sum);
    });
  }, []);

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="card-summary bg-[#603813] h-28">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest opacity-90">Total Pilado (Rendimento)</p>
              <p className="text-4xl font-black leading-tight">{totals.milled.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>

        <div className="card-summary bg-[#1d4ed8] h-28">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Box className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest opacity-90">Estoque Atual (Pilado)</p>
              <p className="text-4xl font-black leading-tight">{totals.balance.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>

        <div className="card-summary bg-[#dc2626] h-28">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest opacity-90">Total Vendido</p>
              <p className="text-4xl font-black leading-tight">{totals.sold.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] text-center md:text-left">Ações</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/add-guide" className="btn-action !bg-transparent !border-none !shadow-none hover:opacity-80">
            <div className="w-16 h-16 bg-[#00a86b] rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100">
              <Plus className="w-9 h-9" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-black text-slate-800 leading-none">Nova Entrada</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Café do Registrador</p>
            </div>
          </Link>

          <Link to="/add-sale" className="btn-action !bg-transparent !border-none !shadow-none hover:opacity-80">
            <div className="w-16 h-16 bg-[#603813] rounded-full flex items-center justify-center text-white shadow-xl shadow-amber-900/20">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-black text-slate-800 leading-none">Nova Venda</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Café do Vendedor</p>
            </div>
          </Link>

          <Link to="/producers" className="btn-action !bg-transparent !border-none !shadow-none hover:opacity-80">
            <div className="w-16 h-16 bg-[#1d4ed8] rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-black text-slate-800 leading-none">Produtores</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ver relatório</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
