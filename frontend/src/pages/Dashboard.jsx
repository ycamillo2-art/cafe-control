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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">Olá, Admin!</h2>
        <p className="text-sm text-slate-400 font-medium tracking-tight">Bem-vindo ao sistema</p>
      </div>

      <div className="space-y-3">
        <div className="card-summary bg-[#2d6a4f]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Total Recebido (Maduro)</p>
              <p className="text-2xl font-black leading-none">{totals.mature.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>

        <div className="card-summary bg-[#603813]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Total Pilado (Rendimento)</p>
              <p className="text-2xl font-black leading-none">{totals.milled.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>

        <div className="card-summary bg-[#1d4ed8]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Estoque Atual (Pilado)</p>
              <p className="text-2xl font-black leading-none">{totals.balance.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>

        <div className="card-summary bg-[#dc2626]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-80">Total Vendido</p>
              <p className="text-2xl font-black leading-none">{totals.sold.toLocaleString('pt-BR')} kg</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ações Rápidas</p>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/add-guide" className="btn-action">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Plus className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-800 leading-none">Nova Entrada</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Registrar café</p>
            </div>
          </Link>

          <Link to="/add-sale" className="btn-action">
            <div className="w-12 h-12 bg-[#603813] rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-800 leading-none">Nova Venda</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Vender café</p>
            </div>
          </Link>

          <Link to="/producers" className="btn-action">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-800 leading-none">Produtores</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Ver relatório</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
