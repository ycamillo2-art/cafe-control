import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Leaf, Settings, DollarSign, Box } from 'lucide-react';
import api from '../utils/api';

export default function ProducerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/producers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-[10px] font-black text-slate-300 uppercase">Carregando...</div>;
  if (!data) return <div className="text-center py-20">Produtor não encontrado.</div>;

  const { summary, guides, sales } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/producers')} className="p-2 -ml-2 text-slate-400">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">{data.name}</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Código: {String(data.id).padStart(3, '0')}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-3 bg-[#2d6a4f] text-white rounded-xl font-black uppercase text-[10px] tracking-tight">
          <FileText className="w-4 h-4" />
          Gerar Relatório (PDF)
        </button>
      </div>

      <div className="space-y-4">
        <div className="section-header">
          <div className="w-1 h-3 bg-emerald-600 rounded-full" />
          <h2 className="section-title">Resumo Geral</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recebido (Maduro)</p>
            </div>
            <p className="text-3xl font-black text-emerald-800 leading-none">{(summary.total_mature || 0).toLocaleString('pt-BR')} kg</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-5 h-5 text-[#603813]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pilado (Rendimento)</p>
            </div>
            <p className="text-3xl font-black text-[#603813] leading-none">{(summary.total_milled || 0).toLocaleString('pt-BR')} kg</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-red-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vendido</p>
            </div>
            <p className="text-3xl font-black text-red-700 leading-none">{(summary.total_sold || 0).toLocaleString('pt-BR')} kg</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Box className="w-5 h-5 text-blue-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Atual (Pilado)</p>
            </div>
            <p className="text-3xl font-black text-blue-800 leading-none">{(summary.balance || 0).toLocaleString('pt-BR')} kg</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="section-header">
          <div className="w-1 h-3 bg-amber-800 rounded-full" />
          <h2 className="section-title">Entradas de Café</h2>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-header">Guia</th>
                <th className="table-header">Data</th>
                <th className="table-header">Peso Maduro</th>
                <th className="table-header">Peso Pilado</th>
                <th className="table-header text-right">Rendimento</th>
              </tr>
            </thead>
            <tbody>
              {guides.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-[10px] font-bold text-slate-300 italic">Sem registros</td></tr>
              ) : (
                guides.map(g => (
                  <tr key={g.id} onClick={() => g.status === 'PENDENTE' && navigate(`/update-guide/${g.id}`)}>
                    <td className="table-cell">{g.guide_number}</td>
                    <td className="table-cell">{new Date(g.date).toLocaleDateString('pt-BR')}</td>
                    <td className="table-cell">{g.weight_mature.toLocaleString('pt-BR')} kg</td>
                    <td className="table-cell">{g.weight_milled ? `${g.weight_milled.toLocaleString('pt-BR')} kg` : <span className="text-amber-600 italic">Pendente</span>}</td>
                    <td className="table-cell text-right font-black text-emerald-700">{g.yield_pct ? `${Number(g.yield_pct).toFixed(1)}%` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="section-header">
          <div className="w-1 h-3 bg-red-600 rounded-full" />
          <h2 className="section-title">Vendas Realizadas</h2>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="table-header">Data</th>
                <th className="table-header">Quantidade</th>
                <th className="table-header text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan="3" className="py-10 text-center text-[10px] font-bold text-slate-300 italic">Sem registros</td></tr>
              ) : (
                sales.map(s => (
                  <tr key={s.id}>
                    <td className="table-cell">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                    <td className="table-cell font-black">{s.quantity.toLocaleString('pt-BR')} kg</td>
                    <td className="table-cell text-right font-black text-red-600">R$ {Number(s.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-slate-400 font-bold text-[10px]">i</div>
        <p className="text-[10px] font-bold text-slate-400 leading-tight">
          Valores de rendimento calculados com base no peso pilado inserido após o processamento da carga.
        </p>
      </div>
    </div>
  );
}
